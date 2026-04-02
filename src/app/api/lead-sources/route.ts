import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const suffix = crypto.randomBytes(3).toString('hex'); // 6-char hex
  return `${base}-${suffix}`;
}

// GET /api/lead-sources — list all lead sources for the logged-in contractor
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('lead_sources')
    .select('*')
    .eq('contractor_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/lead-sources — create a new lead source
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const slug = generateSlug(name.trim());
  const api_key = `sk_${crypto.randomUUID().replace(/-/g, '')}`;

  const { data, error } = await supabase
    .from('lead_sources')
    .insert({
      contractor_id: user.id,
      name: name.trim(),
      slug,
      api_key,
      is_active: true,
      lead_count: 0,
      field_mapping: {},
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    {
      ...data,
      webhook_url: 'https://snapquote.dev/api/leads/inbound',
    },
    { status: 201 },
  );
}
