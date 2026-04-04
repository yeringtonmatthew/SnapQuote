import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { ids, action } = body;

  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 500) {
    return NextResponse.json({ error: 'Invalid request — max 500 items' }, { status: 400 });
  }

  if (action !== 'archive' && action !== 'unarchive' && action !== 'delete') {
    return NextResponse.json(
      { error: 'action must be "archive", "unarchive", or "delete"' },
      { status: 400 }
    );
  }

  if (action === 'delete') {
    // Before deleting, preserve photos on client records
    const { data: quotesToDelete } = await supabase
      .from('quotes')
      .select('id, client_id, photos')
      .in('id', ids)
      .eq('contractor_id', user.id);

    if (quotesToDelete) {
      for (const q of quotesToDelete) {
        if (q.client_id && q.photos && q.photos.length > 0) {
          const { data: client } = await supabase
            .from('clients')
            .select('photos')
            .eq('id', q.client_id)
            .single();
          const existingPhotos: string[] = (client as { photos?: string[] } | null)?.photos || [];
          const newPhotos = q.photos.filter((p: string) => !existingPhotos.includes(p));
          if (newPhotos.length > 0) {
            await supabase
              .from('clients')
              .update({ photos: [...existingPhotos, ...newPhotos] })
              .eq('id', q.client_id);
          }
        }
      }
    }

    const { data, error } = await supabase
      .from('quotes')
      .delete()
      .in('id', ids)
      .eq('contractor_id', user.id)
      .select('id');

    if (error) {
      console.error('Bulk delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: data?.length ?? 0 });
  }

  const archived = action === 'archive';

  const { data, error } = await supabase
    .from('quotes')
    .update({ archived })
    .in('id', ids)
    .eq('contractor_id', user.id)
    .select('id');

  if (error) {
    console.error('Bulk update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, count: data?.length ?? 0 });
}
