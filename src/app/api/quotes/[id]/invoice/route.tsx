import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { InvoicePDF } from '@/components/pdf/InvoicePDF';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', params.id)
      .eq('contractor_id', user.id)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (quote.status === 'draft') {
      return NextResponse.json(
        { error: 'Invoice is not available for draft quotes' },
        { status: 400 }
      );
    }

    const { data: profile } = await supabase
      .from('users')
      .select('id, business_name, full_name, email, phone, address, logo_url, brand_color, license_number, website')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Contractor profile not found' }, { status: 404 });
    }

    const buffer = await renderToBuffer(
      <InvoicePDF quote={quote} profile={profile as unknown as import('@/types/database').User} />
    );

    const customerSlug = quote.customer_name.replace(/\s+/g, '-').toLowerCase();

    return new Response(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${customerSlug}.pdf"`,
      },
    });
  } catch (error) {
    console.error('[invoice] ERROR:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Invoice generation failed: ${msg}` }, { status: 500 });
  }
}
