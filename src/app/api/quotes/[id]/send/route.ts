import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/escape-html';

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit
    if (!(await rateLimit(`send:${user.id}`, 20, 3_600_000))) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
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

    // Update status to sent
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
    await supabase.from('quotes').update(updateData).eq('id', params.id);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://snapquote.dev';
    const proposalUrl = `${appUrl}/q/${params.id}`;

    // Send email if customer has email
    let emailSent = false;
    let emailError: string | undefined;

    if (quote.customer_email && process.env.RESEND_API_KEY) {
      try {
        const { data: profile } = await supabase
          .from('users')
          .select('business_name, full_name, logo_url, brand_color')
          .eq('id', user.id)
          .single();

        const businessName = profile?.business_name || profile?.full_name || 'Licensed Professional';
        const brandColor = profile?.brand_color || '#4f46e5';
        const amount = Number(quote.total ?? quote.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 });
        const fromAddress = process.env.RESEND_FROM_EMAIL || 'SnapQuote <quotes@snapquote.dev>';

        const resend = new Resend(process.env.RESEND_API_KEY);
        const { error: resendErr } = await resend.emails.send({
          from: fromAddress,
          to: quote.customer_email,
          subject: `Quote from ${businessName} — $${amount}`,
          html: `<div style="font-family:-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px 16px"><div style="text-align:center;margin-bottom:24px">${profile?.logo_url ? `<img src="${escapeHtml(profile.logo_url)}" alt="${escapeHtml(businessName)}" style="max-height:48px;margin-bottom:12px"/>` : ''}<h2 style="margin:0;color:#111827;font-size:20px">${escapeHtml(businessName)}</h2></div><p style="color:#374151;font-size:15px;line-height:1.6">Hi ${escapeHtml(quote.customer_name)},</p><p style="color:#374151;font-size:15px;line-height:1.6">You've received a quote for <strong>$${amount}</strong>. Review and approve online:</p><div style="text-align:center;margin:28px 0"><a href="${proposalUrl}" style="display:inline-block;background:${brandColor};color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:15px">View Your Quote</a></div><p style="color:#6b7280;font-size:13px">Sent via <a href="https://snapquote.dev" style="color:${brandColor};text-decoration:none">SnapQuote</a></p></div>`,
        });

        if (resendErr) {
          emailError = resendErr.message;
        } else {
          emailSent = true;
        }
      } catch (err) {
        emailError = err instanceof Error ? err.message : 'Email failed';
      }
    }

    // Fire webhook (non-blocking, don't crash if it fails)
    try {
      const { fireWebhook } = await import('@/lib/webhook');
      fireWebhook(supabase, user.id, 'quote.sent', {
        quote_id: quote.id,
        quote_number: quote.quote_number ?? null,
        customer_name: quote.customer_name,
        amount: quote.total,
        url: proposalUrl,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      url: proposalUrl,
      emailSent,
      ...(emailError ? { emailError } : {}),
    });
  } catch (err) {
    console.error('[send] Unhandled error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
