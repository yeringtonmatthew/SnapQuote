'use client';

import AnimatedNumber from '@/components/AnimatedNumber';

interface DashboardStatsProps {
  monthlyRevenue: number;
  quotesSentCount: number;
  approvalRate: number;
  pendingValue: number;
  pendingCount: number;
  revenueTrend?: number | null;
  sentTrend?: number | null;
}

function TrendBadge({ trend }: { trend: number | null | undefined }) {
  if (trend === null || trend === undefined) return null;
  return (
    <span
      className={`ml-1.5 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
        trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
      }`}
    >
      {trend >= 0 ? '\u2191' : '\u2193'} {Math.abs(trend)}%
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
}: DashboardStatsProps) {
  return (
    <>
      <h2 className="sr-only">Dashboard Statistics</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] card-interactive">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">This Month</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
            <AnimatedNumber value={monthlyRevenue} prefix="$" />
            <TrendBadge trend={revenueTrend} />
          </p>
          <p className="text-[12px] text-gray-500 mt-0.5">deposits collected</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] card-interactive">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Quotes Sent</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
            <AnimatedNumber value={quotesSentCount} />
            <TrendBadge trend={sentTrend} />
          </p>
          <p className="text-[12px] text-gray-500 mt-0.5">this month</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] card-interactive">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Approval Rate</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
            <AnimatedNumber value={approvalRate} suffix="%" />
          </p>
          <p className="text-[12px] text-gray-500 mt-0.5">all time</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] card-interactive">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Pending</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
            <AnimatedNumber value={pendingValue} prefix="$" />
          </p>
          <p className="text-[12px] text-gray-500 mt-0.5">{pendingCount} open quotes</p>
        </div>
      </div>
    </>
  );
}
