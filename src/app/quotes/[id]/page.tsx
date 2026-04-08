import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SendQuoteButton } from '@/components/SendQuoteButton';
import { QuoteEditor } from '@/components/QuoteEditor';
import { CollectPaymentButton } from '@/components/CollectPaymentButton';
import { CancelQuoteButton } from '@/components/CancelQuoteButton';
import { DuplicateQuoteButton } from '@/components/DuplicateQuoteButton';
import { SaveAsTemplateButton } from '@/components/SaveAsTemplateButton';
import { PreviewQuoteButton } from '@/components/PreviewQuoteButton';
import { formatPhoneNumber } from '@/lib/format-phone';
import { SendReminderButton } from '@/components/SendReminderButton';
import { InternalNotes } from '@/components/InternalNotes';
import { ScheduleJobSection } from '@/components/ScheduleJobSection';
import { AddToCalendarButton } from '@/components/AddToCalendarButton';
import { formatQuoteNumber } from '@/lib/format-quote-number';
import PageTransition from '@/components/PageTransition';
import PhotoGallery from '@/components/PhotoGallery';
import { QuoteTimeline } from '@/components/QuoteTimeline';
import { relativeTime } from '@/lib/relative-time';
import { ShareButton } from '@/components/ShareButton';
import { PrintButton } from '@/components/PrintButton';
import { QuoteActionsDropdown, DropdownItem } from '@/components/QuoteActionsDropdown';
import { ArchiveQuoteButton } from '@/components/ArchiveQuoteButton';
import { SMSShareButton } from '@/components/SMSShareButton';
import { SendInvoiceButton } from '@/components/SendInvoiceButton';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  approved: 'bg-amber-100 text-amber-700',
  deposit_paid: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  approved: 'Approved',
  deposit_paid: 'Deposit Paid',
  cancelled: 'Cancelled',
};

