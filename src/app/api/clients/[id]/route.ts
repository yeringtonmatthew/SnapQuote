import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/clients/[id] — get single client with stats
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (error || !client) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Fetch associated quotes
  const { data: quotes } = await supabase
    .from('quotes')
    .select('id, customer_name, total, status, pipeline_stage, quote_number, created_at, paid_at, sent_at, scheduled_date, job_address, photos')
    .eq('client_id', params.id)
    .eq('contractor_id', user.id)
    .order('created_at', { ascending: false });

  const jobCount = quotes?.length || 0;
  const totalRevenue = (quotes || [])
    .filter((q) => q.paid_at)
    .reduce((sum, q) => sum + Number(q.total), 0);
  const lastJobDate = quotes?.[0]?.created_at || null;

  return NextResponse.json({
    ...client,
    total_revenue: totalRevenue,
    job_count: jobCount,
    last_job_date: lastJobDate,
    quotes: quotes || [],
  });
}

// PATCH /api/clients/[id] — update client
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  for (const key of ['name', 'phone', 'email', 'address', 'company', 'notes']) {
    if (key in body) {
      updates[key] = typeof body[key] === 'string' ? body[key].trim() || null : body[key];
    }
  }
  if ('tags' in body) updates.tags = body.tags;

  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/clients/[id] — delete client (quotes keep their data, just unlink)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Unlink quotes first
  await supabase
    .from('quotes')
    .update({ client_id: null })
    .eq('client_id', params.id)
    .eq('contractor_id', user.id);

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
