import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { createNotification, sendNotificationEmail } from '@/lib/notify';
import { formatQuoteNumber } from '@/lib/format-quote-number';
import { fireWebhook } from '@/lib/webhook';
import Stripe from 'stripe';
import twilio from 'twilio';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ── Subscription event handlers ──────────────────────────────────────

async function handleSubscriptionCheckout(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  if (!userId) return;

  const supabase = getSupabase();
  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;

  await supabase
    .from('users')
    .update({
      stripe_customer_id: session.customer as string,
      subscription_id: subscriptionId,
      subscription_status: 'active',
    })
    .eq('id', userId);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = getSupabase();

  // Map Stripe status to our simpler status
  const statusMap: Record<string, string> = {
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'expired',
    incomplete_expired: 'expired',
    trialing: 'trialing',
  };
  const status = statusMap[subscription.status] || 'expired';

  await supabase
    .from('users')
    .update({ subscription_status: status })
    .eq('subscription_id', subscription.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = getSupabase();
  await supabase
    .from('users')
    .update({ subscription_status: 'canceled', subscription_id: null })
    .eq('subscription_id', subscription.id);
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  // invoice.subscription may not exist on all invoice types
  const sub = (invoice as unknown as Record<string, unknown>).subscription;
  if (!sub) return;
  const supabase = getSupabase();
  const subId = typeof sub === 'string' ? sub : (sub as { id: string }).id;

  await supabase
    .from('users')
    .update({ subscription_status: 'past_due' })
    .eq('subscription_id', subId);
}

// ── Deposit event handler (existing logic, unchanged) ────────────────

async function handleDepositCheckout(session: Stripe.Checkout.Session) {
  const quoteId = session.metadata?.quote_id;
  if (!quoteId) return;

  const supabase = getSupabase();

  // Idempotency: skip if this checkout session was already processed
  const { data: existing } = await supabase
    .from('quotes')
    .select('stripe_checkout_session_id')
    .eq('id', quoteId)
    .single();
  if (existing?.stripe_checkout_session_id === session.id) return;

  const { error: updateError } = await supabase
    .from('quotes')
    .update({
      status: 'deposit_paid',
      paid_at: new Date().toISOString(),
      payment_method: 'stripe',
      stripe_checkout_session_id: session.id,
      pipeline_stage: 'deposit_collected',
    })
    .eq('id', quoteId)
    .neq('status', 'deposit_paid');

  if (updateError) {
    console.error('[stripe-webhook] Failed to update quote:', updateError);
    return;
  }

  // Notify contractor about payment
  const { data: quote } = await supabase
    .from('quotes')
    .select('id, contractor_id, customer_name, customer_email, customer_phone, quote_number, deposit_amount')
    .eq('id', quoteId)
    .single();

  if (!quote) return;

  const label = quote.quote_number
    ? formatQuoteNumber(quote.quote_number)
    : quote.id.slice(0, 8).toUpperCase();

  const amount = Number(quote.deposit_amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
  });

  await createNotification(supabase, {
    user_id: quote.contractor_id,
    quote_id: quote.id,
    type: 'quote_paid',
    message: `Payment of $${amount} received for quote ${label}`,
  });

  // Fire webhook (fire-and-forget)
  fireWebhook(supabase, quote.contractor_id, 'quote.paid', {
    quote_id: quote.id,
    quote_number: quote.quote_number ?? null,
    customer_name: quote.customer_name,
    customer_email: quote.customer_email ?? null,
    amount: Number(quote.deposit_amount),
    payment_method: 'stripe',
  });

  const { data: contractor } = await supabase
    .from('users')
    .select('email, business_name, full_name')
    .eq('id', quote.contractor_id)
    .single();

  if (contractor?.email) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://snapquote.dev';
    sendNotificationEmail({
      email: contractor.email,
      subject: `Payment received for quote ${label}`,
      message: `${quote.customer_name} has paid the $${amount} deposit for quote ${label}. The funds will be available in your Stripe account.`,
      quoteUrl: `${appUrl}/quotes/${quoteId}`,
      businessName: contractor.business_name || contractor.full_name || undefined,
    });
  }

  // Fire-and-forget: Send thank-you email to customer
  if (quote.customer_email) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://snapquote.dev';
    fetch(`${appUrl}/api/quotes/${quoteId}/thank-you`, {
      method: 'POST',
      headers: { 'x-internal-secret': process.env.INTERNAL_API_SECRET || '' },
    }).catch((err) => console.error('[webhook] Thank-you email failed:', err));
  }

  // Fire-and-forget: Send SMS receipt
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

  if (sid && token && (from || messagingServiceSid) && quote.customer_phone) {
    const businessName = contractor?.business_name || contractor?.full_name || 'Licensed Professional';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://snapquote.dev';
    const receiptUrl = `${appUrl}/receipt/${quoteId}`;
    const digits = quote.customer_phone.replace(/\D/g, '');
    const toNumber = digits.startsWith('1') ? `+${digits}` : `+1${digits}`;

    try {
      const client = twilio(sid, token);
      client.messages
        .create({
          body: `Hi ${quote.customer_name}, your deposit of $${amount} has been received. Thank you! View your receipt: ${receiptUrl}`,
          ...(messagingServiceSid ? { messagingServiceSid } : { from }),
          to: toNumber,
        })
        .catch((err: unknown) => console.error('[webhook] SMS failed:', err));
    } catch (err) {
      console.error('[webhook] Twilio client error:', err);
    }
  }
}

// ── Main handler ─────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // Connect events (deposits) have event.account set
        // Platform events (subscriptions) do not
        if (session.mode === 'subscription') {
          await handleSubscriptionCheckout(session);
        } else if (session.metadata?.quote_id) {
          await handleDepositCheckout(session);
        }
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(sub);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoiceFailed(invoice);
        break;
      }
      default:
        // Ignore unhandled event types
        break;
    }
  } catch (err) {
    console.error(`[stripe-webhook] Error handling ${event.type}:`, err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
