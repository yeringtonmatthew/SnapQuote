'use client';

import { Quote } from '@/types/database';
import { relativeTime } from '@/lib/relative-time';

interface TimelineStep {
  key: string;
  label: string;
  completedAt: string | null;
  completed: boolean;
}

function getSteps(quote: Quote): TimelineStep[] {
  return [
    {
      key: 'draft',
      label: 'Draft',
      completedAt: quote.created_at,
      completed: true,
    },
    {
      key: 'sent',
      label: 'Sent',
      completedAt: quote.sent_at,
      completed: !!quote.sent_at,
    },
    {
      key: 'approved',
      label: 'Approved',
      completedAt: quote.approved_at,
      completed: !!quote.approved_at,
    },
    {
      key: 'paid',
      label: 'Paid',
      completedAt: quote.paid_at,
      completed: !!quote.paid_at,
    },
  ];
}

function getCurrentStepIndex(quote: Quote): number {
  if (quote.paid_at) return 3;
  if (quote.approved_at) return 2;
  if (quote.sent_at) return 1;
  return 0;
}

function formatTimestamp(dateStr: string): string {
  return relativeTime(dateStr);
}

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

export function QuoteTimeline({ quote }: { quote: Quote }) {
  const isCancelled = quote.status === 'cancelled';
  const isExpired = quote.expires_at && new Date(quote.expires_at) < new Date() && quote.status !== 'approved' && quote.status !== 'deposit_paid';

  const steps = getSteps(quote);
  const currentIndex = getCurrentStepIndex(quote);

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-700/60 dark:bg-gray-900 shadow-sm">
      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-start justify-between">
        {steps.map((step, i) => {
          const isCompleted = step.completed;
          const isCurrent = i === currentIndex && !isCancelled && !isExpired;
          const isFuture = i > currentIndex;
          const showCancelled = isCancelled && i === currentIndex;
          const showExpired = isExpired && i === currentIndex;

          return (
            <div key={step.key} className="flex flex-1 items-start">
              <div className="flex flex-col items-center flex-1">
                {/* Circle */}
                <div className="relative flex items-center justify-center">
                  {showCancelled ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 shadow-sm">
                      <XIcon />
                    </div>
                  ) : showExpired ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 shadow-sm">
                      <WarningIcon />
                    </div>
                  ) : isCompleted ? (
                    <div className={`flex items-center justify-center rounded-full bg-indigo-600 shadow-sm dark:bg-indigo-500 ${isCurrent ? 'h-9 w-9 ring-4 ring-indigo-100 dark:ring-indigo-900' : 'h-8 w-8'}`}>
                      {isCurrent ? (
                        <div className="h-2.5 w-2.5 rounded-full bg-white" />
                      ) : (
                        <CheckIcon />
                      )}
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                      <div className="h-2 w-2 rounded-full bg-gray-200 dark:bg-gray-600" />
                    </div>
                  )}
                </div>

                {/* Label + timestamp */}
                <p className={`mt-2 text-xs font-medium ${
                  showCancelled ? 'text-red-600 dark:text-red-400' :
                  showExpired ? 'text-amber-600 dark:text-amber-400' :
                  isCompleted ? 'text-gray-900 dark:text-gray-100' :
                  'text-gray-400 dark:text-gray-500'
                }`}>
                  {showCancelled ? 'Cancelled' : showExpired ? 'Expired' : step.label}
                </p>
                {step.completedAt && isCompleted && (
                  <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                    {formatTimestamp(step.completedAt)}
                  </p>
                )}
              </div>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="mt-[15px] h-0.5 w-full min-w-4 -mx-1">
                  <div className={`h-full rounded-full ${
                    i < currentIndex ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="flex sm:hidden">
        <div className="flex flex-col items-center">
          {steps.map((step, i) => {
            const isCompleted = step.completed;
            const isCurrent = i === currentIndex && !isCancelled && !isExpired;
            const showCancelled = isCancelled && i === currentIndex;
            const showExpired = isExpired && i === currentIndex;

            return (
              <div key={step.key} className="flex flex-col items-center">
                {/* Circle */}
                {showCancelled ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 shadow-sm">
                    <XIcon />
                  </div>
                ) : showExpired ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 shadow-sm">
                    <WarningIcon />
                  </div>
                ) : isCompleted ? (
                  <div className={`flex items-center justify-center rounded-full bg-indigo-600 shadow-sm dark:bg-indigo-500 ${isCurrent ? 'h-8 w-8 ring-4 ring-indigo-100 dark:ring-indigo-900' : 'h-7 w-7'}`}>
                    {isCurrent ? (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    ) : (
                      <CheckIcon />
                    )}
                  </div>
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-200 dark:bg-gray-600" />
                  </div>
                )}

                {/* Vertical connector */}
                {i < steps.length - 1 && (
                  <div className={`w-0.5 h-8 ${
                    i < currentIndex ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Labels column */}
        <div className="ml-3 flex flex-col">
          {steps.map((step, i) => {
            const isCompleted = step.completed;
            const isCurrent = i === currentIndex && !isCancelled && !isExpired;
            const showCancelled = isCancelled && i === currentIndex;
            const showExpired = isExpired && i === currentIndex;

            return (
              <div key={step.key} className={`${i < steps.length - 1 ? 'pb-[calc(2rem-0.25rem)]' : ''}`}
                style={{ minHeight: i < steps.length - 1 ? 'calc(1.75rem + 2rem)' : '1.75rem' }}>
                <p className={`text-sm font-medium leading-7 ${
                  showCancelled ? 'text-red-600 dark:text-red-400' :
                  showExpired ? 'text-amber-600 dark:text-amber-400' :
                  isCompleted ? 'text-gray-900 dark:text-gray-100' :
                  'text-gray-400 dark:text-gray-500'
                }`}>
                  {showCancelled ? 'Cancelled' : showExpired ? 'Expired' : step.label}
                  {step.completedAt && isCompleted && (
                    <span className="ml-2 text-[11px] font-normal text-gray-400 dark:text-gray-500">
                      {formatTimestamp(step.completedAt)}
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
