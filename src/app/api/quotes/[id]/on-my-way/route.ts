import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendSms } from '@/lib/twilio';

// Rate limit: max 3 "on my way" SMS per quote per day
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(quoteId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(quoteId);

  if (!entry || now > entry.resetAt) {
    // Start of day window (reset at midnight UTC)
    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);
    rateLimitMap.set(quoteId, { count: 1, resetAt: endOfDay.getTime() });
    return true;
  }

  if (entry.count >= 3) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const quoteId = params.id;

  // Fetch quote — must belong to this contractor
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .select('id, customer_name, customer_phone, contractor_id')
    .eq('id', quoteId)
    .eq('contractor_id', user.id)
    .single();

  if (quoteError || !quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
  }

  if (!quote.customer_phone) {
    return NextResponse.json(
      { error: 'No phone number on file for this customer' },
      { status: 400 }
    );
  }

  // Rate limit check
  if (!checkRateLimit(quoteId)) {
    return NextResponse.json(
      { error: 'On My Way message already sent 3 times today. Try again tomorrow.' },
      { status: 429 }
    );
  }

  // Get contractor business name
  const { data: profile } = await supabase
    .from('users')
    .select('business_name, full_name')
    .eq('id', user.id)
    .single();

  const businessName = profile?.business_name || profile?.full_name || 'Your contractor';

  const message = `Hi ${quote.customer_name}! ${businessName} is on the way to your location. See you soon! 🏠`;

  try {
    await sendSms(quote.customer_phone, message);
  } catch (err) {
    console.error('[on-my-way] SMS error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to send SMS' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, message: 'On My Way SMS sent' });
}
