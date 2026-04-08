import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select(`
        id, quote_id, contractor_id, invoice_number, status,
        amount_due, amount_paid, due_date, sent_at, paid_at,
        notes, created_at, updated_at,
        quotes!inner (
          customer_name, customer_phone, customer_email,
          job_address, quote_number, total
        )
      `)
      .eq('contractor_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Flatten joined quote fields
    const flat = (invoices || []).map((inv: Record<string, unknown>) => {
      const q = inv.quotes as Record<string, unknown> | null;
      return {
        ...inv,
        customer_name: q?.customer_name ?? null,
        customer_phone: q?.customer_phone ?? null,
        customer_email: q?.customer_email ?? null,
        job_address: q?.job_address ?? null,
        quote_number: q?.quote_number ?? null,
        total: q?.total ?? null,
        quotes: undefined,
      };
    });

    return NextResponse.json(flat);
  } catch (err) {
    console.error('[invoices GET]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { quote_id } = await request.json();
    if (!quote_id) {
      return NextResponse.json({ error: 'quote_id is required' }, { status: 400 });
    }

    // Fetch the quote
    const { data: quote, error: quoteErr } = await supabase
      .from('quotes')
      .select('id, contractor_id, total, subtotal, customer_name')
      .eq('id', quote_id)
      .eq('contractor_id', user.id)
      .single();

    if (quoteErr || !quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const quoteTotal = Number(quote.total ?? quote.subtotal ?? 0);

    // Sum existing payments for this quote
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('quote_id', quote_id);

    const totalPaid = (payments || []).reduce(
      (sum: number, p: { amount: number }) => sum + Number(p.amount),
      0,
    );

    const amountDue = Math.max(0, quoteTotal - totalPaid);

    // Check if an invoice already exists for this quote
    const { data: existing } = await supabase
      .from('invoices')
      .select('id')
      .eq('quote_id', quote_id)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'An invoice already exists for this quote' },
        { status: 409 },
      );
    }

    // Get next invoice number via RPC
    const { data: invoiceNumber, error: rpcErr } = await supabase.rpc(
      'next_invoice_number',
      { p_contractor_id: user.id },
    );

    if (rpcErr) {
      return NextResponse.json({ error: rpcErr.message }, { status: 500 });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const { data: invoice, error: insertErr } = await supabase
      .from('invoices')
      .insert({
        quote_id,
        contractor_id: user.id,
        invoice_number: invoiceNumber,
        status: 'draft',
        amount_due: amountDue,
        amount_paid: totalPaid,
        due_date: dueDate.toISOString().split('T')[0],
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (err) {
    console.error('[invoices POST]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
