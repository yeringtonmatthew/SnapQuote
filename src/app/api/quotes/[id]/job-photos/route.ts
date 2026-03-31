import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface JobPhoto {
  url: string;
  category: 'before' | 'during' | 'after';
  caption: string | null;
  created_at: string;
}

const VALID_CATEGORIES = ['before', 'during', 'after'];

async function getQuoteWithPhotos(supabase: ReturnType<typeof createClient>, quoteId: string, userId: string) {
  const { data, error } = await supabase
    .from('quotes')
    .select('id, contractor_id, job_photos')
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

    const quote = await getQuoteWithPhotos(supabase, params.id, user.id);
    if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

    const body = await request.json();
    const { url, category, caption } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'category must be before, during, or after' }, { status: 400 });
    }

    const photos: JobPhoto[] = quote.job_photos || [];
    photos.push({
      url,
      category,
      caption: caption || null,
      created_at: new Date().toISOString(),
    });

    const { error } = await supabase
      .from('quotes')
      .update({ job_photos: photos })
      .eq('id', params.id)
      .eq('contractor_id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[job-photos POST] ERROR:', err);
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

    const quote = await getQuoteWithPhotos(supabase, params.id, user.id);
    if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

    const body = await request.json();
    const { url } = body;
    if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 });

    const photos: JobPhoto[] = quote.job_photos || [];
    const filtered = photos.filter((p) => p.url !== url);

    const { error } = await supabase
      .from('quotes')
      .update({ job_photos: filtered })
      .eq('id', params.id)
      .eq('contractor_id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[job-photos DELETE] ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
