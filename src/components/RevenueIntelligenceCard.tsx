'use client';

import { useState } from 'react';
import Link from 'next/link';
import AnimatedNumber from '@/components/AnimatedNumber';

interface AtRiskQuote {
  id: string;
  name: string;
  value: number;
  daysSince: number;
}

interface Props {
  totalPipeline: number;
  atRiskRevenue: number;
  atRiskCount: number;
  atRiskQuotes: AtRiskQuote[];
  likelyToClose: number;
  likelyToCloseCount: number;
  weeklyRevenue: number;
  weeklyRevenueChange: number | null;
  monthlyProjection: number;
  closeRate: number;
  quotesNeedingAttention: number;
}

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function RevenueIntelligenceCard({
  totalPipeline,
  atRiskRevenue,
  atRiskCount,
  atRiskQuotes,
  likelyToClose,
  likelyToCloseCount,
  weeklyRevenue,
  weeklyRevenueChange,
  monthlyProjection,
  closeRate,
  quotesNeedingAttention,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-3">
      {/* ── Scoreboard Header ─────────── */}
      <div className="flex items-center gap-2 px-1">
        <svg className="h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.518l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          Money Summary
        </h2>
      </div>

      {/* ── Performance Strip ──────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 p-5 shadow-sm ring-1 ring-white/[0.06]">
        <div className="grid grid-cols-2 gap-4">
          {/* Weekly closed */}
          <div>
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">This Week</p>
            <p className="mt-1 text-[22px] font-bold text-white tabular-nums leading-none">
              <AnimatedNumber value={weeklyRevenue} prefix="$" />
            </p>
            {weeklyRevenueChange !== null && (
              <span className={`mt-1 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                weeklyRevenueChange >= 0
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {weeklyRevenueChange >= 0 ? '\u2191' : '\u2193'} {Math.abs(weeklyRevenueChange)}% vs last week
              </span>
            )}
          </div>

          {/* Monthly projection */}
          <div>
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Monthly Pace</p>
            <p className="mt-1 text-[22px] font-bold text-white tabular-nums leading-none">
              <AnimatedNumber value={monthlyProjection} prefix="$" />
            </p>
            <p className="mt-1 text-[10px] text-white/30">projected this month</p>
          </div>
        </div>

        {/* Close rate bar */}
        <div className="mt-4 pt-3 border-t border-white/[0.08]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Win Rate</span>
            <span className="text-[13px] font-bold text-white tabular-nums">{closeRate}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-700"
              style={{ width: `${Math.min(closeRate, 100)}%` }}
            />
          </div>
          {closeRate < 40 && (
            <p className="mt-1.5 text-[10px] text-white/30">Top contractors close 50%+ of quotes</p>
          )}
        </div>
      </div>

      {/* ── Opportunity Cards ────────── */}
      <div className="grid grid-cols-2 gap-2">
        {/* Pipeline value */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pipeline</p>
          <p className="mt-1 text-[18px] font-bold text-gray-900 dark:text-gray-100 tabular-nums leading-tight">
            <AnimatedNumber value={totalPipeline} prefix="$" />
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">total active value</p>
        </div>

        {/* Likely to close */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
          <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Likely to Close</p>
          <p className="mt-1 text-[18px] font-bold text-gray-900 dark:text-gray-100 tabular-nums leading-tight">
            <AnimatedNumber value={likelyToClose} prefix="$" />
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">{likelyToCloseCount} quote{likelyToCloseCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* ── At-Risk Alert ─────────────── */}
      {atRiskCount > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 p-4 text-left transition-all press-scale"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/40">
                <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-red-900 dark:text-red-300">
                  {fmt(atRiskRevenue)} at risk
                </p>
                <p className="text-[12px] text-red-600/70 dark:text-red-400/60">
                  {atRiskCount} quote{atRiskCount !== 1 ? 's' : ''} need{atRiskCount === 1 ? 's' : ''} follow-up
                </p>
              </div>
            </div>
            <svg className={`h-4 w-4 text-red-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>

          {/* Expanded: individual at-risk quotes */}
          {expanded && (
            <div className="mt-3 pt-3 border-t border-red-200/60 dark:border-red-800/40 space-y-2">
              {atRiskQuotes.slice(0, 5).map(q => (
                <Link
                  key={q.id}
                  href={`/jobs/${q.id}`}
                  onClick={e => e.stopPropagation()}
                  className="flex items-center justify-between rounded-xl bg-white dark:bg-gray-900 px-3 py-2.5 ring-1 ring-red-100 dark:ring-red-900/40 transition-colors hover:bg-red-50/50"
                >
                  <div>
                    <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">{q.name}</p>
                    <p className="text-[11px] text-gray-400">{q.daysSince} days, no response</p>
                  </div>
                  <span className="text-[13px] font-semibold text-red-600 dark:text-red-400 tabular-nums">{fmt(q.value)}</span>
                </Link>
              ))}
            </div>
          )}
        </button>
      )}

      {/* ── Attention needed ──────────── */}
      {quotesNeedingAttention > 0 && (
        <div className="flex items-center gap-2 px-2 py-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <span className="text-[10px] font-bold text-amber-600">{quotesNeedingAttention}</span>
          </span>
          <p className="text-[12px] text-gray-500 dark:text-gray-400">
            quote{quotesNeedingAttention !== 1 ? 's' : ''} need attention right now
          </p>
        </div>
      )}
    </div>
  );
}
