import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

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
  const businessName = profile.business_name || profile.full_name || 'Your Contractor';

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
      success_url: `${appUrl}/receipt/${quote.id}?paid=true`,
      cancel_url: `${appUrl}/q/${quote.id}?cancelled=true`,
    },
    {
      stripeAccount: profile.stripe_account_id,
    }
  );

  return NextResponse.redirect(session.url!);
}
