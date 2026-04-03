import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { VALID_STAGES } from '@/lib/constants';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    customer_name,
    customer_phone,
    customer_email,
    job_address,
    photos,
    ai_description,
    scope_of_work,
    line_items,
    inspection_findings,
    subtotal,
    tax_rate,
    discount_amount,
    discount_percent,
    total,
    deposit_amount,
    deposit_percent,
    notes,
    status,
    pipeline_stage,
    client_id,
  } = body;

  if (customer_name === undefined || customer_name === null || typeof customer_name !== 'string') {
    return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
  }

  if (subtotal !== undefined && (typeof subtotal !== 'number' || subtotal < 0)) {
    return NextResponse.json({ error: 'Subtotal must be a number >= 0' }, { status: 400 });
  }

  if (deposit_percent !== undefined && (typeof deposit_percent !== 'number' || deposit_percent < 0 || deposit_percent > 100)) {
    return NextResponse.json({ error: 'Deposit percent must be between 0 and 100' }, { status: 400 });
  }

  if (line_items !== undefined && !Array.isArray(line_items)) {
    return NextResponse.json({ error: 'Line items must be an array' }, { status: 400 });
  }

  // Validate pipeline_stage if provided
  if (pipeline_stage && !VALID_STAGES.includes(pipeline_stage)) {
    return NextResponse.json({ error: 'Invalid pipeline stage' }, { status: 400 });
  }

  // Validate status if provided
  const VALID_STATUSES = ['draft', 'sent'];
  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status for new quote' }, { status: 400 });
  }

  // Atomically get next quote number for this contractor (prevents race conditions)
  const { data: nextNum } = await supabase.rpc('next_quote_number', { p_contractor_id: user.id });
  const nextQuoteNumber = nextNum || 1;

  const { data: quote, error } = await supabase
    .from('quotes')
    .insert({
      contractor_id: user.id,
      quote_number: nextQuoteNumber,
      customer_name,
      customer_phone: customer_phone || null,
      customer_email: customer_email || null,
      job_address: job_address || null,
      photos: photos || [],
      ai_description: ai_description || null,
      scope_of_work: scope_of_work || null,
      line_items: line_items || [],
      inspection_findings: inspection_findings || null,
      subtotal: subtotal ?? 0,
      tax_rate: tax_rate ?? null,
      discount_amount: discount_amount ?? null,
      discount_percent: discount_percent ?? null,
      total: total ?? subtotal ?? 0,
      deposit_amount: deposit_amount ?? 0,
      deposit_percent: deposit_percent ?? 0,
      notes: notes || null,
      status: status || 'draft',
      pipeline_stage: pipeline_stage || undefined,
      client_id: client_id || null,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
      expires_at: status === 'sent'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null,
    })
    .select()
    .single();

  if (error) {
    console.error('Save quote error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Copy photos to client record so they persist even if quote is deleted
  if (quote.client_id && photos && photos.length > 0) {
    const { data: client } = await supabase
      .from('clients')
      .select('photos')
      .eq('id', quote.client_id)
      .single();

    const existingPhotos: string[] = (client as any)?.photos || [];
    const newPhotos = photos.filter((p: string) => !existingPhotos.includes(p));
    if (newPhotos.length > 0) {
      await supabase
        .from('clients')
        .update({ photos: [...existingPhotos, ...newPhotos] })
        .eq('id', quote.client_id);
    }
  }

  return NextResponse.json(quote);
}
