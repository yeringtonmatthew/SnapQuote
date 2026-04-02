import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH /api/lead-sources/[id] — update a lead source
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify ownership
  const { data: existing } = await supabase
    .from('lead_sources')
    .select('id')
    .eq('id', params.id)
    .eq('contractor_id', user.id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: 'Lead source not found' }, { status: 404 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.is_active !== undefined) updates.is_active = body.is_active;
  if (body.field_mapping !== undefined) updates.field_mapping = body.field_mapping;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('lead_sources')
    .update(updates)
    .eq('id', params.id)
    .eq('contractor_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/lead-sources/[id] — delete a lead source
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify ownership and delete
  const { error } = await supabase
    .from('lead_sources')
    .delete()
    .eq('id', params.id)
    .eq('contractor_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
