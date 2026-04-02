import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ReviewPrompt } from '@/components/ReviewPrompt';
import { ConfettiOnMount } from '@/components/ConfettiOnMount';

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

const methodLabel: Record<string, string> = {
  cash: 'Cash',
  check: 'Check',
  card: 'Credit / Debit Card',
  stripe: 'Card (Online)',
};

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: quote } = await supabase
    .from('quotes')
    .select('id, contractor_id, customer_name, scope_of_work, ai_description, subtotal, total, deposit_amount, paid_at, payment_method, payment_note, customer_signature, customer_signed_name, approved_at')
    .eq('id', params.id)
    .single();

  if (!quote) notFound();

  const { data: profile } = await supabase
    .from('users')
    .select('business_name, full_name, email, logo_url')
    .eq('id', quote.contractor_id)
    .single();

  const subtotal = Number(quote.subtotal);
  const total = Number(quote.total ?? quote.subtotal);
  const deposit = Number(quote.deposit_amount);
  const balance = total - deposit;
  const businessName = profile?.business_name || profile?.full_name || 'Contractor';
  const receiptNumber = quote.id.slice(-8).toUpperCase();

  return (
    <div className="force-light min-h-dvh bg-[#f5f5f7]">
      <ConfettiOnMount />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            {profile?.logo_url ? (
              <img src={profile.logo_url} alt="" className="h-10 w-10 rounded-xl object-contain bg-gray-50 p-1" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700 font-bold text-sm">
                {businessName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-[15px] font-bold text-gray-900">{businessName}</p>
              <p className="text-[12px] text-gray-400">Payment Receipt</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Receipt</p>
            <p className="text-[13px] font-bold text-gray-700">#{receiptNumber}</p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-lg px-4 py-5 space-y-4">

        {/* Paid confirmation */}
        <div className="rounded-2xl bg-green-600 px-5 py-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <p className="text-[13px] font-semibold text-green-100">Payment Received</p>
          <p className="text-[40px] font-bold text-white leading-tight">{fmt(deposit)}</p>
          <p className="text-[13px] text-green-200 mt-1">
            {quote.paid_at ? formatDate(quote.paid_at) : 'Recorded'}
            {quote.payment_method ? ` · ${methodLabel[quote.payment_method] || quote.payment_method}` : ''}
          </p>
          {quote.payment_note && (
            <p className="text-[12px] text-green-200 mt-0.5">{quote.payment_note}</p>
          )}
        </div>

        {/* Customer & job details */}
        <div className="rounded-2xl bg-white px-5 py-4 space-y-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Details</p>
          <div className="flex justify-between">
            <span className="text-[14px] text-gray-500">Customer</span>
            <span className="text-[14px] font-semibold text-gray-900">{quote.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[14px] text-gray-500">Date</span>
            <span className="text-[14px] font-semibold text-gray-900">
              {quote.paid_at ? formatDate(quote.paid_at) : '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[14px] text-gray-500">Payment Method</span>
            <span className="text-[14px] font-semibold text-gray-900">
              {quote.payment_method ? methodLabel[quote.payment_method] || quote.payment_method : '—'}
            </span>
          </div>
          {quote.payment_note && (
            <div className="flex justify-between">
              <span className="text-[14px] text-gray-500">Note</span>
              <span className="text-[14px] font-semibold text-gray-900">{quote.payment_note}</span>
            </div>
          )}
        </div>

        {/* Job scope */}
        {(quote.scope_of_work || quote.ai_description) && (
          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Work Performed</p>
            <p className="text-[14px] leading-relaxed text-gray-700">
              {quote.scope_of_work || quote.ai_description}
            </p>
          </div>
        )}

        {/* Payment breakdown */}
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
          <div className="flex justify-between px-5 py-4 border-b border-gray-100">
            <span className="text-[14px] text-gray-500">Total Job Value</span>
            <span className="text-[14px] font-semibold text-gray-900">{fmt(total)}</span>
          </div>
          <div className="flex justify-between px-5 py-4 bg-green-50 border-b border-gray-100">
            <span className="text-[14px] font-semibold text-green-800">Deposit Paid</span>
            <span className="text-[14px] font-bold text-green-700">{fmt(deposit)}</span>
          </div>
          <div className="flex justify-between px-5 py-4">
            <span className="text-[14px] text-gray-500">Balance Due on Completion</span>
            <span className="text-[14px] font-semibold text-gray-900">{fmt(balance)}</span>
          </div>
        </div>

        {/* Signature */}
        {(quote.customer_signature || quote.customer_signed_name) && (
          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Customer Signature</p>
            {quote.customer_signature && (
              <div className="rounded-xl border border-gray-100 bg-gray-50 overflow-hidden mb-2">
                <img
                  src={quote.customer_signature}
                  alt="Customer signature"
                  className="h-20 w-full object-contain"
                />
              </div>
            )}
            {quote.customer_signed_name && (
              <p className="text-[14px] font-semibold text-gray-900">{quote.customer_signed_name}</p>
            )}
            {quote.approved_at && (
              <p className="text-[12px] text-gray-400 mt-0.5">
                Signed {new Date(quote.approved_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
        )}

        {/* Review Prompt */}
        <div data-no-print>
          <ReviewPrompt
            contractorId={quote.contractor_id}
            quoteId={quote.id}
            customerName={quote.customer_name}
          />
        </div>

        {/* Download Invoice */}
        <div className="flex justify-center" data-no-print>
          <a
            href={`/api/quotes/${quote.id}/invoice/public`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-5 py-3 text-[14px] font-semibold text-green-700 shadow-sm hover:bg-green-100 transition-colors"
          >
            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download Invoice
          </a>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-1 pb-6" data-no-print>
          <p className="text-[12px] text-gray-400">{businessName}</p>
          <p className="text-[11px] text-gray-300">Powered by SnapQuote</p>
        </div>

      </main>
    </div>
  );
}
