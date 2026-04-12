import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BottomNav from '@/components/BottomNav';
import DesktopSidebar from '@/components/DesktopSidebar';
import PageTransition from '@/components/PageTransition';
import PaymentsList from '@/components/PaymentsList';

export const metadata = { title: 'Payments | SnapQuote', robots: { index: false, follow: false } };

export default async function PaymentsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: payments } = await supabase
    .from('payments')
    .select(`
      id, amount, payment_type, payment_method, payment_note, recorded_at,
      quotes!inner (
        customer_name, job_address, quote_number, total
      )
    `)
    .eq('contractor_id', user.id)
    .order('recorded_at', { ascending: false });

  // Flatten joined fields
  const flat = (payments || []).map((p: Record<string, unknown>) => {
    const q = p.quotes as Record<string, unknown> | null;
    return {
      id: p.id as string,
      amount: p.amount as number,
      payment_type: p.payment_type as string,
      payment_method: p.payment_method as string,
      payment_note: (p.payment_note as string) ?? null,
      recorded_at: p.recorded_at as string,
      customer_name: (q?.customer_name as string) ?? null,
      job_address: (q?.job_address as string) ?? null,
      quote_number: (q?.quote_number as number) ?? null,
      quote_total: (q?.total as number) ?? null,
    };
  });

  return (
    <PageTransition>
      <DesktopSidebar active="payments" />
      <div className="min-h-dvh bg-[#f2f2f7] dark:bg-gray-950 pb-24 lg:pb-8 lg:pl-[220px]">
        <PaymentsList payments={flat} />
        <BottomNav active="more" />
      </div>
    </PageTransition>
  );
}
