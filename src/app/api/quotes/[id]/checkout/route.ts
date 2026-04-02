import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const supabase = createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://snapquote.dev';

  const { data: quote } = await supabase
    .from('quotes')
    .select('id, customer_name, deposit_amount, status, contractor_id')
    .eq('id', params.id)
    .single();

  if (!quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
  }

  if (quote.status === 'deposit_paid') {
    return NextResponse.redirect(`${appUrl}/receipt/${quote.id}`);
  }

  const { data: profile } = await supabase
    .from('users')
    .select('stripe_account_id, business_name, full_name')
    .eq('id', quote.contractor_id)
    .single();

  if (!profile?.stripe_account_id) {
    return NextResponse.json({ error: 'Contractor has not connected Stripe' }, { status: 400 });
  }

  const depositCents = Math.round(Number(quote.deposit_amount) * 100);
  if (!depositCents || depositCents <= 0) {
    return NextResponse.json({ error: 'No deposit amount to collect' }, { status: 400 });
  }
  const businessName = profile.business_name || profile.full_name || 'Licensed Professional';

  try {
    const session = await getStripe().checkout.sessions.create(
      {
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: undefined,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Deposit — ${businessName}`,
                description: `Project deposit for ${quote.customer_name}`,
              },
              unit_amount: depositCents,
            },
            quantity: 1,
          },
        ],
        metadata: {
          quote_id: quote.id,
        },
        success_url: `${appUrl}/receipt/${quote.id}?paid=true&new=1`,
        cancel_url: `${appUrl}/q/${quote.id}?cancelled=true`,
      },
      {
        stripeAccount: profile.stripe_account_id,
      }
    );

    if (!session.url) {
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }

    return NextResponse.redirect(session.url);
  } catch (err) {
    console.error('[checkout] Stripe error:', err);
    return NextResponse.json({ error: 'Payment processing error' }, { status: 500 });
  }
}
