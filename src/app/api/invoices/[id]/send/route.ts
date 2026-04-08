import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { sendSms } from '@/lib/twilio';

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Rate limit
    if (!(await rateLimit(`send-invoice:${user.id}`, 20, 3_600_000))) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }

    const { data: invoice, error: invErr } = await supabase
      .from('invoices')
      .select(`
        *,
        quotes!inner (
          customer_name, customer_phone, customer_email
        )
      `)
      .eq('id', params.id)
      .eq('contractor_id', user.id)
      .single();

    if (invErr || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const q = invoice.quotes as Record<string, unknown> | null;
    const customerName = (q?.customer_name as string) || 'there';
    const customerPhone = q?.customer_phone as string | null;

    // Get business name
    const { data: profile } = await supabase
      .from('users')
      .select('business_name, full_name')
      .eq('id', user.id)
      .single();

    const businessName = profile?.business_name || profile?.full_name || 'Your contractor';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://snapquote.dev';
    const invoiceUrl = `${appUrl}/invoices/${params.id}`;
    const amount = Number(invoice.amount_due - invoice.amount_paid).toFixed(2);

    let smsSent = false;
    let smsError: string | undefined;

    if (customerPhone) {
      try {
        await sendSms(
          customerPhone,
          `Hi ${customerName}, ${businessName} has sent you an invoice for $${amount}. View: ${invoiceUrl}`,
        );
        smsSent = true;
      } catch (err) {
        smsError = err instanceof Error ? err.message : 'SMS failed';
        console.error('[invoice send] SMS error:', err);
      }
    }

    // Update invoice status and sent_at
    const now = new Date().toISOString();
    await supabase
      .from('invoices')
      .update({
        status: 'sent',
        sent_at: now,
        updated_at: now,
      })
      .eq('id', params.id);

    return NextResponse.json({
      success: true,
      url: invoiceUrl,
      smsSent,
      ...(smsError ? { smsError } : {}),
    });
  } catch (err) {
    console.error('[invoice send] Unhandled error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
