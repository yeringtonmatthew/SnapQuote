import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatQuoteNumber } from '@/lib/format-quote-number';
import PageTransition from '@/components/PageTransition';
import DesktopSidebar from '@/components/DesktopSidebar';
import { JobDetailContent } from './JobDetailContent';
import type { Metadata } from 'next';

const capitalize = (s: string) => s.replace(/\b\w/g, (c: string) => c.toUpperCase());

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: quote } = await supabase
    .from('quotes')
    .select('customer_name')
    .eq('id', params.id)
    .single();
  const name = quote?.customer_name ? capitalize(quote.customer_name) : 'Job';
  return { title: `${name} | SnapQuote` };
}

export default async function JobDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: quote } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', params.id)
    .eq('contractor_id', user.id)
    .single();

  if (!quote) notFound();

  const { data: payments } = await supabase
    .from('payments')
    .select('id, amount, payment_type, payment_method, payment_note, recorded_at')
    .eq('quote_id', params.id)
    .order('recorded_at', { ascending: true });

  const totalPaid = (payments || []).reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0);

  const { data: profile } = await supabase
    .from('users')
    .select('business_name, full_name, stripe_account_id, brand_color')
    .eq('id', user.id)
    .single();

  // Default pipeline_stage from status if not set
  const pipelineStage = quote.pipeline_stage || (
    quote.status === 'deposit_paid' ? 'deposit_collected'
    : quote.status === 'sent' || quote.status === 'approved' ? 'quote_sent'
    : 'quote_created'
  );

  const quoteWithDefaults = {
    ...quote,
    pipeline_stage: pipelineStage,
    job_photos: quote.job_photos || [],
    job_notes: quote.job_notes || [],
    job_tasks: quote.job_tasks || [],
  };

  return (
    <PageTransition>
      <DesktopSidebar active="jobs" />
      <div className="lg:pl-[220px]">
        <JobDetailContent
          quote={quoteWithDefaults}
          profile={profile as import('@/types/database').User}
          brandColor={profile?.brand_color || '#4f46e5'}
          totalPaid={totalPaid}
          payments={payments || []}
        />
      </div>
    </PageTransition>
  );
}
