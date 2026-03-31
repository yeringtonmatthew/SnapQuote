import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { quote_id, photo_index, annotated_image } = body;

  if (!quote_id || photo_index == null || !annotated_image) {
    return NextResponse.json(
      { error: 'Missing required fields: quote_id, photo_index, annotated_image' },
      { status: 400 }
    );
  }

  // Verify the quote belongs to this user
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .select('id, photos')
    .eq('id', quote_id)
    .eq('contractor_id', user.id)
    .single();

  if (quoteError || !quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
  }

  const photos: string[] = quote.photos || [];
  if (photo_index < 0 || photo_index >= photos.length) {
    return NextResponse.json({ error: 'Invalid photo index' }, { status: 400 });
  }

  // Decode base64 and upload to Supabase storage
  // The annotated_image comes as a data URL: "data:image/jpeg;base64,..."
  const base64Data = annotated_image.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  const fileName = `annotated-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const filePath = `quotes/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('photos')
    .upload(filePath, buffer, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (uploadError) {
    console.error('[Annotate] Upload error:', uploadError.message);
    return NextResponse.json({ error: 'Failed to upload annotated image' }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from('photos').getPublicUrl(filePath);
  const newUrl = urlData.publicUrl;

  // Update the photos array — replace the photo at the given index
  const updatedPhotos = [...photos];
  updatedPhotos[photo_index] = newUrl;

  const { error: updateError } = await supabase
    .from('quotes')
    .update({ photos: updatedPhotos })
    .eq('id', quote_id)
    .eq('contractor_id', user.id);

  if (updateError) {
    console.error('[Annotate] Update error:', updateError.message);
    return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 });
  }

  return NextResponse.json({ url: newUrl });
}
