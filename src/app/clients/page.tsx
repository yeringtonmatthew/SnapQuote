import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import BottomNav from '@/components/BottomNav';
import DesktopSidebar from '@/components/DesktopSidebar';
import PageTransition from '@/components/PageTransition';
import ClientsListContent from './ClientsListContent';

export default async function ClientsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // Fetch all clients
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true });

  // Fetch quote counts + revenue per client
  const { data: quotes } = await supabase
    .from('quotes')
    .select('client_id, total, paid_at')
    .eq('contractor_id', user.id)
    .not('client_id', 'is', null);

  // Build stats map
  const statsMap: Record<string, { count: number; revenue: number }> = {};
  for (const q of quotes || []) {
    if (!q.client_id) continue;
    if (!statsMap[q.client_id]) statsMap[q.client_id] = { count: 0, revenue: 0 };
    statsMap[q.client_id].count++;
    if (q.paid_at) statsMap[q.client_id].revenue += Number(q.total);
  }

  const enrichedClients = (clients || []).map((c) => ({
    ...c,
    job_count: statsMap[c.id]?.count || 0,
    total_revenue: statsMap[c.id]?.revenue || 0,
  }));

  return (
    <PageTransition>
      <DesktopSidebar active="clients" />
      <div className="min-h-dvh bg-[#f2f2f7] dark:bg-gray-950 pb-24 lg:pb-8 lg:pl-[220px]">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[#f2f2f7]/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-5 pt-14 lg:pt-6 pb-4">
          <div className="mx-auto max-w-7xl flex items-center justify-between">
            <div>
              <h1 className="text-[28px] font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Clients
              </h1>
              {enrichedClients.length > 0 && (
                <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {enrichedClients.length} client{enrichedClients.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </header>

        <ClientsListContent clients={enrichedClients} />

        <BottomNav active="clients" />
      </div>
    </PageTransition>
  );
}
