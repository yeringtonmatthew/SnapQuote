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
  if (!(await rateLimit(ip, 5, 60_000))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const supabase = createClient();
  const body = await request.json();
  const { customer_name, customer_signature, customer_signed_name, selected_option } = body;

  // Validate customer_name input
  if (customer_name !== undefined && (typeof customer_name !== 'string' || customer_name.trim().length === 0)) {
    return NextResponse.json({ error: 'Invalid customer name' }, { status: 400 });
  }
  if (customer_signed_name !== undefined && (typeof customer_signed_name !== 'string' || customer_signed_name.length > 200)) {
    return NextResponse.json({ error: 'Invalid signed name' }, { status: 400 });
  }
  // Limit base64 signature payload to ~2MB to prevent memory exhaustion
  if (customer_signature !== undefined && customer_signature !== null) {
    if (typeof customer_signature !== 'string' || customer_signature.length > 2_000_000) {
      return NextResponse.json({ error: 'Signature data too large or invalid' }, { status: 400 });
    }
  }

  // Public endpoint — no auth required (customer is accepting)
  const { data: quote, error: fetchError } = await supabase
    .from('quotes')
    .select('id, status, pipeline_stage, customer_name, customer_email, contractor_id, quote_number, total, deposit_amount, deposit_percent, tax_rate, discount_amount, discount_percent, expires_at, quote_options')
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

  // If tiered quote and customer selected an option, apply that tier's line items
  let tierUpdate: Record<string, unknown> = {};
  if (quote.quote_options && Array.isArray(quote.quote_options) && typeof selected_option === 'number') {
    // selected_option must be a safe non-negative integer within the options array bounds
    if (!Number.isInteger(selected_option) || selected_option < 0 || selected_option > 99) {
      return NextResponse.json({ error: 'Invalid option selected' }, { status: 400 });
    }
    const option = quote.quote_options[selected_option];
    if (!option) {
      return NextResponse.json({ error: 'Invalid option selected' }, { status: 400 });
    }
    const items = option.line_items || [];
    const subtotal = items.reduce((sum: number, item: { total?: number }) => sum + (Number(item.total ?? 0) || 0), 0);
    const roundedSubtotal = Math.round(subtotal * 100) / 100;

    // Apply same discount/tax logic as update route
    const taxRate = quote.tax_rate != null ? Number(quote.tax_rate) : null;
    const discAmt = quote.discount_amount != null ? Number(quote.discount_amount) : null;
    const discPct = quote.discount_percent != null ? Number(quote.discount_percent) : null;
    let discountValue = 0;
    if (discAmt != null && discAmt > 0) {
      discountValue = Math.round(Math.min(discAmt, roundedSubtotal) * 100) / 100;
    } else if (discPct != null && discPct > 0) {
      discountValue = Math.round(roundedSubtotal * (discPct / 100) * 100) / 100;
    }
    const afterDiscount = Math.round((roundedSubtotal - discountValue) * 100) / 100;
    const taxAmount = taxRate != null && taxRate > 0 ? Math.round(afterDiscount * (taxRate / 100) * 100) / 100 : 0;
    const total = Math.round((afterDiscount + taxAmount) * 100) / 100;
    const depPct = typeof quote.deposit_percent === 'number' ? quote.deposit_percent : 33;
    const depositAmount = Math.round((total * depPct) / 100 * 100) / 100;

    tierUpdate = {
      line_items: items,
      subtotal: roundedSubtotal,
      total,
      deposit_amount: depositAmount,
      selected_option,
    };
  }

  const { error } = await supabase
    .from('quotes')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      customer_signed_name: customer_signed_name || customer_name || null,
      customer_signature: customer_signature || null,
      ...(shouldAdvance ? { pipeline_stage: 'deposit_collected' } : {}),
      ...tierUpdate,
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
