import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
import { AcceptQuoteButton } from '@/components/AcceptQuoteButton';
import { DownloadPdfButton } from '@/components/DownloadPdfButton';
import { PrintButton } from '@/components/PrintButton';
import { ViewTracker } from '@/components/ViewTracker';
import { formatQuoteNumber } from '@/lib/format-quote-number';
import PageTransition from '@/components/PageTransition';
import CustomerPhotoGallery from '@/components/CustomerPhotoGallery';
import { CustomerShareButton } from '@/components/CustomerShareButton';
import { createClient } from '@/lib/supabase/server';
import { QuoteEditor } from '@/components/QuoteEditor';
import { TieredQuoteView } from '@/components/TieredQuoteView';

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtShort = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const serviceClient = getServiceClient();

  const { data: quote } = await serviceClient
    .from('quotes')
    .select('total, subtotal, contractor_id, customer_name')
    .eq('id', params.id)
    .single();

  if (!quote) return {};

  const { data: profile } = await serviceClient
    .from('users')
    .select('business_name, full_name, email, business_email')
    .eq('id', quote.contractor_id)
    .single();

  const businessName = profile?.business_name
    || profile?.full_name
    || (profile?.email ? profile.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : null)
    || 'Licensed Professional';
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
  const serviceClient = getServiceClient();

  const { data: quote } = await serviceClient
    .from('quotes')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!quote) notFound();

  const { data: profile } = await serviceClient
    .from('users')
    .select('business_name, full_name, email, business_email, phone, trade_type, logo_url, stripe_account_id, brand_color, show_reviews_on_quotes, google_rating, google_review_count')
    .eq('id', quote.contractor_id)
    .single();

  // Fetch reviews if contractor has them enabled
  const showReviews = profile?.show_reviews_on_quotes !== false;
  let reviews: { customer_name: string; rating: number; comment: string | null; source: string; reviewer_photo_url: string | null; created_at: string }[] = [];
  if (showReviews) {
    const { data: reviewData } = await serviceClient
      .from('reviews')
      .select('customer_name, rating, comment, source, reviewer_photo_url, created_at')
      .eq('contractor_id', quote.contractor_id)
      .gte('rating', 4)
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5);
    reviews = reviewData || [];
  }
  // Prefer Google's overall rating and total count when available
  const googleRating = profile?.google_rating ? Number(profile.google_rating) : null;
  const googleReviewCount = profile?.google_review_count ? Number(profile.google_review_count) : null;
  const avgRating = googleRating
    ? googleRating
    : reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
  const totalReviewCount = googleReviewCount || reviews.length;

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
  const businessName = profile?.business_name
    || profile?.full_name
    || (profile?.email ? profile.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : null)
    || 'Licensed Professional';
  const stripeEnabled = !!profile?.stripe_account_id;
  const lineItems: { description: string; quantity: number; unit: string; unit_price: number; total: number }[] = quote.line_items || [];
  const quoteOptions: { name: string; description: string; line_items: { description: string; quantity: number; unit: string; unit_price: number; total: number }[]; recommended?: boolean }[] | null = quote.quote_options && Array.isArray(quote.quote_options) && quote.quote_options.length > 0 ? quote.quote_options : null;
  const hasTiers = !!quoteOptions;
  const photos: string[] = quote.photos || [];
  const inspectionFindings: { photo_index: number; finding: string; severity: string; urgency_message: string }[] = quote.inspection_findings || [];
  const heroPhoto = photos[0] || null;
  const isCancelled = quote.status === 'cancelled';
  const isExpired = quote.expires_at
    ? new Date(quote.expires_at) < new Date() && quote.status === 'sent'
    : false;
  const expiresAt = quote.expires_at ? new Date(quote.expires_at) : null;

  const daysRemaining = expiresAt
    ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  // Check if the current viewer is the contractor who owns this quote
  const authClient = createClient();
  const { data: { user } } = await authClient.auth.getUser();
  const isContractor = user?.id === quote.contractor_id;

  const criticalCount = inspectionFindings.filter(f => f.severity === 'critical').length;
  const moderateCount = inspectionFindings.filter(f => f.severity === 'moderate').length;
  const totalIssueCount = inspectionFindings.length;

  const tradeMap: Record<string, string> = {
    roofing: 'Licensed Roofing Contractor',
    plumber: 'Licensed Plumber',
    hvac: 'Licensed HVAC Contractor',
    electrician: 'Licensed Electrician',
    painter: 'Professional Painter',
    landscaper: 'Professional Landscaper',
    general: 'Licensed General Contractor',
    other: 'Licensed Contractor',
  };
  const tradeLabel = (profile?.trade_type && tradeMap[profile.trade_type]) || 'Licensed Contractor';
  const contractorPhone = profile?.phone || null;
  const contractorEmail = profile?.business_email || profile?.email || null;

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

      {/* Floating edit button for the contractor viewing their own quote */}
      {isContractor && (
        <div className="fixed bottom-6 right-6 z-50">
          <QuoteEditor quote={quote} />
        </div>
      )}

      {/* ══════════════════════════════════════════════
          HERO — Cinematic, trust-forward
          ══════════════════════════════════════════════ */}
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

        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/5" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />

        {/* Top bar — logo + actions */}
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
            {isContractor && <DownloadPdfButton quoteId={params.id} />}
            <span className="rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 text-[11px] font-semibold text-white/80 tracking-wider uppercase">
              {quote.quote_number ? `Quote ${formatQuoteNumber(quote.quote_number)}` : 'Quote'}
            </span>
          </div>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8">
          {/* Social proof badge in hero */}
          {(totalReviewCount > 0) && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3 py-1.5 mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`h-3 w-3 ${star <= Math.round(avgRating) ? 'text-amber-400' : 'text-white/20'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-[11px] font-semibold text-white/80">{avgRating.toFixed(1)} from {totalReviewCount} review{totalReviewCount !== 1 ? 's' : ''}</span>
            </div>
          )}

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
          {hasTiers && quoteOptions ? (
            <div className="mt-6">
              <p className="text-[10px] font-semibold text-white/35 uppercase tracking-[0.2em] mb-1">Starting From</p>
              <p className="text-[48px] font-extrabold tracking-tight text-white leading-none">
                {fmtShort(quoteOptions.length > 0 ? Math.min(...quoteOptions.map((o) => (o.line_items || []).reduce((s: number, i: { total: number }) => s + (Number(i.total) || 0), 0))) : 0)}
              </p>
              <p className="text-[13px] font-medium text-white/50 mt-1">{quoteOptions.length} package options available</p>
            </div>
          ) : (
            <div className="mt-6 flex items-end gap-3">
              <div>
                <p className="text-[10px] font-semibold text-white/35 uppercase tracking-[0.2em] mb-1">Project Total</p>
                <p className="text-[48px] font-extrabold tracking-tight text-white leading-none">{fmtShort(quoteTotal)}</p>
              </div>
              <div className="mb-2 h-px flex-1 bg-white/10" />
              <div className="mb-2 text-right">
                <p className="text-[10px] font-semibold text-white/35 uppercase tracking-[0.2em] mb-1">Deposit to Start</p>
                <p className="text-[24px] font-bold" style={{ color: brandColor }}>{fmtShort(deposit)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          STICKY CTA — Only for non-tiered quotes (tiered quotes have CTA in TieredQuoteView)
          ══════════════════════════════════════════════ */}
      {!hasTiers && (
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
                  {daysRemaining !== null && daysRemaining <= 7 && (
                    <span className="flex items-center gap-1 text-amber-500 font-medium">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {daysRemaining}d left
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-lg px-4 pt-5 pb-12 space-y-4">

        {/* ══════════════════════════════════════════════
            1. CONTRACTOR IDENTITY — Who you're working with
            ══════════════════════════════════════════════ */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04] overflow-hidden animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <div className="h-1" style={{ backgroundColor: brandColor }} />
          <div className="px-5 py-5">
            <div className="flex items-start gap-4">
              {profile?.logo_url ? (
                <img
                  src={profile.logo_url}
                  alt={businessName}
                  className="h-14 w-14 rounded-xl object-contain bg-gray-50 ring-1 ring-black/[0.04]"
                />
              ) : (
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl shadow-inner"
                  style={{ backgroundColor: brandColor }}
                >
                  <span className="text-lg font-bold text-white tracking-tight">{businessName.slice(0, 2).toUpperCase()}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[18px] font-bold text-gray-900 tracking-tight leading-tight">{businessName}</p>
                <p className="text-[13px] text-gray-500 mt-0.5">{tradeLabel}</p>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200/60 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                    <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                    Verified Professional
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200/60 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                    <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    Fully Insured
                  </span>
                  {totalReviewCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/60 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      <svg className="h-2.5 w-2.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {avgRating.toFixed(1)} Rating
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* Contact row */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-x-5 gap-y-1.5">
              {contractorPhone && (
                <a href={`tel:${contractorPhone}`} className="flex items-center gap-1.5 text-[13px] font-medium transition-opacity hover:opacity-70" style={{ color: brandColor }}>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  {contractorPhone}
                </a>
              )}
              {contractorEmail && (
                <a href={`mailto:${contractorEmail}`} className="flex items-center gap-1.5 text-[13px] font-medium transition-opacity hover:opacity-70" style={{ color: brandColor }}>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  {contractorEmail}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            2. SOCIAL PROOF — Build trust before showing price
               (Moved UP from below pricing)
            ══════════════════════════════════════════════ */}
        {(reviews.length > 0 || totalReviewCount > 0) && (
          <div className="rounded-2xl bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.04] animate-fade-up" style={{ animationDelay: '0.08s' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">What Customers Say</p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`h-3.5 w-3.5 ${star <= Math.round(avgRating) ? 'text-amber-400' : 'text-gray-200'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-gray-500">{avgRating.toFixed(1)} ({totalReviewCount})</span>
              </div>
            </div>

            <div className="space-y-3">
              {reviews.slice(0, 3).map((review, idx) => (
                <div key={idx} className="rounded-xl bg-gray-50 px-4 py-3.5">
                  <div className="flex items-center gap-2.5 mb-2">
                    {review.reviewer_photo_url ? (
                      <img
                        src={review.reviewer_photo_url}
                        alt=""
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-[11px] font-bold text-gray-500">
                        {review.customer_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-gray-900 truncate">{review.customer_name}</span>
                        {review.source === 'google' && (
                          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`h-3 w-3 ${star <= review.rating ? 'text-amber-400' : 'text-gray-200'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-[13px] text-gray-600 leading-relaxed line-clamp-3">&ldquo;{review.comment}&rdquo;</p>
                  )}
                </div>
              ))}
            </div>

            {/* Show remaining count if more than 3 */}
            {totalReviewCount > 3 && (
              <p className="text-center text-[12px] text-gray-400 mt-3">
                + {totalReviewCount - Math.min(reviews.length, 3)} more happy customer{(totalReviewCount - Math.min(reviews.length, 3)) !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            3. URGENCY BANNER — Time pressure near top
            ══════════════════════════════════════════════ */}
        {expiresAt && !isExpired && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200/80 px-5 py-3.5 animate-fade-up" style={{ animationDelay: '0.1s' }}>
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
        )}

        {/* ══════════════════════════════════════════════
            4. WHY THIS WORK IS NEEDED — Professional Assessment
            ══════════════════════════════════════════════ */}
        {inspectionFindings.length > 0 && (criticalCount > 0 || moderateCount > 0) && (
          <div className="rounded-2xl bg-gradient-to-br from-red-50 to-amber-50/50 border border-red-100/80 px-5 py-5 shadow-sm animate-fade-up" style={{ animationDelay: '0.12s' }}>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <p className="text-[16px] font-bold text-gray-900 tracking-tight">Professional Assessment</p>
                <p className="text-[14px] text-gray-600 mt-1.5 leading-relaxed">
                  Our certified inspection identified{' '}
                  {criticalCount > 0 && (
                    <span className="font-semibold text-red-700">{criticalCount} critical issue{criticalCount !== 1 ? 's' : ''}</span>
                  )}
                  {criticalCount > 0 && moderateCount > 0 && ' and '}
                  {moderateCount > 0 && (
                    <span className="font-semibold text-amber-700">{moderateCount} area{moderateCount !== 1 ? 's' : ''} requiring attention</span>
                  )}
                  . Early intervention protects your property value and prevents escalating repair costs.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            5. INSPECTION REPORT — Photo evidence + findings
            ══════════════════════════════════════════════ */}
        {inspectionFindings.length > 0 ? (
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
              {photos.length > 0 ? photos.map((photoUrl, photoIdx) => {
                const findings = inspectionFindings.filter(f => f.photo_index === photoIdx);
                if (findings.length === 0) return null;
                return (
                  <div key={photoIdx} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04] overflow-hidden">
                    <div className="relative">
                      <img
                        src={photoUrl}
                        alt={`Inspection photo ${photoIdx + 1}`}
                        loading="lazy"
                        className="w-full h-60 object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="rounded-full bg-black/50 backdrop-blur-md px-2.5 py-1 text-[10px] font-medium text-white/90 tabular-nums">
                          {photoIdx + 1} / {photos.length}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 flex gap-1">
                        {findings.length === 1 ? (
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm ${
                            findings[0].severity === 'critical' ? 'bg-red-500/90' : findings[0].severity === 'moderate' ? 'bg-amber-500/90' : 'bg-blue-500/90'
                          }`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                            {findings[0].severity === 'critical' ? 'Critical' : findings[0].severity === 'moderate' ? 'Moderate' : 'Minor'}
                          </span>
                        ) : (
                          findings.map((f, fIdx) => {
                            const badgeColor = f.severity === 'critical' ? 'bg-red-500/90' : f.severity === 'moderate' ? 'bg-amber-500/90' : 'bg-blue-500/90';
                            return (
                              <span key={fIdx} className={`flex h-5.5 w-5.5 items-center justify-center rounded-full ${badgeColor} text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm`} style={{ height: 22, width: 22 }}>
                                {fIdx + 1}
                              </span>
                            );
                          })
                        )}
                      </div>
                      {findings.some(f => f.severity === 'critical') && findings.length > 1 && (
                        <div className="absolute top-3 right-3">
                          <span className="rounded-full bg-red-500/85 backdrop-blur-sm px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">
                            Action Required
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="px-5 py-4 space-y-2.5">
                      {findings.map((f, fIdx) => {
                        const severityStyles = {
                          critical: { bg: 'bg-red-50/60', border: 'border-red-100', text: 'text-red-900', badge: 'text-red-600', dot: 'bg-red-500', label: 'Critical', labelBg: 'bg-red-100' },
                          moderate: { bg: 'bg-amber-50/60', border: 'border-amber-100', text: 'text-amber-900', badge: 'text-amber-600', dot: 'bg-amber-500', label: 'Moderate', labelBg: 'bg-amber-100' },
                          minor: { bg: 'bg-blue-50/60', border: 'border-blue-100', text: 'text-blue-900', badge: 'text-blue-600', dot: 'bg-blue-500', label: 'Minor', labelBg: 'bg-blue-100' },
                        };
                        const style = severityStyles[f.severity as keyof typeof severityStyles] || severityStyles.moderate;
                        return (
                          <div key={fIdx} className={`rounded-xl ${style.bg} border ${style.border} px-4 py-3.5 animate-fade-up`} style={{ animationDelay: `${0.15 + fIdx * 0.05}s` }}>
                            <div className="flex items-start gap-3">
                              <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
                                <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                                {findings.length > 1 && (
                                  <span className={`text-[10px] font-semibold ${style.badge}`}>{fIdx + 1}</span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1 space-y-2">
                                <div>
                                  <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider ${style.badge} ${style.labelBg} rounded px-1.5 py-0.5 mb-1`}>
                                    {style.label}
                                  </span>
                                  <p className={`text-[14px] font-semibold ${style.text} leading-snug`}>
                                    {f.finding}
                                  </p>
                                </div>
                                {f.urgency_message && (
                                  <div className="border-t border-black/[0.04] pt-2 space-y-1.5">
                                    <div className="flex items-start gap-2">
                                      <svg className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                      </svg>
                                      <p className="text-[12px] text-gray-500 leading-relaxed">
                                        <span className="font-medium text-gray-600">If left unaddressed:</span> {f.urgency_message}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }) : (
                inspectionFindings.map((f, fIdx) => {
                  const severityStyles = {
                    critical: { bg: 'bg-red-50/60', border: 'border-red-100', text: 'text-red-900', dot: 'bg-red-500', label: 'Critical', labelBg: 'bg-red-100' },
                    moderate: { bg: 'bg-amber-50/60', border: 'border-amber-100', text: 'text-amber-900', dot: 'bg-amber-500', label: 'Moderate', labelBg: 'bg-amber-100' },
                    minor: { bg: 'bg-blue-50/60', border: 'border-blue-100', text: 'text-blue-900', dot: 'bg-blue-500', label: 'Minor', labelBg: 'bg-blue-100' },
                  };
                  const style = severityStyles[f.severity as keyof typeof severityStyles] || severityStyles.moderate;
                  return (
                    <div key={fIdx} className={`rounded-xl ${style.bg} border ${style.border} px-4 py-3.5 animate-fade-up`} style={{ animationDelay: `${0.15 + fIdx * 0.05}s` }}>
                      <div className="flex items-start gap-3">
                        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
                        <div>
                          <span className={`inline-block rounded-full ${style.labelBg} px-2 py-0.5 text-[10px] font-semibold ${style.text} mb-1`}>{style.label}</span>
                          <p className={`text-[14px] font-medium ${style.text} leading-snug`}>{f.finding}</p>
                          {f.urgency_message && (
                            <p className="mt-1.5 text-[12px] text-gray-500 leading-snug">{f.urgency_message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {(criticalCount > 0 || moderateCount > 0) && (
                <div className="flex items-center gap-2.5 px-2 py-1">
                  <div className="h-px flex-1 bg-gray-200" />
                  <p className="text-[12px] text-gray-400 italic shrink-0">
                    Unresolved issues may worsen over time, leading to more costly repairs.
                  </p>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>
              )}

              {/* Orphaned findings */}
              {photos.length > 0 && inspectionFindings.filter(f => f.photo_index >= photos.length).map((f, fIdx) => {
                const severityStyles = {
                  critical: { bg: 'bg-red-50/60', border: 'border-red-100', text: 'text-red-900', dot: 'bg-red-500', label: 'Critical', labelBg: 'bg-red-100' },
                  moderate: { bg: 'bg-amber-50/60', border: 'border-amber-100', text: 'text-amber-900', dot: 'bg-amber-500', label: 'Moderate', labelBg: 'bg-amber-100' },
                  minor: { bg: 'bg-blue-50/60', border: 'border-blue-100', text: 'text-blue-900', dot: 'bg-blue-500', label: 'Minor', labelBg: 'bg-blue-100' },
                };
                const style = severityStyles[f.severity as keyof typeof severityStyles] || severityStyles.moderate;
                return (
                  <div key={`orphan-${fIdx}`} className={`rounded-xl ${style.bg} border ${style.border} px-4 py-3.5`}>
                    <div className="flex items-start gap-3">
                      <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
                      <div>
                        <span className={`inline-block rounded-full ${style.labelBg} px-2 py-0.5 text-[10px] font-semibold ${style.text} mb-1`}>{style.label}</span>
                        <p className={`text-[14px] font-medium ${style.text} leading-snug`}>{f.finding}</p>
                        {f.urgency_message && <p className="mt-1.5 text-[12px] text-gray-500 leading-snug">{f.urgency_message}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Photos with no findings */}
              {photos.length > 0 && photos.some((_, i) => !inspectionFindings.some(f => f.photo_index === i)) && (
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

        {/* ══════════════════════════════════════════════
            6. SCOPE OF WORK
            ══════════════════════════════════════════════ */}
        {(quote.scope_of_work || quote.ai_description) && (
          <div className="rounded-2xl bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.04] animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Scope of Work</p>
            <p className="text-[15px] leading-[1.7] text-gray-700">
              {quote.scope_of_work || quote.ai_description}
            </p>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            7. JOB LOCATION
            ══════════════════════════════════════════════ */}
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

        {/* ══════════════════════════════════════════════
            TIERED QUOTE — Good / Better / Best selector
            ══════════════════════════════════════════════ */}
        {hasTiers && (
          <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <TieredQuoteView
              quoteId={quote.id}
              options={quoteOptions || []}
              taxRate={quote.tax_rate != null ? Number(quote.tax_rate) : null}
              discountAmount={quote.discount_amount != null ? Number(quote.discount_amount) : null}
              discountPercent={quote.discount_percent != null ? Number(quote.discount_percent) : null}
              depositPercent={quote.deposit_percent ?? 33}
              currentStatus={quote.status}
              stripeEnabled={stripeEnabled}
              brandColor={brandColor}
              isExpired={isExpired}
            />
          </div>
        )}

        {/* ══════════════════════════════════════════════
            8. YOUR INVESTMENT — Line items (non-tiered only)
            ══════════════════════════════════════════════ */}
        {!hasTiers && <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-3 px-1">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Your Investment</p>
              <p className="text-[12px] text-gray-400 mt-0.5">
                Project scope — what&apos;s included
              </p>
            </div>
            <span className="text-[11px] font-medium text-gray-400">{lineItems.length} item{lineItems.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04] px-5 py-5">
            <div className="space-y-4">
              {lineItems.map((item, i: number) => (
                <div key={i} className="flex gap-3">
                  <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-600 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-[14px] text-gray-700 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>}

        {!hasTiers && <>
        {/* ══════════════════════════════════════════════
            9. TOTALS — With enhanced deposit reassurance
            ══════════════════════════════════════════════ */}
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
          {/* Deposit with enhanced reassurance */}
          {deposit > 0 && (
            <>
              <div className="px-5 py-5 border-b border-gray-100" style={{ backgroundColor: brandColor + '0a' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[15px] font-bold" style={{ color: brandColor }}>Deposit to Get Started ({quote.deposit_percent ?? 0}%)</p>
                    <p className="text-[12px] mt-0.5 opacity-60" style={{ color: brandColor }}>Reserves your spot &amp; locks in this price</p>
                  </div>
                  <span className="text-[26px] font-extrabold tabular-nums" style={{ color: brandColor }}>{fmt(deposit)}</span>
                </div>
                {/* Risk-free reassurance */}
                <div className="mt-4 rounded-xl bg-white/80 border border-black/[0.04] px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    <p className="text-[12px] text-gray-600">
                      <span className="font-semibold text-gray-800">Locks in today&apos;s pricing</span> — protected from any future increases
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    <p className="text-[12px] text-gray-600">
                      <span className="font-semibold text-gray-800">Secures your project date</span> — we reserve your slot on our calendar
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                    </svg>
                    <p className="text-[12px] text-gray-600">
                      <span className="font-semibold text-gray-800">Balance of {fmt(balance)} due on completion</span> — only when you&apos;re satisfied
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5">
                <span className="text-[13px] text-gray-400">Balance due on completion</span>
                <span className="text-[14px] font-medium text-gray-500 tabular-nums">{fmt(balance)}</span>
              </div>
            </>
          )}
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
        </>}

        {/* ══════════════════════════════════════════════
            10. OUR GUARANTEE — Trust builder
            ══════════════════════════════════════════════ */}
        <div className="rounded-2xl bg-gradient-to-b from-white to-gray-50/80 px-5 py-6 shadow-sm ring-1 ring-black/[0.04] animate-fade-up" style={{ animationDelay: '0.22s' }}>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Our Guarantee</p>
          <p className="mb-5 text-[13px] text-gray-500">The {businessName} standard of service</p>
          <div className="space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: brandColor + '10' }}>
                <svg className="h-5 w-5" style={{ color: brandColor }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
              <div className="pt-0.5">
                <p className="text-[14px] font-semibold text-gray-900">Backed by Our Reputation</p>
                <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">We stand behind every project. Premium materials, expert craftsmanship, and results that last.</p>
              </div>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: brandColor + '10' }}>
                <svg className="h-5 w-5" style={{ color: brandColor }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div className="pt-0.5">
                <p className="text-[14px] font-semibold text-gray-900">Your Property Is Protected</p>
                <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">Full liability coverage and workers&apos; comp on every job. You carry zero risk.</p>
              </div>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: brandColor + '10' }}>
                <svg className="h-5 w-5" style={{ color: brandColor }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="pt-0.5">
                <p className="text-[14px] font-semibold text-gray-900">On Time, Every Time</p>
                <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">Confirmed windows, proactive updates, and crew that shows up when promised.</p>
              </div>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: brandColor + '10' }}>
                <svg className="h-5 w-5" style={{ color: brandColor }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              </div>
              <div className="pt-0.5">
                <p className="text-[14px] font-semibold text-gray-900">No Surprises, Period</p>
                <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">Every dollar itemized upfront. Balance due only when you&apos;re completely satisfied with the work.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            11. WHAT HAPPENS NEXT — 3-step process
            ══════════════════════════════════════════════ */}
        <div className="rounded-2xl bg-white px-5 py-6 shadow-sm ring-1 ring-black/[0.04] animate-fade-up" style={{ animationDelay: '0.25s' }}>
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-widest text-gray-400">What Happens Next</p>
          <div className="space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white" style={{backgroundColor: brandColor}}>1</div>
              <div>
                <p className="text-[15px] font-semibold text-gray-900">Approve &amp; Secure Your Date</p>
                <p className="text-[13px] text-gray-500 mt-0.5 leading-relaxed">
                  {deposit > 0
                    ? `Your ${quote.deposit_percent ?? 0}% deposit locks in today's pricing and reserves your project on our calendar.`
                    : "Approve this quote to lock in today's pricing and reserve your project on our calendar."}
                </p>
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

        {/* ══════════════════════════════════════════════
            12. TERMS (Collapsible)
            ══════════════════════════════════════════════ */}
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

        {/* ══════════════════════════════════════════════
            13. BOTTOM CTA — Final close with urgency
            ══════════════════════════════════════════════ */}
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
                    <p className="text-[18px] font-bold text-white tracking-tight">Ready to get started?</p>
                    <p className="text-[13px] text-white/40 mt-0.5">Secure your date, pricing, and peace of mind.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[28px] font-extrabold text-white tabular-nums tracking-tight">{fmt(deposit > 0 ? deposit : quoteTotal)}</p>
                    <p className="text-[11px] text-white/25 uppercase tracking-widest">{deposit > 0 ? 'deposit' : 'total'}</p>
                  </div>
                </div>
                <AcceptQuoteButton quoteId={quote.id} depositAmount={deposit} currentStatus={quote.status} stripeEnabled={stripeEnabled} brandColor={brandColor} />
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
                {deposit > 0 && (
                  <p className="text-center text-[11px] text-white/20">
                    Balance of {fmt(balance)} due when the job is complete
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            14. REQUEST CHANGES
            ══════════════════════════════════════════════ */}
        {!isExpired && contractorEmail && (
          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/[0.04] text-center" data-no-print>
            <p className="text-[13px] text-gray-400 mb-2.5">Have questions or need adjustments?</p>
            <a
              href={`mailto:${contractorEmail}?subject=Question about Quote ${quote.quote_number ? formatQuoteNumber(quote.quote_number) : ''}&body=Hi ${profile?.full_name || businessName},%0D%0A%0D%0AI have a question about the quote for ${quote.job_address || 'my project'}:%0D%0A%0D%0A`}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 px-5 py-2.5 text-[14px] font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all press-scale"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
              Request Changes
            </a>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            15. FINAL REASSURANCE — Zero pressure close
            ══════════════════════════════════════════════ */}
        {!isExpired && (
          <div className="rounded-2xl bg-gray-50 border border-gray-200/60 px-5 py-5 text-center" data-no-print>
            <p className="text-[15px] font-semibold text-gray-800">We&apos;re here when you&apos;re ready</p>
            <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
              Have questions? Need changes? Call or email anytime &mdash; zero pressure, zero obligation.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              {contractorPhone && (
                <a
                  href={`tel:${contractorPhone}`}
                  className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-semibold text-white transition-all hover:opacity-90 press-scale"
                  style={{ backgroundColor: brandColor }}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  Call Us
                </a>
              )}
              {contractorEmail && (
                <a
                  href={`mailto:${contractorEmail}?subject=Question about my quote`}
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

        {/* ══════════════════════════════════════════════
            16. DOWNLOAD INVOICE (paid quotes)
            ══════════════════════════════════════════════ */}
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

        {/* ══════════════════════════════════════════════
            FOOTER
            ══════════════════════════════════════════════ */}
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
