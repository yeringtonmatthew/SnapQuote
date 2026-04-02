import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

  // Get next quote number for this contractor
  const { data: maxRow } = await supabase
    .from('quotes')
    .select('quote_number')
    .eq('contractor_id', user.id)
    .order('quote_number', { ascending: false, nullsFirst: false })
    .limit(1)
    .single();

  const nextQuoteNumber = (maxRow?.quote_number ?? 0) + 1;

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

  return NextResponse.json(quote);
}
