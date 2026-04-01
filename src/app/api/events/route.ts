import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (!start || !end) {
    return NextResponse.json(
      { error: 'start and end query params are required' },
      { status: 400 }
    );
  }

  const { data: events, error } = await supabase
    .from('events')
    .select(`
      *,
      quotes:quote_id (
        customer_name,
        job_address,
        customer_phone,
        quote_number,
        pipeline_stage,
        total
      )
    `)
    .eq('contractor_id', user.id)
    .gte('event_date', start)
    .lte('event_date', end)
    .order('event_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Fetch events error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Flatten the joined quotes data onto each event
  const flattened = (events || []).map((event: any) => {
    const { quotes, ...rest } = event;
    return {
      ...rest,
      customer_name: quotes?.customer_name ?? null,
      job_address: quotes?.job_address ?? null,
      customer_phone: quotes?.customer_phone ?? null,
      quote_number: quotes?.quote_number ?? null,
      pipeline_stage: quotes?.pipeline_stage ?? null,
      total: quotes?.total ?? null,
    };
  });

  return NextResponse.json(flattened);
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    title,
    event_type,
    event_date,
    quote_id,
    start_time,
    end_time,
    all_day,
    notes,
    color,
  } = body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  if (!event_type) {
    return NextResponse.json({ error: 'event_type is required' }, { status: 400 });
  }

  if (!event_date) {
    return NextResponse.json({ error: 'event_date is required' }, { status: 400 });
  }

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      contractor_id: user.id,
      title: title.trim(),
      event_type,
      event_date,
      quote_id: quote_id || null,
      start_time: start_time || null,
      end_time: end_time || null,
      all_day: all_day ?? false,
      notes: notes || null,
      color: color || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Create event error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If this is a job_scheduled event linked to a quote, sync back to the quote
  if (quote_id && event_type === 'job_scheduled') {
    const { error: updateError } = await supabase
      .from('quotes')
      .update({
        scheduled_date: event_date,
        scheduled_time: start_time || null,
        pipeline_stage: 'job_scheduled',
      })
      .eq('id', quote_id)
      .eq('contractor_id', user.id);

    if (updateError) {
      console.error('Sync quote schedule error:', updateError);
    }
  }

  return NextResponse.json(event);
}
