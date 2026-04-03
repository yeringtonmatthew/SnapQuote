import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/escape-html';

export async function POST(
  _request: Request,
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

  if (!quote.customer_email) {
    return NextResponse.json(
      { error: 'No customer email on this quote' },
      { status: 400 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const proposalUrl = `${appUrl}/q/${params.id}`;

  const { data: profile } = await supabase
    .from('users')
    .select('business_name, full_name, logo_url, brand_color')
    .eq('id', user.id)
    .single();

  const businessName = profile?.business_name || profile?.full_name || 'Licensed Professional';
  const rawBrandColor = profile?.brand_color || '#4f46e5';
  // Validate brand_color to a safe CSS hex color to prevent style injection
  const brandColor = /^#[0-9a-fA-F]{3,6}$/.test(rawBrandColor) ? rawBrandColor : '#4f46e5';
  const amount = Number(quote.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Resend not configured — skip silently
    return NextResponse.json({
      success: true,
      skipped: true,
      message: 'Email not configured (no RESEND_API_KEY)',
    });
  }

  const resend = new Resend(apiKey);
  const fromAddress = process.env.RESEND_FROM_EMAIL || 'SnapQuote <quotes@snapquote.dev>';

  const { error: emailError } = await resend.emails.send({
    from: fromAddress,
    to: quote.customer_email,
    subject: `Quote from ${businessName} — $${amount}`,
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
          You've received a quote for <strong>$${amount}</strong>. Review the details and approve it online:
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${proposalUrl}" style="display: inline-block; background-color: ${brandColor}; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            View Your Quote
          </a>
        </div>
        <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
          This quote was created using <a href="https://snapquote.dev" style="color: ${brandColor}; text-decoration: none;">SnapQuote</a>.
          If you didn't request this quote, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  if (emailError) {
    console.error('[send-email] Resend error:', emailError);
    return NextResponse.json({
      success: false,
      error: emailError.message,
    }, { status: 500 });
  }

  return NextResponse.json({ success: true, proposalUrl });
}
