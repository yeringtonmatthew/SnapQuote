import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Only allow internal calls — require a shared secret header
  const internalSecret = process.env.INTERNAL_API_SECRET;
  const authHeader = request.headers.get('x-internal-secret');
  if (!internalSecret || authHeader !== internalSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      success: true,
      skipped: true,
      message: 'Email not configured (no RESEND_API_KEY)',
    });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .select('id, contractor_id, customer_name, customer_email, deposit_amount, quote_number')
    .eq('id', params.id)
    .single();

  if (quoteError || !quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
  }

  if (!quote.customer_email) {
    return NextResponse.json({
      success: true,
      skipped: true,
      message: 'No customer email on this quote',
    });
  }

  const { data: profile } = await supabase
    .from('users')
    .select('business_name, full_name, logo_url')
    .eq('id', quote.contractor_id)
    .single();

  const businessName = profile?.business_name || profile?.full_name || 'Licensed Professional';
  const amount = Number(quote.deposit_amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const receiptUrl = `${appUrl}/receipt/${params.id}`;

  const resend = new Resend(apiKey);
  const fromAddress = `${businessName} via SnapQuote <quotes@snapquote.dev>`;

  const { error: emailError } = await resend.emails.send({
    from: fromAddress,
    to: quote.customer_email,
    subject: `Thank you for your payment — ${businessName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          ${profile?.logo_url ? `<img src="${profile.logo_url}" alt="${businessName}" style="max-height: 48px; margin-bottom: 12px;" />` : ''}
          <h2 style="margin: 0; color: #111827; font-size: 20px;">${businessName}</h2>
        </div>
        <h1 style="color: #111827; font-size: 22px; text-align: center; margin: 0 0 20px;">
          Thank you, ${quote.customer_name}!
        </h1>
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">
          Your deposit of <strong>$${amount}</strong> has been received for your quote.
        </p>
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">
          Your contractor <strong>${businessName}</strong> will be in touch about next steps.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${receiptUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            View Receipt
          </a>
        </div>
        <p style="color: #6b7280; font-size: 13px; line-height: 1.5; text-align: center;">
          Powered by <a href="https://snapquote.dev" style="color: #4f46e5; text-decoration: none;">SnapQuote</a>
        </p>
      </div>
    `,
  });

  if (emailError) {
    console.error('[thank-you] Resend error:', emailError);
    return NextResponse.json(
      { success: false, error: emailError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, receiptUrl });
}
