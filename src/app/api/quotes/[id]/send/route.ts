import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fireWebhook } from '@/lib/webhook';
import { rateLimit } from '@/lib/rate-limit';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/escape-html';
// Twilio import disabled — A2P 10DLC campaign pending. Re-enable when approved.
// import twilio from 'twilio';

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

  // Send email directly if customer_email exists
  let emailError: string | undefined;
  if (quote.customer_email) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      emailError = 'Email not configured';
    } else {
      try {
        const { data: profile } = await supabase
          .from('users')
          .select('business_name, full_name, logo_url, brand_color')
          .eq('id', user.id)
          .single();

        const businessName = profile?.business_name || profile?.full_name || 'Licensed Professional';
        const rawBrandColor = profile?.brand_color || '#2563eb';
        const brandColor = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(rawBrandColor) ? rawBrandColor : '#2563eb';
        const amount = Number(quote.total ?? quote.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 });
        const fromAddress = process.env.RESEND_FROM_EMAIL || 'SnapQuote <quotes@snapquote.dev>';

        const resend = new Resend(apiKey);
        const { error: resendError } = await resend.emails.send({
          from: fromAddress,
          to: quote.customer_email,
          subject: `Quote from ${businessName} — $${amount}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
              <div style="text-align: center; margin-bottom: 24px;">
                ${profile?.logo_url ? `<img src="${escapeHtml(profile.logo_url)}" alt="${escapeHtml(businessName)}" style="max-height: 48px; margin-bottom: 12px;" />` : ''}
                <h2 style="margin: 0; color: #111827; font-size: 20px;">${escapeHtml(businessName)}</h2>
              </div>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">Hi ${escapeHtml(quote.customer_name)},</p>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">You've received a quote for <strong>$${amount}</strong>. Review the details and approve it online:</p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${proposalUrl}" style="display: inline-block; background-color: ${brandColor}; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">View Your Quote</a>
              </div>
              <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">This quote was created using <a href="https://snapquote.dev" style="color: ${brandColor}; text-decoration: none;">SnapQuote</a>.</p>
            </div>
          `,
        });

        if (resendError) {
          console.error('[send] Resend error:', resendError);
          emailError = resendError.message;
        }
      } catch (err) {
        console.error('[send] Email error:', err);
        emailError = err instanceof Error ? err.message : 'Email send failed';
      }
    }
  }

  return NextResponse.json({
    success: true,
    url: proposalUrl,
    ...(emailError ? { emailError } : {}),
  });
}
