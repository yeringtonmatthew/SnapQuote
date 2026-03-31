import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ScheduleCalendar } from './ScheduleCalendar';
import PageTransition from '@/components/PageTransition';

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
      <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/60 px-4 pb-6 pt-2">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 rounded-xl press-scale focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11.47 3.841a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.061l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.689z" />
                <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.432z" />
              </svg>
            </div>
            <span className="text-[10px] font-semibold text-gray-400">Home</span>
          </Link>

          <Link href="/schedule" aria-current="page" className="flex flex-col items-center gap-1 rounded-xl press-scale focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <span className="text-[10px] font-semibold text-brand-600">Schedule</span>
          </Link>

          <Link href="/quotes/new" aria-label="Create new quote" className="flex flex-col items-center gap-1 -mt-5 rounded-full press-scale focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 shadow-lg shadow-brand-500/30">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="text-[10px] font-semibold text-gray-400">Quote</span>
          </Link>

          <Link href="/settings" className="flex flex-col items-center gap-1 rounded-xl press-scale focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <span className="text-[10px] font-semibold text-gray-400">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
    </PageTransition>
  );
}
