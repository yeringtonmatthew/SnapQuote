import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ScheduleCalendar } from './ScheduleCalendar';
import PageTransition from '@/components/PageTransition';
import BottomNav from '@/components/BottomNav';

export default async function SchedulePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: quotes } = await supabase
    .from('quotes')
    .select('id, customer_name, quote_number, scheduled_date, scheduled_time, job_address, status')
    .eq('contractor_id', user.id)
    .not('scheduled_date', 'is', null)
    .order('scheduled_date', { ascending: true });

  const scheduledJobs = (quotes || []).map((q) => ({
    id: q.id,
    customer_name: q.customer_name,
    quote_number: q.quote_number,
    scheduled_date: q.scheduled_date,
    scheduled_time: q.scheduled_time,
    job_address: q.job_address,
    status: q.status,
  }));

  return (
    <PageTransition>
    <div className="min-h-dvh bg-[#f2f2f7] pb-28">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#f2f2f7]/90 backdrop-blur-xl border-b border-black/5 px-5 pt-14 pb-4">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-gray-900">Schedule</h1>
            <p className="text-[12px] text-gray-400 font-medium">Your upcoming jobs</p>
          </div>
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100"
          >
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-5">
        <ScheduleCalendar jobs={scheduledJobs} />
      </main>

      {/* Bottom Nav */}
      <BottomNav active="schedule" />
    </div>
    </PageTransition>
  );
}
