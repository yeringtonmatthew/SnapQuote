import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        quotes!inner (
          customer_name, customer_phone, customer_email,
          job_address, quote_number, total, line_items,
          scope_of_work, notes
        )
      `)
      .eq('id', params.id)
      .eq('contractor_id', user.id)
      .single();

    if (error || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Flatten
    const q = invoice.quotes as Record<string, unknown> | null;
    const flat = {
      ...invoice,
      customer_name: q?.customer_name ?? null,
      customer_phone: q?.customer_phone ?? null,
      customer_email: q?.customer_email ?? null,
      job_address: q?.job_address ?? null,
      quote_number: q?.quote_number ?? null,
      total: q?.total ?? null,
      line_items: q?.line_items ?? [],
      scope_of_work: q?.scope_of_work ?? null,
      quote_notes: q?.notes ?? null,
      quotes: undefined,
    };

    // Fetch payments for this invoice
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', params.id)
      .order('recorded_at', { ascending: false });

    return NextResponse.json({ ...flat, payments: payments || [] });
  } catch (err) {
    console.error('[invoice GET]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const allowed: Record<string, unknown> = {};
    if (body.status !== undefined) allowed.status = body.status;
    if (body.due_date !== undefined) allowed.due_date = body.due_date;
    if (body.notes !== undefined) allowed.notes = body.notes;

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    allowed.updated_at = new Date().toISOString();

    const { data: updated, error } = await supabase
      .from('invoices')
      .update(allowed)
      .eq('id', params.id)
      .eq('contractor_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[invoice PATCH]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
