import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import twilio from 'twilio';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { payment_method, payment_note, amount } = body;

  if (!payment_method) {
    return NextResponse.json({ error: 'Payment method required' }, { status: 400 });
  }

  // Validate payment amount
  if (amount !== undefined && amount !== null) {
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 });
    }
  }

  const { data: quote, error: fetchError } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', params.id)
    .eq('contractor_id', user.id)
    .single();

  if (fetchError || !quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
  }

  // Validate amount does not exceed quote total
  if (amount !== undefined && amount !== null) {
    const quoteTotal = Number(quote.total ?? quote.subtotal ?? 0);
    if (amount > quoteTotal) {
      return NextResponse.json({ error: 'Amount exceeds quote total' }, { status: 400 });
    }
  }

  // If a custom amount was provided (e.g. full payment or balance), update deposit_amount
  const updatePayload: Record<string, unknown> = {
    status: 'deposit_paid',
    paid_at: new Date().toISOString(),
    payment_method,
    payment_note: payment_note || null,
    pipeline_stage: 'deposit_collected',
  };
  if (amount !== undefined && amount !== null) {
    updatePayload.deposit_amount = amount;
  }

  const { data: updated, error } = await supabase
    .from('quotes')
    .update(updatePayload)
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send SMS receipt if phone + Twilio configured
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (quote.customer_phone && sid && token && from) {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('business_name, full_name')
        .eq('id', user.id)
        .single();

      const businessName = profile?.business_name || profile?.full_name || 'Licensed Professional';
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://snapquote.dev';
      const receiptUrl = `${appUrl}/receipt/${params.id}`;
      const paidAmount = amount || quote.deposit_amount;
      const client = twilio(sid!, token!);

      const digits = quote.customer_phone?.replace(/\D/g, '') ?? '';
      const toNumber = digits.startsWith('1') ? `+${digits}` : `+1${digits}`;

      await client.messages.create({
        body: `Hi ${quote.customer_name}, ${businessName} has recorded your payment of $${Number(paidAmount).toFixed(2)}. View your receipt here: ${receiptUrl}`,
        from,
        to: toNumber,
      });
    } catch (smsErr) {
      console.error('[pay] SMS error:', smsErr);
    }
  }

  return NextResponse.json({ success: true, quote: updated });
}
