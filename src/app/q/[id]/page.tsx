import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AcceptQuoteButton } from '@/components/AcceptQuoteButton';
import { DownloadPdfButton } from '@/components/DownloadPdfButton';
import { PrintButton } from '@/components/PrintButton';
import { ViewTracker } from '@/components/ViewTracker';
import { formatQuoteNumber } from '@/lib/format-quote-number';
import PageTransition from '@/components/PageTransition';
import CustomerPhotoGallery from '@/components/CustomerPhotoGallery';
import { CustomerShareButton } from '@/components/CustomerShareButton';

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtShort = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const supabase = createClient();

  const { data: quote } = await supabase
    .from('quotes')
    .select('total, subtotal, contractor_id, customer_name')
    .eq('id', params.id)
    .single();

  if (!quote) return {};

  const { data: profile } = await supabase
    .from('users')
    .select('business_name, full_name')
    .eq('id', quote.contractor_id)
    .single();

  const businessName = profile?.business_name || profile?.full_name || 'Your Contractor';
  const total = Number(quote.total ?? quote.subtotal);
  const amountStr = '$' + total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const ogParams = new URLSearchParams({
    title: `Quote from ${businessName}`,
    subtitle: `For ${quote.customer_name}`,
    amount: amountStr,
  });

  const ogUrl = `https://snapquote.dev/api/og?${ogParams.toString()}`;
  const pageTitle = `Quote from ${businessName} — ${amountStr}`;

  return {
    title: pageTitle,
    description: `Review and approve your ${amountStr} quote from ${businessName}.`,
    openGraph: {
      title: pageTitle,
      description: `Review and approve your ${amountStr} quote from ${businessName}.`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: `Review and approve your ${amountStr} quote from ${businessName}.`,
    },
  };
}

