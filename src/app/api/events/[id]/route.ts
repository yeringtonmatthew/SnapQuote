import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Only allow known fields to be updated
  const allowedFields = [
    'title',
    'event_type',
    'event_date',
    'quote_id',
    'start_time',
    'end_time',
    'all_day',
    'notes',
    'color',
    'completed',
  ];

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const { data: event, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', params.id)
    .eq('contractor_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Update event error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // If date or time changed and event is linked to a quote, sync back
  if (event.quote_id && ('event_date' in updates || 'start_time' in updates)) {
    const { error: syncError } = await supabase
      .from('quotes')
      .update({
        scheduled_date: event.event_date,
        scheduled_time: event.start_time || null,
      })
      .eq('id', event.quote_id)
      .eq('contractor_id', user.id);

    if (syncError) {
      console.error('Sync quote schedule error:', syncError);
    }
  }

  return NextResponse.json(event);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', params.id)
    .eq('contractor_id', user.id);

  if (error) {
    console.error('Delete event error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
