import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BottomNav from '@/components/BottomNav';
import DesktopSidebar from '@/components/DesktopSidebar';
import PageTransition from '@/components/PageTransition';
import ClientProfileContent from './ClientProfileContent';

export default async function ClientProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (error || !client) notFound();

  // Fetch client's quotes
  const { data: quotes } = await supabase
    .from('quotes')
    .select(
      'id, customer_name, total, status, pipeline_stage, quote_number, created_at, paid_at, sent_at, scheduled_date, job_address, photos, job_tasks',
    )
    .eq('client_id', params.id)
    .eq('contractor_id', user.id)
    .order('created_at', { ascending: false });

  const clientQuotes = quotes || [];
  const totalRevenue = clientQuotes
    .filter((q) => q.paid_at)
    .reduce((sum, q) => sum + Number(q.total), 0);
  const totalQuoted = clientQuotes.reduce((sum, q) => sum + Number(q.total), 0);

  return (
    <PageTransition>
      <DesktopSidebar active="clients" />
      <div className="min-h-dvh bg-[#f2f2f7] dark:bg-gray-950 pb-28 lg:pb-8 lg:pl-[220px]">
        <ClientProfileContent
          client={client}
          quotes={clientQuotes}
          totalRevenue={totalRevenue}
          totalQuoted={totalQuoted}
        />
        <BottomNav active="search" />
      </div>
    </PageTransition>
  );
}
