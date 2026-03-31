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
    .select('quote_number, customer_name, customer_phone, customer_email, status, subtotal, deposit_amount, created_at, sent_at, approved_at, paid_at')
    .eq('contractor_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }

  const headers = [
    'Quote Number',
    'Customer Name',
    'Customer Phone',
    'Customer Email',
    'Status',
    'Subtotal',
    'Deposit Amount',
    'Created',
    'Sent',
    'Approved',
    'Paid',
  ];

  const rows = (quotes || []).map((q) => [
    formatQuoteNumber(q.quote_number),
    escapeCSV(q.customer_name || ''),
    escapeCSV(q.customer_phone || ''),
    escapeCSV(q.customer_email || ''),
    q.status || '',
    Number(q.subtotal || 0).toFixed(2),
    Number(q.deposit_amount || 0).toFixed(2),
    formatDate(q.created_at),
    formatDate(q.sent_at),
    formatDate(q.approved_at),
    formatDate(q.paid_at),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const today = new Date().toISOString().split('T')[0];

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="snapquote-export-${today}.csv"`,
    },
  });
}
