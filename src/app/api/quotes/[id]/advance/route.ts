import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const VALID_STAGES = [
  'lead',
  'quote_created',
  'quote_sent',
  'deposit_collected',
  'job_scheduled',
  'in_progress',
  'completed',
] as const;

/**
 * POST /api/quotes/[id]/advance
 * One-tap stage advancement from the dashboard.
 * Body: { stage: string }
 */
export async function POST(
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
    const stage = body.stage as string;

    if (!VALID_STAGES.includes(stage as (typeof VALID_STAGES)[number])) {
      return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
    }

    const updates: Record<string, string | null> = { pipeline_stage: stage };

    if (stage === 'in_progress' && !quote.started_at) {
      updates.started_at = new Date().toISOString();
    }
    if (stage === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
    if (quote.pipeline_stage === 'completed' && stage !== 'completed') {
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

    return NextResponse.json({ success: true, stage });
  } catch (err) {
    console.error('[advance] ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
