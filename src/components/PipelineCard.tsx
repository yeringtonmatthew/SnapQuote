'use client';

import Link from 'next/link';
import { relativeTime } from '@/lib/relative-time';

export interface PipelineCardProps {
  quote: {
    id: string;
    customer_name: string;
    customer_phone: string | null;
    job_address: string | null;
    total: number;
    status: string;
    pipeline_stage: string;
    quote_number: number | null;
    photos: string[];
    scheduled_date: string | null;
    sent_at: string | null;
    job_tasks: { id: string; text: string; done: boolean; created_at: string }[];
    created_at: string;
    paid_at: string | null;
    reminder_sent_at: string | null;
  };
  onStageChange?: (quoteId: string, stage: string) => void;
  onQuickActions?: (quoteId: string, stage: string) => void;
}

/** Deterministic pastel background from a string, for the initial avatar. */
function initialColor(name: string): string {
  const colors = [
    'bg-blue-50 text-blue-600',
    'bg-violet-50 text-violet-600',
    'bg-amber-50 text-amber-600',
    'bg-emerald-50 text-emerald-600',
    'bg-rose-50 text-rose-600',
    'bg-cyan-50 text-cyan-600',
    'bg-orange-50 text-orange-600',
    'bg-indigo-50 text-indigo-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/** Compute follow-up urgency badge for quote_sent stage. */
function getFollowUpBadge(
  stage: string,
  createdAt: string,
): { label: string; classes: string } | null {
  if (stage !== 'quote_sent') return null;
  const now = Date.now();
  const created = new Date(createdAt).getTime();
  const daysSince = (now - created) / (1000 * 60 * 60 * 24);
  if (daysSince > 7) {
    return {
      label: 'Overdue',
      classes:
        'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 ring-1 ring-red-200/60 dark:ring-red-800/40',
    };
  }
  if (daysSince > 3) {
    return {
      label: 'Follow up',
      classes:
        'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 ring-1 ring-amber-200/60 dark:ring-amber-800/40',
    };
  }
  return null;
}

/** Determine the most recent activity timestamp. */
function lastActivity(quote: PipelineCardProps['quote']): string {
  const timestamps = [quote.created_at, quote.paid_at, quote.sent_at, quote.reminder_sent_at].filter(
    Boolean,
  ) as string[];
  timestamps.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  return timestamps[0];
}

/** Get smart nudge badge for deposit_collected without scheduled date. */
function getScheduleNudge(
  stage: string,
  scheduledDate: string | null,
): { label: string; classes: string } | null {
  if (stage === 'deposit_collected' && !scheduledDate) {
    return {
      label: 'Schedule',
      classes:
        'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200/60',
    };
  }
  return null;
}

export default function PipelineCard({
  quote,
  onStageChange,
  onQuickActions,
}: PipelineCardProps) {
  const thumb = quote.photos?.[0];
  const doneTasks = quote.job_tasks?.filter((t) => t.done).length ?? 0;
  const totalTasks = quote.job_tasks?.length ?? 0;
  const progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

  const formattedTotal = `$${Number(quote.total).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

  const formattedDate = quote.scheduled_date
    ? new Date(quote.scheduled_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  const initial = quote.customer_name?.charAt(0)?.toUpperCase() || '?';
  const avatarClasses = initialColor(quote.customer_name);

  const followUpBadge = getFollowUpBadge(
    quote.pipeline_stage,
    quote.created_at,
  );
  const scheduleNudge = getScheduleNudge(
    quote.pipeline_stage,
    quote.scheduled_date,
  );
  const lastTouchTime = lastActivity(quote);

  // Use onQuickActions if provided, else fall back to onStageChange
  const handleMenuTap = onQuickActions || onStageChange;

  return (
    <div className="relative group">
      <Link
        href={`/jobs/${quote.id}`}
        className="flex items-start gap-3 rounded-xl bg-white dark:bg-gray-900 p-3 ring-1 ring-black/[0.04] dark:ring-white/[0.06] press-scale transition-all duration-150 hover:shadow-sm"
        draggable={false}
      >
        {/* Thumbnail / Initial Avatar */}
        {thumb ? (
          <img
            src={thumb}
            alt=""
            className="h-10 w-10 shrink-0 rounded-xl object-cover bg-gray-100"
          />
        ) : (
          <div
            className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-[13px] font-semibold ${avatarClasses}`}
          >
            {initial}
          </div>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Row 1: Name + Amount */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1 flex items-center gap-1.5">
              <p className="truncate text-[14px] font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                {quote.customer_name}
              </p>
              {quote.quote_number && (
                <span className="shrink-0 text-[10px] text-gray-300 dark:text-gray-600 font-medium tabular-nums">
                  #{String(quote.quote_number).padStart(4, '0')}
                </span>
              )}
            </div>
            <span className="shrink-0 text-[14px] font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
              {formattedTotal}
            </span>
          </div>

          {/* Row 2: Address */}
          <p className="truncate text-[12px] text-gray-400 leading-tight mt-0.5">
            {quote.job_address || 'No address'}
          </p>

          {/* Row 3: Metadata chips + follow-up badge + relative time */}
          <div className="mt-2 flex items-center gap-1.5">
            {formattedDate && (
              <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                <svg
                  className="h-3 w-3 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.75}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
                {formattedDate}
              </span>
            )}

            {totalTasks > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 tabular-nums">
                <span className="relative h-1 w-5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </span>
                {doneTasks}/{totalTasks}
              </span>
            )}

            {/* Follow-up urgency badge */}
            {followUpBadge && (
              <span
                className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${followUpBadge.classes}`}
              >
                {followUpBadge.label}
              </span>
            )}

            {/* Schedule nudge badge */}
            {scheduleNudge && (
              <span
                className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${scheduleNudge.classes}`}
              >
                {scheduleNudge.label}
              </span>
            )}

            {/* In-progress task progress mini bar */}
            {quote.pipeline_stage === 'in_progress' && totalTasks > 0 && doneTasks < totalTasks && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-1.5 py-0.5 text-[11px] font-medium text-indigo-600 tabular-nums">
                <span className="relative h-1 w-5 rounded-full bg-indigo-200 overflow-hidden">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </span>
                {doneTasks}/{totalTasks}
              </span>
            )}

            {/* Spacer pushes relative time to the right */}
            <span className="flex-1" />

            <span className="text-[11px] text-gray-300 dark:text-gray-600 tabular-nums">
              Last: {relativeTime(lastTouchTime)}
            </span>
          </div>
        </div>
      </Link>

      {/* 3-dot menu for quick actions / stage change */}
      {handleMenuTap && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleMenuTap(quote.id, quote.pipeline_stage);
          }}
          className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition-opacity press-scale"
          aria-label="Quick actions"
        >
          <svg
            className="h-3.5 w-3.5 text-gray-400"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
      )}
    </div>
  );
}
