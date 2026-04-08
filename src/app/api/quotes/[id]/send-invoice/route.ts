import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/escape-html';
import { sendSms } from '@/lib/twilio';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { sendEmail = true, sendSmsMsg = false } = body;

  const { data: quote } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', params.id)
    .eq('contractor_id', user.id)
    .single();

  if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
  if (quote.status === 'draft') {
    return NextResponse.json({ error: 'Cannot send invoice for a draft quote' }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from('users')
    .select('business_name, full_name, logo_url, brand_color, email, phone')
    .eq('id', user.id)
    .single();

  const businessName = profile?.business_name || profile?.full_name || 'Licensed Professional';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://snapquote.dev';
  const receiptUrl = `${appUrl}/receipt/${params.id}`;
  const quoteUrl = `${appUrl}/q/${params.id}`;
  const isPaid = quote.status === 'deposit_paid';
  const amount = Number(quote.total ?? quote.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 });

  const results = { emailSent: false, smsSent: false };

  // Send email
  if (sendEmail && quote.customer_email && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromAddress = process.env.RESEND_FROM_EMAIL || 'SnapQuote <quotes@snapquote.dev>';
      const subject = isPaid
        ? `Invoice from ${businessName} — PAID ✓`
        : `Invoice from ${businessName} — $${amount} Due`;

      const ctaUrl = isPaid ? receiptUrl : quoteUrl;
      const ctaLabel = isPaid ? 'View Receipt & Invoice' : 'View Invoice';
      const ctaColor = isPaid ? '#16a34a' : '#2563eb';

      const paymentMethodLabel = quote.payment_method
        ? quote.payment_method.charAt(0).toUpperCase() + quote.payment_method.slice(1)
        : '';
      const paidNote = quote.payment_note ? ` (${quote.payment_note})` : '';

      await resend.emails.send({
        from: fromAddress,
        to: quote.customer_email,
        subject,
        html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px 16px;color:#111827">
          ${profile?.logo_url ? `<div style="text-align:center;margin-bottom:24px"><img src="${escapeHtml(profile.logo_url)}" alt="${escapeHtml(businessName)}" style="max-height:56px"/></div>` : ''}
          <h2 style="margin:0 0 4px;font-size:22px;font-weight:700">${escapeHtml(businessName)}</h2>
          <p style="margin:0 0 20px;color:#6b7280;font-size:14px">Invoice for ${escapeHtml(quote.customer_name)}</p>
          ${isPaid
            ? `<div style="display:inline-flex;align-items:center;gap:6px;background:#dcfce7;color:#15803d;font-size:13px;font-weight:700;padding:6px 14px;border-radius:20px;margin-bottom:20px;letter-spacing:0.04em">&#10003;&nbsp;PAID IN FULL</div>`
            : `<div style="display:inline-block;background:#fef9c3;color:#854d0e;font-size:13px;font-weight:700;padding:6px 14px;border-radius:20px;margin-bottom:20px">PAYMENT DUE — $${amount}</div>`
          }
          <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px">Hi ${escapeHtml(quote.customer_name)},<br><br>${isPaid
            ? `Thank you for your payment of <strong>$${amount}</strong>${paymentMethodLabel ? ` via ${paymentMethodLabel}${paidNote}` : ''}. Your receipt and invoice are attached below.`
            : `Please find your invoice for <strong>$${amount}</strong> from ${escapeHtml(businessName)} below.`
          }</p>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px 24px;margin:0 0 28px">
            <table style="width:100%;border-collapse:collapse">
              ${(quote.line_items || []).slice(0, 5).map((item: { description: string; total: number }) => `
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6">${escapeHtml(item.description)}</td>
                <td style="padding:6px 0;font-size:14px;color:#111827;font-weight:600;text-align:right;border-bottom:1px solid #f3f4f6">$${Number(item.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              </tr>`).join('')}
              <tr>
                <td style="padding:12px 0 0;font-size:15px;font-weight:700;color:#111827">Total</td>
                <td style="padding:12px 0 0;font-size:18px;font-weight:700;color:${isPaid ? '#16a34a' : '#111827'};text-align:right">$${amount}</td>
              </tr>
              ${isPaid && paymentMethodLabel ? `<tr><td colspan="2" style="padding:4px 0 0;font-size:13px;color:#6b7280">Paid via ${paymentMethodLabel}${paidNote}${quote.paid_at ? ` on ${new Date(quote.paid_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}</td></tr>` : ''}
            </table>
          </div>
          <div style="text-align:center;margin:0 0 28px">
            <a href="${ctaUrl}" style="display:inline-block;background:${ctaColor};color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:600;font-size:15px">${ctaLabel}</a>
          </div>
          <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0">Sent via <a href="https://snapquote.dev" style="color:#6366f1;text-decoration:none">SnapQuote</a></p>
        </div>`,
      });
      results.emailSent = true;
    } catch (err) {
      console.error('[send-invoice] Email error:', err);
    }
  }

  // Send SMS
  if (sendSmsMsg && quote.customer_phone) {
    try {
      const smsBody = isPaid
        ? `Hi ${quote.customer_name}, thank you for your payment! Your receipt from ${businessName} is ready: ${receiptUrl}`
        : `Hi ${quote.customer_name}, your invoice for $${amount} from ${businessName} is ready to view: ${quoteUrl}`;
      await sendSms(quote.customer_phone, smsBody);
      results.smsSent = true;
    } catch (err) {
      console.error('[send-invoice] SMS error:', err);
    }
  }

  return NextResponse.json({ success: true, ...results });
}
