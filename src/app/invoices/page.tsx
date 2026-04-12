import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BottomNav from '@/components/BottomNav';
import DesktopSidebar from '@/components/DesktopSidebar';
import PageTransition from '@/components/PageTransition';
import InvoicesList from '@/components/InvoicesList';
import type { InvoiceStatus } from '@/types/database';

export const metadata = { title: 'Invoices | SnapQuote', robots: { index: false, follow: false } };

export default async function InvoicesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      id, invoice_number, status, amount_due, amount_paid,
      due_date, sent_at, created_at,
      quotes!inner (
        customer_name, job_address, quote_number
      )
    `)
    .eq('contractor_id', user.id)
    .order('created_at', { ascending: false });

  // Flatten joined fields
  const flat = (invoices || []).map((inv: Record<string, unknown>) => {
    const q = inv.quotes as Record<string, unknown> | null;
    return {
      id: inv.id as string,
      invoice_number: inv.invoice_number as number,
      status: inv.status as InvoiceStatus,
      amount_due: inv.amount_due as number,
      amount_paid: inv.amount_paid as number,
      due_date: inv.due_date as string | null,
      sent_at: inv.sent_at as string | null,
      created_at: inv.created_at as string,
      customer_name: (q?.customer_name as string) ?? null,
      job_address: (q?.job_address as string) ?? null,
      quote_number: (q?.quote_number as number) ?? null,
    };
  });

  return (
    <PageTransition>
      <DesktopSidebar active="invoices" />
      <div className="min-h-dvh bg-[#f2f2f7] dark:bg-gray-950 pb-24 lg:pb-8 lg:pl-[220px]">
        <InvoicesList invoices={flat} />
        <BottomNav active="more" />
      </div>
    </PageTransition>
  );
}
