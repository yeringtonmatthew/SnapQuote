import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { createNotification, sendNotificationEmail } from '@/lib/notify';
import { formatQuoteNumber } from '@/lib/format-quote-number';
import { fireWebhook } from '@/lib/webhook';
import Stripe from 'stripe';
import twilio from 'twilio';

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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const quoteId = session.metadata?.quote_id;

    if (quoteId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await supabase
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

      // Notify contractor about payment
      const { data: quote } = await supabase
        .from('quotes')
        .select('id, contractor_id, customer_name, customer_email, customer_phone, quote_number, deposit_amount')
        .eq('id', quoteId)
        .single();

      if (quote) {
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
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
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
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          fetch(`${appUrl}/api/quotes/${quoteId}/thank-you`, {
            method: 'POST',
            headers: {
              'x-internal-secret': process.env.INTERNAL_API_SECRET || '',
            },
          }).catch((err) => {
            console.error('[webhook] Thank-you email fire-and-forget failed:', err);
          });
        }

        // Fire-and-forget: Send thank-you SMS to customer
        const sid = process.env.TWILIO_ACCOUNT_SID;
        const token = process.env.TWILIO_AUTH_TOKEN;
        const from = process.env.TWILIO_PHONE_NUMBER;
        const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

        if (sid && token && (from || messagingServiceSid) && quote.customer_phone) {
          const businessName = contractor?.business_name || contractor?.full_name || 'Licensed Professional';
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
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
              .catch((err: unknown) => {
                console.error('[webhook] Thank-you SMS failed:', err);
              });
          } catch (err) {
            console.error('[webhook] Twilio client error:', err);
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
