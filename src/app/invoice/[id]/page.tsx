import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { formatQuoteNumber } from '@/lib/format-quote-number';
import { formatPhoneNumber } from '@/lib/format-phone';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatInvoiceNumber(n: number | null | undefined): string {
  if (n == null) return '';
  return `INV-${String(n).padStart(3, '0')}`;
}

const methodLabel: Record<string, string> = {
  cash: 'Cash',
  check: 'Check',
  card: 'Credit / Debit Card',
  stripe: 'Card (Online)',
};

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const serviceClient = getServiceClient();

  const { data: quote } = await serviceClient
    .from('quotes')
    .select('total, subtotal, contractor_id, customer_name, quote_number')
    .eq('id', params.id)
    .single();

  if (!quote) return {};

  const { data: profile } = await serviceClient
    .from('users')
    .select('business_name, full_name')
    .eq('id', quote.contractor_id)
    .single();

  const businessName = profile?.business_name || profile?.full_name || 'Contractor';
  const total = Number(quote.total ?? quote.subtotal);
  const amountStr = '$' + total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const invoiceNum = quote.quote_number ? formatInvoiceNumber(quote.quote_number) : '';

  return {
    title: `Invoice${invoiceNum ? ` ${invoiceNum}` : ''} from ${businessName} — ${amountStr}`,
    description: `View invoice for ${amountStr} from ${businessName}.`,
  };
}

