import { SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { NotificationType } from '@/types/database';

interface CreateNotificationParams {
  user_id: string;
  quote_id: string;
  type: NotificationType;
  message: string;
}

export async function createNotification(
  supabase: SupabaseClient,
  { user_id, quote_id, type, message }: CreateNotificationParams
) {
  const { error } = await supabase
    .from('notifications')
    .insert({ user_id, quote_id, type, message, read: false });

  if (error) {
    console.error('[notify] Failed to create notification:', error.message);
  }
}

interface SendNotificationEmailParams {
  email: string;
  subject: string;
  message: string;
  quoteUrl: string;
  businessName?: string;
}

export async function sendNotificationEmail({
  email,
  subject,
  message,
  quoteUrl,
  businessName,
}: SendNotificationEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('[notify] Skipping email — no RESEND_API_KEY');
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'SnapQuote <quotes@snapquote.dev>';

    await resend.emails.send({
      from: fromAddress,
      to: email,
      subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
          <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px;">${subject}</h2>
          <p style="color: #374151; font-size: 15px; line-height: 1.6;">
            ${message}
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${quoteUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
              View Quote
            </a>
          </div>
          <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
            This notification was sent by <a href="https://snapquote.dev" style="color: #4f46e5; text-decoration: none;">SnapQuote</a>${businessName ? ` on behalf of ${businessName}` : ''}.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error('[notify] Email send failed:', err);
  }
}
