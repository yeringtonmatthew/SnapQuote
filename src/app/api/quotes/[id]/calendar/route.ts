import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateGoogleCalendarUrl, generateICalEvent } from '@/lib/calendar';
import { formatQuoteNumber } from '@/lib/format-quote-number';

export async function GET(
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

  if (!quote.scheduled_date) {
    return NextResponse.json(
      { error: 'This quote does not have a scheduled date' },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format');

  if (format !== 'google' && format !== 'ical') {
    return NextResponse.json(
      { error: 'Invalid format. Use ?format=google or ?format=ical' },
      { status: 400 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const quoteUrl = `${appUrl}/quotes/${params.id}`;
  const quoteLabel = quote.quote_number
    ? formatQuoteNumber(quote.quote_number)
    : `Quote #${params.id.slice(0, 8)}`;

  const jobSummary = quote.ai_description || quote.scope_of_work || 'Scheduled job';
  const title = `${quote.customer_name} - ${jobSummary}`;

  // Parse duration from estimated_duration field (e.g. "2-3 hours" -> 2)
  let duration = 2;
  if (quote.estimated_duration) {
    const match = quote.estimated_duration.match(/(\d+)/);
    if (match) {
      duration = Math.max(1, Math.min(parseInt(match[1], 10), 12));
    }
  }

  const descriptionLines = [
    `${quoteLabel} — ${quote.customer_name}`,
    '',
    `Job: ${jobSummary}`,
    `Total: $${Number(quote.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    '',
  ];

  if (quote.customer_phone) {
    descriptionLines.push(`Phone: ${quote.customer_phone}`);
  }
  if (quote.customer_email) {
    descriptionLines.push(`Email: ${quote.customer_email}`);
  }

  descriptionLines.push('', `View quote: ${quoteUrl}`);

  const event = {
    title,
    description: descriptionLines.join('\n'),
    date: quote.scheduled_date,
    time: quote.scheduled_time || undefined,
    duration,
    location: quote.job_address || undefined,
  };

  if (format === 'google') {
    const url = generateGoogleCalendarUrl(event);
    return NextResponse.redirect(url);
  }

  // iCal download
  const icsContent = generateICalEvent(event);
  const fileName = `${quote.customer_name.replace(/[^a-zA-Z0-9]/g, '-')}-job.ics`;

  return new NextResponse(icsContent, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
}
