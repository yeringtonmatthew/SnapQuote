import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BottomNav from '@/components/BottomNav';
import DesktopSidebar from '@/components/DesktopSidebar';
import PageTransition from '@/components/PageTransition';
import PaymentHistory from '@/components/PaymentHistory';
import InvoiceDetailClient from './InvoiceDetailClient';

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      *,
      quotes!inner (
        customer_name, customer_phone, customer_email,
        job_address, quote_number, total, line_items,
        scope_of_work, notes
      )
    `)
    .eq('id', params.id)
    .eq('contractor_id', user.id)
    .single();

  if (error || !invoice) notFound();

  const q = invoice.quotes as Record<string, unknown> | null;

  // Fetch payments for this invoice
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('invoice_id', params.id)
    .order('recorded_at', { ascending: false });

  const flat = {
    ...invoice,
    customer_name: (q?.customer_name as string) ?? null,
    customer_phone: (q?.customer_phone as string) ?? null,
    customer_email: (q?.customer_email as string) ?? null,
    job_address: (q?.job_address as string) ?? null,
    quote_number: (q?.quote_number as number) ?? null,
    total: (q?.total as number) ?? 0,
    line_items: (q?.line_items as Array<{ description: string; quantity: number; unit: string; unit_price: number; total: number }>) ?? [],
    scope_of_work: (q?.scope_of_work as string) ?? null,
    quote_notes: (q?.notes as string) ?? null,
    quotes: undefined,
  };

  return (
    <PageTransition>
      <DesktopSidebar active="invoices" />
      <div className="min-h-dvh bg-[#f2f2f7] dark:bg-gray-950 pb-24 lg:pb-8 lg:pl-[220px]">
        <InvoiceDetailClient invoice={flat} payments={payments || []} />
        <BottomNav active="more" />
      </div>
    </PageTransition>
  );
}
