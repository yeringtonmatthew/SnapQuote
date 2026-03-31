import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StarRating } from './StarRating';
import EmptyState from '@/components/EmptyState';
import type { Metadata } from 'next';

const tradeLabels: Record<string, string> = {
  plumber: 'Plumber',
  hvac: 'HVAC Specialist',
  electrician: 'Electrician',
  general: 'General Contractor',
  other: 'Contractor',
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const { data: contractor } = await supabase
    .from('users')
    .select('business_name, trade_type, profile_bio')
    .eq('profile_slug', params.slug)
    .eq('profile_public', true)
    .single();

  if (!contractor) return { title: 'Profile Not Found' };

  const name = contractor.business_name || 'Contractor';
  const trade = tradeLabels[contractor.trade_type || 'other'] || 'Contractor';

  return {
    title: `${name} - ${trade} | SnapQuote`,
    description: contractor.profile_bio || `Request a quote from ${name}, a trusted ${trade.toLowerCase()}.`,
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: contractor } = await supabase
    .from('users')
    .select('id, business_name, full_name, trade_type, logo_url, profile_bio, email')
    .eq('profile_slug', params.slug)
    .eq('profile_public', true)
    .single();

  if (!contractor) notFound();

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('contractor_id', contractor.id)
    .order('created_at', { ascending: false })
    .limit(20);

  const businessName = contractor.business_name || contractor.full_name || 'Contractor';
  const trade = tradeLabels[contractor.trade_type || 'other'] || 'Contractor';
  const reviewList = reviews || [];
  const avgRating =
    reviewList.length > 0
      ? Math.round((reviewList.reduce((sum, r) => sum + r.rating, 0) / reviewList.length) * 10) / 10
      : 0;

  return (
    <div className="min-h-dvh bg-[#f2f2f7]">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1c1c1e] to-[#2c3e50]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500" />
          <div className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-brand-400" />
        </div>

        <div className="relative mx-auto max-w-lg px-5 pb-8 pt-14">
          <div className="flex items-start gap-4">
            {contractor.logo_url ? (
              <img
                src={contractor.logo_url}
                alt={businessName}
                className="h-20 w-20 shrink-0 rounded-2xl bg-white/10 object-contain p-2 backdrop-blur-sm"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <span className="text-2xl font-bold text-white">
                  {businessName.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0 pt-1">
              <h1 className="text-[24px] font-bold text-white leading-tight truncate">
                {businessName}
              </h1>
              <p className="mt-1 text-[14px] font-medium text-brand-300">{trade}</p>
              {reviewList.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <StarRating rating={avgRating} size="sm" />
                  <span className="text-[13px] font-semibold text-white/80">{avgRating}</span>
                  <span className="text-[12px] text-white/40">
                    ({reviewList.length} review{reviewList.length !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
            </div>
          </div>

          {contractor.profile_bio && (
            <p className="mt-5 text-[14px] leading-relaxed text-white/70">
              {contractor.profile_bio}
            </p>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="sticky top-0 z-20 bg-[#f2f2f7]/80 px-4 py-3 backdrop-blur-xl border-b border-black/5">
        <div className="mx-auto max-w-lg">
          <a
            href={`mailto:${contractor.email}?subject=Quote Request from SnapQuote`}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            Request a Quote
          </a>
        </div>
      </div>

      <main className="mx-auto max-w-lg px-4 pt-5 pb-12 space-y-4">
        {/* Reviews section */}
        {reviewList.length > 0 ? (
          <div>
            <div className="flex items-center justify-between px-1 mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                Customer Reviews
              </p>
              <div className="flex items-center gap-1.5">
                <StarRating rating={avgRating} size="xs" />
                <span className="text-[12px] font-semibold text-gray-600">{avgRating} avg</span>
              </div>
            </div>

            <div className="space-y-3">
              {reviewList.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl bg-white px-5 py-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                        <span className="text-[12px] font-bold text-gray-500">
                          {review.customer_name
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-gray-900">
                          {review.customer_name}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {new Date(review.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} size="xs" />
                  </div>
                  {review.comment && (
                    <p className="mt-3 text-[14px] leading-relaxed text-gray-600">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-white shadow-sm">
            <EmptyState
              icon={
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              }
              title="No reviews yet"
              description="Reviews from customers will appear here."
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-1 pt-2">
          <p className="text-[12px] text-gray-400">{businessName}</p>
          <p className="text-[11px] text-gray-300">Powered by SnapQuote</p>
        </div>
      </main>
    </div>
  );
}
