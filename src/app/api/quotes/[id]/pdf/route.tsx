import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { QuotePDF } from '@/components/pdf/QuotePDF';

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

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    const buffer = await renderToBuffer(
      <QuotePDF quote={quote} profile={profile} />
    );

    const customerSlug = quote.customer_name.replace(/\s+/g, '-').toLowerCase();

    return new Response(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quote-${customerSlug}.pdf"`,
      },
    });
  } catch (error) {
    console.error('[pdf] ERROR:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `PDF generation failed: ${msg}` }, { status: 500 });
  }
}
