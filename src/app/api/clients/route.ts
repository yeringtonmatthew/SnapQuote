import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generatePropertyReportForClient } from '@/lib/property-intel';

// GET /api/clients — list clients for the logged-in user (supports pagination + search)
export async function GET(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const search = searchParams.get('search')?.trim() || '';
  const withStats = searchParams.get('withStats') === '1';

  // Build query
  let query = supabase
    .from('clients')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id);

  if (search) {
    // Escape LIKE metacharacters to prevent pattern injection before embedding in ilike filter
    const escapedSearch = search.replace(/%/g, '\\%').replace(/_/g, '\\_');
    // Search across name, company, phone, email using Supabase ilike
    query = query.or(
      `name.ilike.%${escapedSearch}%,company.ilike.%${escapedSearch}%,phone.ilike.%${escapedSearch}%,email.ilike.%${escapedSearch}%`
    );
  }

  query = query.order('name', { ascending: true }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Optionally enrich with quote stats
  if (withStats && data && data.length > 0) {
    const { data: quotes } = await supabase
      .from('quotes')
      .select('client_id, total, paid_at')
      .eq('contractor_id', user.id)
      .not('client_id', 'is', null);

    const statsMap: Record<string, { count: number; revenue: number }> = {};
    for (const q of quotes || []) {
      if (!q.client_id) continue;
      if (!statsMap[q.client_id]) statsMap[q.client_id] = { count: 0, revenue: 0 };
      statsMap[q.client_id].count++;
      if (q.paid_at) statsMap[q.client_id].revenue += Number(q.total);
    }

    const enriched = data.map((c) => ({
      ...c,
      job_count: statsMap[c.id]?.count || 0,
      total_revenue: statsMap[c.id]?.revenue || 0,
    }));

    return NextResponse.json({ clients: enriched, total: count ?? 0 });
  }

  return NextResponse.json({ clients: data, total: count ?? 0 });
}

// POST /api/clients — create a new client
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, phone, email, address, company, notes, tags, lead_source } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('clients')
    .insert({
      user_id: user.id,
      name: name.trim(),
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      address: address?.trim() || null,
      company: company?.trim() || null,
      notes: notes?.trim() || null,
      tags: tags || [],
      lead_source: lead_source?.trim() || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fire-and-forget property intelligence (don't await — don't block the response)
  if (data.address && data.id) {
    generatePropertyReportForClient(supabase, data.id, data.address, user.id).catch(() => {});
  }

  return NextResponse.json(data, { status: 201 });
}