export default async function InvoicePage({
  params,
}: {
  params: { id: string };
}) {
  const serviceClient = getServiceClient();

  const { data: quote } = await serviceClient
    .from('quotes')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!quote) notFound();

  // Don't show invoices for drafts
  if (quote.status === 'draft') notFound();

  const { data: profile } = await serviceClient
    .from('users')
    .select('business_name, full_name, email, phone, logo_url, stripe_account_id, brand_color')
    .eq('id', quote.contractor_id)
    .single();

  const subtotal = Number(quote.subtotal);
  const quoteTotal = Number(quote.total ?? quote.subtotal);
  const deposit = Number(quote.deposit_amount);
  const balance = quoteTotal - deposit;

  const hasDiscount =
    (quote.discount_amount != null && quote.discount_amount > 0) ||
    (quote.discount_percent != null && quote.discount_percent > 0);
  const discountDisplay =
    quote.discount_amount != null && quote.discount_amount > 0
      ? Number(quote.discount_amount)
      : quote.discount_percent != null && quote.discount_percent > 0
        ? Math.round(subtotal * (Number(quote.discount_percent) / 100) * 100) / 100
        : 0;
  const hasTax = quote.tax_rate != null && Number(quote.tax_rate) > 0;
  const afterDiscount = Math.round((subtotal - discountDisplay) * 100) / 100;
  const taxAmount = hasTax
    ? Math.round(afterDiscount * (Number(quote.tax_rate) / 100) * 100) / 100
    : 0;

  const businessName = profile?.business_name || profile?.full_name || 'Contractor';
  const invoiceNumber = quote.quote_number
    ? formatInvoiceNumber(quote.quote_number)
    : `INV-${quote.id.slice(-6).toUpperCase()}`;
  const issueDate = quote.sent_at
    ? formatDate(quote.sent_at)
    : formatDate(quote.created_at);
  const lineItems: { description: string; quantity: number; unit: string; unit_price: number; total: number }[] =
    quote.line_items || [];
  const isPaid = quote.status === 'deposit_paid';
  const stripeEnabled = !!profile?.stripe_account_id;

  return (
    <div className="force-light min-h-dvh bg-gray-100 print:bg-white">
      {/* Print styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              [data-no-print] { display: none !important; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          `,
        }}
      />

      <div className="mx-auto max-w-3xl px-4 py-8 print:px-0 print:py-0">
        {/* Invoice card */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06] overflow-hidden print:shadow-none print:ring-0 print:rounded-none">

          {/* Header */}
          <div className="border-b border-gray-100 px-8 py-8 sm:flex sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              {profile?.logo_url ? (
                <img
                  src={profile.logo_url}
                  alt=""
                  className="h-14 w-14 rounded-xl object-contain bg-gray-50 p-1.5"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-900 text-white font-bold text-lg">
                  {businessName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-gray-900">{businessName}</h2>
                {profile?.full_name && profile?.business_name && (
                  <p className="text-sm text-gray-500">{profile.full_name}</p>
                )}
                {profile?.email && (
                  <p className="text-sm text-gray-500">{profile.email}</p>
                )}
                {profile?.phone && (
                  <p className="text-sm text-gray-500">{formatPhoneNumber(profile.phone)}</p>
                )}
              </div>
            </div>

            <div className="mt-4 sm:mt-0 sm:text-right">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">INVOICE</h1>
              <p className="mt-1 text-sm font-semibold text-gray-700">{invoiceNumber}</p>
              {quote.quote_number && (
                <p className="text-xs text-gray-400">Ref: Quote {formatQuoteNumber(quote.quote_number)}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">Issued: {issueDate}</p>

              {/* Status badge */}
              {isPaid ? (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-green-700 ring-1 ring-green-200">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Deposit Paid
                </span>
              ) : (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-700 ring-1 ring-orange-200">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Unpaid
                </span>
              )}
            </div>
          </div>

          {/* Bill To / From */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-8 py-6 border-b border-gray-100 bg-gray-50/50">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Bill To</p>
              <p className="text-sm font-semibold text-gray-900">{quote.customer_name}</p>
              {quote.customer_phone && (
                <p className="text-sm text-gray-600">{formatPhoneNumber(quote.customer_phone)}</p>
              )}
              {quote.customer_email && (
                <p className="text-sm text-gray-600">{quote.customer_email}</p>
              )}
              {quote.job_address && (
                <p className="text-sm text-gray-600 mt-1">{quote.job_address}</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">From</p>
              <p className="text-sm font-semibold text-gray-900">{businessName}</p>
              {profile?.full_name && profile?.business_name && (
                <p className="text-sm text-gray-600">{profile.full_name}</p>
              )}
              {profile?.email && (
                <p className="text-sm text-gray-600">{profile.email}</p>
              )}
              {profile?.phone && (
                <p className="text-sm text-gray-600">{formatPhoneNumber(profile.phone)}</p>
              )}
            </div>
          </div>

          {/* Description of Work */}
          {(quote.scope_of_work || quote.ai_description) && (
            <div className="px-8 py-5 border-b border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Description of Work</p>
              <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                {quote.scope_of_work || quote.ai_description}
              </p>
            </div>
          )}

          {/* Line Items Table */}
          <div className="px-8 py-5 border-b border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Line Items</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider rounded-l-lg">Description</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider w-16">Qty</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider w-16">Unit</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider w-24">Price</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider w-24 rounded-r-lg">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lineItems.map((item, i) => (
                    <tr key={i} className={i % 2 === 1 ? 'bg-gray-50/50' : ''}>
                      <td className="px-3 py-2.5 text-gray-700">{item.description}</td>
                      <td className="px-3 py-2.5 text-right text-gray-600 tabular-nums">{item.quantity}</td>
                      <td className="px-3 py-2.5 text-right text-gray-600">{item.unit}</td>
                      <td className="px-3 py-2.5 text-right text-gray-600 tabular-nums">{fmt(item.unit_price)}</td>
                      <td className="px-3 py-2.5 text-right font-semibold text-gray-900 tabular-nums">{fmt(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="px-8 py-5 border-b border-gray-100">
            <div className="flex justify-end">
              <div className="w-full sm:w-72 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-gray-900 tabular-nums">{fmt(subtotal)}</span>
                </div>
                {hasDiscount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Discount{quote.discount_percent != null && quote.discount_percent > 0 ? ` (${quote.discount_percent}%)` : ''}
                    </span>
                    <span className="font-semibold text-red-600 tabular-nums">-{fmt(discountDisplay)}</span>
                  </div>
                )}
                {hasTax && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax ({quote.tax_rate}%)</span>
                    <span className="font-semibold text-gray-900 tabular-nums">{fmt(taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t-2 border-gray-900 pt-2 mt-2">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-base font-bold text-gray-900 tabular-nums">{fmt(quoteTotal)}</span>
                </div>

                {/* Deposit / Balance */}
                <div className={`flex justify-between rounded-lg px-3 py-2 mt-2 ${isPaid ? 'bg-green-50' : 'bg-orange-50'}`}>
                  <span className={`text-sm font-semibold ${isPaid ? 'text-green-800' : 'text-orange-800'}`}>
                    {isPaid ? 'Deposit Paid' : 'Deposit Required'} ({quote.deposit_percent}%)
                  </span>
                  <span className={`text-sm font-bold tabular-nums ${isPaid ? 'text-green-700' : 'text-orange-700'}`}>
                    {fmt(deposit)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{isPaid ? 'Balance Remaining' : 'Balance Due on Completion'}</span>
                  <span className="font-semibold text-gray-700 tabular-nums">{fmt(balance)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information (for paid invoices) */}
          {isPaid && (
            <div className="px-8 py-5 border-b border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Payment Information</p>
              <div className="space-y-1">
                <p className="text-sm text-gray-700">
                  Status: Deposit paid{quote.paid_at ? ` on ${formatDate(quote.paid_at)}` : ''}
                </p>
                {quote.payment_method && (
                  <p className="text-sm text-gray-700">
                    Method: {methodLabel[quote.payment_method] || quote.payment_method}
                  </p>
                )}
                {quote.payment_note && (
                  <p className="text-sm text-gray-700">Note: {quote.payment_note}</p>
                )}
              </div>
            </div>
          )}

          {/* Payment pending info (for unpaid invoices) */}
          {!isPaid && (
            <div className="px-8 py-5 border-b border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Payment Information</p>
              <div className="space-y-1">
                <p className="text-sm text-gray-700">Status: Payment pending</p>
                <p className="text-sm text-gray-700">
                  Deposit required: {fmt(deposit)} ({quote.deposit_percent}% of total)
                </p>
                {balance > 0 && (
                  <p className="text-sm text-gray-700">
                    Balance of {fmt(balance)} due upon completion of work.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Notes / Terms */}
          {quote.notes && (
            <div className="px-8 py-5 border-b border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Terms & Notes</p>
              <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">{quote.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="px-8 py-6 flex flex-col sm:flex-row items-center gap-3" data-no-print>
            {/* Download PDF */}
            <a
              href={`/api/quotes/${quote.id}/invoice/public`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download PDF
            </a>

            {/* Pay Now button — only for unpaid + stripe-enabled */}
            {!isPaid && stripeEnabled && (
              <a
                href={`/q/${quote.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
                Pay Now
              </a>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-8 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400">{businessName}</p>
            <p className="text-[10px] text-gray-300">Powered by SnapQuote</p>
          </div>
        </div>
      </div>
    </div>
  );
}
