'use client';

import { useState } from 'react';
import Link from 'next/link';
import EmptyState from '@/components/EmptyState';

interface ScheduledJob {
  id: string;
  customer_name: string;
  quote_number: number | null;
  scheduled_date: string;
  scheduled_time: string | null;
  job_address: string | null;
  status: string;
}

interface ScheduleCalendarProps {
  jobs: ScheduledJob[];
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 border-gray-200 text-gray-700',
  sent: 'bg-blue-50 border-blue-200 text-blue-700',
  approved: 'bg-amber-50 border-amber-200 text-amber-700',
  deposit_paid: 'bg-green-50 border-green-200 text-green-700',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatTime(time: string | null): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function formatQuoteNum(n: number | null): string {
  if (!n) return '';
  return `#${String(n).padStart(4, '0')}`;
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function ScheduleCalendar({ jobs }: ScheduleCalendarProps) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [view, setView] = useState<'week' | 'month'>('week');

  // Build a map of date -> jobs
  const jobsByDate: Record<string, ScheduledJob[]> = {};
  for (const job of jobs) {
    const key = job.scheduled_date;
    if (!jobsByDate[key]) jobsByDate[key] = [];
    jobsByDate[key].push(job);
  }

  // Get the start of the current week (Sunday)
  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // Get all days in the current month grid (including padding from prev/next months)
  function getMonthGrid(date: Date): Date[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const days: Date[] = [];

    // Previous month padding
    for (let i = startPad - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push(d);
    }
    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    // Next month padding to fill grid
    const remainder = days.length % 7;
    if (remainder > 0) {
      const extra = 7 - remainder;
      for (let i = 1; i <= extra; i++) {
        days.push(new Date(year, month + 1, i));
      }
    }

    return days;
  }

  // Get 7 days for week view
  function getWeekDays(date: Date): Date[] {
    const start = getWeekStart(date);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }

  function navigatePrev() {
    const d = new Date(currentDate);
    if (view === 'week') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setMonth(d.getMonth() - 1);
    }
    setCurrentDate(d);
  }

  function navigateNext() {
    const d = new Date(currentDate);
    if (view === 'week') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    setCurrentDate(d);
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  const weekDays = getWeekDays(currentDate);
  const monthDays = getMonthGrid(currentDate);

  // For week view, get all jobs in the current week for the list below
  const weekStart = getWeekStart(currentDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const weekJobs = jobs.filter((j) => {
    const d = new Date(j.scheduled_date + 'T00:00:00');
    return d >= weekStart && d <= weekEnd;
  });

  // Title
  const title = view === 'week'
    ? `${MONTH_NAMES[weekDays[0].getMonth()]} ${weekDays[0].getDate()} - ${weekDays[0].getMonth() !== weekDays[6].getMonth() ? MONTH_NAMES[weekDays[6].getMonth()] + ' ' : ''}${weekDays[6].getDate()}, ${weekDays[6].getFullYear()}`
    : `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  return (
    <div className="space-y-4">
      {/* View toggle + nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={navigatePrev}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-gray-200 shadow-sm active:scale-95 transition-transform"
            aria-label="Previous"
          >
            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={navigateNext}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-gray-200 shadow-sm active:scale-95 transition-transform"
            aria-label="Next"
          >
            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className="rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm active:scale-95 transition-transform"
          >
            Today
          </button>
        </div>
        <div className="flex rounded-lg bg-white border border-gray-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setView('week')}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${view === 'week' ? 'bg-brand-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Week
          </button>
          <button
            onClick={() => setView('month')}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${view === 'month' ? 'bg-brand-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Period title */}
      <h2 className="text-sm font-semibold text-gray-700">{title}</h2>

      {/* ── WEEK VIEW ──────────────────────────── */}
      {view === 'week' && (
        <>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day, i) => {
              const isToday = isSameDay(day, today);
              const key = toDateKey(day);
              const dayJobs = jobsByDate[key] || [];
              return (
                <div key={i} className="text-center">
                  <p className="text-[10px] font-medium text-gray-400 uppercase">{DAY_NAMES[i]}</p>
                  <div
                    className={`mt-1 mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                      isToday
                        ? 'bg-brand-600 text-white'
                        : 'text-gray-900'
                    }`}
                  >
                    {day.getDate()}
                  </div>
                  {dayJobs.length > 0 && (
                    <div className="mt-1 flex justify-center gap-0.5">
                      {dayJobs.slice(0, 3).map((_, j) => (
                        <div key={j} className="h-1 w-1 rounded-full bg-brand-500" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Job list for the week */}
          <div className="space-y-2 pt-2">
            {weekJobs.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800">
                <EmptyState
                  icon={
                    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  }
                  title="No jobs scheduled"
                  description="Schedule a job from any approved quote to see it here."
                />
              </div>
            ) : (
              weekJobs.map((job) => {
                const jobDate = new Date(job.scheduled_date + 'T00:00:00');
                return (
                  <Link
                    key={job.id}
                    href={`/quotes/${job.id}`}
                    className={`block rounded-xl border px-4 py-3 shadow-sm active:scale-[0.98] transition-transform ${statusColors[job.status] || 'bg-white border-gray-200 text-gray-700'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{job.customer_name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {job.quote_number && (
                            <span className="text-[11px] opacity-70">{formatQuoteNum(job.quote_number)}</span>
                          )}
                          <span className="text-[11px] opacity-70">
                            {DAY_NAMES[jobDate.getDay()]} {jobDate.getDate()}
                          </span>
                        </div>
                        {job.job_address && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <svg className="h-3 w-3 shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            <span className="text-[11px] opacity-70 truncate">{job.job_address}</span>
                          </div>
                        )}
                      </div>
                      {job.scheduled_time && (
                        <span className="text-xs font-medium opacity-80">{formatTime(job.scheduled_time)}</span>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </>
      )}

      {/* ── MONTH VIEW ─────────────────────────── */}
      {view === 'month' && (
        <div>
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_NAMES_SHORT.map((name, i) => (
              <div key={i} className="text-center text-[10px] font-medium text-gray-400 uppercase py-1">
                {name}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
            {monthDays.map((day, i) => {
              const isToday = isSameDay(day, today);
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const key = toDateKey(day);
              const dayJobs = jobsByDate[key] || [];

              return (
                <div
                  key={i}
                  className={`min-h-[72px] p-1 ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                        isToday
                          ? 'bg-brand-600 text-white'
                          : isCurrentMonth
                            ? 'text-gray-700'
                            : 'text-gray-300'
                      }`}
                    >
                      {day.getDate()}
                    </span>
                  </div>
                  <div className="mt-0.5 space-y-0.5">
                    {dayJobs.slice(0, 2).map((job) => (
                      <Link
                        key={job.id}
                        href={`/quotes/${job.id}`}
                        className={`block rounded px-1 py-0.5 text-[9px] font-medium leading-tight truncate active:opacity-70 ${
                          job.status === 'deposit_paid'
                            ? 'bg-green-100 text-green-700'
                            : job.status === 'approved'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {job.scheduled_time ? formatTime(job.scheduled_time) + ' ' : ''}{job.customer_name}
                      </Link>
                    ))}
                    {dayJobs.length > 2 && (
                      <p className="text-[9px] text-gray-400 px-1">+{dayJobs.length - 2} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
