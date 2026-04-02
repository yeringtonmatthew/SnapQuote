import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_ROWS = 5000;

// Rate limit: 5 imports per hour per user (in-memory, resets on deploy)
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;
  const timestamps = (rateLimitMap.get(userId) || []).filter((t) => t > hourAgo);
  if (timestamps.length >= 5) return false;
  timestamps.push(now);
  rateLimitMap.set(userId, timestamps);
  return true;
}

const fieldPatterns: Record<string, string[]> = {
  name: ['name', 'client name', 'customer name', 'full name', 'contact name', 'client', 'customer', 'first name and last name'],
  first_name: ['first name', 'first_name', 'firstname', 'fname', 'given name'],
  last_name: ['last name', 'last_name', 'lastname', 'lname', 'surname', 'family name'],
  phone: ['phone', 'phone number', 'phone_number', 'mobile', 'cell', 'telephone', 'primary phone', 'home phone', 'work phone', 'mobile phone'],
  email: ['email', 'email address', 'email_address', 'e-mail', 'primary email'],
  address: ['address', 'street address', 'street', 'property address', 'service address', 'billing address', 'full address', 'location'],
  city: ['city', 'town'],
  state: ['state', 'province', 'region'],
  zip: ['zip', 'zip code', 'zipcode', 'postal code', 'postal_code', 'postcode'],
  company: ['company', 'company name', 'business', 'business name', 'organization'],
  notes: ['notes', 'note', 'comments', 'description', 'internal notes', 'memo'],
  tags: ['tags', 'labels', 'categories', 'type', 'client type'],
};

function detectFieldMapping(headers: string[]): Record<string, string | null> {
  const normalized = headers.map((h) => h.toLowerCase().trim());
  const mapping: Record<string, string | null> = {};

  for (const [field, patterns] of Object.entries(fieldPatterns)) {
    const idx = normalized.findIndex((h) => patterns.includes(h));
    mapping[field] = idx >= 0 ? headers[idx] : null;
  }

  return mapping;
}

function getValue(row: Record<string, string>, mapping: Record<string, string | null>, field: string): string {
  const col = mapping[field];
  if (!col) return '';
  return (row[col] || '').trim();
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!checkRateLimit(user.id)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Maximum 5 imports per hour.' }, { status: 429 });
  }

  let body: { rows: Record<string, string>[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { rows } = body;
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'No rows provided' }, { status: 400 });
  }
  if (rows.length > MAX_ROWS) {
    return NextResponse.json({ error: `Too many rows. Maximum is ${MAX_ROWS}.` }, { status: 400 });
  }

  // Get headers from the first row's keys
  const headers = Object.keys(rows[0]);
  const mapping = detectFieldMapping(headers);

  // Fetch existing clients for duplicate checking
  const { data: existingClients } = await supabase
    .from('clients')
    .select('phone, email')
    .eq('user_id', user.id);

  const existingPhones = new Set<string>();
  const existingEmails = new Set<string>();
  for (const c of existingClients || []) {
    if (c.phone) existingPhones.add(c.phone.replace(/\D/g, ''));
    if (c.email) existingEmails.add(c.email.toLowerCase());
  }

  let skipped = 0;
  let duplicates = 0;
  const errors: string[] = [];
  const toInsert: {
    user_id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    company: string | null;
    notes: string | null;
    tags: string[];
  }[] = [];

  // Track duplicates within the import itself
  const importPhones = new Set<string>();
  const importEmails = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Build name
    let name = getValue(row, mapping, 'name');
    if (!name) {
      const first = getValue(row, mapping, 'first_name');
      const last = getValue(row, mapping, 'last_name');
      name = [first, last].filter(Boolean).join(' ');
    }

    if (!name) {
      skipped++;
      continue;
    }

    // Build address
    let address = getValue(row, mapping, 'address');
    if (!address) {
      const parts = [
        getValue(row, mapping, 'city'),
        getValue(row, mapping, 'state'),
        getValue(row, mapping, 'zip'),
      ].filter(Boolean);
      if (parts.length > 0) address = parts.join(', ');
    }

    const phone = getValue(row, mapping, 'phone') || null;
    const email = getValue(row, mapping, 'email') || null;
    const company = getValue(row, mapping, 'company') || null;
    const notes = getValue(row, mapping, 'notes') || null;
    const tagsRaw = getValue(row, mapping, 'tags');
    const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : [];

    // Duplicate check against existing clients
    const phoneDigits = phone ? phone.replace(/\D/g, '') : '';
    const emailLower = email ? email.toLowerCase() : '';

    let isDuplicate = false;
    if (phoneDigits && (existingPhones.has(phoneDigits) || importPhones.has(phoneDigits))) {
      isDuplicate = true;
    }
    if (emailLower && (existingEmails.has(emailLower) || importEmails.has(emailLower))) {
      isDuplicate = true;
    }

    if (isDuplicate) {
      duplicates++;
      continue;
    }

    // Track for intra-import dedup
    if (phoneDigits) importPhones.add(phoneDigits);
    if (emailLower) importEmails.add(emailLower);

    toInsert.push({
      user_id: user.id,
      name,
      phone,
      email,
      address: address || null,
      company,
      notes,
      tags,
    });
  }

  // Batch insert (Supabase supports bulk insert)
  let imported = 0;
  if (toInsert.length > 0) {
    // Insert in batches of 500 to avoid payload limits
    const BATCH_SIZE = 500;
    for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
      const batch = toInsert.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from('clients').insert(batch);
      if (error) {
        errors.push(`Batch insert error (rows ${i + 1}-${i + batch.length}): ${error.message}`);
      } else {
        imported += batch.length;
      }
    }
  }

  return NextResponse.json({ imported, skipped, duplicates, errors });
}
