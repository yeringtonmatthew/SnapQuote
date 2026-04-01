import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { CalendarEvent } from '@/types/database';
import { CalendarView } from './CalendarView';
import PageTransition from '@/components/PageTransition';
import BottomNav from '@/components/BottomNav';
import DesktopSidebar from '@/components/DesktopSidebar';

export default async function SchedulePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // Fetch events for current month +/- 1 week padding
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  start.setDate(start.getDate() - 7);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  end.setDate(end.getDate() + 7);

  const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
  const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

  const { data: events } = await supabase
    .from('calendar_events')
    .select(`
      *,
      quotes:quote_id (
        customer_name,
        job_address,
        customer_phone,
        quote_number,
        pipeline_stage,
        total
      )
    `)
    .eq('contractor_id', user.id)
    .gte('event_date', startStr)
    .lte('event_date', endStr)
    .order('event_date', { ascending: true })
    .order('start_time', { ascending: true });

  // Flatten joined quote data onto event
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calendarEvents: CalendarEvent[] = (events || []).map((e: any) => {
    const quote = e.quotes as Record<string, unknown> | null;
    const { quotes: _q, ...rest } = e;
    return {
      ...rest,
      customer_name: (quote?.customer_name as string) ?? undefined,
      job_address: (quote?.job_address as string) ?? undefined,
      customer_phone: (quote?.customer_phone as string) ?? undefined,
      quote_number: (quote?.quote_number as number) ?? undefined,
      pipeline_stage: (quote?.pipeline_stage as string) ?? undefined,
      total: (quote?.total as number) ?? undefined,
    } as CalendarEvent;
  });

  // Fetch approved/deposit_paid quotes that have no calendar events (needs scheduling)
  const { data: needsScheduling } = await supabase
    .from('quotes')
    .select('id, customer_name, job_address, quote_number, status, total, pipeline_stage')
    .eq('contractor_id', user.id)
    .in('status', ['approved', 'deposit_paid'])
    .eq('archived', false)
    .order('created_at', { ascending: false })
    .limit(20);

  // Filter out quotes that already have events
  const eventQuoteIds = new Set(
    (events || [])
      .map((e: Record<string, unknown>) => e.quote_id as string | null)
      .filter(Boolean)
  );
  const unscheduledQuotes = (needsScheduling || []).filter(
    (q: Record<string, unknown>) => !eventQuoteIds.has(q.id as string)
  );

  return (
    <PageTransition>
      <DesktopSidebar active="schedule" />
      <div className="min-h-dvh bg-[#f2f2f7] pb-28 lg:pb-8 lg:pl-[220px]">
        <CalendarView
          initialEvents={calendarEvents}
          unscheduledQuotes={unscheduledQuotes}
        />
        <BottomNav active="schedule" />
      </div>
    </PageTransition>
  );
}
