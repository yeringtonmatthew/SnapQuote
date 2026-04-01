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
          <span className="text-[12px] font-semibold text-gray-900 truncate">
            {event.customer_name || event.title}
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        if (event.quote_id) {
          window.location.href = `/jobs/${event.quote_id}`;
        } else {
          onTap(event);
        }
      }}
      className="w-full text-left rounded-xl bg-white ring-1 ring-black/[0.04] overflow-hidden active:scale-[0.98] transition-transform"
    >
      <div className="flex">
        <div className={`w-1 shrink-0 ${colorBar}`} />
        <div className="flex-1 px-3.5 py-3 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-gray-900 truncate">
                {event.customer_name || event.title}
              </p>
              <p className="text-[13px] text-gray-500 mt-0.5">
                {event.all_day ? 'All day' : formatTimeRange(event.start_time, event.end_time)}
              </p>
            </div>
            <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${lightBg} ${textColor}`}>
              {EVENT_TYPE_LABELS[eventType] || eventType}
            </span>
          </div>
          {event.job_address && (
            <div className="flex items-center gap-1 mt-1.5">
              <svg className="h-3 w-3 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span className="text-[12px] text-gray-400 truncate">{event.job_address}</span>
            </div>
          )}
        </div>
      </div>
    </button>
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
              onClick={() => {
                if (ev.quote_id) {
                  window.location.href = `/jobs/${ev.quote_id}`;
                } else {
                  onEventTap(ev);
                }
              }}
              className={`absolute left-14 right-2 z-10 rounded-lg border overflow-hidden active:scale-[0.98] transition-transform ${lightBg}`}
              style={{ top: `${top}px`, height: `${height}px` }}
            >
              <div className="flex h-full">
                <div className={`w-1 shrink-0 ${colorBar}`} />
                <div className="flex-1 px-2.5 py-1.5 min-w-0">
                  <p className={`text-[12px] font-semibold truncate ${textColor}`}>
                    {ev.customer_name || ev.title}
                  </p>
                  {height >= 48 && (
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {formatTimeRange(ev.start_time, ev.end_time)}
                    </p>
                  )}
                  {height >= 64 && ev.job_address && (
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">{ev.job_address}</p>
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
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, i) => {
          const isToday = isSameDay(day, today);
          const key = toDateKey(day);
          const dayEvents = eventsByDate[key] || [];

          return (
            <button
              key={i}
              onClick={() => onDaySelect(day)}
              className="text-center py-1 active:scale-[0.96] transition-transform"
            >
              <p className="text-[10px] font-medium text-gray-400 uppercase">{DAY_NAMES[i]}</p>
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
export function CalendarView({ initialEvents, unscheduledQuotes }: CalendarViewProps) {
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

  const handleEventTap = useCallback((event: CalendarEvent) => {
    setEditingEvent(event);
    setSheetOpen(true);
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
      <header className="sticky top-0 z-10 bg-[#f2f2f7]/90 backdrop-blur-xl border-b border-black/5 px-5 pt-14 pb-3">
        <div className="mx-auto max-w-lg">
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

      <main className="mx-auto max-w-lg px-4 pt-4 space-y-5">
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
        quotes={unscheduledQuotes.map((q) => ({
          id: q.id,
          customer_name: q.customer_name,
          job_address: q.job_address,
        }))}
        editingEvent={editingEvent}
      />
    </>
  );
}
