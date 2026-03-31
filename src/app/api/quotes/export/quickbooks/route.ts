import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { formatQuoteNumber } from '@/lib/format-quote-number';
import type { LineItem } from '@/types/database';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  // MM/DD/YYYY format expected by QuickBooks
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
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
    .select('quote_number, customer_name, customer_email, status, line_items, subtotal, tax_rate, total, deposit_amount, created_at, paid_at')
    .eq('contractor_id', user.id)
    .eq('status', 'deposit_paid')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }

  const headers = [
    'Invoice No',
    'Customer',
    'Date',
    'Due Date',
    'Item',
    'Description',
    'Quantity',
    'Rate',
    'Amount',
    'Tax',
    'Total',
  ];

  const rows: string[][] = [];

  for (const q of quotes || []) {
    const invoiceNo = formatQuoteNumber(q.quote_number);
    const customer = escapeCSV(q.customer_name || '');
    const date = formatDate(q.paid_at || q.created_at);
    const dueDate = date; // Already paid, so due date = paid date
    const taxRate = Number(q.tax_rate || 0);
    const lineItems = (q.line_items || []) as LineItem[];

    if (lineItems.length === 0) {
      // Single row for quotes with no line items
      const subtotal = Number(q.subtotal || 0);
      const taxAmount = subtotal * (taxRate / 100);
      rows.push([
        invoiceNo,
        customer,
        date,
        dueDate,
        'Service',
        escapeCSV('General Service'),
        '1',
        subtotal.toFixed(2),
        subtotal.toFixed(2),
        taxAmount.toFixed(2),
        Number(q.total || 0).toFixed(2),
      ]);
    } else {
      for (let i = 0; i < lineItems.length; i++) {
        const item = lineItems[i];
        const amount = Number(item.quantity) * Number(item.unit_price);
        const taxAmount = amount * (taxRate / 100);
        rows.push([
          invoiceNo,
          customer,
          // Only show date/customer on first row per invoice (QuickBooks convention)
          i === 0 ? date : '',
          i === 0 ? dueDate : '',
          escapeCSV(item.unit || 'Service'),
          escapeCSV(item.description || ''),
          String(item.quantity),
          Number(item.unit_price).toFixed(2),
          amount.toFixed(2),
          i === lineItems.length - 1 ? (Number(q.subtotal || 0) * (taxRate / 100)).toFixed(2) : '',
          i === lineItems.length - 1 ? Number(q.total || 0).toFixed(2) : '',
        ]);
      }
    }
  }

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const today = new Date().toISOString().split('T')[0];

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="snapquote-quickbooks-${today}.csv"`,
    },
  });
}
