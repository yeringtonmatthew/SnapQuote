import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: templates, error } = await supabase
    .from('quote_templates')
    .select('*')
    .eq('contractor_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, line_items, notes, scope_of_work } = body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
  }

  if (!Array.isArray(line_items)) {
    return NextResponse.json({ error: 'Line items must be an array' }, { status: 400 });
  }

  const { data: template, error } = await supabase
    .from('quote_templates')
    .insert({
      contractor_id: user.id,
      name: name.trim(),
      line_items,
      notes: notes || null,
      scope_of_work: scope_of_work || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Save template error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(template);
}
