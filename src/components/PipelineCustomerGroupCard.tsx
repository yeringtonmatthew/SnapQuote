'use client';

import Link from 'next/link';
import { formatQuoteNumber } from '@/lib/format-quote-number';
import { relativeTime } from '@/lib/relative-time';
import type { PipelineCardProps } from './PipelineCard';

export interface PipelineCustomerGroup {
  key: string;
  customerName: string;
  customerPhone: string | null;
  total: number;
  lastActivity: string;
  quotes: PipelineCardProps['quote'][];
}

interface PipelineCustomerGroupCardProps {
  accentClass: string;
  group: PipelineCustomerGroup;
  onQuickActions?: (quoteId: string, stage: string) => void;
}

function formatCurrency(amount: number): string {
  return `$${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default function PipelineCustomerGroupCard({
  accentClass,
  group,
  onQuickActions,
}: PipelineCustomerGroupCardProps) {
  const initial = group.customerName?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className={`rounded-2xl border-l-4 ${accentClass} bg-white dark:bg-gray-900 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] dark:shadow-none ring-1 ring-black/[0.04] dark:ring-white/[0.06]`}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-[15px] font-bold text-brand-600 dark:bg-brand-950/30 dark:text-brand-300">
          {initial}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-gray-900 dark:text-gray-100">
                {group.customerName}
              </p>
              <p className="mt-0.5 text-[12px] text-gray-400 dark:text-gray-500">
                {group.quotes.length} quote{group.quotes.length !== 1 ? 's' : ''} in this stage
              </p>
            </div>

            <div className="text-right">
              <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                {formatCurrency(group.total)}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                {relativeTime(group.lastActivity)}
              </p>
            </div>
          </div>

          {group.customerPhone && (
            <div className="mt-3 flex gap-2">
              <a
                href={`tel:${group.customerPhone}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-[12px] font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                Call
              </a>
              <a
                href={`sms:${group.customerPhone}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-[12px] font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
                Text
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {group.quotes.map((quote) => {
          const touchedAt = quote.reminder_sent_at || quote.sent_at || quote.paid_at || quote.created_at;

          return (
            <div
              key={quote.id}
              className="rounded-xl bg-gray-50/90 dark:bg-gray-800/50 p-3 ring-1 ring-black/[0.03] dark:ring-white/[0.05]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-500 ring-1 ring-black/[0.04] dark:bg-gray-900 dark:text-gray-400 dark:ring-white/[0.06]">
                      {quote.quote_number ? formatQuoteNumber(quote.quote_number) : 'Quote'}
                    </span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      {relativeTime(touchedAt)}
                    </span>
                  </div>
                  <p className="mt-2 truncate text-[13px] font-medium text-gray-900 dark:text-gray-100">
                    {quote.job_address || 'No address yet'}
                  </p>
                </div>

                <p className="shrink-0 text-[14px] font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                  {formatCurrency(quote.total)}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Link
                  href={`/jobs/${quote.id}`}
                  className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-2 text-[12px] font-semibold text-gray-700 ring-1 ring-black/[0.04] dark:bg-gray-900 dark:text-gray-300 dark:ring-white/[0.06]"
                >
                  Open
                </Link>
                <Link
                  href={`/quotes/${quote.id}`}
                  className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-2 text-[12px] font-semibold text-gray-700 ring-1 ring-black/[0.04] dark:bg-gray-900 dark:text-gray-300 dark:ring-white/[0.06]"
                >
                  Edit
                </Link>
                {onQuickActions && (
                  <button
                    onClick={() => onQuickActions(quote.id, quote.pipeline_stage)}
                    className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-500 ring-1 ring-black/[0.04] dark:bg-gray-900 dark:text-gray-400 dark:ring-white/[0.06]"
                    aria-label={`More actions for quote ${quote.quote_number ?? quote.id}`}
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="5" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="12" cy="19" r="2" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
