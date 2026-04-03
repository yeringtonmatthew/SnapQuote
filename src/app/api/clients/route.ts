import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generatePropertyReportForClient } from '@/lib/property-intel';

// GET /api/clients — list all clients for the logged-in user
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
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
