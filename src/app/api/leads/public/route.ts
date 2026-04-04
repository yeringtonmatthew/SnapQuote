import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Rate limit by IP: 5 submissions per hour
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (!(await rateLimit(`public_lead_${ip}`, 5, 60 * 60 * 1000))) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 },
    );
  }

  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const jobAddress = typeof body.job_address === 'string' ? body.job_address.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';

  // Validation
  if (!slug) {
    return NextResponse.json({ error: 'Missing contractor.' }, { status: 400 });
  }
  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'Name is required (min 2 characters).' }, { status: 400 });
  }
  if (!phone || phone.length < 7) {
    return NextResponse.json({ error: 'A valid phone number is required.' }, { status: 400 });
  }
  if (!description || description.length < 10) {
    return NextResponse.json(
      { error: 'Please describe the work needed (min 10 characters).' },
      { status: 400 },
    );
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
  }
  // Cap field lengths to prevent abuse
  if (name.length > 200 || phone.length > 30 || email.length > 200 || jobAddress.length > 500 || description.length > 5000) {
    return NextResponse.json({ error: 'Input too long.' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Look up contractor by slug
  const { data: contractor, error: contractorError } = await supabase
    .from('users')
    .select('id, business_name')
    .eq('profile_slug', slug)
    .eq('profile_public', true)
    .single();

  if (contractorError || !contractor) {
    return NextResponse.json({ error: 'Contractor not found.' }, { status: 404 });
  }

  const contractorId = contractor.id;

  // Find existing client by phone
  let clientId: string | null = null;

  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', contractorId)
    .eq('phone', phone)
    .limit(1)
    .maybeSingle();

  if (existingClient) {
    clientId = existingClient.id;
  }

  // Create client if not found
  if (!clientId) {
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        user_id: contractorId,
        name,
        phone,
        email: email || null,
        address: jobAddress || null,
        tags: ['lead'],
      })
      .select('id')
      .single();

    if (clientError) {
      return NextResponse.json({ error: 'Failed to create client.' }, { status: 500 });
    }
    clientId = newClient.id;
  }

  // Create quote as lead
  const internalNotes = `Lead from: Public profile page\nDetails: ${description}`;

  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .insert({
      contractor_id: contractorId,
      client_id: clientId,
      customer_name: name,
      customer_phone: phone,
      customer_email: email || null,
      job_address: jobAddress || null,
      status: 'draft',
      pipeline_stage: 'lead',
      internal_notes: internalNotes,
      notes: description,
      line_items: [],
      subtotal: 0,
      total: 0,
      deposit_amount: 0,
      deposit_percent: 0,
      photos: [],
      job_photos: [],
      job_notes: [],
      job_tasks: [],
      archived: false,
    })
    .select('id')
    .single();

  if (quoteError) {
    return NextResponse.json({ error: 'Failed to create lead.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, lead_id: quote.id });
}
