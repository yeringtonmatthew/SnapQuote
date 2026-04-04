'use client';

import Link from 'next/link';

interface RecentQuote {
  id: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
  sent_at?: string | null;
  approved_at?: string | null;
  paid_at?: string | null;
}

interface Props {
  quotes: RecentQuote[];
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  draft: {
    label: 'Draft',
    classes: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
  sent: {
    label: 'Sent',
    classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  viewed: {
    label: 'Viewed',
    classes: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  },
  approved: {
    label: 'Approved',
    classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  deposit_paid: {
    label: 'Paid',
    classes: 'bg-emerald-600 text-white dark:bg-emerald-500',
  },
  declined: {
    label: 'Declined',
    classes: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
  expired: {
    label: 'Expired',
    classes: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
  },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

const fmtMoney = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function RecentActivity({ quotes }: Props) {
  if (quotes.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {quotes.map((q) => {
        const config = statusConfig[q.status] || statusConfig.draft;
        const latestDate = q.paid_at || q.approved_at || q.sent_at || q.created_at;

        return (
          <Link
            key={q.id}
            href={`/jobs/${q.id}`}
            className="flex items-center gap-3 rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] px-4 py-3 active:bg-gray-50 dark:active:bg-gray-800 transition-all min-h-[56px]"
          >
            {/* Left: avatar circle with initial */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <span className="text-[13px] font-bold text-gray-500 dark:text-gray-400">
                {q.customer_name.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Middle: name + time */}
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100 truncate leading-tight">
                {q.customer_name}
              </p>
              <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">
                {timeAgo(latestDate)}
              </p>
            </div>

            {/* Right: amount + status pill */}
            <div className="shrink-0 flex flex-col items-end gap-1">
              <p className="text-[14px] font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                {fmtMoney(q.total)}
              </p>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none ${config.classes}`}>
                {config.label}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
