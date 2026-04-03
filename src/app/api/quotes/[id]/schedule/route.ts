import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { generateGoogleCalendarUrl } from '@/lib/calendar';
import { formatQuoteNumber } from '@/lib/format-quote-number';
import { escapeHtml } from '@/lib/escape-html';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: existing, error: fetchError } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', params.id)
    .eq('contractor_id', user.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
  }

  // Only allow scheduling for non-cancelled, non-draft quotes
  if (existing.status === 'cancelled') {
    return NextResponse.json(
      { error: 'Cannot schedule a cancelled quote' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { scheduled_date, scheduled_time } = body;

  // Only advance pipeline to job_scheduled if we're setting a date and currently at an earlier stage
  const earlyStages = ['lead', 'follow_up', 'quote_created', 'quote_sent', 'deposit_collected'];
  const shouldAdvance = scheduled_date && earlyStages.includes(existing.pipeline_stage || '');

  const { data: quote, error } = await supabase
    .from('quotes')
    .update({
      scheduled_date: scheduled_date || null,
      scheduled_time: scheduled_time || null,
      ...(shouldAdvance ? { pipeline_stage: 'job_scheduled' } : {}),
    })
    .eq('id', params.id)
    .eq('contractor_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Schedule quote error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send notification email to contractor with calendar links
  if (scheduled_date) {
    try {
      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey) {
        const { data: profile } = await supabase
          .from('users')
          .select('business_name, full_name, email')
          .eq('id', user.id)
          .single();

        const contractorEmail = profile?.email || user.email;
        if (contractorEmail) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          const quoteUrl = `${appUrl}/quotes/${params.id}`;
          const jobSummary = existing.ai_description || existing.scope_of_work || 'Scheduled job';
          const quoteLabel = existing.quote_number
            ? formatQuoteNumber(existing.quote_number)
            : `Quote #${params.id.slice(0, 8)}`;

          const formattedDate = new Date(scheduled_date + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          });
          const formattedTime = scheduled_time
            ? new Date(`2000-01-01T${scheduled_time}:00`).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })
            : null;

          const googleCalUrl = generateGoogleCalendarUrl({
            title: `${existing.customer_name} - ${jobSummary}`,
            description: `${quoteLabel}\nJob: ${jobSummary}\nView quote: ${quoteUrl}`,
            date: scheduled_date,
            time: scheduled_time || undefined,
            duration: 2,
          });

          const icalUrl = `${appUrl}/api/quotes/${params.id}/calendar?format=ical`;

          const resend = new Resend(apiKey);
          const fromAddress = process.env.RESEND_FROM_EMAIL || 'SnapQuote <quotes@snapquote.dev>';

          await resend.emails.send({
            from: fromAddress,
            to: contractorEmail,
            subject: `Job Scheduled: ${existing.customer_name} — ${formattedDate}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
                <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px;">Job Scheduled</h2>
                <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 8px;">
                  <strong>${escapeHtml(existing.customer_name)}</strong> — ${escapeHtml(jobSummary)}
                </p>
                <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 4px;">
                  <strong>Date:</strong> ${formattedDate}${formattedTime ? ` at ${formattedTime}` : ''}
                </p>
                ${existing.customer_phone ? `<p style="color: #6b7280; font-size: 14px; margin: 4px 0;">Phone: ${escapeHtml(existing.customer_phone)}</p>` : ''}
                <div style="margin: 24px 0; text-align: center;">
                  <a href="${googleCalUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-right: 8px;">
                    Add to Google Calendar
                  </a>
                  <a href="${icalUrl}" style="display: inline-block; background-color: #ffffff; color: #374151; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; border: 1px solid #d1d5db;">
                    Download .ics
                  </a>
                </div>
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${quoteUrl}" style="color: #4f46e5; text-decoration: none; font-size: 14px;">View Quote</a>
                </div>
                <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
                  Sent by <a href="https://snapquote.dev" style="color: #4f46e5; text-decoration: none;">SnapQuote</a>.
                </p>
              </div>
            `,
          });
        }
      }
    } catch (emailErr) {
      // Don't fail the schedule save if email fails
      console.error('[schedule] Notification email failed:', emailErr);
    }
  }

  return NextResponse.json(quote);
}
