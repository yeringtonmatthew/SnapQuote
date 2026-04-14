import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatQuoteNumber } from '@/lib/format-quote-number';
import { getSchedulingInsights } from '@/lib/scheduling-intelligence';
import AddressActionButton from '@/components/ui/AddressActionButton';
import type { Quote } from '@/types/database';

// ── Event type color mapping ──────────────────────────
const EVENT_TYPE_COLORS: Record<string, { dot: string; border: string }> = {
  job_scheduled: { dot: 'bg-blue-500', border: 'border-l-blue-500' },
  site_visit: { dot: 'bg-violet-500', border: 'border-l-violet-500' },
  estimate: { dot: 'bg-amber-500', border: 'border-l-amber-500' },
  follow_up: { dot: 'bg-orange-500', border: 'border-l-orange-500' },
  meeting: { dot: 'bg-emerald-500', border: 'border-l-emerald-500' },
  reminder: { dot: 'bg-rose-500', border: 'border-l-rose-500' },
  default: { dot: 'bg-gray-400', border: 'border-l-gray-400' },
};

function getEventColor(type: string) {
  return EVENT_TYPE_COLORS[type] || EVENT_TYPE_COLORS.default;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  job_scheduled: 'Job',
  site_visit: 'Site Visit',
  estimate: 'Estimate',
  follow_up: 'Check-In',
  meeting: 'Meeting',
  reminder: 'Reminder',
};

function getEventLabel(type: string) {
  return EVENT_TYPE_LABELS[type] || 'On Calendar';
}

