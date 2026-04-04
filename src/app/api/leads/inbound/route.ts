import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rate-limit';
import { generatePropertyReportForClient } from '@/lib/property-intel';

const fieldPatterns: Record<string, string[]> = {
  name: ['name', 'customer_name', 'full_name', 'contact_name', 'first_name', 'lead_name', 'customerName', 'fullName'],
  first_name: ['first_name', 'firstName', 'fname'],
  last_name: ['last_name', 'lastName', 'lname', 'surname'],
  phone: ['phone', 'phone_number', 'phoneNumber', 'telephone', 'mobile', 'cell', 'customer_phone'],
  email: ['email', 'customer_email', 'emailAddress', 'email_address'],
  address: ['address', 'job_address', 'street_address', 'location', 'property_address', 'street', 'jobAddress'],
  notes: ['notes', 'description', 'message', 'comments', 'details', 'job_description', 'scope', 'project_description'],
  source: ['source', 'lead_source', 'referral_source', 'utm_source', 'channel'],
};

function extractField(
  body: Record<string, unknown>,
  field: string,
  customMapping: Record<string, string>,
): string | undefined {
  // Check custom field_mapping first (maps incoming field name -> SnapQuote field name)
  for (const [incomingKey, snapquoteField] of Object.entries(customMapping)) {
    if (snapquoteField === field && body[incomingKey] !== undefined) {
      return String(body[incomingKey]);
    }
  }

  // Fall back to pattern matching
  const patterns = fieldPatterns[field];
  if (!patterns) return undefined;
  for (const pattern of patterns) {
    if (body[pattern] !== undefined && body[pattern] !== null && body[pattern] !== '') {
      return String(body[pattern]);
    }
  }
  return undefined;
}

export async function POST(request: NextRequest) {
  // Extract API key from header or query param
  const apiKey =
    request.headers.get('x-api-key') ||
    request.nextUrl.searchParams.get('api_key');

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing API key. Provide x-api-key header or api_key query parameter.' },
      { status: 401 },
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Look up the lead source by api_key
  const { data: leadSource, error: lsError } = await supabase
    .from('lead_sources')
    .select('*')
    .eq('api_key', apiKey)
    .maybeSingle();

  if (lsError || !leadSource) {
    return NextResponse.json(
      { error: 'Invalid API key.' },
      { status: 401 },
    );
  }

  if (!leadSource.is_active) {
    return NextResponse.json(
      { error: 'This lead source is inactive.' },
      { status: 403 },
    );
  }

  // Rate limit: 60 leads per hour per source
  if (!(await rateLimit(`lead_source_${leadSource.id}`, 60, 60 * 60 * 1000))) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Maximum 60 leads per hour per source.' },
      { status: 429 },
    );
  }

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body.' },
      { status: 400 },
    );
  }

  const customMapping: Record<string, string> = leadSource.field_mapping || {};

  // Extract fields
  let name = extractField(body, 'name', customMapping);
  const firstName = extractField(body, 'first_name', customMapping);
  const lastName = extractField(body, 'last_name', customMapping);
  const phone = extractField(body, 'phone', customMapping);
  const email = extractField(body, 'email', customMapping);
  const address = extractField(body, 'address', customMapping);
  const notes = extractField(body, 'notes', customMapping);
  const source = extractField(body, 'source', customMapping);

  // Combine first + last name if name not found
  if (!name && (firstName || lastName)) {
    name = [firstName, lastName].filter(Boolean).join(' ');
  }

  if (!name || !name.trim()) {
    return NextResponse.json(
      { error: 'Could not extract a name from the request body. Include a "name", "first_name", or "customer_name" field.' },
      { status: 400 },
    );
  }

  name = name.trim();
  const contractorId = leadSource.contractor_id;

  // Check for existing client by phone or email
  let clientId: string | null = null;

  if (phone || email) {
    let existingClient: { id: string } | null = null;

    if (phone) {
      const { data } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', contractorId)
        .eq('phone', phone.trim())
        .limit(1)
        .maybeSingle();
      existingClient = data;
    }

    if (!existingClient && email) {
      const { data } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', contractorId)
        .eq('email', email.trim())
        .limit(1)
        .maybeSingle();
      existingClient = data;
    }

    if (existingClient) {
      clientId = existingClient.id;
    }
  }

  // Create client if not found
  if (!clientId) {
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        user_id: contractorId,
        name,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null,
        tags: ['lead'],
      })
      .select('id')
      .single();

    if (clientError) {
      return NextResponse.json(
        { error: 'Failed to create client.' },
        { status: 500 },
      );
    }
    clientId = newClient.id;
  }

  // Build internal notes
  const notesParts: string[] = [];
  notesParts.push(`Lead from: ${leadSource.name}`);
  if (source) notesParts.push(`Source: ${source}`);
  if (notes) notesParts.push(`Details: ${notes}`);

  // Create quote as lead in pipeline
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .insert({
      contractor_id: contractorId,
      client_id: clientId,
      customer_name: name,
      customer_phone: phone?.trim() || null,
      customer_email: email?.trim() || null,
      job_address: address?.trim() || null,
      status: 'draft',
      pipeline_stage: 'lead',
      internal_notes: notesParts.join('\n'),
      notes: notes?.trim() || null,
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
    return NextResponse.json(
      { error: 'Failed to create lead.' },
      { status: 500 },
    );
  }

  // Fire-and-forget property intelligence
  if (address && clientId) {
    generatePropertyReportForClient(supabase, clientId, address.trim(), contractorId).catch(() => {});
  }

  // Update lead source stats (atomic increment via rpc, fallback to direct update)
  await supabase.rpc('increment_lead_source_count', { source_id: leadSource.id }).then(
    () => {},
    // Fallback if RPC doesn't exist yet
    () => supabase
      .from('lead_sources')
      .update({
        lead_count: (leadSource.lead_count || 0) + 1,
        last_lead_at: new Date().toISOString(),
      })
      .eq('id', leadSource.id)
  );
  // Always update last_lead_at
  await supabase
    .from('lead_sources')
    .update({ last_lead_at: new Date().toISOString() })
    .eq('id', leadSource.id);

  return NextResponse.json({
    success: true,
    lead_id: quote.id,
    client_id: clientId,
  });
}
