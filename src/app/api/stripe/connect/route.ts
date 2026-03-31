import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const stripe = getStripe();

  // Check if contractor already has a Stripe account
  const { data: profile } = await supabase
    .from('users')
    .select('stripe_account_id')
    .eq('id', user.id)
    .single();

  let accountId = profile?.stripe_account_id;

  // Create a new connected account if none exists
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      metadata: { user_id: user.id },
    });
    accountId = account.id;

    await supabase
      .from('users')
      .update({ stripe_account_id: accountId })
      .eq('id', user.id);
  }

  // Create an account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/api/stripe/connect`,
    return_url: `${appUrl}/settings?stripe=connected`,
    type: 'account_onboarding',
  });

  return NextResponse.redirect(accountLink.url);
}
