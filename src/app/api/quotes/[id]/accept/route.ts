import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createNotification, sendNotificationEmail } from '@/lib/notify';
import { formatQuoteNumber } from '@/lib/format-quote-number';
import { rateLimit } from '@/lib/rate-limit';
import { fireWebhook } from '@/lib/webhook';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 5, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const supabase = createClient();
  const body = await request.json();
  const { customer_name, customer_signature } = body;

  // Public endpoint — no auth required (customer is accepting)
  const { data: quote, error: fetchError } = await supabase
    .from('quotes')
    .select('id, status, pipeline_stage, customer_name, customer_email, contractor_id, quote_number, total, deposit_amount, expires_at')
    .eq('id', params.id)
    .single();

  if (fetchError || !quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
  }

  if (quote.status === 'approved' || quote.status === 'deposit_paid') {
    return NextResponse.json({ error: 'Quote has already been accepted' }, { status: 400 });
  }

  if (quote.expires_at && new Date(quote.expires_at) < new Date() && quote.status === 'sent') {
    return NextResponse.json({ error: 'This quote has expired. Please contact the contractor for a new quote.' }, { status: 410 });
  }

  // Advance pipeline past quote_sent on approval
  const advanceStages = ['lead', 'follow_up', 'quote_created', 'quote_sent'];
  const currentStage = quote.pipeline_stage || 'quote_sent';
  const shouldAdvance = advanceStages.includes(currentStage);

  const { error } = await supabase
    .from('quotes')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      customer_signed_name: customer_name || null,
      customer_signature: customer_signature || null,
      ...(shouldAdvance ? { pipeline_stage: 'deposit_collected' } : {}),
    })
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fire webhook (fire-and-forget)
  fireWebhook(supabase, quote.contractor_id, 'quote.approved', {
    quote_id: quote.id,
    quote_number: quote.quote_number ?? null,
    customer_name: quote.customer_name,
    customer_email: quote.customer_email ?? null,
    amount: quote.total,
    deposit_amount: quote.deposit_amount,
  });

  // Notify contractor
  const label = quote.quote_number
    ? formatQuoteNumber(quote.quote_number)
    : quote.id.slice(0, 8).toUpperCase();

  await createNotification(supabase, {
    user_id: quote.contractor_id,
    quote_id: quote.id,
    type: 'quote_approved',
    message: `${quote.customer_name} approved quote ${label}`,
  });

  // Send email to contractor (fire-and-forget)
  const { data: contractor } = await supabase
    .from('users')
    .select('email, business_name, full_name')
    .eq('id', quote.contractor_id)
    .single();

  if (contractor?.email) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    sendNotificationEmail({
      email: contractor.email,
      subject: `Quote ${label} approved by ${quote.customer_name}`,
      message: `Great news! ${quote.customer_name} has approved quote ${label}. Log in to review the details and next steps.`,
      quoteUrl: `${appUrl}/quotes/${params.id}`,
      businessName: contractor.business_name || contractor.full_name || undefined,
    });
  }

  return NextResponse.json({ success: true });
}
