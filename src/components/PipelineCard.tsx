'use client';

import Link from 'next/link';

export interface PipelineCardProps {
  quote: {
    id: string;
    customer_name: string;
    job_address: string | null;
    total: number;
    status: string;
    pipeline_stage: string;
    quote_number: number | null;
    photos: string[];
    scheduled_date: string | null;
    job_tasks: { id: string; text: string; done: boolean; created_at: string }[];
    created_at: string;
    paid_at: string | null;
  };
  onStageChange?: (quoteId: string, stage: string) => void;
}

export default function PipelineCard({ quote, onStageChange }: PipelineCardProps) {
  const thumb = quote.photos?.[0];
  const doneTasks = quote.job_tasks?.filter((t) => t.done).length ?? 0;
  const totalTasks = quote.job_tasks?.length ?? 0;

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

  return (
    <div className="relative group">
      <Link
        href={`/quotes/${quote.id}`}
        className="flex items-start gap-3 rounded-2xl bg-white dark:bg-gray-900 p-3 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] press-scale transition-shadow hover:shadow-md"
        draggable={false}
      >
        {/* Thumbnail */}
        {thumb && (
          <img
            src={thumb}
            alt=""
            className="h-12 w-12 shrink-0 rounded-lg object-cover bg-gray-100"
          />
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold text-gray-900 dark:text-gray-100">
                {quote.customer_name}
              </p>
              <p className="truncate text-[12px] text-gray-400">
                {quote.job_address || 'No address'}
              </p>
            </div>

            {/* Quote number badge */}
            {quote.quote_number && (
              <span className="shrink-0 text-[10px] text-gray-400 font-medium tabular-nums">
                #{String(quote.quote_number).padStart(4, '0')}
              </span>
            )}
          </div>

          {/* Bottom row */}
          <div className="mt-1.5 flex items-center gap-2 text-[13px]">
            <span className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
              {formattedTotal}
            </span>

            {formattedDate && (
              <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                {formattedDate}
              </span>
            )}

            {totalTasks > 0 && (
              <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 tabular-nums">
                {doneTasks}/{totalTasks}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* 3-dot menu for stage change */}
      {onStageChange && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onStageChange(quote.id, quote.pipeline_stage);
          }}
          className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 bg-gray-100 dark:bg-gray-800 transition-opacity press-scale"
          aria-label="Change stage"
        >
          <svg className="h-3.5 w-3.5 text-gray-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
      )}
    </div>
  );
}
