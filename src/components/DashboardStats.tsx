'use client';

import AnimatedNumber from '@/components/AnimatedNumber';

interface DashboardStatsProps {
  monthlyRevenue: number;
  quotesSentCount: number;
  approvalRate: number;
  pendingValue: number;
  pendingCount: number;
}

export default function DashboardStats({
  monthlyRevenue,
  quotesSentCount,
  approvalRate,
  pendingValue,
  pendingCount,
}: DashboardStatsProps) {
  return (
    <>
      <h2 className="sr-only">Dashboard Statistics</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-sm border border-gray-100 dark:border-gray-800 card-interactive">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">This Month</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
            <AnimatedNumber value={monthlyRevenue} prefix="$" />
          </p>
          <p className="text-[12px] text-gray-500 mt-0.5">deposits collected</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-sm border border-gray-100 dark:border-gray-800 card-interactive">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Quotes Sent</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
            <AnimatedNumber value={quotesSentCount} />
          </p>
          <p className="text-[12px] text-gray-500 mt-0.5">this month</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-sm border border-gray-100 dark:border-gray-800 card-interactive">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Approval Rate</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
            <AnimatedNumber value={approvalRate} suffix="%" />
          </p>
          <p className="text-[12px] text-gray-500 mt-0.5">all time</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-sm border border-gray-100 dark:border-gray-800 card-interactive">
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
