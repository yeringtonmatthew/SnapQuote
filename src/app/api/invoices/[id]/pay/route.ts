import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { payment_method, payment_note, amount, payment_type } = body;

    if (!payment_method) {
      return NextResponse.json({ error: 'Payment method required' }, { status: 400 });
    }
    if (
      amount === undefined ||
      amount === null ||
      typeof amount !== 'number' ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 });
    }

    // Fetch invoice
    const { data: invoice, error: invErr } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', params.id)
      .eq('contractor_id', user.id)
      .single();

    if (invErr || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const balance = Number(invoice.amount_due) - Number(invoice.amount_paid);
    if (amount > balance + 0.01) {
      return NextResponse.json({ error: 'Amount exceeds remaining balance' }, { status: 400 });
    }

    // Insert payment
    const { error: payErr } = await supabase.from('payments').insert({
      quote_id: invoice.quote_id,
      invoice_id: params.id,
      contractor_id: user.id,
      amount,
      payment_type: payment_type || 'partial',
      payment_method,
      payment_note: payment_note || null,
      recorded_at: new Date().toISOString(),
    });

    if (payErr) {
      return NextResponse.json({ error: payErr.message }, { status: 500 });
    }

    // Recalculate amount_paid from all invoice payments
    const { data: paymentRows } = await supabase
      .from('payments')
      .select('amount')
      .eq('invoice_id', params.id);

    const newAmountPaid = (paymentRows || []).reduce(
      (sum: number, p: { amount: number }) => sum + Number(p.amount),
      0,
    );

    const amountDue = Number(invoice.amount_due);
    const isPaid = newAmountPaid >= amountDue - 0.01;
    const isPartial = newAmountPaid > 0 && !isPaid;

    const now = new Date().toISOString();
    const updatePayload: Record<string, unknown> = {
      amount_paid: newAmountPaid,
      status: isPaid ? 'paid' : isPartial ? 'partially_paid' : invoice.status,
      updated_at: now,
    };
    if (isPaid) {
      updatePayload.paid_at = now;
    }

    const { data: updated, error: updateErr } = await supabase
      .from('invoices')
      .update(updatePayload)
      .eq('id', params.id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, invoice: updated });
  } catch (err) {
    console.error('[invoice pay]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
