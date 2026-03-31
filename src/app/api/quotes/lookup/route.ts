import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(ip, 5, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    const body = await request.json();
    const { phone, email } = body as { phone?: string; email?: string };

    if (!phone && !email) {
      return NextResponse.json(
        { error: 'Please provide a phone number or email address' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Build query — search by phone or email
    let query = supabase
      .from('quotes')
      .select(`
        id,
        customer_name,
        contractor_id,
        subtotal,
        status,
        created_at,
        expires_at
      `)
      .in('status', ['sent', 'approved', 'deposit_paid', 'cancelled'])
      .order('created_at', { ascending: false });

    if (phone) {
      // Strip all non-digits for comparison
      const digits = phone.replace(/\D/g, '');
      query = query.ilike('customer_phone', `%${digits.slice(-10)}%`);
    } else if (email) {
      query = query.ilike('customer_email', email.trim());
    }

    const { data: quotes, error } = await query;

    if (error) {
      console.error('Lookup query error:', error);
      return NextResponse.json(
        { error: 'Something went wrong. Please try again.' },
        { status: 500 }
      );
    }

    if (!quotes || quotes.length === 0) {
      return NextResponse.json({ quotes: [] });
    }

    // Fetch contractor business names for matched quotes
    const contractorIds = Array.from(new Set(quotes.map((q) => q.contractor_id)));
    const { data: contractors } = await supabase
      .from('users')
      .select('id, business_name, full_name')
      .in('id', contractorIds);

    const contractorMap = new Map(
      (contractors || []).map((c) => [
        c.id,
        c.business_name || c.full_name || 'Contractor',
      ])
    );

    const results = quotes.map((q) => ({
      id: q.id,
      customer_name: q.customer_name,
      business_name: contractorMap.get(q.contractor_id) || 'Contractor',
      subtotal: q.subtotal,
      status: q.status,
      created_at: q.created_at,
      expires_at: q.expires_at,
    }));

    return NextResponse.json({ quotes: results });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
