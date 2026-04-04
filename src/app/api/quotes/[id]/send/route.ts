import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fireWebhook } from '@/lib/webhook';
import { rateLimit } from '@/lib/rate-limit';
import twilio from 'twilio';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: 20 sends per hour per user to prevent SMS/email spam
  if (!(await rateLimit(`send:${user.id}`, 20, 3_600_000))) {
    return NextResponse.json({ error: 'Too many requests. Please wait before sending more quotes.' }, { status: 429 });
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

  // Update status to sent + auto-advance pipeline
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const updateData: Record<string, unknown> = {
    status: 'sent',
    sent_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  };
  const currentStage = quote.pipeline_stage || 'quote_created';
  if (['lead', 'follow_up', 'quote_created'].includes(currentStage)) {
    updateData.pipeline_stage = 'quote_sent';
  }
  const { error: updateError } = await supabase
    .from('quotes')
    .update(updateData)
    .eq('id', params.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_APP_URL) {
    console.error('[send] NEXT_PUBLIC_APP_URL is not set in production — using localhost fallback');
  }
  const proposalUrl = `${appUrl}/q/${params.id}`;

  // Fire webhook (fire-and-forget)
  fireWebhook(supabase, user.id, 'quote.sent', {
    quote_id: quote.id,
    quote_number: quote.quote_number ?? null,
    customer_name: quote.customer_name,
    customer_email: quote.customer_email ?? null,
    amount: quote.total,
    deposit_amount: quote.deposit_amount,
    url: proposalUrl,
  });

  // Twilio SMS disabled — A2P 10DLC campaign pending carrier approval.
  // SMS is handled via native device messaging (sms: URI) in the frontend.
  // Re-enable this block once the A2P campaign status changes to "approved"
  // in Twilio Console > Messaging > Regulatory Compliance > Campaigns.
  // TODO: Re-enable Twilio SMS after A2P approval

  // Send email if customer_email exists (fire-and-forget, don't block on failure)
  let emailError: string | undefined;
  if (quote.customer_email) {
    try {
      // Only call the send-email sub-route when appUrl is the configured app URL.
      // Fall back gracefully if the URL is not set rather than calling localhost
      // in a context where that could route to an internal service.
      const sendEmailUrl = process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/quotes/${params.id}/send-email`
        : null;

      if (!sendEmailUrl) {
        emailError = 'NEXT_PUBLIC_APP_URL not configured — email skipped';
      } else {
        const emailRes = await fetch(sendEmailUrl, {
          method: 'POST',
          headers: {
            // Forward the auth cookie so the email route can authenticate.
            // Only sent to our own configured app origin.
            cookie: request.headers.get('cookie') || '',
          },
        });
        if (!emailRes.ok) {
          const emailData = await emailRes.json();
          emailError = emailData.error || 'Email send failed';
        }
      }
    } catch (err) {
      console.error('[send] Email error:', err);
      emailError = err instanceof Error ? err.message : 'Email send failed';
    }
  }

  return NextResponse.json({
    success: true,
    url: proposalUrl,
    ...(emailError ? { emailError } : {}),
  });
}
