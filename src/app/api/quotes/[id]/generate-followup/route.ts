import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: quote } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', params.id)
      .eq('contractor_id', user.id)
      .single();

    if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

    const { data: profile } = await supabase
      .from('users')
      .select('business_name, full_name, trade_type, phone')
      .eq('id', user.id)
      .single();

    // Get existing follow-ups to know context
    const { data: followUps } = await supabase
      .from('follow_ups')
      .select('follow_up_number, message, sent_at')
      .eq('quote_id', params.id)
      .order('follow_up_number', { ascending: true });

    const total = Number(quote.total ?? quote.subtotal);
    const daysSinceSent = quote.sent_at
      ? Math.floor((Date.now() - new Date(quote.sent_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const findings = (quote.inspection_findings || []) as { severity: string; finding: string; urgency_message: string }[];
    const criticalFindings = findings.filter(f => f.severity === 'critical');

    const businessName = profile?.business_name || profile?.full_name || 'our team';
    const tradeType = profile?.trade_type || 'contractor';
    const followUpCount = followUps?.length || 0;

    const prompt = `You are a sales assistant for ${businessName}, a ${tradeType}. Generate a short, warm, professional follow-up SMS message for a customer.

Context:
- Customer name: ${quote.customer_name}
- Quote value: $${total.toLocaleString()}
- Days since quote was sent: ${daysSinceSent}
- Previous follow-ups sent: ${followUpCount}
- Job address: ${quote.job_address || 'not specified'}
${criticalFindings.length > 0 ? `- Critical inspection findings: ${criticalFindings.map(f => f.finding).join('; ')}` : ''}
${quote.scope_of_work ? `- Scope: ${quote.scope_of_work.slice(0, 200)}` : ''}

Rules:
- Keep it under 160 characters (SMS length)
- Use their first name only
- Sound human, not corporate
- If there are critical findings, subtly reference urgency
- If this is a 2nd+ follow-up, be more direct but still respectful
- End with a question or soft call-to-action
- Do NOT use exclamation marks excessively
- Do NOT include emojis

Return ONLY the message text, nothing else.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });

    const message = (response.content[0] as { type: string; text: string }).text.trim();

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Follow-up generation error:', error);
    return NextResponse.json({ error: 'Failed to generate follow-up' }, { status: 500 });
  }
}
