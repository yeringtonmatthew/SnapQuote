'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CONTRACTOR_STAGE_LABELS } from '@/lib/crm-stage-labels';

interface Job {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  job_address: string | null;
  total: number;
  status: string;
  pipeline_stage: string;
  quote_number: number | null;
  scheduled_date: string | null;
  job_tasks: { name: string; done: boolean }[] | null;
  created_at: string;
  total_paid?: number;
}

const capitalize = (s: string) => s.replace(/\b\w/g, c => c.toUpperCase());

type FilterTab = 'all' | 'active' | 'scheduled' | 'completed';

const STAGE_CONFIG: Record<string, { label: string; color: string; bg: string; text: string }> = {
  deposit_collected: {
    label: CONTRACTOR_STAGE_LABELS.deposit_collected,
    color: 'bg-green-500',
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-700 dark:text-green-400',
  },
  job_scheduled: {
    label: CONTRACTOR_STAGE_LABELS.job_scheduled,
    color: 'bg-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
  },
  in_progress: {
    label: CONTRACTOR_STAGE_LABELS.in_progress,
    color: 'bg-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    text: 'text-indigo-700 dark:text-indigo-400',
  },
  completed: {
    label: CONTRACTOR_STAGE_LABELS.completed,
    color: 'bg-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
};

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'completed', label: 'Completed' },
];

function filterJobs(jobs: Job[], filter: FilterTab): Job[] {
  switch (filter) {
    case 'active':
      return jobs.filter((j) =>
        j.pipeline_stage === 'deposit_collected' ||
        j.pipeline_stage === 'job_scheduled' ||
        j.pipeline_stage === 'in_progress'
      );
    case 'scheduled':
      return jobs.filter((j) => j.pipeline_stage === 'job_scheduled');
    case 'completed':
      return jobs.filter((j) => j.pipeline_stage === 'completed');
    default:
      return jobs;
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function JobsList({ jobs }: { jobs: Job[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const filtered = filterJobs(jobs, activeFilter);
  const activeCount = jobs.filter(
    (j) => j.pipeline_stage !== 'completed',
  ).length;

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#f2f2f7]/80 dark:bg-gray-950/80 backdrop-blur-xl">
        <div className="px-4 pt-[60px] pb-3 lg:pt-8 lg:px-8">
          <h1 className="text-[28px] font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Jobs
          </h1>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
            {activeCount} active job{activeCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="px-4 lg:px-8 pb-3">
          <div className="flex gap-2">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors press-scale ${
                  activeFilter === tab.key
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Job list */}
      <div className="px-4 lg:px-8 space-y-2 pt-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 pt-20 text-center">
            <div className="relative mx-auto mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-950/40 dark:to-brand-900/30">
                <svg
                  className="h-10 w-10 text-brand-500/80"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-brand-200/60 dark:bg-brand-800/40" />
              <div className="absolute -bottom-1.5 -left-1.5 h-2 w-2 rounded-full bg-brand-300/40 dark:bg-brand-700/30" />
            </div>
            <h2 className="text-[22px] font-bold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
              {activeFilter === 'all'
                ? 'No jobs yet'
                : activeFilter === 'active'
                  ? 'No open jobs'
                  : `No ${activeFilter} jobs`}
            </h2>
            <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 max-w-[280px]">
              {activeFilter === 'all'
                ? 'Jobs show up here after a customer says yes and pays the deposit.'
                : 'No jobs match this filter right now.'}
            </p>
          </div>
        ) : (
          filtered.map((job, idx) => {
            const config = STAGE_CONFIG[job.pipeline_stage] || STAGE_CONFIG.deposit_collected;
            const tasks = job.job_tasks || [];
            const completedTasks = tasks.filter((t) => t.done).length;
            const totalTasks = tasks.length;
            const taskPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            const initial = job.customer_name?.charAt(0)?.toUpperCase() || '?';

            // Deterministic avatar color
            const avatarColors = [
              'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
              'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400',
              'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
              'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
              'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
              'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400',
            ];
            let hash = 0;
            for (let i = 0; i < job.customer_name.length; i++) {
              hash = job.customer_name.charCodeAt(i) + ((hash << 5) - hash);
            }
            const avatarClass = avatarColors[Math.abs(hash) % avatarColors.length];

            return (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] dark:shadow-none ring-1 ring-black/[0.03] dark:ring-white/[0.06] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-[0.5px] active:scale-[0.98] animate-card-enter"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="flex items-start gap-3.5">
                  {/* Avatar */}
                  <div className={`h-11 w-11 shrink-0 rounded-full flex items-center justify-center text-[14px] font-bold ${avatarClass}`}>
                    {initial}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 truncate leading-tight">
                          {capitalize(job.customer_name)}
                        </p>
                        {job.job_address && (
                          <p className="text-[12px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                            {job.job_address}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                          {formatCurrency(Number(job.total))}
                        </p>
                        {(job.total_paid ?? 0) > 0 && (
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium tabular-nums">
                            ({formatCurrency(job.total_paid!)} collected)
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status row */}
                    <div className="flex items-center gap-2 mt-2.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${config.bg} ${config.text}`}
                      >
                        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${config.color}`} />
                        {config.label}
                        {job.pipeline_stage === 'job_scheduled' && job.scheduled_date && (
                          <span className="ml-1 opacity-70">
                            &middot; {formatDate(job.scheduled_date)}
                          </span>
                        )}
                      </span>

                      {/* Task progress bar */}
                      {totalTasks > 0 && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 font-medium tabular-nums">
                          <span className="relative h-1 w-8 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                            <span
                              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out ${
                                taskPct === 100 ? 'bg-emerald-500' : 'bg-brand-500'
                              }`}
                              style={{ width: `${taskPct}%` }}
                            />
                          </span>
                          {completedTasks}/{totalTasks}
                        </span>
                      )}

                      <span className="flex-1" />

                      {/* Chevron */}
                      <svg
                        className="h-4 w-4 text-gray-300 dark:text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
