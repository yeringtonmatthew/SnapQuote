import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/escape-html';
import { sendSms } from '@/lib/twilio';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: 10 reminders per hour per user, and 3 per hour per quote
  if (!(await rateLimit(`remind:${user.id}`, 10, 3_600_000))) {
    return NextResponse.json({ error: 'Too many requests. Please wait before sending more reminders.' }, { status: 429 });
  }
  if (!(await rateLimit(`remind:quote:${params.id}`, 3, 3_600_000))) {
    return NextResponse.json({ error: 'Too many reminders sent for this quote. Please wait before trying again.' }, { status: 429 });
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

  if (quote.status !== 'sent') {
    return NextResponse.json(
      { error: 'Reminders can only be sent for quotes with status "sent"' },
      { status: 400 }
    );
  }

  if (!quote.customer_email && !quote.customer_phone) {
    return NextResponse.json(
      { error: 'No customer email or phone number on this quote' },
      { status: 400 }
    );
  }

  const { data: profile } = await supabase
    .from('users')
    .select('business_name, full_name, logo_url')
    .eq('id', user.id)
    .single();

  const businessName = profile?.business_name || profile?.full_name || 'Licensed Professional';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://snapquote.dev';
  const proposalUrl = `${appUrl}/q/${params.id}`;
  const amount = Number(quote.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 });

  let emailSent = false;
  let smsSent = false;
  let emailErrorMsg: string | undefined;
  let smsErrorMsg: string | undefined;

  // Send email reminder if customer has an email
  if (quote.customer_email) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      emailErrorMsg = 'Email not configured (no RESEND_API_KEY)';
    } else {
      const resend = new Resend(apiKey);
      const fromAddress = process.env.RESEND_FROM_EMAIL || 'SnapQuote <quotes@snapquote.dev>';

      const { error: emailError } = await resend.emails.send({
        from: fromAddress,
        to: quote.customer_email,
        subject: `Reminder: Quote from ${businessName} — $${amount}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
            <div style="text-align: center; margin-bottom: 24px;">
              ${profile?.logo_url ? `<img src="${profile.logo_url}" alt="${escapeHtml(businessName)}" style="max-height: 48px; margin-bottom: 12px;" />` : ''}
              <h2 style="margin: 0; color: #111827; font-size: 20px;">${escapeHtml(businessName)}</h2>
            </div>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">
              Hi ${escapeHtml(quote.customer_name)},
            </p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">
              Just a reminder — you have a quote from <strong>${escapeHtml(businessName)}</strong> for <strong>$${amount}</strong> waiting for your review.
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${proposalUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                View Your Quote
              </a>
            </div>
            <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
              This is a friendly reminder sent via <a href="https://snapquote.dev" style="color: #4f46e5; text-decoration: none;">SnapQuote</a>.
              If you didn't request this quote, you can safely ignore this email.
            </p>
          </div>
        `,
      });

      if (emailError) {
        console.error('[remind] Resend error:', emailError);
        emailErrorMsg = emailError.message;
      } else {
        emailSent = true;
      }
    }
  }

  // Send SMS reminder if customer has a phone number
  if (quote.customer_phone) {
    try {
      const smsBody = `Hi ${quote.customer_name}, just a reminder about your quote from ${businessName}. View it here: ${proposalUrl}`;
      await sendSms(quote.customer_phone, smsBody);
      smsSent = true;
    } catch (smsError) {
      console.error('[remind] SMS error:', smsError);
      smsErrorMsg = smsError instanceof Error ? smsError.message : 'SMS failed';
    }
  }

  // If neither channel succeeded, return an error
  if (!emailSent && !smsSent) {
    return NextResponse.json({
      success: false,
      error: 'Failed to send reminder',
      ...(emailErrorMsg ? { emailError: emailErrorMsg } : {}),
      ...(smsErrorMsg ? { smsError: smsErrorMsg } : {}),
    }, { status: 500 });
  }

  // Update reminder_sent_at
  await supabase
    .from('quotes')
    .update({ reminder_sent_at: new Date().toISOString() })
    .eq('id', params.id);

  return NextResponse.json({
    success: true,
    emailSent,
    smsSent,
    ...(emailErrorMsg ? { emailError: emailErrorMsg } : {}),
    ...(smsErrorMsg ? { smsError: smsErrorMsg } : {}),
  });
}