function formatTime(time: string | null): string {
  if (!time) return 'All day';
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

export default async function DashboardScheduleSection({ userId }: { userId: string }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Fetch events and quotes in parallel
  const [eventsResult, quotesResult] = await Promise.all([
    (async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            quotes:quote_id (
              customer_name,
              job_address,
              customer_phone,
              quote_number
            ),
            clients:client_id (
              name,
              phone,
              address
            )
          `)
          .eq('contractor_id', userId)
          .eq('event_date', todayStr)
          .order('start_time', { ascending: true });

        if (!error && data) {
          return data.map((e: Record<string, unknown>) => {
            const quote = e.quotes as Record<string, unknown> | null;
            const client = e.clients as Record<string, unknown> | null;
            return {
              ...e,
              quotes: undefined,
              clients: undefined,
              customer_name: client?.name ?? quote?.customer_name ?? e.title,
              job_address: client?.address ?? quote?.job_address ?? null,
              customer_phone: client?.phone ?? quote?.customer_phone ?? null,
              quote_number: quote?.quote_number ?? null,
            };
          });
        } else if (error) {
          const { data: evData } = await supabase
            .from('events')
            .select(`
              *,
              quotes:quote_id (
                customer_name,
                job_address,
                customer_phone,
                quote_number
              )
            `)
            .eq('contractor_id', userId)
            .eq('event_date', todayStr)
            .order('start_time', { ascending: true });

          if (evData) {
            return evData.map((e: Record<string, unknown>) => {
              const quote = e.quotes as Record<string, unknown> | null;
              return {
                ...e,
                quotes: undefined,
                customer_name: quote?.customer_name ?? e.title,
                job_address: quote?.job_address ?? null,
                customer_phone: quote?.customer_phone ?? null,
                quote_number: quote?.quote_number ?? null,
              };
            });
          }
        }
        return [];
      } catch {
        return [];
      }
    })(),
    supabase
      .from('quotes')
      .select('id, customer_name, customer_phone, customer_email, status, subtotal, total, deposit_amount, deposit_percent, quote_number, created_at, sent_at, approved_at, paid_at, archived, pipeline_stage, scheduled_date, scheduled_time, reminder_sent_at, job_address, expires_at, client_id, started_at, completed_at, payment_method, quote_options, selected_option, photos, scope_of_work, ai_description, job_tasks')
      .eq('contractor_id', userId)
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  const todayEvents: Record<string, unknown>[] = eventsResult;
  const allQuotes = quotesResult.data || [];
  const activeQuotes = allQuotes.filter(q => !q.archived);

  // Merge quote-based scheduled events
  const quotesScheduledToday = activeQuotes.filter(q => q.scheduled_date === todayStr);
  const eventQuoteIds = new Set(todayEvents.map(e => e.quote_id).filter(Boolean));
  const extraScheduleEvents = quotesScheduledToday
    .filter(q => !eventQuoteIds.has(q.id))
    .map(q => ({
      id: `quote-${q.id}`,
      title: q.customer_name,
      event_type: 'job_scheduled',
      event_date: q.scheduled_date,
      start_time: q.scheduled_time || null,
      end_time: null,
      all_day: !q.scheduled_time,
      quote_id: q.id,
      customer_name: q.customer_name,
      job_address: q.job_address || null,
      quote_number: q.quote_number,
    }));
  const allTodayEvents = [...todayEvents, ...extraScheduleEvents];

  // Scheduling Intelligence
  const schedulingInsights = getSchedulingInsights(activeQuotes as unknown as Quote[], now);

  return (
    <>
      {/* Today's Schedule */}
      <section className="lg:col-start-2 lg:row-start-2 lg:row-span-2">
        <div className="mb-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <h2 className="text-[15px] font-bold text-gray-900 dark:text-gray-100">
              Today&apos;s Schedule
            </h2>
            {allTodayEvents.length > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                {allTodayEvents.length}
              </span>
            )}
          </div>
          <Link href="/schedule" className="text-[13px] font-semibold text-brand-600 transition-opacity active:opacity-70 dark:text-brand-400">
            Open Calendar
          </Link>
        </div>

        {allTodayEvents.length > 0 ? (
          <div className="space-y-2">
            {allTodayEvents.map((event: Record<string, unknown>) => {
              const eventType = (event.event_type as string) || 'default';
              const colors = getEventColor(eventType);
              const quoteId = event.quote_id as string | null;
              const address = typeof event.job_address === 'string' ? event.job_address : '';

              return (
                <div key={event.id as string} className={`overflow-hidden rounded-2xl border-l-[3px] bg-white shadow-sm ring-1 ring-black/[0.04] dark:bg-gray-900 dark:ring-white/[0.06] ${colors.border}`}>
                  {quoteId ? (
                    <Link href={`/jobs/${quoteId}`} className="block px-5 pb-3.5 pt-4 active:bg-gray-50 transition-colors dark:active:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-[16px] font-semibold text-gray-900 dark:text-gray-100">
                            {(event.customer_name as string) || (event.title as string)}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                              {getEventLabel(eventType)}
                            </span>
                            {(event.quote_number as number | null) && (
                              <span className="text-[12px] text-gray-400 dark:text-gray-500 tabular-nums">
                                {formatQuoteNumber(event.quote_number as number)}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="whitespace-nowrap text-[13px] font-semibold text-gray-400 tabular-nums dark:text-gray-500">
                          {formatTime(event.start_time as string | null)}
                        </span>
                        <svg className="h-4 w-4 text-gray-300 dark:text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    </Link>
                  ) : (
                    <div className="px-5 pb-3.5 pt-4">
                      <div className="flex items-center gap-3">
                        <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
                        <p className="flex-1 truncate text-[16px] font-semibold text-gray-900 dark:text-gray-100">
                          {(event.customer_name as string) || (event.title as string)}
                        </p>
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          {getEventLabel(eventType)}
                        </span>
                        <span className="whitespace-nowrap text-[13px] font-semibold text-gray-400 tabular-nums dark:text-gray-500">
                          {formatTime(event.start_time as string | null)}
                        </span>
                      </div>
                    </div>
                  )}
                  {address && (
                    <AddressActionButton
                      address={address}
                      className="ml-[23px] flex items-center gap-1.5 px-5 pb-4 pt-0 text-[13px] text-brand-600 active:text-brand-700 dark:text-brand-400"
                      copiedMessage="Address copied"
                      sheetTitle="Directions"
                    >
                      <svg className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span className="truncate underline underline-offset-2">{address}</span>
                    </AddressActionButton>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] px-5 py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
              <svg className="h-6 w-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <p className="text-[15px] font-medium text-gray-500 dark:text-gray-400">Nothing on the calendar today</p>
            <Link href="/schedule" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all active:scale-[0.97]">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Open Calendar
            </Link>
          </div>
        )}
      </section>

      {/* Scheduling Intelligence */}
      {schedulingInsights.length > 0 && (
        <section className="lg:col-start-2">
          <h2 className="mb-3 px-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-gray-400">
            Plan Ahead
          </h2>
          <div className="space-y-2">
            {schedulingInsights.slice(0, 3).map((insight, idx) => {
              const iconMap: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
                unscheduled_paid: {
                  bg: 'bg-amber-50 dark:bg-amber-900/20',
                  text: 'text-amber-600 dark:text-amber-400',
                  icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>,
                },
                same_day_cluster: {
                  bg: 'bg-blue-50 dark:bg-blue-900/20',
                  text: 'text-blue-600 dark:text-blue-400',
                  icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
                },
                gap_day: {
                  bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                  text: 'text-emerald-600 dark:text-emerald-400',
                  icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
                },
              };
              const style = iconMap[insight.type] || iconMap.gap_day;
              return (
                <div
                  key={`sched-${idx}`}
                  className="flex items-start gap-3 rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] px-4 py-3"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${style.bg} ${style.text}`}>
                    {style.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100">{insight.headline}</p>
                    <p className="mt-1 text-[13px] text-gray-500 dark:text-gray-400">{insight.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
