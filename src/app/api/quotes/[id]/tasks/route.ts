import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface Task {
  id: string;
  text: string;
  done: boolean;
  created_at: string;
}

async function getQuoteWithTasks(supabase: ReturnType<typeof createClient>, quoteId: string, userId: string) {
  const { data, error } = await supabase
    .from('quotes')
    .select('id, contractor_id, job_tasks')
    .eq('id', quoteId)
    .eq('contractor_id', userId)
    .single();

  if (error || !data) return null;
  return data;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const quote = await getQuoteWithTasks(supabase, params.id, user.id);
    if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

    const body = await request.json();
    const { text } = body;
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }
    if (text.length > 1_000) {
      return NextResponse.json({ error: 'Task text exceeds maximum length of 1,000 characters' }, { status: 400 });
    }

    const tasks: Task[] = quote.job_tasks || [];
    tasks.push({
      id: crypto.randomUUID(),
      text,
      done: false,
      created_at: new Date().toISOString(),
    });

    const { error } = await supabase
      .from('quotes')
      .update({ job_tasks: tasks })
      .eq('id', params.id)
      .eq('contractor_id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[tasks POST] ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const quote = await getQuoteWithTasks(supabase, params.id, user.id);
    if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

    const body = await request.json();
    const { task_id, done, text } = body;
    if (!task_id) return NextResponse.json({ error: 'task_id is required' }, { status: 400 });

    const tasks: Task[] = quote.job_tasks || [];
    const task = tasks.find((t) => t.id === task_id);
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    if (typeof done === 'boolean') task.done = done;
    if (typeof text === 'string') {
      if (text.length > 1_000) {
        return NextResponse.json({ error: 'Task text exceeds maximum length of 1,000 characters' }, { status: 400 });
      }
      task.text = text;
    }

    const { error } = await supabase
      .from('quotes')
      .update({ job_tasks: tasks })
      .eq('id', params.id)
      .eq('contractor_id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[tasks PATCH] ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const quote = await getQuoteWithTasks(supabase, params.id, user.id);
    if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

    const body = await request.json();
    const { task_id } = body;
    if (!task_id) return NextResponse.json({ error: 'task_id is required' }, { status: 400 });

    const tasks: Task[] = quote.job_tasks || [];
    const filtered = tasks.filter((t) => t.id !== task_id);

    const { error } = await supabase
      .from('quotes')
      .update({ job_tasks: filtered })
      .eq('id', params.id)
      .eq('contractor_id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[tasks DELETE] ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
