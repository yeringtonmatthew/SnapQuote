import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import PipelineBoard, { type PipelineColumn } from '@/components/PipelineBoard';
import PipelineHeader from '@/components/PipelineHeader';
import type { PipelineCardProps } from '@/components/PipelineCard';
import BottomNav from '@/components/BottomNav';
import DesktopSidebar from '@/components/DesktopSidebar';
import PageTransition from '@/components/PageTransition';

const COLUMN_DEFS: { stage: string; label: string; color: string }[] = [
  { stage: 'lead', label: 'Lead', color: 'gray-400' },
  { stage: 'quote_created', label: 'Quote Created', color: 'slate-500' },
  { stage: 'quote_sent', label: 'Quote Sent', color: 'blue-500' },
  { stage: 'deposit_collected', label: 'Deposit Collected', color: 'green-500' },
  { stage: 'job_scheduled', label: 'Scheduled', color: 'amber-500' },
  { stage: 'in_progress', label: 'In Progress', color: 'indigo-500' },
  { stage: 'completed', label: 'Completed', color: 'emerald-600' },
];

function mapStatusToStage(status: string): string {
  switch (status) {
    case 'draft':
      return 'quote_created';
    case 'sent':
      return 'quote_sent';
    case 'approved':
      return 'quote_sent';
    case 'deposit_paid':
      return 'deposit_collected';
    default:
      return 'quote_created';
  }
}

export default async function PipelinePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('users')
    .select('business_name')
    .eq('id', user.id)
    .single();

  const { data: quotes } = await supabase
    .from('quotes')
    .select(
      'id, customer_name, customer_phone, job_address, total, status, pipeline_stage, quote_number, photos, scheduled_date, job_tasks, created_at, paid_at, sent_at, reminder_sent_at, notes',
    )
    .eq('contractor_id', user.id)
    .neq('status', 'cancelled')
    .eq('archived', false)
    .order('created_at', { ascending: false });

  const allQuotes = (quotes || []) as PipelineCardProps['quote'][];

  // Build columns, falling back status -> pipeline_stage when pipeline_stage is missing
  const grouped: Record<string, PipelineCardProps['quote'][]> = {};
  for (const def of COLUMN_DEFS) {
    grouped[def.stage] = [];
  }

  for (const q of allQuotes) {
    const stage = q.pipeline_stage || mapStatusToStage(q.status);
    const normalised = { ...q, pipeline_stage: stage };
    if (grouped[stage]) {
      grouped[stage].push(normalised);
    } else {
      grouped['quote_created'].push(normalised);
    }
  }

  const columns: PipelineColumn[] = COLUMN_DEFS.map((def) => ({
    ...def,
    quotes: grouped[def.stage],
  }));

  const isEmpty = allQuotes.length === 0;
  const totalValue = allQuotes.reduce((s, q) => s + Number(q.total), 0);
  const activeCount = allQuotes.length;

  return (
    <PageTransition>
      <DesktopSidebar active="pipeline" />
      <div className="min-h-dvh bg-[#f2f2f7] dark:bg-gray-950 pb-24 lg:pb-8 lg:pl-[220px]">
        {/* Header */}
        <PipelineHeader activeCount={activeCount} totalValue={totalValue} isEmpty={isEmpty} />

        {/* Content */}
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center px-6 pt-28 text-center">
            {/* Illustration */}
            <div className="relative mx-auto mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-950/40 dark:to-brand-900/30">
                <svg
                  className="h-10 w-10 text-brand-500/80"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              {/* Subtle decorative dots */}
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-brand-200/60 dark:bg-brand-800/40" />
              <div className="absolute -bottom-1.5 -left-1.5 h-2 w-2 rounded-full bg-brand-300/40 dark:bg-brand-700/30" />
            </div>
            <h2 className="text-[22px] font-bold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
              Your pipeline is empty
            </h2>
            <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 max-w-[280px] mb-8">
              Create your first quote to start tracking jobs from lead to completion.
            </p>
            <Link
              href="/quotes/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3.5 text-[15px] font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 press-scale"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create Your First Quote
            </Link>
          </div>
        ) : (
          <div className="pt-4">
            <PipelineBoard columns={columns} />
          </div>
        )}

        <BottomNav active="pipeline" />
      </div>
    </PageTransition>
  );
}
