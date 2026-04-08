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
    .from('events')
    .select(`
      *,
      quotes:quote_id (
        customer_name,
        job_address,
        customer_phone,
        quote_number,
        pipeline_stage,
        total
      ),
      clients:client_id (
        name,
        phone,
        address
      )
    `)
    .eq('contractor_id', user.id)
    .gte('event_date', startStr)
    .lte('event_date', endStr)
    .order('event_date', { ascending: true })
    .order('start_time', { ascending: true });

  // Flatten joined quote/client data onto event
  const calendarEvents: CalendarEvent[] = (events || []).map((e: Record<string, unknown>) => {
    const quote = e.quotes as Record<string, unknown> | null;
    const client = e.clients as Record<string, unknown> | null;
    const { quotes: _q, clients: _c, ...rest } = e;
    return {
      ...rest,
      customer_name: (client?.name as string) ?? (quote?.customer_name as string) ?? undefined,
      job_address: (client?.address as string) ?? (quote?.job_address as string) ?? undefined,
      customer_phone: (client?.phone as string) ?? (quote?.customer_phone as string) ?? undefined,
      quote_number: (quote?.quote_number as number) ?? undefined,
      pipeline_stage: (quote?.pipeline_stage as string) ?? undefined,
      total: (quote?.total as number) ?? undefined,
    } as CalendarEvent;
  });

  // Fetch all active quotes for linking (not just unscheduled)
  const { data: allQuotes } = await supabase
    .from('quotes')
    .select('id, customer_name, job_address, quote_number, status, total, pipeline_stage')
    .eq('contractor_id', user.id)
    .eq('archived', false)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false })
    .limit(50);

  // Filter unscheduled quotes for the "Needs Scheduling" section
  const eventQuoteIds = new Set(
    (events || [])
      .map((e: Record<string, unknown>) => e.quote_id as string | null)
      .filter(Boolean)
  );
  const unscheduledQuotes = (allQuotes || []).filter(
    (q: Record<string, unknown>) =>
      ['approved', 'deposit_paid'].includes(q.status as string) &&
      !eventQuoteIds.has(q.id as string)
  );

  return (
    <PageTransition>
      <DesktopSidebar active="schedule" />
      <div className="min-h-dvh bg-[#f2f2f7] dark:bg-gray-950 pb-28 lg:pb-8 lg:pl-[220px]">
        <CalendarView
          initialEvents={calendarEvents}
          unscheduledQuotes={unscheduledQuotes}
          allQuotes={(allQuotes || []) as { id: string; customer_name: string; job_address: string | null }[]}
        />
        <BottomNav active="more" />
      </div>
    </PageTransition>
  );
}
