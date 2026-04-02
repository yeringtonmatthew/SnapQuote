import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { google_place_id } = await request.json();
  if (!google_place_id) {
    return NextResponse.json({ error: 'Google Place ID is required' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
  }

  try {
    // Fetch place details including reviews
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.set('place_id', google_place_id);
    url.searchParams.set('fields', 'reviews,rating,user_ratings_total,name');
    url.searchParams.set('key', apiKey);

    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.status !== 'OK') {
      console.error('[sync-google] Google API error:', data.status, data.error_message);
      return NextResponse.json({ error: `Google API error: ${data.status}` }, { status: 400 });
    }

    const reviews = data.result?.reviews || [];
    const overallRating = data.result?.rating || null;
    const totalRatings = data.result?.user_ratings_total || 0;
    const businessName = data.result?.name || null;

    if (reviews.length === 0) {
      return NextResponse.json({
        success: true,
        synced: 0,
        overall_rating: overallRating,
        total_ratings: totalRatings,
      });
    }

    // Delete existing Google reviews for this contractor (replace with fresh data)
    await supabase
      .from('reviews')
      .delete()
      .eq('contractor_id', user.id)
      .eq('source', 'google');

    // Insert new Google reviews
    const reviewRows = reviews.map((r: any) => ({
      contractor_id: user.id,
      customer_name: r.author_name || 'Google Reviewer',
      rating: r.rating,
      comment: r.text || null,
      source: 'google',
      reviewer_photo_url: r.profile_photo_url || null,
      created_at: r.time ? new Date(r.time * 1000).toISOString() : new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from('reviews')
      .insert(reviewRows);

    if (insertError) {
      console.error('[sync-google] Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save reviews' }, { status: 500 });
    }

    // Update last fetched timestamp
    await supabase
      .from('users')
      .update({ reviews_last_fetched_at: new Date().toISOString() })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      synced: reviewRows.length,
      overall_rating: overallRating,
      total_ratings: totalRatings,
      business_name: businessName,
    });
  } catch (err) {
    console.error('[sync-google] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch Google reviews' }, { status: 500 });
  }
}
