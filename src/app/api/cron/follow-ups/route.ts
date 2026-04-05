import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
// Twilio disabled — A2P 10DLC pending. Re-enable when approved.
// import twilio from 'twilio';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/escape-html';

// Follow-up schedule: [hours after sent_at]
const FOLLOW_UP_SCHEDULE = [
  { number: 1, hoursAfter: 24 },      // Day 1
  { number: 2, hoursAfter: 72 },      // Day 3
  { number: 3, hoursAfter: 120 },     // Day 5
  { number: 4, hoursAfter: 168 },     // Day 7 (1 week)
  { number: 5, hoursAfter: 240 },     // Day 10
  { number: 6, hoursAfter: 336 },     // Day 14 (2 weeks)
  { number: 7, hoursAfter: 504 },     // Day 21 (3 weeks)
];

const DEFAULT_TEMPLATES = [
  'Hey {{name}}, just checking if you saw your quote. Let me know if you have any questions!',
  'Hi {{name}}, we have an opening this week if you\'d like to move forward. Would love to get you on the schedule!',
  'Hey {{name}}, just wanted to follow up — happy to adjust anything if needed or get you scheduled.',
  'Hi {{name}}, your quote from {{business}} is still available. Ready when you are!',
  'Hey {{name}}, just a friendly check-in. If timing or budget changed, I\'m happy to work with you.',
  'Hi {{name}}, wanted to reach out one more time about your project. We\'d love to help when you\'re ready.',
  'Hey {{name}}, it\'s been a few weeks — if you\'re still considering the work, {{business}} is here to help. No pressure!',
];

const QUARTERLY_TEMPLATE = 'Hi {{name}}, it\'s been a while! Just checking in from {{business}} to see if you still need help with your project. We\'re here whenever you\'re ready.';

function replaceTemplateVars(
  template: string,
  vars: { name: string; business: string; link: string }
): string {
  return template
    .replace(/\{\{name\}\}/g, vars.name)
    .replace(/\{\{business\}\}/g, vars.business)
    .replace(/\{\{link\}\}/g, vars.link);
}

interface Quote {
  id: string;
  contractor_id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  subtotal: number;
  sent_at: string;
  status: string;
  job_notes: { id: string; text: string; created_at: string; updated_at: string }[] | null;
}

interface Contractor {
  id: string;
  business_name: string | null;
  full_name: string | null;
  auto_follow_up: boolean;
  follow_up_templates: string[] | null;
}

