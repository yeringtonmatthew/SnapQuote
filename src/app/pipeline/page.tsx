import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import PipelineBoard, { type PipelineColumn } from '@/components/PipelineBoard';
import type { PipelineCardProps } from '@/components/PipelineCard';
import BottomNav from '@/components/BottomNav';
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
      'id, customer_name, job_address, total, status, pipeline_stage, quote_number, photos, scheduled_date, job_tasks, created_at, paid_at',
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

  return (
    <PageTransition>
      <div className="min-h-dvh bg-[#f2f2f7] dark:bg-gray-950 pb-24">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[#f2f2f7]/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-5 pt-14 pb-4">
          <div className="mx-auto max-w-5xl flex items-center justify-between">
            <h1 className="text-[28px] font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Pipeline
            </h1>
            <div className="flex items-center gap-2">
              <Link
                href="/quotes/new"
                className="flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm press-scale transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New Quote
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center px-6 pt-32 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="4" height="16" rx="1" stroke="currentColor" />
                <rect x="10" y="4" width="4" height="12" rx="1" stroke="currentColor" />
                <rect x="17" y="4" width="4" height="8" rx="1" stroke="currentColor" />
              </svg>
            </div>
            <h2 className="text-[20px] font-bold text-gray-900 dark:text-gray-100 mb-1">
              Your pipeline is empty
            </h2>
            <p className="text-[14px] text-gray-500 max-w-xs mb-6">
              Create your first quote to start tracking jobs through your pipeline.
            </p>
            <Link
              href="/quotes/new"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-[15px] font-semibold text-white hover:bg-brand-700 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
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
