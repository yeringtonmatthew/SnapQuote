import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BottomNav from '@/components/BottomNav';
import DesktopSidebar from '@/components/DesktopSidebar';
import PageTransition from '@/components/PageTransition';
import JobsList from '@/components/JobsList';

export default async function JobsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: quotes } = await supabase
    .from('quotes')
    .select(
      'id, customer_name, customer_phone, job_address, total, status, pipeline_stage, quote_number, scheduled_date, job_tasks, created_at, payments(amount)',
    )
    .eq('contractor_id', user.id)
    .neq('status', 'cancelled')
    .eq('archived', false)
    .in('pipeline_stage', [
      'deposit_collected',
      'job_scheduled',
      'in_progress',
      'completed',
    ])
    .order('created_at', { ascending: false });

  // Sort: in_progress first, then job_scheduled, then deposit_collected, then completed
  const stageOrder: Record<string, number> = {
    in_progress: 0,
    job_scheduled: 1,
    deposit_collected: 2,
    completed: 3,
  };

  const sortedQuotes = (quotes || []).map((q) => {
    const pmts = ((q as Record<string, unknown>).payments as { amount: number }[] | null) || [];
    const totalPaid = pmts.reduce((sum, p) => sum + Number(p.amount), 0);
    return {
      id: q.id,
      customer_name: q.customer_name,
      customer_phone: q.customer_phone,
      job_address: q.job_address,
      total: q.total,
      status: q.status,
      pipeline_stage: q.pipeline_stage,
      quote_number: q.quote_number,
      scheduled_date: q.scheduled_date,
      job_tasks: q.job_tasks as { name: string; done: boolean }[] | null,
      created_at: q.created_at,
      total_paid: totalPaid,
    };
  }).sort((a, b) => {
    const aOrder = stageOrder[a.pipeline_stage] ?? 99;
    const bOrder = stageOrder[b.pipeline_stage] ?? 99;
    return aOrder - bOrder;
  });

  return (
    <PageTransition>
      <DesktopSidebar active="jobs" />
      <div className="min-h-dvh bg-[#f2f2f7] dark:bg-gray-950 pb-24 lg:pb-8 lg:pl-[220px]">
        <JobsList jobs={sortedQuotes} />
        <BottomNav active="more" />
      </div>
    </PageTransition>
  );
}