async function sendFollowUp({
  quote,
  contractor,
  followUpNumber,
  message,
  proposalUrl,
  supabase,
  sentFollowUps,
  results,
}: {
  quote: Quote;
  contractor: Contractor;
  followUpNumber: number;
  message: string;
  proposalUrl: string;
  supabase: SupabaseClient;
  sentFollowUps: Set<string>;
  results: { sent: number; errors: number; skipped: number };
}): Promise<boolean> {
  const businessName = contractor.business_name || contractor.full_name || 'Licensed Professional';
  let channel: 'sms' | 'email' = 'sms';
  let sendSuccess = false;

  // Twilio SMS disabled — A2P 10DLC campaign pending carrier approval.
  // SMS follow-ups were costing $15-30/day with 401 eligible quotes.
  // Re-enable this block once A2P campaign is approved.
  // TODO: Re-enable Twilio SMS follow-ups after A2P approval

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
              <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px;">${escapeHtml(businessName)}</h2>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                ${escapeHtml(message)}
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
      follow_up_number: followUpNumber,
      channel,
      message,
      status: 'sent',
    });

    // Add system note to job_notes
    const existingNotes: { id: string; text: string; created_at: string; updated_at: string }[] = quote.job_notes || [];
    const systemNote = {
      id: crypto.randomUUID(),
      text: `[Auto] Follow-up #${followUpNumber} sent via ${channel.toUpperCase()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await supabase
      .from('quotes')
      .update({ job_notes: [...existingNotes, systemNote] })
      .eq('id', quote.id);

    sentFollowUps.add(`${quote.id}:${followUpNumber}`);
    results.sent++;
    return true;
  } else {
    results.errors++;
    return false;
  }
}

export async function GET(request: Request) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  if (!cronSecret || !authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const expected = Buffer.from(`Bearer ${cronSecret}`);
  const provided = Buffer.from(authHeader);
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
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
    // 1. Get all sent/approved quotes from contractors with auto_follow_up enabled
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
      .in('status', ['sent', 'approved'])
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
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_APP_URL) {
      console.error('[cron/follow-ups] NEXT_PUBLIC_APP_URL is not set in production — using localhost fallback');
    }

    // 4. Process each quote — initial 21-day sequence (follow-ups 1–7)
    for (const quote of quotes) {
      const contractor = contractorMap.get(quote.contractor_id);
      if (!contractor) {
        results.skipped++;
        continue;
      }

      // Initial sequence only applies to 'sent' quotes
      if (quote.status !== 'sent') continue;

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

        await sendFollowUp({
          quote: quote as Quote,
          contractor: contractor as Contractor,
          followUpNumber: schedule.number,
          message,
          proposalUrl,
          supabase,
          sentFollowUps,
          results,
        });
      }
    }

    // 5. Quarterly check-ins (follow-up 8–12)
    // For quotes that have completed the 21-day sequence (follow-up 7 sent)

    // Pre-compute which quotes are eligible and their max follow-up number
    const quarterlyQuoteIds: string[] = [];
    const maxSentByQuote = new Map<string, number>();

    for (const quote of quotes) {
      if (!contractorMap.has(quote.contractor_id)) continue;
      if (!sentFollowUps.has(`${quote.id}:7`)) continue;

      const maxSent = Math.max(
        ...Array.from(sentFollowUps)
          .filter((k) => k.startsWith(`${quote.id}:`))
          .map((k) => parseInt(k.split(':')[1]))
      );

      if (maxSent >= 12) continue;

      quarterlyQuoteIds.push(quote.id);
      maxSentByQuote.set(quote.id, maxSent);
    }

    // Batch-fetch the created_at for each quote's max follow-up in a single query
    const lastFollowUpByQuote = new Map<string, string>();

    if (quarterlyQuoteIds.length > 0) {
      const orFilter = quarterlyQuoteIds
        .map((qId) => `and(quote_id.eq.${qId},follow_up_number.eq.${maxSentByQuote.get(qId)})`)
        .join(',');

      const { data: lastFollowUps } = await supabase
        .from('follow_ups')
        .select('quote_id, follow_up_number, created_at')
        .or(orFilter);

      for (const fu of lastFollowUps || []) {
        lastFollowUpByQuote.set(fu.quote_id, fu.created_at);
      }
    }

    for (const quote of quotes) {
      const contractor = contractorMap.get(quote.contractor_id);
      if (!contractor) continue;

      const maxSent = maxSentByQuote.get(quote.id);
      if (maxSent === undefined) continue;

      const nextNumber = maxSent + 1;

      const lastCreatedAt = lastFollowUpByQuote.get(quote.id);
      if (!lastCreatedAt) continue;

      const lastSentAt = new Date(lastCreatedAt);
      const daysSinceLastFollowUp = (now.getTime() - lastSentAt.getTime()) / (1000 * 60 * 60 * 24);

      // Only send if 90+ days since last follow-up
      if (daysSinceLastFollowUp < 90) continue;

      const businessName = contractor.business_name || contractor.full_name || 'Licensed Professional';
      const proposalUrl = `${appUrl}/q/${quote.id}`;
      const message = replaceTemplateVars(QUARTERLY_TEMPLATE, {
        name: quote.customer_name,
        business: businessName,
        link: proposalUrl,
      });

      await sendFollowUp({
        quote: quote as Quote,
        contractor: contractor as Contractor,
        followUpNumber: nextNumber,
        message,
        proposalUrl,
        supabase,
        sentFollowUps,
        results,
      });
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
