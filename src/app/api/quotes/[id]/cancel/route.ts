import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .select('id, status, contractor_id')
    .eq('id', params.id)
    .eq('contractor_id', user.id)
    .single();

  if (quoteError || !quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
  }

  if (quote.status !== 'draft' && quote.status !== 'sent') {
    return NextResponse.json(
      { error: 'Only draft or sent quotes can be cancelled' },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabase
    .from('quotes')
    .update({ status: 'cancelled' })
    .eq('id', params.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
