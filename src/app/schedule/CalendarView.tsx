'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import type { CalendarEvent, EventType } from '@/types/database';
import EventCreateSheet from '@/components/EventCreateSheet';

// ── Constants ────────────────────────────────────────────
const EVENT_COLORS: Record<EventType, string> = {
  estimate: 'bg-blue-500',
  follow_up: 'bg-amber-500',
  job_scheduled: 'bg-indigo-500',
  material_dropoff: 'bg-orange-500',
  production: 'bg-purple-500',
  walkthrough: 'bg-cyan-500',
  payment_collection: 'bg-green-500',
  blocked_time: 'bg-gray-400',
};

const EVENT_COLORS_LIGHT: Record<EventType, string> = {
  estimate: 'bg-blue-50 border-blue-200',
  follow_up: 'bg-amber-50 border-amber-200',
  job_scheduled: 'bg-indigo-50 border-indigo-200',
  material_dropoff: 'bg-orange-50 border-orange-200',
  production: 'bg-purple-50 border-purple-200',
  walkthrough: 'bg-cyan-50 border-cyan-200',
  payment_collection: 'bg-green-50 border-green-200',
  blocked_time: 'bg-gray-50 border-gray-200',
};

const EVENT_TEXT_COLORS: Record<EventType, string> = {
  estimate: 'text-blue-700',
  follow_up: 'text-amber-700',
  job_scheduled: 'text-indigo-700',
  material_dropoff: 'text-orange-700',
  production: 'text-purple-700',
  walkthrough: 'text-cyan-700',
  payment_collection: 'text-green-700',
  blocked_time: 'text-gray-600',
};

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  estimate: 'Estimate',
  follow_up: 'Follow Up',
  job_scheduled: 'Job',
  material_dropoff: 'Materials',
  production: 'Production',
  walkthrough: 'Walkthrough',
  payment_collection: 'Payment',
  blocked_time: 'Blocked',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const HOURS = Array.from({ length: 15 }, (_, i) => i + 6); // 6am to 8pm

