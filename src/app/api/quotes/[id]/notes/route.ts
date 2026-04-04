import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface Note {
  id: string;
  text: string;
  created_at: string;
  updated_at: string;
}

async function getQuoteWithNotes(supabase: ReturnType<typeof createClient>, quoteId: string, userId: string) {
  const { data, error } = await supabase
    .from('quotes')
    .select('id, contractor_id, job_notes')
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

    const quote = await getQuoteWithNotes(supabase, params.id, user.id);
    if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

    const body = await request.json();
    const { text } = body;
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }
    if (text.length > 10_000) {
      return NextResponse.json({ error: 'Note text exceeds maximum length of 10,000 characters' }, { status: 400 });
    }

    const notes: Note[] = quote.job_notes || [];
    const now = new Date().toISOString();
    notes.push({ id: crypto.randomUUID(), text, created_at: now, updated_at: now });

    const { error } = await supabase
      .from('quotes')
      .update({ job_notes: notes })
      .eq('id', params.id)
      .eq('contractor_id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[notes POST] ERROR:', err);
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

    const quote = await getQuoteWithNotes(supabase, params.id, user.id);
    if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

    const body = await request.json();
    const { note_id, text } = body;
    if (!note_id || !text || typeof text !== 'string') {
      return NextResponse.json({ error: 'note_id and text are required' }, { status: 400 });
    }
    if (text.length > 10_000) {
      return NextResponse.json({ error: 'Note text exceeds maximum length of 10,000 characters' }, { status: 400 });
    }

    const notes: Note[] = quote.job_notes || [];
    const note = notes.find((n) => n.id === note_id);
    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });

    note.text = text;
    note.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('quotes')
      .update({ job_notes: notes })
      .eq('id', params.id)
      .eq('contractor_id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[notes PATCH] ERROR:', err);
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

    const quote = await getQuoteWithNotes(supabase, params.id, user.id);
    if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

    const body = await request.json();
    const { note_id } = body;
    if (!note_id) return NextResponse.json({ error: 'note_id is required' }, { status: 400 });

    const notes: Note[] = quote.job_notes || [];
    const filtered = notes.filter((n) => n.id !== note_id);

    const { error } = await supabase
      .from('quotes')
      .update({ job_notes: filtered })
      .eq('id', params.id)
      .eq('contractor_id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[notes DELETE] ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
