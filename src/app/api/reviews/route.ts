import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const contractorId = request.nextUrl.searchParams.get('contractor_id');
  if (!contractorId) {
    return NextResponse.json({ error: 'contractor_id is required' }, { status: 400 });
  }

  const supabase = createClient();
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('contractor_id', contractorId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reviews });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { contractor_id, quote_id, customer_name, rating, comment } = body;

  if (!contractor_id || !customer_name || !rating) {
    return NextResponse.json(
      { error: 'contractor_id, customer_name, and rating are required' },
      { status: 400 }
    );
  }

  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return NextResponse.json(
      { error: 'rating must be an integer between 1 and 5' },
      { status: 400 }
    );
  }

  const supabase = createClient();
  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      contractor_id,
      quote_id: quote_id || null,
      customer_name,
      rating,
      comment: comment || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ review }, { status: 201 });
}
