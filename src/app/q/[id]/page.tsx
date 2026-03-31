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
    .select('business_name, full_name, email, trade_type, logo_url, stripe_account_id, brand_color, phone')
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

  // Calculate days remaining for urgency
  const daysRemaining = expiresAt
    ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  // Count critical/moderate findings for urgency
  const criticalCount = inspectionFindings.filter(f => f.severity === 'critical').length;
  const moderateCount = inspectionFindings.filter(f => f.severity === 'moderate').length;
  const totalIssueCount = inspectionFindings.length;

  const tradeLabel = profile?.trade_type || 'Licensed Contractor';
  const contractorPhone = (profile as any)?.phone || null;

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
    <div className="force-light min-h-dvh bg-[#f7f7f8]">
      <ViewTracker quoteId={quote.id} />

      {/* ── Hero — #1 premium visual weight ────────── */}
      <div className="relative overflow-hidden" style={{ height: '62vh', minHeight: 340 }}>
        {heroPhoto ? (
          <img
            src={heroPhoto}
            alt={`Job site photo for quote from ${businessName}`}
            loading="eager"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f10] to-[#1a2332]" />
        )}

        {/* Richer gradient overlay — deeper, more cinematic */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/5" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />

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

        {/* Hero content — #1 stronger hierarchy */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8">
          <p className="text-[13px] font-semibold uppercase tracking-widest mb-2 opacity-90" style={{ color: brandColor }}>
            Prepared for {quote.customer_name}
          </p>
          <h1 className="text-[32px] font-extrabold tracking-tight text-white leading-[1.1]">
            {quote.status === 'deposit_paid'
              ? <>Your deposit has<br />been received.</>
              : quote.status === 'approved'
                ? <>Your quote has<br />been approved.</>
                : <>Your proposal is<br />ready for review.</>
            }
          </h1>
          <div className="mt-6 flex items-end gap-3">
            <div>
              <p className="text-[10px] font-semibold text-white/35 uppercase tracking-[0.2em] mb-1">Project Total</p>
              <p className="text-[48px] font-extrabold tracking-tight text-white leading-none">{fmtShort(quoteTotal)}</p>
            </div>
            <div className="mb-2 h-px flex-1 bg-white/10" />
            <div className="mb-2 text-right">
              <p className="text-[10px] font-semibold text-white/35 uppercase tracking-[0.2em] mb-1">Deposit Due</p>
              <p className="text-[24px] font-bold" style={{ color: brandColor }}>{fmtShort(deposit)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky CTA — #4 upgraded wording + #6 microcopy ── */}
      <div className="sticky top-0 z-20 px-4 py-3 bg-[#f7f7f8]/80 backdrop-blur-xl border-b border-black/5" data-no-print>
        <div className="mx-auto max-w-lg">
          {isExpired ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-gray-100 px-4 py-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[14px] font-medium text-gray-500">This quote has expired</span>
            </div>
          ) : (
            <>
              <AcceptQuoteButton quoteId={quote.id} depositAmount={deposit} currentStatus={quote.status} stripeEnabled={stripeEnabled} brandColor={brandColor} />
              {/* #6 friction-reducing microcopy */}
              <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Secure
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  No hidden fees
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  Receipt emailed
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  We&apos;ll schedule
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Urgency Banner — stronger ──────────────── */}
      {expiresAt && !isExpired && (
        <div className="mx-auto max-w-lg px-4 pt-4">
          <div className="rounded-2xl bg-amber-50 border border-amber-200/80 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-amber-900">
                  {daysRemaining !== null && daysRemaining <= 7
                    ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`
                    : `Valid until ${expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                  }
                </p>
                <p className="text-[12px] text-amber-700/70 mt-0.5">
                  {criticalCount > 0
                    ? 'Delaying repairs may lead to additional damage and higher costs.'
                    : 'Pricing and availability are reserved until the expiration date.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-lg px-4 pt-5 pb-12 space-y-4">

        {/* ── Your Contractor — premium card ──────── */}
        <div className="rounded-2xl bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.04]">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Your Contractor</p>
          <div className="flex items-start gap-4">
            {profile?.logo_url ? (
              <img
                src={profile.logo_url}
                alt={businessName}
                className="h-14 w-14 rounded-xl object-contain bg-gray-50"
              />
            ) : (
              <div
                className="flex h-14 w-14 items-center justify-center rounded-xl"
                style={{ backgroundColor: brandColor }}
              >
                <span className="text-base font-bold text-white">{businessName.slice(0, 2).toUpperCase()}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[17px] font-bold text-gray-900 tracking-tight">{businessName}</p>
              <p className="text-[13px] text-gray-500 mt-0.5">{tradeLabel}</p>
              {/* Trust badges */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-700">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                  Verified
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  Licensed &amp; Insured
                </span>
              </div>
            </div>
          </div>
          {/* Contact row */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-x-5 gap-y-1.5">
            {profile?.email && (
              <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: brandColor }}>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                {profile.email}
              </a>
            )}
            {contractorPhone && (
              <a href={`tel:${contractorPhone}`} className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: brandColor }}>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                {contractorPhone}
              </a>
            )}
          </div>
          {/* #5 Social proof / local legitimacy */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-[12px] text-gray-400 text-center">
              Trusted by homeowners for professional, reliable workmanship
            </p>
          </div>
        </div>

        {/* ── Why This Work Is Needed ────────────── */}
        {inspectionFindings.length > 0 && (criticalCount > 0 || moderateCount > 0) && (
          <div className="rounded-2xl bg-gradient-to-br from-red-50 to-amber-50/50 border border-red-100/80 px-5 py-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <p className="text-[16px] font-bold text-gray-900 tracking-tight">Why This Work Is Needed</p>
                <p className="text-[14px] text-gray-600 mt-1.5 leading-relaxed">
                  Our on-site inspection identified{' '}
                  {criticalCount > 0 && (
                    <span className="font-semibold text-red-700">{criticalCount} critical issue{criticalCount !== 1 ? 's' : ''}</span>
                  )}
                  {criticalCount > 0 && moderateCount > 0 && ' and '}
                  {moderateCount > 0 && (
                    <span className="font-semibold text-amber-700">{moderateCount} moderate issue{moderateCount !== 1 ? 's' : ''}</span>
                  )}
                  {' '}that require professional attention. Addressing these now prevents further damage and protects your home&apos;s value.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Property Inspection Report — #2 upgraded moat ── */}
        {inspectionFindings.length > 0 && photos.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">Inspection Report</p>
              </div>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                {totalIssueCount} finding{totalIssueCount !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-3">
              {photos.map((photoUrl, photoIdx) => {
                const findings = inspectionFindings.filter(f => f.photo_index === photoIdx);
                if (findings.length === 0) return null;
                return (
                  <div key={photoIdx} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04] overflow-hidden">
                    {/* Photo with improved overlay — #2 */}
                    <div className="relative">
                      <img
                        src={photoUrl}
                        alt={`Inspection photo ${photoIdx + 1}`}
                        loading="lazy"
                        className="w-full h-60 object-cover"
                      />
                      {/* Subtle bottom fade for badge legibility */}
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-white">
                          Photo {photoIdx + 1} of {photos.length}
                        </span>
                      </div>
                      {/* Issue count badge on photo — #2 stronger callouts */}
                      <div className="absolute bottom-3 left-3 flex gap-1.5">
                        {findings.map((f, fIdx) => {
                          const badgeColor = f.severity === 'critical' ? 'bg-red-500' : f.severity === 'moderate' ? 'bg-amber-500' : 'bg-blue-500';
                          return (
                            <span key={fIdx} className={`flex h-7 w-7 items-center justify-center rounded-full ${badgeColor} text-[12px] font-bold text-white shadow-lg ring-2 ring-white/30`}>
                              {fIdx + 1}
                            </span>
                          );
                        })}
                      </div>
                      {/* Severity summary pill on photo */}
                      {findings.some(f => f.severity === 'critical') && (
                        <div className="absolute top-3 right-3">
                          <span className="rounded-full bg-red-500/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                            Needs Attention
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Findings list — #2 improved hierarchy */}
                    <div className="px-5 py-4 space-y-2.5">
                      {findings.map((f, fIdx) => {
                        const severityStyles = {
                          critical: { bg: 'bg-red-50', border: 'border-red-200/80', text: 'text-red-800', badge: 'bg-red-100 text-red-700', badgeColor: 'bg-red-500', label: 'Critical' },
                          moderate: { bg: 'bg-amber-50', border: 'border-amber-200/80', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-700', badgeColor: 'bg-amber-500', label: 'Moderate' },
                          minor: { bg: 'bg-blue-50', border: 'border-blue-200/80', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-700', badgeColor: 'bg-blue-500', label: 'Minor' },
                        };
                        const style = severityStyles[f.severity as keyof typeof severityStyles] || severityStyles.moderate;
                        return (
                          <div key={fIdx} className={`rounded-xl ${style.bg} border ${style.border} px-4 py-3.5`}>
                            <div className="flex items-start gap-2.5">
                              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${style.badgeColor} text-[11px] font-bold text-white mt-0.5`}>
                                {fIdx + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.badge}`}>
                                    {style.label}
                                  </span>
                                </div>
                                <p className={`text-[15px] font-semibold ${style.text} leading-snug tracking-tight`}>
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

              {/* #3 Fear-of-inaction line — after inspection findings */}
              {(criticalCount > 0 || moderateCount > 0) && (
                <div className="flex items-center gap-2.5 px-2 py-1">
                  <div className="h-px flex-1 bg-gray-200" />
                  <p className="text-[12px] text-gray-400 italic shrink-0">
                    Unresolved issues may worsen over time, leading to more costly repairs.
                  </p>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>
              )}

              {/* Photos with no findings */}
              {photos.some((_, i) => !inspectionFindings.some(f => f.photo_index === i)) && (
                <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/[0.04]">
                  <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Additional Photos</p>
                  <div className="flex gap-2.5 overflow-x-auto scrollbar-none -mx-1 px-1 pb-1">
                    {photos.map((url, i) => {
                      if (inspectionFindings.some(f => f.photo_index === i)) return null;
                      return (
                        <img
                          key={i}
                          src={url}
                          alt={`Job site photo ${i + 1}`}
                          loading="lazy"
                          className="h-28 w-40 shrink-0 rounded-xl object-cover bg-gray-100"
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : photos.length > 1 ? (
          <div>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-gray-500 px-1">Job Site Photos</p>
            <CustomerPhotoGallery photos={photos} businessName={businessName} />
          </div>
        ) : null}

        {/* ── Scope ────────────────────────────── */}
        {(quote.scope_of_work || quote.ai_description) && (
          <div className="rounded-2xl bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.04]">
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Scope of Work</p>
            <p className="text-[15px] leading-[1.7] text-gray-700">
              {quote.scope_of_work || quote.ai_description}
            </p>
          </div>
        )}

        {/* ── Job Address ────────────────────────── */}
        {quote.job_address && (
          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/[0.04]">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Job Location</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(quote.job_address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[15px] font-medium hover:opacity-80 transition-opacity"
              style={{ color: brandColor }}
            >
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {quote.job_address}
            </a>
          </div>
        )}

        {/* ── Why Homeowners Choose Us — #5 ──────── */}
        <div className="rounded-2xl bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.04]">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Why Homeowners Choose Us</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: brandColor + '12' }}>
                <svg className="h-4.5 w-4.5" style={{ color: brandColor }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-gray-900">Quality Work</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">Premium materials &amp; expert craftsmanship</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: brandColor + '12' }}>
                <svg className="h-4.5 w-4.5" style={{ color: brandColor }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-gray-900">Fully Insured</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">Your property is protected</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: brandColor + '12' }}>
                <svg className="h-4.5 w-4.5" style={{ color: brandColor }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-gray-900">On-Time Arrival</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">We show up when we say we will</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: brandColor + '12' }}>
                <svg className="h-4.5 w-4.5" style={{ color: brandColor }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-gray-900">Clear Pricing</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">No surprises or hidden charges</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Line Items — #1 premium framing ────── */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Your Investment</p>
              <p className="text-[12px] text-gray-400 mt-0.5">
                Itemized pricing — no markups, no surprises
              </p>
            </div>
            <span className="text-[11px] font-medium text-gray-400">{quote.line_items.length} item{quote.line_items.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
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
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
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
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <span className="text-[15px] font-bold text-gray-900">Project Total</span>
            <span className="text-[17px] font-extrabold text-gray-900 tabular-nums">{fmt(quoteTotal)}</span>
          </div>
          {/* Deposit with justification */}
          <div className="px-5 py-5 border-b border-gray-100" style={{ backgroundColor: brandColor + '0a' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[15px] font-bold" style={{ color: brandColor }}>Deposit to Book ({quote.deposit_percent}%)</p>
                <p className="text-[12px] mt-0.5 opacity-60" style={{ color: brandColor }}>Reserves your project date &amp; materials</p>
              </div>
              <span className="text-[26px] font-extrabold tabular-nums" style={{ color: brandColor }}>{fmt(deposit)}</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
              Your deposit locks in today&apos;s pricing and secures your spot on our schedule. The remaining balance of {fmt(balance)} is due only when the work is complete and you&apos;re satisfied.
            </p>
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

        {/* ── What Happens Next ──────────────────── */}
        <div className="rounded-2xl bg-white px-5 py-6 shadow-sm ring-1 ring-black/[0.04]">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-widest text-gray-400">What Happens Next</p>
          <div className="space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white" style={{backgroundColor: brandColor}}>1</div>
              <div>
                <p className="text-[15px] font-semibold text-gray-900">Approve &amp; Secure Your Date</p>
                <p className="text-[13px] text-gray-500 mt-0.5 leading-relaxed">Your {quote.deposit_percent}% deposit locks in today&apos;s pricing and reserves your project on our calendar.</p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white" style={{backgroundColor: brandColor}}>2</div>
              <div>
                <p className="text-[15px] font-semibold text-gray-900">We Handle the Details</p>
                <p className="text-[13px] text-gray-500 mt-0.5 leading-relaxed">Materials ordered, logistics coordinated, and a start date confirmed around your schedule.</p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white" style={{backgroundColor: brandColor}}>3</div>
              <div>
                <p className="text-[15px] font-semibold text-gray-900">Work Completed to Your Satisfaction</p>
                <p className="text-[13px] text-gray-500 mt-0.5 leading-relaxed">Our team arrives on schedule. Remaining balance is due only when you&apos;re 100% satisfied.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Terms (Collapsible) ────────────────── */}
        {quote.notes && (
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04] overflow-hidden">
            <details>
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-colors">
                <span>Terms &amp; Conditions</span>
                <svg className="h-4 w-4 text-gray-300 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="border-t border-gray-100 px-5 py-4">
                <p className="text-[13px] leading-relaxed text-gray-500 whitespace-pre-line">{quote.notes}</p>
              </div>
            </details>
          </div>
        )}

        {/* ── Bottom CTA — #1 premium, #4 upgraded wording ── */}
        <div className="overflow-hidden rounded-2xl bg-[#111113] shadow-xl ring-1 ring-white/[0.06]" data-no-print>
          {heroPhoto && (
            <div className="relative h-32 overflow-hidden">
              <img src={heroPhoto} alt="" loading="lazy" className="h-full w-full object-cover opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-[#111113]" />
            </div>
          )}
          <div className="px-5 pt-5 pb-6 space-y-4">
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
                    <p className="text-[18px] font-bold text-white tracking-tight">Ready to move forward?</p>
                    <p className="text-[13px] text-white/40 mt-0.5">Secure your project with a deposit today.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[28px] font-extrabold text-white tabular-nums tracking-tight">{fmt(deposit)}</p>
                    <p className="text-[11px] text-white/25 uppercase tracking-widest">deposit</p>
                  </div>
                </div>
                <AcceptQuoteButton quoteId={quote.id} depositAmount={deposit} currentStatus={quote.status} stripeEnabled={stripeEnabled} brandColor={brandColor} />
                {/* #6 friction-reducing microcopy */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  <span className="flex items-center gap-1 text-[11px] text-white/25">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    Secure
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-white/25">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                    No hidden fees
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-white/25">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    Receipt emailed
                  </span>
                </div>
                <p className="text-center text-[11px] text-white/20">
                  Balance of {fmt(balance)} due when the job is complete
                </p>
              </>
            )}
          </div>
        </div>

        {/* ── Request Changes ──────────────────── */}
        {!isExpired && profile?.email && (
          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/[0.04] text-center" data-no-print>
            <p className="text-[13px] text-gray-400 mb-2.5">Have questions or need adjustments?</p>
            <a
              href={`mailto:${profile.email}?subject=Question about Quote ${quote.quote_number ? formatQuoteNumber(quote.quote_number) : ''}&body=Hi ${profile?.full_name || businessName},%0D%0A%0D%0AI have a question about the quote for ${quote.job_address || 'my project'}:%0D%0A%0D%0A`}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 px-5 py-2.5 text-[14px] font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
              Request Changes
            </a>
          </div>
        )}

        {/* ── #7 Final Reassurance Block ────────── */}
        {!isExpired && (
          <div className="rounded-2xl bg-gray-50 border border-gray-200/60 px-5 py-5 text-center" data-no-print>
            <p className="text-[15px] font-semibold text-gray-800">Still have questions?</p>
            <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
              We&apos;re here to help. Reach out anytime &mdash; no pressure, no obligation.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              {contractorPhone && (
                <a
                  href={`tel:${contractorPhone}`}
                  className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-semibold text-white transition-colors"
                  style={{ backgroundColor: brandColor }}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  Call Us
                </a>
              )}
              {profile?.email && (
                <a
                  href={`mailto:${profile.email}?subject=Question about my quote`}
                  className="inline-flex items-center gap-1.5 rounded-xl border-2 border-gray-200 px-4 py-2 text-[13px] font-semibold text-gray-600 hover:bg-white transition-colors"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  Email Us
                </a>
              )}
            </div>
          </div>
        )}

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
        <div className="space-y-2 px-1 pt-2" data-no-print>
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
