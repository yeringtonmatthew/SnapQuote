import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Fetch existing quote to verify ownership and check status
  const { data: existing, error: fetchError } = await supabase
    .from('quotes')
    .select('id, contractor_id, status')
    .eq('id', params.id)
    .eq('contractor_id', user.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
  }

  const body = await request.json();

  // Allow internal_notes to be saved on any status (private contractor notes)
  if (Object.keys(body).length === 1 && 'internal_notes' in body) {
    const { data: quote, error } = await supabase
      .from('quotes')
      .update({ internal_notes: body.internal_notes || null })
      .eq('id', params.id)
      .eq('contractor_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Update internal_notes error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(quote);
  }

  // Only allow editing draft or sent quotes
  if (existing.status !== 'draft' && existing.status !== 'sent') {
    return NextResponse.json(
      { error: `Cannot edit a quote with status "${existing.status}". Only draft or sent quotes can be edited.` },
      { status: 403 }
    );
  }

  const {
    customer_name,
    customer_phone,
    job_address,
    scope_of_work,
    line_items,
    deposit_percent,
    tax_rate,
    discount_amount,
    discount_percent,
    notes,
    internal_notes,
  } = body;

  // Validate required fields
  if (!customer_name || typeof customer_name !== 'string' || !customer_name.trim()) {
    return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
  }

  if (line_items !== undefined && !Array.isArray(line_items)) {
    return NextResponse.json({ error: 'Line items must be an array' }, { status: 400 });
  }

  const validDepositPercent = typeof deposit_percent === 'number' && deposit_percent >= 0 && deposit_percent <= 100
    ? deposit_percent
    : 33;

  // Server-side recalculation of subtotal and deposit from line items
  const items = Array.isArray(line_items) ? line_items : [];
  const subtotal = items.reduce((sum: number, item: any) => {
    const total = Number(item.total) || 0;
    return sum + Math.round(total * 100) / 100;
  }, 0);
  const roundedSubtotal = Math.round(subtotal * 100) / 100;

  // Calculate discount
  const validTaxRate = typeof tax_rate === 'number' && tax_rate >= 0 ? tax_rate : null;
  const validDiscountAmount = typeof discount_amount === 'number' && discount_amount >= 0 ? discount_amount : null;
  const validDiscountPercent = typeof discount_percent === 'number' && discount_percent >= 0 && discount_percent <= 100 ? discount_percent : null;

  let discountValue = 0;
  if (validDiscountAmount != null) {
    discountValue = Math.round(Math.min(validDiscountAmount, roundedSubtotal) * 100) / 100;
  } else if (validDiscountPercent != null) {
    discountValue = Math.round(roundedSubtotal * (validDiscountPercent / 100) * 100) / 100;
  }
  const afterDiscount = Math.round((roundedSubtotal - discountValue) * 100) / 100;

  // Calculate tax (applied after discount)
  const taxAmount = validTaxRate != null
    ? Math.round(afterDiscount * (validTaxRate / 100) * 100) / 100
    : 0;
  const total = Math.round((afterDiscount + taxAmount) * 100) / 100;

  // Deposit is based on final total
  const depositAmount = Math.round((total * validDepositPercent) / 100 * 100) / 100;

  const { data: quote, error } = await supabase
    .from('quotes')
    .update({
      customer_name: customer_name.trim(),
      customer_phone: customer_phone || null,
      ...(job_address !== undefined ? { job_address: job_address || null } : {}),
      scope_of_work: scope_of_work || null,
      line_items: items,
      subtotal: roundedSubtotal,
      tax_rate: validTaxRate,
      discount_amount: validDiscountAmount,
      discount_percent: validDiscountPercent,
      total,
      deposit_amount: depositAmount,
      deposit_percent: validDepositPercent,
      notes: notes || null,
      ...(internal_notes !== undefined ? { internal_notes: internal_notes || null } : {}),
    })
    .eq('id', params.id)
    .eq('contractor_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Update quote error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(quote);
}