export default async function CustomerProposalPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: quote } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!quote) notFound();

  const { data: profile } = await supabase
    .from('users')
    .select('business_name, full_name, email, trade_type, logo_url, stripe_account_id, brand_color')
    .eq('id', quote.contractor_id)
    .single();

  const brandColor = profile?.brand_color || '#4f46e5';
  const subtotal = Number(quote.subtotal);
  const quoteTotal = Number(quote.total ?? quote.subtotal);
  const deposit = Number(quote.deposit_amount);
  const balance = quoteTotal - deposit;
  const hasDiscount = (quote.discount_amount != null && quote.discount_amount > 0) ||
    (quote.discount_percent != null && quote.discount_percent > 0);
  const discountDisplay = quote.discount_amount != null && quote.discount_amount > 0
    ? Number(quote.discount_amount)
    : quote.discount_percent != null && quote.discount_percent > 0
      ? Math.round(subtotal * (Number(quote.discount_percent) / 100) * 100) / 100
      : 0;
  const hasTax = quote.tax_rate != null && Number(quote.tax_rate) > 0;
  const afterDiscount = Math.round((subtotal - discountDisplay) * 100) / 100;
  const taxAmount = hasTax ? Math.round(afterDiscount * (Number(quote.tax_rate) / 100) * 100) / 100 : 0;
  const businessName = profile?.business_name || profile?.full_name || 'Your Contractor';
  const stripeEnabled = !!profile?.stripe_account_id;
  const photos: string[] = quote.photos || [];
  const inspectionFindings: { photo_index: number; finding: string; severity: string; urgency_message: string }[] = quote.inspection_findings || [];
  const heroPhoto = photos[0] || null;
  const isCancelled = quote.status === 'cancelled';
  const isExpired = quote.expires_at
    ? new Date(quote.expires_at) < new Date() && quote.status === 'sent'
    : false;
  const expiresAt = quote.expires_at ? new Date(quote.expires_at) : null;

  if (isCancelled) {
    return (
      <PageTransition>
      <div className="force-light flex min-h-dvh flex-col items-center justify-center bg-[#f2f2f7] px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-[20px] font-bold text-gray-900">Quote No Longer Available</h1>
          <p className="mt-2 text-[14px] text-gray-500">
            This quote has been cancelled by the contractor. Please contact {businessName} if you have questions.
          </p>
        </div>
      </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
    <div className="force-light min-h-dvh bg-[#f2f2f7]">
      <ViewTracker quoteId={quote.id} />

      {/* ── Hero ─────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ height: '58vh', minHeight: 320 }}>
        {heroPhoto ? (
          <img
            src={heroPhoto}
            alt={`Job site photo for quote from ${businessName}`}
            loading="eager"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1c1c1e] to-[#2c3e50]" />
        )}

        {/* Multi-stop gradient overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/10" />

        {/* Top bar */}
        <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-5 pt-12">
          <div className="flex items-center gap-2.5">
            {profile?.logo_url ? (
              <img
                src={profile.logo_url}
                alt={businessName}
                loading="lazy"
                className="h-9 w-9 rounded-xl object-contain bg-white/10 backdrop-blur-sm p-1"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <span className="text-xs font-bold text-white">{businessName.slice(0, 2).toUpperCase()}</span>
              </div>
            )}
            <span className="text-[13px] font-semibold text-white/90 tracking-tight">{businessName}</span>
          </div>
          <div className="flex items-center gap-2" data-no-print>
            <CustomerShareButton quoteId={quote.id} />
            <PrintButton variant="icon" />
            <DownloadPdfButton quoteId={params.id} />
            <span className="rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 text-[11px] font-semibold text-white/80 tracking-wider uppercase">
              {quote.quote_number ? `Quote ${formatQuoteNumber(quote.quote_number)}` : 'Quote'}
            </span>
          </div>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-7">
          <p className="text-[14px] font-medium mb-1" style={{ color: brandColor }}>Hi {quote.customer_name},</p>
          <h1 className="text-[28px] font-bold tracking-tight text-white leading-tight">
            {quote.status === 'deposit_paid'
              ? <>Your deposit has<br />been received.</>
              : quote.status === 'approved'
                ? <>Your quote has<br />been approved.</>
                : <>Your quote is<br />ready to review.</>
            }
          </h1>
          <div className="mt-5 flex items-end gap-3">
            <div>
              <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest mb-0.5">Total</p>
              <p className="text-[52px] font-bold tracking-tight text-white leading-none">{fmtShort(quoteTotal)}</p>
            </div>
            <div className="mb-2 h-px flex-1 bg-white/10" />
            <div className="mb-2 text-right">
              <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest mb-0.5">Deposit</p>
              <p className="text-[22px] font-bold" style={{ color: brandColor }}>{fmtShort(deposit)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky CTA ───────────────────────────── */}
      <div className="sticky top-0 z-20 px-4 py-3 bg-[#f2f2f7]/80 backdrop-blur-xl border-b border-black/5" data-no-print>
        <div className="mx-auto max-w-lg">
          {isExpired ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-gray-100 px-4 py-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[14px] font-medium text-gray-500">This quote has expired</span>
            </div>
          ) : (
            <AcceptQuoteButton quoteId={quote.id} depositAmount={deposit} currentStatus={quote.status} stripeEnabled={stripeEnabled} brandColor={brandColor} />
          )}
        </div>
      </div>

      <main className="mx-auto max-w-lg px-4 pt-5 pb-12 space-y-3">

        {/* ── Property Inspection Report ─────────── */}
        {inspectionFindings.length > 0 && photos.length > 0 ? (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">Property Inspection Report</p>
            </div>

            <div className="space-y-3">
              {photos.map((photoUrl, photoIdx) => {
                const findings = inspectionFindings.filter(f => f.photo_index === photoIdx);
                if (findings.length === 0) return null;
                return (
                  <div key={photoIdx} className="rounded-2xl bg-white shadow-sm overflow-hidden">
                    <div className="relative">
                      <img
                        src={photoUrl}
                        alt={`Inspection photo ${photoIdx + 1}`}
                        loading="lazy"
                        className="w-full h-56 object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-white">
                          Photo {photoIdx + 1} of {photos.length}
                        </span>
                      </div>
                    </div>
                    <div className="px-5 py-4 space-y-3">
                      {findings.map((f, fIdx) => {
                        const severityStyles = {
                          critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700', icon: '⚠️' },
                          moderate: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', icon: '⚡' },
                          minor: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', icon: 'ℹ️' },
                        };
                        const style = severityStyles[f.severity as keyof typeof severityStyles] || severityStyles.moderate;
                        return (
                          <div key={fIdx} className={`rounded-xl ${style.bg} border ${style.border} px-4 py-3`}>
                            <div className="flex items-start gap-2">
                              <span className="text-[14px] mt-0.5 shrink-0">{style.icon}</span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.badge}`}>
                                    {f.severity}
                                  </span>
                                </div>
                                <p className={`text-[14px] font-semibold ${style.text} leading-snug`}>
                                  {f.finding}
                                </p>
                                <p className="text-[13px] text-gray-600 mt-1.5 leading-relaxed">
                                  {f.urgency_message}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Photos with no findings — show in a simple gallery */}
              {photos.some((_, i) => !inspectionFindings.some(f => f.photo_index === i)) && (
                <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
                  <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Additional Photos</p>
                  <div className="flex gap-2.5 overflow-x-auto scrollbar-none -mx-1 px-1 pb-1">
                    {photos.map((url, i) => {
                      if (inspectionFindings.some(f => f.photo_index === i)) return null;
                      return (
                        <img
                          key={i}
                          src={url}
                          alt={`Job site photo ${i + 1}`}
                          loading="lazy"
                          className="h-28 w-40 shrink-0 rounded-xl object-cover bg-gray-200"
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : photos.length > 1 ? (
          /* Fallback to simple carousel if no inspection findings */
          <div>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-gray-500 px-1">Job Site Photos</p>
            <CustomerPhotoGallery photos={photos} businessName={businessName} />
          </div>
        ) : null}

        {/* ── Scope ────────────────────────────── */}
        {(quote.scope_of_work || quote.ai_description) && (
          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Scope of Work</p>
            <p className="text-[15px] leading-relaxed text-gray-800">
              {quote.scope_of_work || quote.ai_description}
            </p>
          </div>
        )}

        {/* ── Job Address ────────────────────────── */}
        {quote.job_address && (
          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Job Location</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(quote.job_address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[15px] font-medium text-brand-600 hover:text-brand-700"
            >
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {quote.job_address}
            </a>
          </div>
        )}

        {/* ── Line Items ───────────────────────── */}
        <div>
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-gray-500 px-1">What&apos;s Included</p>
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {quote.line_items.map((item: any, i: number) => (
              <div
                key={i}
                className={`flex items-start justify-between px-5 py-4 ${
                  i < quote.line_items.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="min-w-0 flex-1 pr-4">
                  <p className="text-[15px] font-medium text-gray-900 leading-snug">{item.description}</p>
                  <p className="mt-1 text-[12px] text-gray-400">
                    {item.quantity} {item.unit} × {fmt(Number(item.unit_price))}
                  </p>
                </div>
                <p className="shrink-0 text-[15px] font-semibold text-gray-900 tabular-nums">
                  {fmt(Number(item.total))}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Totals ───────────────────────────── */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <span className="text-[14px] text-gray-500">Subtotal</span>
            <span className="text-[14px] font-semibold text-gray-900 tabular-nums">{fmt(subtotal)}</span>
          </div>
          {hasDiscount && (
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <span className="text-[14px] text-gray-500">
                Discount{quote.discount_percent != null && quote.discount_percent > 0 ? ` (${quote.discount_percent}%)` : ''}
              </span>
              <span className="text-[14px] font-medium text-red-500 tabular-nums">-{fmt(discountDisplay)}</span>
            </div>
          )}
          {hasTax && (
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <span className="text-[14px] text-gray-500">Tax ({quote.tax_rate}%)</span>
              <span className="text-[14px] font-medium text-gray-700 tabular-nums">{fmt(taxAmount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <span className="text-[15px] font-semibold text-gray-900">Project Total</span>
            <span className="text-[16px] font-bold text-gray-900 tabular-nums">{fmt(quoteTotal)}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-4" style={{ backgroundColor: brandColor + '12' }}>
            <div>
              <p className="text-[15px] font-semibold" style={{ color: brandColor }}>Deposit to Book ({quote.deposit_percent}%)</p>
              <p className="text-[12px] mt-0.5" style={{ color: brandColor, opacity: 0.6 }}>Secures your spot on our schedule</p>
            </div>
            <span className="text-[24px] font-bold tabular-nums" style={{ color: brandColor }}>{fmt(deposit)}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-[13px] text-gray-400">Balance due on completion</span>
            <span className="text-[14px] font-medium text-gray-500 tabular-nums">{fmt(balance)}</span>
          </div>
          {expiresAt && (
            <div className="flex items-center justify-center gap-1.5 border-t border-gray-100 px-5 py-3">
              <svg className="h-3.5 w-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`text-[12px] ${isExpired ? 'text-red-400' : 'text-gray-400'}`}>
                {isExpired
                  ? `Expired ${expiresAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                  : `Valid until ${expiresAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                }
              </span>
            </div>
          )}
        </div>

        {/* ── Terms ────────────────────────────── */}
        {quote.notes && (
          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Terms & Conditions</p>
            <p className="text-[13px] leading-relaxed text-gray-500 whitespace-pre-line">{quote.notes}</p>
          </div>
        )}

        {/* ── Bottom CTA ───────────────────────── */}
        <div className="overflow-hidden rounded-2xl bg-[#1c1c1e] shadow-lg" data-no-print>
          {heroPhoto && (
            <div className="relative h-28 overflow-hidden">
              <img src={heroPhoto} alt="" loading="lazy" className="h-full w-full object-cover opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1c1c1e]" />
            </div>
          )}
          <div className="px-5 pt-4 pb-5 space-y-3">
            {isExpired ? (
              <div className="text-center py-2">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                  <svg className="h-6 w-6 text-white/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-[17px] font-bold text-white">This quote has expired</p>
                <p className="text-[13px] text-white/40 mt-1">
                  Please contact {businessName} for an updated quote.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[17px] font-bold text-white">Ready to get started?</p>
                    <p className="text-[12px] text-white/40 mt-0.5">Pay your deposit to lock in your date.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[26px] font-bold text-white tabular-nums">{fmt(deposit)}</p>
                    <p className="text-[11px] text-white/30">deposit</p>
                  </div>
                </div>
                <AcceptQuoteButton quoteId={quote.id} depositAmount={deposit} currentStatus={quote.status} stripeEnabled={stripeEnabled} brandColor={brandColor} />
                <p className="text-center text-[11px] text-white/25">
                  Balance of {fmt(balance)} due when the job is complete
                </p>
              </>
            )}
          </div>
        </div>

        {/* ── Download Invoice (paid quotes) ──── */}
        {quote.status === 'deposit_paid' && (
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
        )}

        {/* ── Footer ───────────────────────────── */}
        <div className="space-y-2 px-1 pt-1" data-no-print>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {profile?.logo_url && (
                <img src={profile.logo_url} alt="" className="h-5 w-5 rounded-md object-contain" />
              )}
              <p className="text-[12px] text-gray-400">{businessName}</p>
            </div>
            <p className="text-[11px] text-gray-300">Powered by SnapQuote</p>
          </div>
          <div className="text-center pb-1">
            <a href="/quotes/lookup" className="text-[12px] font-medium" style={{ color: brandColor }}>
              View all your quotes
            </a>
          </div>
        </div>

      </main>
    </div>
    </PageTransition>
  );
}
