import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';
import { Resend } from 'resend';

// Follow-up schedule: [hours after sent_at]
const FOLLOW_UP_SCHEDULE = [
  { number: 1, hoursAfter: 24 },    // 1 day
  { number: 2, hoursAfter: 72 },    // 3 days
  { number: 3, hoursAfter: 120 },   // 5 days
];

const DEFAULT_TEMPLATES = [
  'Hey {{name}}, just checking if you saw your quote. Let me know if you have any questions!',
  'Hi {{name}}, we have an opening this week if you\'d like to move forward. Would love to get you on the schedule!',
  'Hey {{name}}, just wanted to follow up — happy to adjust anything if needed or get you scheduled.',
];

function replaceTemplateVars(
  template: string,
  vars: { name: string; business: string; link: string }
): string {
  return template
    .replace(/\{\{name\}\}/g, vars.name)
    .replace(/\{\{business\}\}/g, vars.business)
    .replace(/\{\{link\}\}/g, vars.link);
}

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use service role to bypass RLS
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 });
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const now = new Date();
  const results: { sent: number; errors: number; skipped: number } = {
    sent: 0,
    errors: 0,
    skipped: 0,
  };

  try {
    // 1. Get all sent quotes from contractors with auto_follow_up enabled
    const { data: quotes, error: quotesError } = await supabase
      .from('quotes')
      .select(`
        id,
        contractor_id,
        customer_name,
        customer_phone,
        customer_email,
        subtotal,
        sent_at,
        status,
        job_notes
      `)
      .eq('status', 'sent')
      .not('sent_at', 'is', null);

    if (quotesError) {
      console.error('[cron/follow-ups] Error fetching quotes:', quotesError);
      return NextResponse.json({ error: quotesError.message }, { status: 500 });
    }

    if (!quotes || quotes.length === 0) {
      return NextResponse.json({ ...results, message: 'No eligible quotes' });
    }

    // 2. Get contractors with auto_follow_up enabled
    const contractorIds = Array.from(new Set(quotes.map((q) => q.contractor_id)));
    const { data: contractors, error: contractorsError } = await supabase
      .from('users')
      .select('id, business_name, full_name, auto_follow_up, follow_up_templates')
      .in('id', contractorIds)
      .eq('auto_follow_up', true);

    if (contractorsError) {
      console.error('[cron/follow-ups] Error fetching contractors:', contractorsError);
      return NextResponse.json({ error: contractorsError.message }, { status: 500 });
    }

    if (!contractors || contractors.length === 0) {
      return NextResponse.json({ ...results, message: 'No contractors with auto follow-up' });
    }

    const contractorMap = new Map(contractors.map((c) => [c.id, c]));

    // 3. Get existing follow-ups for these quotes
    const quoteIds = quotes
      .filter((q) => contractorMap.has(q.contractor_id))
      .map((q) => q.id);

    if (quoteIds.length === 0) {
      return NextResponse.json({ ...results, message: 'No eligible quotes for enabled contractors' });
    }

    const { data: existingFollowUps } = await supabase
      .from('follow_ups')
      .select('quote_id, follow_up_number')
      .in('quote_id', quoteIds);

    const sentFollowUps = new Set(
      (existingFollowUps || []).map((f) => `${f.quote_id}:${f.follow_up_number}`)
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 4. Process each quote
    for (const quote of quotes) {
      const contractor = contractorMap.get(quote.contractor_id);
      if (!contractor) {
        results.skipped++;
        continue;
      }

      const sentAt = new Date(quote.sent_at);
      const hoursSinceSent = (now.getTime() - sentAt.getTime()) / (1000 * 60 * 60);
      const businessName = contractor.business_name || contractor.full_name || 'Licensed Professional';
      const proposalUrl = `${appUrl}/q/${quote.id}`;
      const templates: string[] = contractor.follow_up_templates || DEFAULT_TEMPLATES;

      for (const schedule of FOLLOW_UP_SCHEDULE) {
        const key = `${quote.id}:${schedule.number}`;

        // Skip if already sent or not yet due
        if (sentFollowUps.has(key)) continue;
        if (hoursSinceSent < schedule.hoursAfter) continue;

        // Don't send follow-up 2 if follow-up 1 hasn't been sent yet, etc.
        if (schedule.number > 1) {
          const prevKey = `${quote.id}:${schedule.number - 1}`;
          if (!sentFollowUps.has(prevKey)) continue;
        }

        const template = templates[schedule.number - 1] || DEFAULT_TEMPLATES[schedule.number - 1];
        const message = replaceTemplateVars(template, {
          name: quote.customer_name,
          business: businessName,
          link: proposalUrl,
        });

        let channel: 'sms' | 'email' = 'sms';
        let sendSuccess = false;

        // Try SMS first
        const sid = process.env.TWILIO_ACCOUNT_SID;
        const token = process.env.TWILIO_AUTH_TOKEN;
        const from = process.env.TWILIO_PHONE_NUMBER;
        const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

        if (sid && token && (from || messagingServiceSid) && quote.customer_phone) {
          try {
            const client = twilio(sid, token);
            const digits = quote.customer_phone.replace(/\D/g, '');
            const toNumber = digits.startsWith('1') ? `+${digits}` : `+1${digits}`;

            const smsBody = `${message}\n\nView your quote: ${proposalUrl}`;

            await client.messages.create({
              body: smsBody,
              ...(messagingServiceSid ? { messagingServiceSid } : { from }),
              to: toNumber,
            });
            channel = 'sms';
            sendSuccess = true;
          } catch (smsError) {
            console.error(`[cron/follow-ups] SMS error for quote ${quote.id}:`, smsError);
          }
        }

        // Fall back to email if SMS failed or no phone
        if (!sendSuccess && quote.customer_email) {
          const apiKey = process.env.RESEND_API_KEY;
          if (apiKey) {
            try {
              const resend = new Resend(apiKey);
              const fromAddress = process.env.RESEND_FROM_EMAIL || 'SnapQuote <quotes@snapquote.dev>';
              const amount = Number(quote.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 });

              await resend.emails.send({
                from: fromAddress,
                to: quote.customer_email,
                subject: `Following up on your quote from ${businessName}`,
                html: `
                  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
                    <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px;">${businessName}</h2>
                    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                      ${message}
                    </p>
                    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                      Your quote for <strong>$${amount}</strong> is ready for review.
                    </p>
                    <div style="text-align: center; margin: 28px 0;">
                      <a href="${proposalUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                        View Your Quote
                      </a>
                    </div>
                    <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
                      This is an automated follow-up sent via <a href="https://snapquote.dev" style="color: #4f46e5; text-decoration: none;">SnapQuote</a>.
                    </p>
                  </div>
                `,
              });
              channel = 'email';
              sendSuccess = true;
            } catch (emailError) {
              console.error(`[cron/follow-ups] Email error for quote ${quote.id}:`, emailError);
            }
          }
        }

        if (sendSuccess) {
          // Record follow-up
          await supabase.from('follow_ups').insert({
            quote_id: quote.id,
            contractor_id: quote.contractor_id,
            follow_up_number: schedule.number,
            channel,
            message,
            status: 'sent',
          });

          // Add system note to job_notes
          const existingNotes: any[] = quote.job_notes || [];
          const systemNote = {
            id: crypto.randomUUID(),
            text: `[Auto] Follow-up #${schedule.number} sent via ${channel.toUpperCase()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          await supabase
            .from('quotes')
            .update({ job_notes: [...existingNotes, systemNote] })
            .eq('id', quote.id);

          sentFollowUps.add(key);
          results.sent++;
        } else {
          results.errors++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('[cron/follow-ups] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