export default async function QuoteDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: quote } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', params.id)
    .eq('contractor_id', user.id)
    .single();

  if (!quote) notFound();

  // Fetch payments to compute totalPaid
  const { data: payments } = await supabase
    .from('payments')
    .select('amount')
    .eq('quote_id', params.id);
  const totalPaid = (payments || []).reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0);

  const { data: profile } = await supabase
    .from('users')
    .select('business_name, full_name')
    .eq('id', user.id)
    .single();
  const businessName = profile?.business_name || profile?.full_name || 'us';

  const subtotal = Number(quote.subtotal);
  const quoteTotal = Number(quote.total ?? quote.subtotal);
  const deposit = Number(quote.deposit_amount);
  const balance = quoteTotal - deposit;
  const hasDiscount = (quote.discount_amount != null && Number(quote.discount_amount) > 0) ||
    (quote.discount_percent != null && Number(quote.discount_percent) > 0);
  const discountDisplay = quote.discount_amount != null && Number(quote.discount_amount) > 0
    ? Number(quote.discount_amount)
    : quote.discount_percent != null && Number(quote.discount_percent) > 0
      ? Math.round(subtotal * (Number(quote.discount_percent) / 100) * 100) / 100
      : 0;
  const hasTax = quote.tax_rate != null && Number(quote.tax_rate) > 0;
  const afterDiscount = Math.round((subtotal - discountDisplay) * 100) / 100;
  const taxAmount = hasTax ? Math.round(afterDiscount * (Number(quote.tax_rate) / 100) * 100) / 100 : 0;

  return (
    <PageTransition>
    <div className="min-h-dvh bg-[#f2f2f7] dark:bg-gray-950 pb-28 lg:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-black/5 dark:border-white/5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl px-5 pt-14 lg:pt-3 pb-3" data-no-print>
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              aria-label="Go back"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-gray-100">
                {quote.quote_number ? <span className="text-gray-500 font-medium">{formatQuoteNumber(quote.quote_number)}</span> : null}
                {quote.quote_number ? ' ' : ''}{quote.customer_name}
              </h1>
              <span className={`status-badge text-xs ${statusColors[quote.status] || 'bg-gray-100 text-gray-700'}`}>
                {statusLabels[quote.status] || quote.status}
              </span>
            </div>
          </div>
          {/* Actions — Keep primary visible, overflow into dropdown */}
          <div className="flex items-center gap-2">
            <CollectPaymentButton
              quoteId={quote.id}
              quoteTotal={quoteTotal}
              totalPaid={totalPaid}
              depositPercent={Number(quote.deposit_percent || 0)}
              currentStatus={quote.status}
              paymentMethod={quote.payment_method}
              hasEmail={!!quote.customer_email}
              hasPhone={!!quote.customer_phone}
            />
            {quote.customer_phone && (
              <SMSShareButton
                phone={quote.customer_phone}
                message={`Hi ${quote.customer_name}, ${businessName} sent you a quote for $${Number(quote.total ?? quote.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}. View and approve here: ${process.env.NEXT_PUBLIC_APP_URL || 'https://snapquote.dev'}/q/${quote.id}`}
              />
            )}
            <ShareButton
              url={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/q/${quote.id}`}
              title={`Quote for ${quote.customer_name}`}
              text="Review your quote"
            />
            <QuoteActionsDropdown>
              <div className="px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Actions</p>
              </div>
              <div>
                <QuoteEditor quote={quote} />
              </div>
              {(quote.status === 'draft' || quote.status === 'sent') && (
                <div>
                  <PreviewQuoteButton
                    quoteId={quote.id}
                    currentStatus={quote.status}
                    hasPhone={!!quote.customer_phone}
                    hasEmail={!!quote.customer_email}
                  />
                </div>
              )}
              <div>
                <SendQuoteButton
                  quoteId={quote.id}
                  currentStatus={quote.status}
                  hasPhone={!!quote.customer_phone}
                  hasEmail={!!quote.customer_email}
                  customerName={quote.customer_name}
                  customerPhone={quote.customer_phone}
                  total={Number(quote.total ?? quote.subtotal)}
                  businessName={businessName}
                />
              </div>
              <div>
                <SendReminderButton
                  quoteId={quote.id}
                  status={quote.status}
                  hasEmail={!!quote.customer_email}
                  reminderSentAt={quote.reminder_sent_at}
                />
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                <div className="px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">More</p>
                </div>
              </div>
              <div><DuplicateQuoteButton quote={quote} /></div>
              <div>
                <SaveAsTemplateButton
                  lineItems={quote.line_items}
                  notes={quote.notes}
                  scopeOfWork={quote.scope_of_work}
                />
              </div>
              <DropdownItem href={`/api/quotes/${quote.id}/pdf`}>
                <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download PDF
              </DropdownItem>
              <div><PrintButton variant="full" /></div>
              <div><AddToCalendarButton quoteId={quote.id} scheduledDate={quote.scheduled_date} /></div>
              {quote.status === 'deposit_paid' && (
                <DropdownItem href={`/api/quotes/${quote.id}/invoice`}>
                  <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  Download Invoice
                </DropdownItem>
              )}
              <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                <ArchiveQuoteButton quoteId={quote.id} isArchived={!!quote.archived} />
              </div>
            </QuoteActionsDropdown>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-5 lg:px-8 pt-6">

        {/* Status Timeline */}
        <QuoteTimeline quote={quote} />

        {/* ── Payment & Invoice Action Card ── */}
        {quote.status === 'approved' && (
          <div className="card !border-green-200 dark:!border-green-800 !bg-green-50 dark:!bg-green-950/20 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                <svg className="h-4 w-4 text-green-700 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-bold text-green-800 dark:text-green-300">Quote Approved</p>
                <p className="text-[12px] text-green-700/70 dark:text-green-400/70">Ready to collect payment</p>
              </div>
            </div>
            <CollectPaymentButton
              quoteId={quote.id}
              quoteTotal={quoteTotal}
              totalPaid={totalPaid}
              depositPercent={Number(quote.deposit_percent || 0)}
              currentStatus={quote.status}
              paymentMethod={quote.payment_method}
              hasEmail={!!quote.customer_email}
              hasPhone={!!quote.customer_phone}
              prominent
            />
            <SendInvoiceButton
              quoteId={quote.id}
              isPaid={false}
              hasEmail={!!quote.customer_email}
              hasPhone={!!quote.customer_phone}
              prominent={false}
            />
          </div>
        )}

        {quote.status === 'deposit_paid' && (
          <div className="card !border-green-200 dark:!border-green-800 !bg-green-50 dark:!bg-green-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                  <svg className="h-4 w-4 text-green-700 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-green-800 dark:text-green-300">Payment Received</p>
                  <p className="text-[12px] text-green-700/70 dark:text-green-400/70">
                    {quote.payment_method ? `via ${quote.payment_method.charAt(0).toUpperCase() + quote.payment_method.slice(1)}` : ''}
                    {quote.payment_note ? ` · ${quote.payment_note}` : ''}
                    {quote.paid_at ? ` · ${new Date(quote.paid_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                  </p>
                </div>
              </div>
              <span className="text-[15px] font-bold text-green-700 dark:text-green-300">
                ${Number(quote.deposit_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <SendInvoiceButton
              quoteId={quote.id}
              isPaid
              hasEmail={!!quote.customer_email}
              hasPhone={!!quote.customer_phone}
              prominent
            />
            <div className="flex gap-2">
              <a
                href={`/receipt/${quote.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-green-200 dark:border-green-800 bg-white dark:bg-gray-900 py-2.5 text-[13px] font-medium text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 press-scale"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View Receipt
              </a>
              <a
                href={`/api/quotes/${quote.id}/invoice`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-green-200 dark:border-green-800 bg-white dark:bg-gray-900 py-2.5 text-[13px] font-medium text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 press-scale"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download PDF
              </a>
            </div>
          </div>
        )}

        {/* AI Summary */}
        {quote.ai_description && (
          <div className="card !bg-brand-50 dark:!bg-brand-950/30 !border-brand-200 dark:!border-brand-800">
            <div className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <p className="text-sm font-medium text-brand-900 dark:text-brand-200">{quote.ai_description}</p>
            </div>
          </div>
        )}

        {/* Scope of Work */}
        {quote.scope_of_work && (
          <div className="card">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Scope of Work</p>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{quote.scope_of_work}</p>
          </div>
        )}

        {/* Inspection Report */}
        {quote.inspection_findings && Array.isArray(quote.inspection_findings) && (quote.inspection_findings as Array<{finding: string; severity: string; urgency_message: string; photo_index: number}>).length > 0 && (
          <div className="card space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              Inspection Report ({(quote.inspection_findings as unknown[]).length} finding{(quote.inspection_findings as unknown[]).length !== 1 ? 's' : ''})
            </p>
            <div className="space-y-2">
              {(quote.inspection_findings as Array<{finding: string; severity: string; urgency_message: string; photo_index: number}>).map((f, i) => {
                const sc = f.severity === 'critical'
                  ? { bg: 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900', dot: 'bg-red-500', label: 'Critical', textColor: 'text-red-700 dark:text-red-400' }
                  : f.severity === 'moderate'
                    ? { bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900', dot: 'bg-amber-500', label: 'Moderate', textColor: 'text-amber-700 dark:text-amber-400' }
                    : { bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900', dot: 'bg-blue-400', label: 'Minor', textColor: 'text-blue-700 dark:text-blue-400' };
                const photoUrl = (quote.photos && f.photo_index != null && f.photo_index < quote.photos.length)
                  ? quote.photos[f.photo_index]
                  : null;
                return (
                  <div key={i} className={`rounded-xl border overflow-hidden ${sc.bg}`}>
                    {photoUrl && (
                      <img
                        src={photoUrl}
                        alt={`Finding photo ${f.photo_index + 1}`}
                        loading="lazy"
                        className="w-full h-28 object-cover"
                      />
                    )}
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`h-2 w-2 rounded-full shrink-0 ${sc.dot}`} />
                        <span className={`text-[11px] font-semibold uppercase tracking-wider ${sc.textColor}`}>{sc.label}</span>
                      </div>
                      <p className="text-[14px] font-medium text-gray-900 dark:text-gray-100">{f.finding}</p>
                      {f.urgency_message && (
                        <p className="mt-0.5 text-[13px] text-gray-500 dark:text-gray-400 italic">"{f.urgency_message}"</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Customer */}
        <div className="card">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Customer</p>
          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{quote.customer_name}</p>
          {quote.customer_phone && (
            <a href={`tel:${quote.customer_phone}`} className="text-xs text-brand-600">
              {formatPhoneNumber(quote.customer_phone)}
            </a>
          )}
          {quote.customer_email && (
            <a href={`mailto:${quote.customer_email}`} className="block text-xs text-brand-600">
              {quote.customer_email}
            </a>
          )}
          {quote.job_address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(quote.job_address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700"
            >
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {quote.job_address}
            </a>
          )}
        </div>

        {/* Line Items */}
        <div>
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Line Items</h2>
          <div className="overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
            {(quote.line_items || []).map((item: { description: string; quantity: number; unit: string; unit_price: number; total: number }, i: number) => (
              <div
                key={i}
                className={`flex items-start justify-between px-4 py-3.5 ${
                  i < (quote.line_items || []).length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
                } ${i % 2 === 1 ? 'bg-gray-50/40 dark:bg-gray-800/20' : ''}`}
              >
                <div className="min-w-0 flex-1 pr-4">
                  <p className="text-[14px] font-medium text-gray-900 dark:text-gray-100">{item.description}</p>
                  <p className="mt-0.5 text-[12px] text-gray-400 dark:text-gray-500">
                    {item.quantity} {item.unit} x ${Number(item.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <p className="shrink-0 text-[14px] font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                  ${Number(item.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div className="card">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Terms & Conditions</p>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{quote.notes}</p>
          </div>
        )}

        {/* Internal Notes */}
        <div data-no-print>
          <InternalNotes quoteId={quote.id} initialNotes={quote.internal_notes} />
        </div>

        {/* Totals */}
        <div className="card space-y-3 !shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          {hasDiscount && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Discount{quote.discount_percent != null && Number(quote.discount_percent) > 0 ? ` (${quote.discount_percent}%)` : ''}
              </span>
              <span className="text-sm font-medium text-red-500">
                -${discountDisplay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {hasTax && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tax ({quote.tax_rate}%)</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ${taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {(hasDiscount || hasTax) && (
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Total</span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                ${quoteTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Deposit ({quote.deposit_percent}%)</span>
            <span className="text-lg font-bold text-brand-600">
              ${deposit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Balance due on completion</span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Photos */}
        {quote.photos && quote.photos.length > 0 && (
          <div>
            <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Photos</h2>
            <PhotoGallery photos={quote.photos} quoteId={quote.id} />
          </div>
        )}

        {/* Send / Share */}
        {(quote.status === 'draft' || quote.status === 'sent') && (
          <div className="card space-y-3" data-no-print>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Send to Customer</p>
            {!quote.customer_phone && !quote.customer_email && (
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2">
                Add a phone number or email to send the quote. You can also copy the link below.
              </p>
            )}
            <div className="flex gap-2">
              <SendQuoteButton
                quoteId={quote.id}
                currentStatus={quote.status}
                hasPhone={!!quote.customer_phone}
                hasEmail={!!quote.customer_email}
                customerName={quote.customer_name}
                customerPhone={quote.customer_phone}
                total={Number(quote.total ?? quote.subtotal)}
                businessName={businessName}
              />
            </div>
            <div className="flex justify-center">
              <PreviewQuoteButton
                quoteId={quote.id}
                currentStatus={quote.status}
                hasPhone={!!quote.customer_phone}
                hasEmail={!!quote.customer_email}
              />
            </div>
          </div>
        )}

        {/* Signature */}
        {(quote.customer_signature || quote.customer_signed_name) && (
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Customer Signature</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-950/40 px-2.5 py-1 text-[11px] font-semibold text-green-700 dark:text-green-400">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Signed
              </span>
            </div>
            {quote.customer_signature && (
              <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 overflow-hidden mb-2">
                <img
                  src={quote.customer_signature}
                  alt="Customer signature"
                  loading="lazy"
                  className="h-20 w-full object-contain"
                />
              </div>
            )}
            {quote.customer_signed_name && (
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{quote.customer_signed_name}</p>
            )}
            {quote.approved_at && (
              <p className="text-xs text-gray-400 mt-0.5">
                Signed {relativeTime(quote.approved_at)}
              </p>
            )}
          </div>
        )}

        {/* Schedule Job */}
        <div data-no-print>
          <ScheduleJobSection
            quoteId={quote.id}
            status={quote.status}
            scheduledDate={quote.scheduled_date}
            scheduledTime={quote.scheduled_time}
            estimatedDuration={quote.estimated_duration}
          />
        </div>

        {/* Cancel Quote */}
        <div data-no-print>
          <CancelQuoteButton quoteId={quote.id} currentStatus={quote.status} />
        </div>

        {/* Metadata */}
        <p className="pb-4 text-center text-xs text-gray-400">
          Created {relativeTime(quote.created_at)}
          {quote.sent_at && ` · Sent ${relativeTime(quote.sent_at)}`}
          {quote.paid_at && ` · Paid ${relativeTime(quote.paid_at)}`}
        </p>

      </main>
    </div>
    </PageTransition>
  );
}
