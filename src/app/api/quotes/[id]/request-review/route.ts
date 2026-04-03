import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import twilio from 'twilio';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/escape-html';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

  // Fetch contractor profile
  const { data: profile } = await supabase
    .from('users')
    .select('business_name, full_name, logo_url, brand_color, google_place_id')
    .eq('id', user.id)
    .single();

  if (!profile?.google_place_id) {
    return NextResponse.json(
      { error: 'Google Place ID not configured. Add it in Settings > Automation.' },
      { status: 400 }
    );
  }

  const businessName = profile.business_name || profile.full_name || 'Licensed Professional';
  const reviewUrl = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(profile.google_place_id)}`;

  if (!quote.customer_phone && !quote.customer_email) {
    return NextResponse.json(
      { error: 'No phone or email on file for this customer.' },
      { status: 400 }
    );
  }

  let smsSent = false;
  let smsError: string | undefined;
  let emailSent = false;
  let emailError: string | undefined;

  // ── Send SMS ──
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

  if (sid && token && (from || messagingServiceSid) && quote.customer_phone) {
    try {
      const client = twilio(sid, token);
      const smsBody = `Hi ${quote.customer_name}! Thanks for choosing ${businessName}. We'd love your feedback! Leave us a Google review: ${reviewUrl} ⭐`;

      // Normalize to E.164
      const digits = quote.customer_phone?.replace(/\D/g, '') ?? '';
      const toNumber = digits.startsWith('1') ? `+${digits}` : `+1${digits}`;

      await client.messages.create({
        body: smsBody,
        ...(messagingServiceSid ? { messagingServiceSid } : { from }),
        to: toNumber,
      });
      smsSent = true;
    } catch (err) {
      console.error('[request-review] SMS error:', err);
      smsError = err instanceof Error ? err.message : 'SMS failed';
    }
  }

  // ── Send Email ──
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && quote.customer_email) {
    try {
      const resend = new Resend(resendKey);
      const rawBrandColor = profile.brand_color || '#4f46e5';
      const brandColor = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(rawBrandColor) ? rawBrandColor : '#4f46e5';
      const fromAddress = `${businessName} via SnapQuote <quotes@snapquote.dev>`;

      await resend.emails.send({
        from: fromAddress,
        to: quote.customer_email,
        subject: `How did we do? Leave us a review — ${businessName}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
            <div style="text-align: center; margin-bottom: 24px;">
              ${profile.logo_url ? `<img src="${profile.logo_url}" alt="${escapeHtml(businessName)}" style="max-height: 48px; margin-bottom: 12px;" />` : ''}
              <h2 style="margin: 0; color: #111827; font-size: 20px;">${escapeHtml(businessName)}</h2>
            </div>
            <h1 style="color: #111827; font-size: 22px; text-align: center; margin: 0 0 20px;">
              Thanks, ${escapeHtml(quote.customer_name)}!
            </h1>
            <p style="color: #374151; font-size: 15px; line-height: 1.6; text-align: center;">
              We hope you're happy with the work. If you have a moment, we'd really appreciate a Google review. It helps us grow and serve more customers like you!
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${reviewUrl}" style="display: inline-block; background-color: ${brandColor}; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                ⭐ Leave a Review
              </a>
            </div>
            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; text-align: center;">
              Powered by <a href="https://snapquote.dev" style="color: #4f46e5; text-decoration: none;">SnapQuote</a>
            </p>
          </div>
        `,
      });
      emailSent = true;
    } catch (err) {
      console.error('[request-review] Email error:', err);
      emailError = err instanceof Error ? err.message : 'Email failed';
    }
  }

  if (!smsSent && !emailSent) {
    return NextResponse.json({
      error: 'Failed to send review request.',
      smsError,
      emailError,
    }, { status: 500 });
  }

  // Mark review as requested
  await supabase
    .from('quotes')
    .update({ review_requested_at: new Date().toISOString() })
    .eq('id', params.id);

  return NextResponse.json({
    success: true,
    smsSent,
    emailSent,
    reviewUrl,
    ...(smsError ? { smsError } : {}),
    ...(emailError ? { emailError } : {}),
  });
}
