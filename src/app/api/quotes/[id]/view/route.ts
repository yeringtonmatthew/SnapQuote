import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createNotification, sendNotificationEmail } from '@/lib/notify';
import { formatQuoteNumber } from '@/lib/format-quote-number';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  // Rate-limit by quote ID (not just IP) to prevent notification spam regardless of IP rotation
  if (!(await rateLimit(`view:${params.id}`, 3, 60_000))) {
    // Return success silently — don't reveal the limit to callers
    return NextResponse.json({ success: true, already_tracked: true });
  }
  const ip = _request.headers.get('x-forwarded-for') || 'unknown';
  if (!(await rateLimit(ip, 10, 60_000))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const supabase = createClient();

  // Fetch the quote (public — no auth required)
  const { data: quote, error: fetchError } = await supabase
    .from('quotes')
    .select('id, contractor_id, customer_name, quote_number')
    .eq('id', params.id)
    .single();

  if (fetchError || !quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
  }

  // Only create one "viewed" notification per quote to avoid spam
  const { data: existing } = await supabase
    .from('notifications')
    .select('id')
    .eq('quote_id', params.id)
    .eq('type', 'quote_viewed')
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ success: true, already_tracked: true });
  }

  const label = quote.quote_number
    ? formatQuoteNumber(quote.quote_number)
    : quote.id.slice(0, 8).toUpperCase();

  const message = `${quote.customer_name} viewed quote ${label}`;

  await createNotification(supabase, {
    user_id: quote.contractor_id,
    quote_id: quote.id,
    type: 'quote_viewed',
    message,
  });

  // Send email to contractor
  const { data: contractor } = await supabase
    .from('users')
    .select('email, business_name, full_name')
    .eq('id', quote.contractor_id)
    .single();

  if (contractor?.email) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://snapquote.dev';
    const quoteUrl = `${appUrl}/quotes/${params.id}`;
    sendNotificationEmail({
      email: contractor.email,
      subject: `${quote.customer_name} viewed your quote`,
      message: `Your customer ${quote.customer_name} just opened quote ${label}. This is a great sign they're considering your proposal.`,
      quoteUrl,
      businessName: contractor.business_name || contractor.full_name || undefined,
    });
  }

  return NextResponse.json({ success: true });
}
