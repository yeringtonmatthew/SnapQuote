import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const contractorId = request.nextUrl.searchParams.get('contractor_id');
  if (!contractorId) {
    return NextResponse.json({ error: 'contractor_id is required' }, { status: 400 });
  }

  const supabase = createClient();

  // Require authentication and restrict to own reviews only.
  // Public review widgets should use a dedicated public endpoint scoped
  // to display-safe fields only.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (user.id !== contractorId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('id, contractor_id, quote_id, customer_name, rating, comment, created_at')
    .eq('contractor_id', contractorId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reviews });
}

export async function POST(request: NextRequest) {
  // Rate limit: 5 reviews per hour per IP
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!(await rateLimit(ip + ':reviews', 5, 3_600_000))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

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

  // Require a valid quote_id linked to the contractor to prevent fake reviews
  if (!quote_id) {
    return NextResponse.json(
      { error: 'quote_id is required to submit a review' },
      { status: 400 }
    );
  }

  const supabase = createClient();

  // Verify the quote exists, belongs to this contractor, and is paid
  const { data: quote } = await supabase
    .from('quotes')
    .select('id, contractor_id, status')
    .eq('id', quote_id)
    .eq('contractor_id', contractor_id)
    .single();

  if (!quote) {
    return NextResponse.json({ error: 'Invalid quote' }, { status: 400 });
  }

  if (quote.status !== 'deposit_paid' && quote.status !== 'approved') {
    return NextResponse.json(
      { error: 'Reviews can only be submitted for completed quotes' },
      { status: 400 }
    );
  }

  // Check for duplicate review on same quote
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('quote_id', quote_id)
    .limit(1)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: 'A review has already been submitted for this quote' },
      { status: 409 }
    );
  }

  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      contractor_id,
      quote_id,
      customer_name: String(customer_name).slice(0, 200),
      rating,
      comment: comment ? String(comment).slice(0, 2000) : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ review }, { status: 201 });
}
