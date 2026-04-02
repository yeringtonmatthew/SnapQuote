import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fireWebhook } from '@/lib/webhook';
import twilio from 'twilio';

export async function POST(
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

  // Update status to sent + auto-advance pipeline
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const updateData: Record<string, any> = {
    status: 'sent',
    sent_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  };
  const currentStage = quote.pipeline_stage || 'quote_created';
  if (['lead', 'follow_up', 'quote_created'].includes(currentStage)) {
    updateData.pipeline_stage = 'quote_sent';
  }
  const { error: updateError } = await supabase
    .from('quotes')
    .update(updateData)
    .eq('id', params.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const proposalUrl = `${appUrl}/q/${params.id}`;

  // Fire webhook (fire-and-forget)
  fireWebhook(supabase, user.id, 'quote.sent', {
    quote_id: quote.id,
    quote_number: quote.quote_number ?? null,
    customer_name: quote.customer_name,
    customer_email: quote.customer_email ?? null,
    amount: quote.total,
    deposit_amount: quote.deposit_amount,
    url: proposalUrl,
  });

  // Send SMS if Twilio is configured AND phone number exists
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

  if (sid && token && (from || messagingServiceSid) && quote.customer_phone) {
    try {
      const client = twilio(sid!, token!);
      const { data: profile } = await supabase
        .from('users')
        .select('business_name, full_name')
        .eq('id', user.id)
        .single();

      const businessName = profile?.business_name || profile?.full_name || 'Licensed Professional';
      const message = `Hi ${quote.customer_name}, ${businessName} sent you a quote for $${Number(quote.total ?? quote.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}. View and approve here: ${proposalUrl}`;

      // Normalize to E.164 format (+1XXXXXXXXXX for US numbers)
      const digits = quote.customer_phone?.replace(/\D/g, '') ?? '';
      const toNumber = digits.startsWith('1') ? `+${digits}` : `+1${digits}`;

      // Prefer Messaging Service (required for A2P 10DLC), fall back to direct number
      const msg = await client.messages.create({
        body: message,
        ...(messagingServiceSid ? { messagingServiceSid } : { from }),
        to: toNumber,
      });
      // SMS sent successfully
    } catch (smsError) {
      console.error('[send] SMS error:', smsError);
      // Don't fail the whole request if SMS fails — status was already updated
      return NextResponse.json({
        success: true,
        smsError: smsError instanceof Error ? smsError.message : 'SMS failed',
        proposalUrl,
      });
    }
  }

  // Send email if customer_email exists (fire-and-forget, don't block on failure)
  let emailError: string | undefined;
  if (quote.customer_email) {
    try {
      const emailRes = await fetch(`${appUrl}/api/quotes/${params.id}/send-email`, {
        method: 'POST',
        headers: {
          // Forward the auth cookie so the email route can authenticate
          cookie: request.headers.get('cookie') || '',
        },
      });
      if (!emailRes.ok) {
        const emailData = await emailRes.json();
        emailError = emailData.error || 'Email send failed';
      }
    } catch (err) {
      console.error('[send] Email error:', err);
      emailError = err instanceof Error ? err.message : 'Email send failed';
    }
  }

  return NextResponse.json({
    success: true,
    url: proposalUrl,
    ...(emailError ? { emailError } : {}),
  });
}