// ── Helpers ──────────────────────────────────────────────
function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatTime(time: string | null): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function formatTimeRange(start: string | null, end: string | null): string {
  if (!start) return 'All day';
  if (!end) return formatTime(start);
  return `${formatTime(start)} - ${formatTime(end)}`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function formatRelativeDate(date: Date, today: Date): string {
  if (isSameDay(date, today)) return 'Today';
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isSameDay(date, tomorrow)) return 'Tomorrow';
  return `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

// ── Types ────────────────────────────────────────────────
type ViewType = 'day' | 'week' | 'agenda';

interface UnscheduledQuote {
  id: string;
  customer_name: string;
  job_address: string | null;
  quote_number: number | null;
  status: string;
  total: number;
  pipeline_stage: string;
}

interface CalendarViewProps {
  initialEvents: CalendarEvent[];
  unscheduledQuotes: UnscheduledQuote[];
  allQuotes?: { id: string; customer_name: string; job_address: string | null }[];
}

// ── Event Card Component ─────────────────────────────────
function EventCard({
  event,
  compact = false,
  onTap,
}: {
  event: CalendarEvent;
  compact?: boolean;
  onTap: (event: CalendarEvent) => void;
}) {
  const eventType = event.event_type as EventType;
  const colorBar = EVENT_COLORS[eventType] || 'bg-gray-400';
  const lightBg = EVENT_COLORS_LIGHT[eventType] || 'bg-gray-50 border-gray-200';
  const textColor = EVENT_TEXT_COLORS[eventType] || 'text-gray-600';

  if (compact) {
    return (
      <button
        onClick={() => onTap(event)}
        className={`w-full text-left rounded-lg border px-2.5 py-1.5 active:scale-[0.98] transition-transform ${lightBg}`}
      >
        <div className="flex items-center gap-1.5">
          <div className={`h-2 w-2 rounded-full shrink-0 ${colorBar}`} />
          <span className="text-[12px] font-bold text-gray-900 truncate">
            {event.customer_name || event.title}
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => onTap(event)}
      className="w-full text-left rounded-xl bg-white ring-1 ring-black/[0.04] overflow-hidden active:scale-[0.98] transition-all hover:shadow-md hover:ring-black/[0.08]"
    >
      <div className="flex">
        <div className={`w-1 shrink-0 ${colorBar}`} />
        <div className="flex-1 px-3.5 py-2.5 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-gray-900 truncate">
                {event.customer_name || event.title}
              </p>
              <p className="text-[12px] text-gray-400 mt-0.5">
                {event.all_day ? 'All day' : formatTimeRange(event.start_time, event.end_time)}
              </p>
            </div>
            <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${lightBg} ${textColor}`}>
              {EVENT_TYPE_LABELS[eventType] || eventType}
            </span>
          </div>
          {event.job_address && typeof event.job_address === 'string' && (
            <p className="text-[11px] text-gray-400 truncate mt-1">{event.job_address}</p>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Event Detail Sheet ──────────────────────────────────
function EventDetailSheet({
  event,
  onClose,
  onEdit,
  onStageUpdate,
}: {
  event: CalendarEvent;
  onClose: () => void;
  onEdit: () => void;
  onStageUpdate: (quoteId: string, stage: string) => void;
}) {
  const eventType = event.event_type as EventType;
  const colorBar = EVENT_COLORS[eventType] || 'bg-gray-400';
  const addr = typeof event.job_address === 'string' ? event.job_address : null;
  const phone = typeof event.customer_phone === 'string' ? event.customer_phone : null;
  const [updating, setUpdating] = useState(false);

  const handleStageChange = async (stage: string) => {
    if (!event.quote_id) return;
    setUpdating(true);
    try {
      await fetch(`/api/quotes/${event.quote_id}/pipeline`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipeline_stage: stage }),
      });
      onStageUpdate(event.quote_id, stage);
      onClose();
    } catch { /* silent */ } finally {
      setUpdating(false);
    }
  };

  const pipelineStage = event.pipeline_stage as string | undefined;
  const canStart = event.quote_id && pipelineStage !== 'in_progress' && pipelineStage !== 'completed';
  const canComplete = event.quote_id && pipelineStage === 'in_progress';

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 animate-sheet-backdrop" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 lg:inset-y-0 lg:left-auto lg:right-0 lg:bottom-auto lg:w-[420px] z-50 animate-sheet-up lg:animate-none">
        <div className="mx-auto max-w-lg lg:max-w-none lg:h-full rounded-t-2xl lg:rounded-none bg-white dark:bg-gray-900 shadow-2xl pb-8 lg:pb-0 lg:overflow-y-auto">
          <div className="flex justify-center pt-3 pb-2">
            <div className="h-1 w-8 rounded-full bg-gray-300 dark:bg-gray-700" />
          </div>

          {/* Title */}
          <div className="px-5 pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`h-2.5 w-2.5 rounded-full ${colorBar}`} />
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    {EVENT_TYPE_LABELS[eventType] || eventType}
                  </span>
                </div>
                <h2 className="text-[20px] font-bold text-gray-900 dark:text-gray-100 truncate">
                  {event.customer_name || event.title}
                </h2>
              </div>
              <button onClick={onEdit} className="shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-[12px] font-semibold text-gray-600 dark:text-gray-300 press-scale">
                Edit
              </button>
            </div>

            {/* Address */}
            {addr && (
              <a
                href={`maps://maps.apple.com/?daddr=${encodeURIComponent(addr)}`}
                className="flex items-center gap-1.5 mt-2 text-[13px] text-gray-500 press-scale"
              >
                <svg className="h-3.5 w-3.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="truncate">{addr}</span>
              </a>
            )}

            {/* Time */}
            <p className="text-[13px] text-gray-400 mt-1.5">
              {event.all_day ? 'All day' : formatTimeRange(event.start_time, event.end_time)}
            </p>
          </div>

          {/* Directions — primary CTA */}
          {addr && (
            <div className="px-5 mb-4">
              <a
                href={`maps://maps.apple.com/?daddr=${encodeURIComponent(addr)}`}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-brand-600 py-3.5 text-[15px] font-semibold text-white shadow-sm press-scale"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                </svg>
                Directions
              </a>
            </div>
          )}

          {/* Action row */}
          <div className="px-5 grid grid-cols-4 gap-2 mb-4">
            {/* Call */}
            {phone ? (
              <a href={`tel:${phone}`} className="flex flex-col items-center gap-1 rounded-xl bg-gray-50 dark:bg-gray-800 py-3 press-scale">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                <span className="text-[10px] font-semibold text-gray-500">Call</span>
              </a>
            ) : (
              <div className="flex flex-col items-center gap-1 rounded-xl bg-gray-50/50 py-3 opacity-30">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                <span className="text-[10px] font-semibold text-gray-400">Call</span>
              </div>
            )}

            {/* Text */}
            {phone ? (
              <a href={`sms:${phone}`} className="flex flex-col items-center gap-1 rounded-xl bg-gray-50 dark:bg-gray-800 py-3 press-scale">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                <span className="text-[10px] font-semibold text-gray-500">Text</span>
              </a>
            ) : (
              <div className="flex flex-col items-center gap-1 rounded-xl bg-gray-50/50 py-3 opacity-30">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                <span className="text-[10px] font-semibold text-gray-400">Text</span>
              </div>
            )}

            {/* View Job */}
            {event.quote_id ? (
              <a href={`/jobs/${event.quote_id}`} className="flex flex-col items-center gap-1 rounded-xl bg-gray-50 dark:bg-gray-800 py-3 press-scale">
                <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                <span className="text-[10px] font-semibold text-gray-500">View Job</span>
              </a>
            ) : (
              <div className="flex flex-col items-center gap-1 rounded-xl bg-gray-50/50 py-3 opacity-30">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                <span className="text-[10px] font-semibold text-gray-400">Job</span>
              </div>
            )}

            {/* Start / Complete */}
            {canStart && (
              <button
                onClick={() => handleStageChange('in_progress')}
                disabled={updating}
                className="flex flex-col items-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 py-3 press-scale"
              >
                <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" /></svg>
                <span className="text-[10px] font-semibold text-emerald-600">{updating ? '...' : 'Start'}</span>
              </button>
            )}
            {canComplete && (
              <button
                onClick={() => handleStageChange('completed')}
                disabled={updating}
                className="flex flex-col items-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 py-3 press-scale"
              >
                <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-[10px] font-semibold text-emerald-600">{updating ? '...' : 'Complete'}</span>
              </button>
            )}
            {!canStart && !canComplete && (
              <div className="flex flex-col items-center gap-1 rounded-xl bg-gray-50/50 py-3 opacity-30">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-[10px] font-semibold text-gray-400">Done</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {event.notes && (
            <div className="px-5 pb-2">
              <p className="text-[12px] text-gray-400 whitespace-pre-wrap">{event.notes}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Day View ─────────────────────────────────────────────
function DayView({
  date,
  events,
  onEventTap,
  onEmptySlotTap,
}: {
  date: Date;
  events: CalendarEvent[];
  onEventTap: (event: CalendarEvent) => void;
  onEmptySlotTap: (hour: number) => void;
}) {
  const today = new Date();
  const isToday = isSameDay(date, today);
  const [currentMinute, setCurrentMinute] = useState(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });

  useEffect(() => {
    if (!isToday) return;
    const interval = setInterval(() => {
      const n = new Date();
      setCurrentMinute(n.getHours() * 60 + n.getMinutes());
    }, 60000);
    return () => clearInterval(interval);
  }, [isToday]);

  // All-day events
  const allDayEvents = events.filter((e) => e.all_day);
  // Timed events
  const timedEvents = events.filter((e) => !e.all_day && e.start_time);

  // Calculate position for timed events
  const startHour = 6;
  const hourHeight = 60; // px per hour

  return (
    <div className="space-y-3">
      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="space-y-1.5 px-1">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">All Day</p>
          {allDayEvents.map((ev) => (
            <EventCard key={ev.id} event={ev} compact onTap={onEventTap} />
          ))}
        </div>
      )}

      {/* Time grid */}
      <div className="relative" style={{ height: `${HOURS.length * hourHeight}px` }}>
        {/* Hour lines */}
        {HOURS.map((hour) => (
          <button
            key={hour}
            onClick={() => onEmptySlotTap(hour)}
            className="absolute left-0 right-0 flex items-start border-t border-gray-100 active:bg-gray-50 transition-colors"
            style={{ top: `${(hour - startHour) * hourHeight}px`, height: `${hourHeight}px` }}
          >
            <span className="text-[11px] text-gray-400 font-medium w-12 -mt-2 text-right pr-3 shrink-0">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </span>
          </button>
        ))}

        {/* Current time indicator */}
        {isToday && currentMinute >= startHour * 60 && currentMinute <= 20 * 60 && (
          <div
            className="absolute left-10 right-0 z-20 flex items-center pointer-events-none"
            style={{ top: `${((currentMinute - startHour * 60) / 60) * hourHeight}px` }}
          >
            <div className="h-2.5 w-2.5 rounded-full bg-red-500 -ml-1.5 shrink-0" />
            <div className="flex-1 h-[2px] bg-red-500" />
          </div>
        )}

        {/* Event blocks */}
        {timedEvents.map((ev) => {
          const evStart = timeToMinutes(ev.start_time!);
          const evEnd = ev.end_time ? timeToMinutes(ev.end_time) : evStart + 60;
          const top = ((evStart - startHour * 60) / 60) * hourHeight;
          const height = Math.max(((evEnd - evStart) / 60) * hourHeight, 36);
          const eventType = ev.event_type as EventType;
          const colorBar = EVENT_COLORS[eventType] || 'bg-gray-400';
          const lightBg = EVENT_COLORS_LIGHT[eventType] || 'bg-gray-50 border-gray-200';
          const textColor = EVENT_TEXT_COLORS[eventType] || 'text-gray-600';

          return (
            <button
              key={ev.id}
              onClick={() => onEventTap(ev)}
              className={`absolute left-14 right-2 lg:right-[40%] z-10 rounded-lg border overflow-hidden active:scale-[0.98] transition-transform hover:shadow-md ${lightBg}`}
              style={{ top: `${top}px`, height: `${height}px` }}
            >
              <div className="flex h-full">
                <div className={`w-1 shrink-0 ${colorBar}`} />
                <div className="flex-1 px-2.5 py-1.5 min-w-0">
                  <p className={`text-[12px] font-bold truncate ${textColor}`}>
                    {ev.customer_name || ev.title}
                  </p>
                  {height >= 48 && (
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {formatTimeRange(ev.start_time, ev.end_time)}
                    </p>
                  )}
                  {height >= 64 && ev.job_address && (
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">{typeof ev.job_address === 'string' ? ev.job_address : ''}</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Week View ────────────────────────────────────────────
function WeekView({
  date,
  events,
  onEventTap,
  onDaySelect,
}: {
  date: Date;
  events: CalendarEvent[];
  onEventTap: (event: CalendarEvent) => void;
  onDaySelect: (date: Date) => void;
}) {
  const today = new Date();

  // Get week start (Sunday)
  const weekStart = new Date(date);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  // Map events by date
  const eventsByDate: Record<string, CalendarEvent[]> = {};
  for (const ev of events) {
    const key = ev.event_date;
    if (!eventsByDate[key]) eventsByDate[key] = [];
    eventsByDate[key].push(ev);
  }

  // Filter events to this week
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEvents = events.filter((ev) => {
    const d = new Date(ev.event_date + 'T00:00:00');
    return d >= weekStart && d <= weekEnd;
  });

  // Group week events by day for agenda list
  const groupedEvents: { date: Date; events: CalendarEvent[] }[] = [];
  for (const day of weekDays) {
    const key = toDateKey(day);
    const dayEvents = eventsByDate[key] || [];
    if (dayEvents.length > 0) {
      groupedEvents.push({ date: day, events: dayEvents });
    }
  }

  return (
    <div className="space-y-4">
      {/* Week strip */}
      <div className="grid grid-cols-7 gap-1 lg:gap-2">
        {weekDays.map((day, i) => {
          const isToday = isSameDay(day, today);
          const key = toDateKey(day);
          const dayEvents = eventsByDate[key] || [];

          return (
            <button
              key={i}
              onClick={() => onDaySelect(day)}
              className="text-center py-1 lg:py-3 lg:rounded-xl lg:bg-white lg:ring-1 lg:ring-black/[0.04] lg:hover:shadow-sm active:scale-[0.96] transition-all"
            >
              <p className="text-[10px] lg:text-[11px] font-medium text-gray-400 uppercase">{DAY_NAMES[i]}</p>
              <div
                className={`mt-1 mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isToday ? 'bg-brand-600 text-white' : 'text-gray-900'
                }`}
              >
                {day.getDate()}
              </div>
              <div className="mt-1 flex justify-center gap-0.5 h-1.5">
                {dayEvents.slice(0, 3).map((ev, j) => (
                  <div
                    key={j}
                    className={`h-1.5 w-1.5 rounded-full ${EVENT_COLORS[ev.event_type as EventType] || 'bg-gray-400'}`}
                  />
                ))}
              </div>
              {/* Desktop: show event count */}
              {dayEvents.length > 0 && (
                <p className="hidden lg:block text-[10px] text-gray-400 mt-1">{dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Agenda list grouped by day */}
      {groupedEvents.length === 0 ? (
        <div className="rounded-xl bg-white ring-1 ring-black/[0.04] p-8 text-center">
          <svg className="h-10 w-10 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <p className="text-[14px] font-semibold text-gray-900 mt-3">No events this week</p>
          <p className="text-[13px] text-gray-500 mt-1">Tap + to add an event</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedEvents.map(({ date: groupDate, events: dayEvents }) => (
            <div key={toDateKey(groupDate)}>
              <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
                {formatRelativeDate(groupDate, today)}
              </p>
              <div className="space-y-2">
                {dayEvents.map((ev) => (
                  <EventCard key={ev.id} event={ev} onTap={onEventTap} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Agenda View ──────────────────────────────────────────
function AgendaView({
  events,
  onEventTap,
}: {
  events: CalendarEvent[];
  onEventTap: (event: CalendarEvent) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter to upcoming events (today and forward), sorted by date/time
  const upcoming = events
    .filter((ev) => {
      const d = new Date(ev.event_date + 'T00:00:00');
      return d >= today;
    })
    .sort((a, b) => {
      if (a.event_date !== b.event_date) return a.event_date.localeCompare(b.event_date);
      if (!a.start_time) return -1;
      if (!b.start_time) return 1;
      return a.start_time.localeCompare(b.start_time);
    });

  // Group by date
  const groups: { date: Date; events: CalendarEvent[] }[] = [];
  let lastKey = '';
  for (const ev of upcoming) {
    if (ev.event_date !== lastKey) {
      groups.push({ date: new Date(ev.event_date + 'T00:00:00'), events: [] });
      lastKey = ev.event_date;
    }
    groups[groups.length - 1].events.push(ev);
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-xl bg-white ring-1 ring-black/[0.04] p-8 text-center">
        <svg className="h-10 w-10 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
        <p className="text-[14px] font-semibold text-gray-900 mt-3">No upcoming events</p>
        <p className="text-[13px] text-gray-500 mt-1">Your schedule is clear</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {groups.map(({ date, events: dayEvents }) => (
        <div key={toDateKey(date)}>
          <div className="sticky top-[120px] z-[5] bg-[#f2f2f7]/95 backdrop-blur-sm py-1.5 px-1">
            <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
              {formatRelativeDate(date, new Date())}
            </p>
          </div>
          <div className="space-y-2 mt-1.5">
            {dayEvents.map((ev) => (
              <EventCard key={ev.id} event={ev} onTap={onEventTap} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Needs Scheduling Section ─────────────────────────────
function NeedsSchedulingSection({ quotes }: { quotes: UnscheduledQuote[] }) {
  const [expanded, setExpanded] = useState(false);

  if (quotes.length === 0) return null;

  const visible = expanded ? quotes : quotes.slice(0, 3);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
          Needs Scheduling ({quotes.length})
        </p>
        {quotes.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[12px] font-semibold text-brand-600 press-scale"
          >
            {expanded ? 'Show less' : 'Show all'}
          </button>
        )}
      </div>
      <div className="space-y-2">
        {visible.map((q) => (
          <Link
            key={q.id}
            href={`/jobs/${q.id}`}
            className="flex items-center gap-3 rounded-xl bg-white ring-1 ring-black/[0.04] px-3.5 py-3 active:scale-[0.98] transition-transform"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50">
              <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-gray-900 truncate">{q.customer_name}</p>
              {q.job_address && (
                <p className="text-[12px] text-gray-400 truncate">{q.job_address}</p>
              )}
            </div>
            <span className="text-[12px] font-medium text-amber-600 bg-amber-50 rounded-full px-2 py-0.5 shrink-0">
              {q.status === 'deposit_paid' ? 'Paid' : 'Approved'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Main CalendarView Component ──────────────────────────
export function CalendarView({ initialEvents, unscheduledQuotes, allQuotes = [] }: CalendarViewProps) {
  const [view, setView] = useState<ViewType>('day');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(undefined);
  const [defaultTime, setDefaultTime] = useState<string | undefined>(undefined);

  const today = useMemo(() => new Date(), []);

  const isToday = isSameDay(selectedDate, today);

  // Date navigation
  const goToToday = useCallback(() => setSelectedDate(new Date()), []);

  const navigateDay = useCallback((delta: number) => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + delta);
      return d;
    });
  }, []);

  const navigateWeek = useCallback((delta: number) => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + delta * 7);
      return d;
    });
  }, []);

  // Formatted date for header
  const headerDate = useMemo(() => {
    if (view === 'day') {
      return `${DAY_NAMES[selectedDate.getDay()]}, ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getDate()}`;
    }
    if (view === 'week') {
      const weekStart = new Date(selectedDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getDate()} - ${weekEnd.getDate()}`;
      }
      return `${MONTH_NAMES[weekStart.getMonth()].slice(0, 3)} ${weekStart.getDate()} - ${MONTH_NAMES[weekEnd.getMonth()].slice(0, 3)} ${weekEnd.getDate()}`;
    }
    return MONTH_NAMES[selectedDate.getMonth()] + ' ' + selectedDate.getFullYear();
  }, [view, selectedDate]);

  // Handle event creation/update
  const handleSaveEvent = useCallback(async (eventData: Partial<CalendarEvent>) => {
    try {
      if (editingEvent) {
        const res = await fetch(`/api/events/${editingEvent.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
        if (res.ok) {
          const updated = await res.json();
          setEvents((prev) => prev.map((e) => (e.id === editingEvent.id ? { ...e, ...updated } : e)));
        }
      } else {
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
        if (res.ok) {
          const created = await res.json();
          setEvents((prev) => [...prev, created]);
        }
      }
    } catch (err) {
      console.error('Failed to save event:', err);
    }
    setSheetOpen(false);
    setEditingEvent(undefined);
    setDefaultTime(undefined);
  }, [editingEvent]);

  // Event detail sheet state
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);

  const handleEventTap = useCallback((event: CalendarEvent) => {
    setDetailEvent(event);
  }, []);

  const handleEditFromDetail = useCallback(() => {
    if (detailEvent) {
      setEditingEvent(detailEvent);
      setDetailEvent(null);
      setSheetOpen(true);
    }
  }, [detailEvent]);

  const handleStageUpdate = useCallback((quoteId: string, stage: string) => {
    setEvents((prev) => prev.map((e) => e.quote_id === quoteId ? { ...e, pipeline_stage: stage } : e));
  }, []);

  const handleEmptySlotTap = useCallback((hour: number) => {
    setDefaultTime(`${String(hour).padStart(2, '0')}:00`);
    setEditingEvent(undefined);
    setSheetOpen(true);
  }, []);

  const openCreateSheet = useCallback(() => {
    setEditingEvent(undefined);
    setDefaultTime(undefined);
    setSheetOpen(true);
  }, []);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#f2f2f7]/90 backdrop-blur-xl border-b border-black/5 px-5 pt-14 lg:pt-6 pb-3">
        <div className="mx-auto max-w-7xl">
          {/* Title row */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-[22px] font-bold tracking-tight text-gray-900">Schedule</h1>
            <div className="flex items-center gap-2">
              {!isToday && (
                <button
                  onClick={goToToday}
                  className="rounded-lg bg-white ring-1 ring-black/[0.04] px-3 py-1.5 text-[12px] font-semibold text-brand-600 active:scale-[0.96] transition-transform"
                >
                  Today
                </button>
              )}
              <button
                onClick={openCreateSheet}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 active:scale-[0.94] transition-transform"
                aria-label="Create event"
              >
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Segmented control */}
          <div className="flex rounded-lg bg-gray-200/70 p-0.5">
            {(['day', 'week', 'agenda'] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex-1 rounded-md py-1.5 text-[13px] font-semibold transition-all ${
                  view === v
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-4 space-y-5 lg:px-8">
        {/* Date navigation (Day and Week views) */}
        {view !== 'agenda' && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => view === 'day' ? navigateDay(-1) : navigateWeek(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white ring-1 ring-black/[0.04] active:scale-[0.94] transition-transform"
              aria-label="Previous"
            >
              <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <p className="text-[14px] font-semibold text-gray-900">{headerDate}</p>
            <button
              onClick={() => view === 'day' ? navigateDay(1) : navigateWeek(1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white ring-1 ring-black/[0.04] active:scale-[0.94] transition-transform"
              aria-label="Next"
            >
              <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        )}

        {/* Day View */}
        {view === 'day' && (
          <DayView
            date={selectedDate}
            events={events.filter((e) => e.event_date === toDateKey(selectedDate))}
            onEventTap={handleEventTap}
            onEmptySlotTap={handleEmptySlotTap}
          />
        )}

        {/* Week View */}
        {view === 'week' && (
          <WeekView
            date={selectedDate}
            events={events}
            onEventTap={handleEventTap}
            onDaySelect={(day) => {
              setSelectedDate(day);
              setView('day');
            }}
          />
        )}

        {/* Agenda View */}
        {view === 'agenda' && (
          <AgendaView events={events} onEventTap={handleEventTap} />
        )}

        {/* Needs Scheduling */}
        <NeedsSchedulingSection quotes={unscheduledQuotes} />
      </main>

      {/* Event Detail Sheet */}
      {detailEvent && (
        <EventDetailSheet
          event={detailEvent}
          onClose={() => setDetailEvent(null)}
          onEdit={handleEditFromDetail}
          onStageUpdate={handleStageUpdate}
        />
      )}

      {/* Event Create/Edit Sheet */}
      <EventCreateSheet
        isOpen={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setEditingEvent(undefined);
          setDefaultTime(undefined);
        }}
        onSave={handleSaveEvent}
        defaultDate={toDateKey(selectedDate)}
        defaultTime={defaultTime}
        quotes={allQuotes.map((q) => ({
          id: q.id,
          customer_name: q.customer_name,
          job_address: q.job_address,
        }))}
        editingEvent={editingEvent}
      />
    </>
  );
}
