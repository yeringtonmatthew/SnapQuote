import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const VALID_STAGES = [
  'lead',
  'follow_up',
  'quote_created',
  'quote_sent',
  'deposit_collected',
  'job_scheduled',
  'in_progress',
  'completed',
] as const;

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: quote, error: fetchError } = await supabase
      .from('quotes')
      .select('id, contractor_id, pipeline_stage, started_at, completed_at')
      .eq('id', params.id)
      .eq('contractor_id', user.id)
      .single();

    if (fetchError || !quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const body = await request.json();
    const { pipeline_stage } = body;

    if (!VALID_STAGES.includes(pipeline_stage)) {
      return NextResponse.json({ error: 'Invalid pipeline stage' }, { status: 400 });
    }

    const updates: Record<string, string | null> = { pipeline_stage };

    // Set started_at when moving to in_progress (only if not already set)
    if (pipeline_stage === 'in_progress' && !quote.started_at) {
      updates.started_at = new Date().toISOString();
    }

    // Set completed_at when moving to completed
    if (pipeline_stage === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    // Clear completed_at when moving away from completed
    if (quote.pipeline_stage === 'completed' && pipeline_stage !== 'completed') {
      updates.completed_at = null;
    }

    const { error } = await supabase
      .from('quotes')
      .update(updates)
      .eq('id', params.id)
      .eq('contractor_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[pipeline] ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
