'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { JobDetailTabs } from '@/components/JobDetailTabs';
import { JobTimeline } from '@/components/JobTimeline';
import { JobTaskList } from '@/components/JobTaskList';
import { JobPhotoManager } from '@/components/JobPhotoManager';
import StagePicker from '@/components/StagePicker';
import type { PipelineStage, Quote } from '@/types/database';
import { formatQuoteNumber } from '@/lib/format-quote-number';

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const stageLabels: Record<string, string> = {
  lead: 'Lead',
  quote_created: 'Quote Created',
  quote_sent: 'Quote Sent',
  deposit_collected: 'Deposit Collected',
  job_scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const stageColors: Record<string, string> = {
  lead: 'bg-gray-100 text-gray-600',
  quote_created: 'bg-slate-100 text-slate-600',
  quote_sent: 'bg-blue-100 text-blue-700',
  deposit_collected: 'bg-green-100 text-green-700',
  job_scheduled: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-emerald-100 text-emerald-700',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  approved: 'bg-amber-100 text-amber-700',
  deposit_paid: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  approved: 'Approved',
  deposit_paid: 'Deposit Paid',
  cancelled: 'Cancelled',
};

interface Props {
  quote: Quote;
  profile: any;
  brandColor: string;
}

export function JobDetailContent({ quote, profile, brandColor }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'quote' | 'job' | 'activity'>('quote');
  const [showStagePicker, setShowStagePicker] = useState(false);
  const [currentStage, setCurrentStage] = useState<PipelineStage>(quote.pipeline_stage);

  const subtotal = Number(quote.subtotal);
  const total = Number(quote.total ?? quote.subtotal);
  const deposit = Number(quote.deposit_amount);
  const balance = total - deposit;
  const hasDiscount = (quote.discount_amount != null && Number(quote.discount_amount) > 0) ||
    (quote.discount_percent != null && Number(quote.discount_percent) > 0);
  const discountDisplay = quote.discount_amount != null && Number(quote.discount_amount) > 0
    ? Number(quote.discount_amount)
    : quote.discount_percent != null && Number(quote.discount_percent) > 0
      ? Math.round(subtotal * (Number(quote.discount_percent) / 100) * 100) / 100
      : 0;
  const hasTax = quote.tax_rate != null && Number(quote.tax_rate) > 0;
  const afterDiscount = Math.round((subtotal - discountDisplay) * 100) / 100;
  const taxAmount = hasTax ? Math.round(afterDiscount * (Number(quote.tax_rate!) / 100) * 100) / 100 : 0;

  async function handleStageChange(stage: PipelineStage) {
    setCurrentStage(stage);
    setShowStagePicker(false);
    try {
      const res = await fetch(`/api/quotes/${quote.id}/pipeline`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipeline_stage: stage }),
      });
      if (!res.ok) {
        setCurrentStage(quote.pipeline_stage);
      } else {
        router.refresh();
      }
    } catch {
      setCurrentStage(quote.pipeline_stage);
    }
  }

  // Pipeline progress dots
  const allStages: PipelineStage[] = ['lead', 'quote_created', 'quote_sent', 'deposit_collected', 'job_scheduled', 'in_progress', 'completed'];
  const currentIdx = allStages.indexOf(currentStage);

  return (
    <div className="min-h-dvh bg-[#f2f2f7]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#f2f2f7]/80 backdrop-blur-xl border-b border-black/5">
        <div className="mx-auto max-w-lg px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/pipeline"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-[17px] font-bold text-gray-900 truncate">{quote.customer_name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                {quote.quote_number && (
                  <span className="text-[11px] text-gray-400">#{formatQuoteNumber(quote.quote_number)}</span>
                )}
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColors[quote.status] || 'bg-gray-100 text-gray-600'}`}>
                  {statusLabels[quote.status] || quote.status}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowStagePicker(true)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${stageColors[currentStage] || 'bg-gray-100 text-gray-600'}`}
            >
              {stageLabels[currentStage] || currentStage}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <JobDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="mx-auto max-w-lg px-4 pb-24">

        {/* ── QUOTE TAB ──────────────────────── */}
        {activeTab === 'quote' && (
          <div className="space-y-3 pt-3">
            {/* Customer Info */}
            <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/[0.04]">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Customer</p>
              <p className="text-[16px] font-semibold text-gray-900">{quote.customer_name}</p>
              <div className="mt-2 space-y-1">
                {quote.customer_phone && (
                  <a href={`tel:${quote.customer_phone}`} className="flex items-center gap-2 text-[14px]" style={{ color: brandColor }}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    {quote.customer_phone}
                  </a>
                )}
                {quote.customer_email && (
                  <a href={`mailto:${quote.customer_email}`} className="flex items-center gap-2 text-[14px]" style={{ color: brandColor }}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    {quote.customer_email}
                  </a>
                )}
                {quote.job_address && (
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(quote.job_address)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[14px]" style={{ color: brandColor }}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {quote.job_address}
                  </a>
                )}
              </div>
            </div>

            {/* Scope */}
            {(quote.scope_of_work || quote.ai_description) && (
              <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/[0.04]">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Scope of Work</p>
                <p className="text-[14px] leading-relaxed text-gray-700">{quote.scope_of_work || quote.ai_description}</p>
              </div>
            )}

            {/* Line Items */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04] overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Line Items</p>
              </div>
              {quote.line_items.map((item: any, i: number) => (
                <div key={i} className={`flex items-start justify-between px-5 py-3 ${i < quote.line_items.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="text-[14px] font-medium text-gray-900">{item.description}</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">{item.quantity} {item.unit} × {fmt(Number(item.unit_price))}</p>
                  </div>
                  <p className="text-[14px] font-semibold text-gray-900 tabular-nums">{fmt(Number(item.total))}</p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <span className="text-[14px] text-gray-500">Subtotal</span>
                <span className="text-[14px] font-semibold text-gray-900 tabular-nums">{fmt(subtotal)}</span>
              </div>
              {hasDiscount && (
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                  <span className="text-[14px] text-gray-500">Discount</span>
                  <span className="text-[14px] font-medium text-red-500 tabular-nums">-{fmt(discountDisplay)}</span>
                </div>
              )}
              {hasTax && (
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                  <span className="text-[14px] text-gray-500">Tax ({quote.tax_rate}%)</span>
                  <span className="text-[14px] font-medium text-gray-700 tabular-nums">{fmt(taxAmount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                <span className="text-[15px] font-bold text-gray-900">Total</span>
                <span className="text-[16px] font-extrabold text-gray-900 tabular-nums">{fmt(total)}</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3" style={{ backgroundColor: brandColor + '0a' }}>
                <span className="text-[14px] font-semibold" style={{ color: brandColor }}>Deposit ({quote.deposit_percent}%)</span>
                <span className="text-[16px] font-bold tabular-nums" style={{ color: brandColor }}>{fmt(deposit)}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2" data-no-print>
              <Link
                href={`/quotes/${quote.id}`}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-[14px] font-semibold text-gray-700 shadow-sm ring-1 ring-black/[0.04] hover:bg-gray-50 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                Edit Quote
              </Link>
              <Link
                href={`/q/${quote.id}`}
                target="_blank"
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[14px] font-semibold text-white shadow-sm transition-colors"
                style={{ backgroundColor: brandColor }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Preview
              </Link>
            </div>

            {/* Quote Photos */}
            {quote.photos && quote.photos.length > 0 && (
              <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/[0.04]">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Quote Photos</p>
                <div className="grid grid-cols-3 gap-2">
                  {quote.photos.map((url: string, i: number) => (
                    <img key={i} src={url} alt={`Photo ${i + 1}`} className="aspect-square rounded-xl object-cover bg-gray-100" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── JOB TAB ──────────────────────── */}
        {activeTab === 'job' && (
          <div className="space-y-3 pt-3">
            {/* Pipeline Progress */}
            <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/[0.04]">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Progress</p>
              <div className="flex items-center gap-1">
                {allStages.map((stage, i) => (
                  <div key={stage} className="flex items-center flex-1">
                    <div
                      className={`h-2 w-full rounded-full transition-colors ${
                        i <= currentIdx ? 'bg-brand-600' : 'bg-gray-200'
                      }`}
                      style={i <= currentIdx ? { backgroundColor: brandColor } : undefined}
                    />
                  </div>
                ))}
              </div>
              <p className="mt-2 text-center text-[12px] font-medium text-gray-500">
                {stageLabels[currentStage]}
              </p>
            </div>

            {/* Schedule */}
            {(quote.scheduled_date || currentStage === 'job_scheduled' || currentStage === 'in_progress') && (
              <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/[0.04]">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Schedule</p>
                {quote.scheduled_date ? (
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    <div>
                      <p className="text-[15px] font-semibold text-gray-900">
                        {new Date(quote.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                      {quote.scheduled_time && (
                        <p className="text-[13px] text-gray-500">{quote.scheduled_time}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-[14px] text-gray-400">No date scheduled yet</p>
                )}
              </div>
            )}

            {/* Tasks */}
            <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/[0.04]">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Tasks</p>
              <JobTaskList quoteId={quote.id} tasks={quote.job_tasks || []} />
            </div>

            {/* Job Photos */}
            <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/[0.04]">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Job Photos</p>
              <JobPhotoManager quoteId={quote.id} jobPhotos={quote.job_photos || []} quotePhotos={quote.photos || []} />
            </div>
          </div>
        )}

        {/* ── ACTIVITY TAB ──────────────────────── */}
        {activeTab === 'activity' && (
          <div className="pt-3">
            <JobTimeline
              quoteId={quote.id}
              notes={quote.job_notes || []}
              createdAt={quote.created_at}
              sentAt={quote.sent_at}
              approvedAt={quote.approved_at}
              paidAt={quote.paid_at}
              startedAt={quote.started_at}
              completedAt={quote.completed_at}
            />
          </div>
        )}
      </div>

      {/* Stage Picker */}
      {showStagePicker && (
        <StagePicker
          currentStage={currentStage}
          onSelect={handleStageChange}
          onClose={() => setShowStagePicker(false)}
        />
      )}
    </div>
  );
}
