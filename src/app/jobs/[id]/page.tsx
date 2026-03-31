import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatQuoteNumber } from '@/lib/format-quote-number';
import PageTransition from '@/components/PageTransition';
import { JobDetailContent } from './JobDetailContent';

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
      <JobDetailContent
        quote={quoteWithDefaults}
        profile={profile}
        brandColor={profile?.brand_color || '#4f46e5'}
      />
    </PageTransition>
  );
}
