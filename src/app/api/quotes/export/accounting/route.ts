import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { formatQuoteNumber } from '@/lib/format-quote-number';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: quotes, error } = await supabase
    .from('quotes')
    .select('quote_number, customer_name, customer_phone, customer_email, status, subtotal, discount_amount, discount_percent, tax_rate, total, deposit_percent, deposit_amount, stripe_payment_intent_id, created_at, sent_at, approved_at, paid_at')
    .eq('contractor_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }

  const headers = [
    'Quote Number',
    'Customer',
    'Phone',
    'Email',
    'Date Created',
    'Date Sent',
    'Date Approved',
    'Date Paid',
    'Subtotal',
    'Discount',
    'Tax Rate (%)',
    'Tax Amount',
    'Total',
    'Deposit %',
    'Deposit Amount',
    'Balance',
    'Status',
    'Payment Method',
  ];

  const rows = (quotes || []).map((q) => {
    const subtotal = Number(q.subtotal || 0);
    const taxRate = Number(q.tax_rate || 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = Number(q.total || 0);
    const depositAmount = Number(q.deposit_amount || 0);
    const balance = total - depositAmount;
    const discount = q.discount_amount
      ? Number(q.discount_amount).toFixed(2)
      : q.discount_percent
        ? `${Number(q.discount_percent).toFixed(1)}%`
        : '0.00';

    return [
      formatQuoteNumber(q.quote_number),
      escapeCSV(q.customer_name || ''),
      escapeCSV(q.customer_phone || ''),
      escapeCSV(q.customer_email || ''),
      formatDate(q.created_at),
      formatDate(q.sent_at),
      formatDate(q.approved_at),
      formatDate(q.paid_at),
      subtotal.toFixed(2),
      discount,
      taxRate.toFixed(2),
      taxAmount.toFixed(2),
      total.toFixed(2),
      Number(q.deposit_percent || 0).toFixed(1),
      depositAmount.toFixed(2),
      balance.toFixed(2),
      q.status || '',
      q.stripe_payment_intent_id ? 'Stripe' : '',
    ];
  });

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const today = new Date().toISOString().split('T')[0];

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="snapquote-accounting-${today}.csv"`,
    },
  });
}
