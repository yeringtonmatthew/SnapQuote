import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  // Get the authenticated user
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_APP_URL || 'https://snapquote.dev'));
  }

  // Get or create Stripe customer
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile } = await adminSupabase
    .from('users')
    .select('stripe_customer_id, email, business_name, full_name')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const stripe = getStripe();
  let customerId = profile.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email || user.email,
      name: profile.business_name || profile.full_name || undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;

    await adminSupabase
      .from('users')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id);
  }

  // Create Checkout Session for subscription
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://snapquote.dev';

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    metadata: { user_id: user.id },
    success_url: `${appUrl}/dashboard?subscribed=true`,
    cancel_url: `${appUrl}/subscribe?cancelled=true`,
    allow_promotion_codes: true,
  });

  return NextResponse.redirect(session.url!);
}
