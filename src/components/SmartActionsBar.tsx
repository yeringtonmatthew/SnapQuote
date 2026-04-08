'use client';

import Link from 'next/link';

interface ActionItem {
  label: string;
  count: number;
  value?: number;
  href: string;
  color: 'amber' | 'emerald' | 'blue' | 'orange' | 'red';
  icon: React.ReactNode;
}

interface Props {
  awaitingCount: number;
  depositsCount: number;
  collectableAmount: number;
  todayJobsCount: number;
  followUpCount: number;
  jobsToScheduleCount: number;
}

const fmtMoney = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function SmartActionsBar({
  awaitingCount,
  depositsCount,
  collectableAmount,
  todayJobsCount,
  followUpCount,
  jobsToScheduleCount,
}: Props) {
  const items: ActionItem[] = [];

  if (followUpCount > 0) {
    items.push({
      label: `${followUpCount} need${followUpCount === 1 ? 's' : ''} follow-up`,
      count: followUpCount,
      href: '/pipeline?stage=quote_sent',
      color: 'orange',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      ),
    });
  }

  if (depositsCount > 0) {
    items.push({
      label: `${depositsCount} deposit${depositsCount === 1 ? '' : 's'} pending`,
      count: depositsCount,
      href: '/pipeline?stage=deposit_collected',
      color: 'emerald',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
      ),
    });
  }

  if (collectableAmount > 0) {
    items.push({
      label: `${fmtMoney(collectableAmount)} to collect`,
      count: 0,
      value: collectableAmount,
      href: '/pipeline?stage=deposit_collected',
      color: 'emerald',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    });
  }

  if (awaitingCount > 0) {
    items.push({
      label: `${awaitingCount} awaiting reply`,
      count: awaitingCount,
      href: '/pipeline?stage=quote_sent',
      color: 'amber',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    });
  }

  if (todayJobsCount > 0) {
    items.push({
      label: `${todayJobsCount} job${todayJobsCount === 1 ? '' : 's'} today`,
      count: todayJobsCount,
      href: '/schedule',
      color: 'blue',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
    });
  }

  if (jobsToScheduleCount > 0) {
    items.push({
      label: `${jobsToScheduleCount} to schedule`,
      count: jobsToScheduleCount,
      href: '/schedule',
      color: 'blue',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
    });
  }

  if (items.length === 0) return null;

  const colorMap = {
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      icon: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
      text: 'text-amber-900 dark:text-amber-200',
      ring: 'ring-amber-200/40 dark:ring-amber-800/30',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      icon: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
      text: 'text-emerald-900 dark:text-emerald-200',
      ring: 'ring-emerald-200/40 dark:ring-emerald-800/30',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      icon: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
      text: 'text-blue-900 dark:text-blue-200',
      ring: 'ring-blue-200/40 dark:ring-blue-800/30',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      icon: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
      text: 'text-orange-900 dark:text-orange-200',
      ring: 'ring-orange-200/40 dark:ring-orange-800/30',
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-950/30',
      icon: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
      text: 'text-red-900 dark:text-red-200',
      ring: 'ring-red-200/40 dark:ring-red-800/30',
    },
  };

  return (
    <div className="flex flex-wrap gap-2.5 pb-1">
      {items.map((item, i) => {
        const c = colorMap[item.color];
        return (
          <Link
            key={i}
            href={item.href}
            className={`flex items-center gap-2.5 rounded-2xl ${c.bg} ring-1 ${c.ring} px-4 py-3 min-h-[52px] active:scale-[0.97] transition-all`}
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${c.icon}`}>
              {item.icon}
            </div>
            <p className={`text-[13px] font-semibold ${c.text} whitespace-nowrap`}>
              {item.label}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
