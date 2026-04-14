'use client';

import Link from 'next/link';
import AnimatedNumber from '@/components/AnimatedNumber';

interface DashboardStatsProps {
  monthlyRevenue: number;
  quotesSentCount: number;
  approvalRate: number;
  pendingValue: number;
  pendingCount: number;
  revenueTrend?: number | null;
  sentTrend?: number | null;
  avgQuoteValue?: number;
  approvalTrend?: number | null;
}

function TrendBadge({ trend }: { trend: number | null | undefined }) {
  if (trend === null || trend === undefined) return null;
  const isUp = trend >= 0;
  return (
    <span
      className={`ml-2 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none transition-colors ${
        isUp
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
          : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
      }`}
    >
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        {isUp ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
        )}
      </svg>
      {Math.abs(trend)}%
    </span>
  );
}

export default function DashboardStats({
  monthlyRevenue,
  quotesSentCount,
  approvalRate,
  pendingValue,
  pendingCount,
  revenueTrend,
  sentTrend,
  avgQuoteValue = 0,
  approvalTrend,
}: DashboardStatsProps) {
  return (
    <>
      <h2 className="sr-only">Your Numbers</h2>

      {/* Hero stat: Monthly Revenue */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 shadow-lg shadow-emerald-500/10 dark:from-emerald-700 dark:to-emerald-900 dark:shadow-emerald-900/20 lg:p-7">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/60">
          Collected This Month
        </p>
        <div className="mt-1 flex items-baseline">
          <p className="text-[38px] font-extrabold leading-none tracking-tight text-white tabular-nums lg:text-[44px]">
            <AnimatedNumber value={monthlyRevenue} prefix="$" />
          </p>
          <TrendBadge trend={revenueTrend} />
        </div>
        <p className="mt-2 text-[13px] text-white/55">from payments</p>
      </div>

      {/* Secondary stats: 3-column grid */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {/* Quotes Sent */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04] transition-transform active:scale-[0.98] dark:bg-gray-900 dark:ring-white/[0.06]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">Quotes Sent</p>
          <p className="mt-2 text-[26px] font-bold leading-none text-gray-900 tabular-nums dark:text-gray-100 lg:text-[28px]">
            <AnimatedNumber value={quotesSentCount} />
          </p>
          <div className="mt-1 flex items-center">
            <p className="text-[12px] text-gray-400">this month</p>
            {sentTrend !== null && sentTrend !== undefined && (
              <span className={`ml-auto text-[11px] font-semibold ${sentTrend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                {sentTrend >= 0 ? '+' : ''}{sentTrend}%
              </span>
            )}
          </div>
        </div>

        {/* Win Rate */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04] transition-transform active:scale-[0.98] dark:bg-gray-900 dark:ring-white/[0.06]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">Win Rate</p>
          <p className="mt-2 text-[26px] font-bold leading-none text-gray-900 tabular-nums dark:text-gray-100 lg:text-[28px]">
            <AnimatedNumber value={approvalRate} suffix="%" />
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-700 ease-out"
              style={{ width: `${Math.min(approvalRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Avg Quote */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04] transition-transform active:scale-[0.98] dark:bg-gray-900 dark:ring-white/[0.06]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">Avg Job</p>
          <p className="mt-2 text-[26px] font-bold leading-none text-gray-900 tabular-nums dark:text-gray-100 lg:text-[28px]">
            <AnimatedNumber value={avgQuoteValue} prefix="$" />
          </p>
          <p className="mt-1.5 text-[12px] text-gray-400">per job</p>
        </div>
      </div>

      {/* Pending pipeline callout */}
      {pendingCount > 0 && (
        <Link
          href="/pipeline"
          prefetch
          className="mt-2.5 flex items-center justify-between rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 px-4 py-3 transition-colors hover:bg-amber-100/60 dark:hover:bg-amber-950/30 active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[16px] font-bold text-amber-900 tabular-nums dark:text-amber-200">
                <AnimatedNumber value={pendingValue} prefix="$" />
              </p>
              <p className="text-[12px] text-amber-700/70 dark:text-amber-400/60">{pendingCount} open quote{pendingCount === 1 ? '' : 's'} waiting on a yes or follow-up</p>
            </div>
          </div>
          <svg className="h-4 w-4 text-amber-400 dark:text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      )}
    </>
  );
}
