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
  if (amount === undefined || amount === null || typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 });
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

  const quoteTotal = Number(quote.total ?? quote.subtotal ?? 0);

  // Validate amount does not exceed remaining balance
  const { data: existingPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('quote_id', params.id);
  const previouslyPaid = (existingPayments || []).reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0);

  if (amount > quoteTotal - previouslyPaid + 0.01) {
    return NextResponse.json({ error: 'Amount exceeds remaining balance' }, { status: 400 });
  }

  // Insert into payments table
  const { error: payError } = await supabase.from('payments').insert({
    quote_id: params.id,
    contractor_id: user.id,
    amount,
    payment_type: body.payment_type || 'deposit',
    payment_method,
    payment_note: payment_note || null,
    recorded_at: new Date().toISOString(),
  });

  if (payError) {
    return NextResponse.json({ error: payError.message }, { status: 500 });
  }

  // Query total paid after this payment
  const { data: paymentRows } = await supabase
    .from('payments')
    .select('amount')
    .eq('quote_id', params.id);
  const totalPaid = (paymentRows || []).reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0);

  // Determine status based on totalPaid vs quote total
  const newStatus = totalPaid >= quoteTotal ? 'paid' : 'deposit_paid';
  const updatePayload: Record<string, unknown> = {
    status: newStatus,
    paid_at: new Date().toISOString(),
    payment_method,
    payment_note: payment_note || null,
  };

  // Only update pipeline_stage for partial payments
  if (newStatus === 'deposit_paid') {
    updatePayload.pipeline_stage = 'deposit_collected';
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
      const client = twilio(sid!, token!);

      const digits = quote.customer_phone?.replace(/\D/g, '') ?? '';
      const toNumber = digits.startsWith('1') ? `+${digits}` : `+1${digits}`;

      await client.messages.create({
        body: `Hi ${quote.customer_name}, ${businessName} has recorded your payment of $${Number(amount).toFixed(2)}. View your receipt here: ${receiptUrl}`,
        from,
        to: toNumber,
      });
    } catch (smsErr) {
      console.error('[pay] SMS error:', smsErr);
    }
  }

  return NextResponse.json({ success: true, quote: updated });
}
