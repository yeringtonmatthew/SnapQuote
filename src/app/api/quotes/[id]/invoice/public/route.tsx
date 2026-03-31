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

    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', params.id)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (quote.status !== 'deposit_paid') {
      return NextResponse.json(
        { error: 'Invoice is only available for paid quotes' },
        { status: 400 }
      );
    }

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', quote.contractor_id)
      .single();

    const buffer = await renderToBuffer(
      <InvoicePDF quote={quote} profile={profile} />
    );

    const customerSlug = quote.customer_name.replace(/\s+/g, '-').toLowerCase();

    return new Response(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${customerSlug}.pdf"`,
      },
    });
  } catch (error) {
    console.error('[invoice-public] ERROR:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Invoice generation failed: ${msg}` }, { status: 500 });
  }
}
