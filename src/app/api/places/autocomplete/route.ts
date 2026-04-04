import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  // Require authentication — don't expose Google Maps API as public proxy
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ predictions: [] });
  }

  const input = request.nextUrl.searchParams.get('input');

  if (!input || input.length < 3) {
    return NextResponse.json({ predictions: [] });
  }

  const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ predictions: [] });
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    url.searchParams.set('input', input);
    url.searchParams.set('types', 'address');
    url.searchParams.set('components', 'country:us');
    url.searchParams.set('key', apiKey);

    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    const data = await res.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('[places/autocomplete] Google API error:', data.status, data.error_message);
      return NextResponse.json({ predictions: [] });
    }

    return NextResponse.json({
      predictions: (data.predictions || []).slice(0, 5).map((p: { description: string; place_id: string }) => ({
        description: p.description,
        place_id: p.place_id,
      })),
    });
  } catch (err) {
    console.error('[places/autocomplete] Fetch error:', err);
    return NextResponse.json({ predictions: [] });
  }
}
