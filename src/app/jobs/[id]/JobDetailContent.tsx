'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { JobDetailTabs } from '@/components/JobDetailTabs';
import { JobTimeline } from '@/components/JobTimeline';
import { JobTaskList } from '@/components/JobTaskList';
import { JobPhotoManager } from '@/components/JobPhotoManager';
import StagePicker from '@/components/StagePicker';
import { BeforeAfterGenerator } from '@/components/BeforeAfterGenerator';
import { SmartFollowUpButton } from '@/components/SmartFollowUpButton';
import type { PipelineStage, Quote, JobPhoto } from '@/types/database';
import { formatQuoteNumber } from '@/lib/format-quote-number';
import { haptic } from '@/lib/haptic';
import { getLeadScore, temperatureStyles } from '@/lib/lead-temperature';

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const stageLabels: Record<string, string> = {
  lead: 'Lead',
  follow_up: 'Follow Up',
  quote_created: 'Quote Created',
  quote_sent: 'Quote Sent',
  deposit_collected: 'Deposit Collected',
  job_scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const stageDotColors: Record<string, string> = {
  lead: 'bg-gray-400',
  follow_up: 'bg-orange-500',
  quote_created: 'bg-slate-400',
  quote_sent: 'bg-blue-500',
  deposit_collected: 'bg-green-500',
  job_scheduled: 'bg-amber-500',
  in_progress: 'bg-indigo-500',
  completed: 'bg-emerald-500',
};

const stageTextColors: Record<string, string> = {
  lead: 'text-gray-600',
  follow_up: 'text-orange-600',
  quote_created: 'text-slate-600',
  quote_sent: 'text-blue-600',
  deposit_collected: 'text-green-600',
  job_scheduled: 'text-amber-600',
  in_progress: 'text-indigo-600',
  completed: 'text-emerald-600',
};

const stageTrackColors: Record<string, string> = {
  lead: 'bg-gray-400',
  follow_up: 'bg-orange-500',
  quote_created: 'bg-slate-400',
  quote_sent: 'bg-blue-500',
  deposit_collected: 'bg-green-500',
  job_scheduled: 'bg-amber-500',
  in_progress: 'bg-indigo-500',
  completed: 'bg-emerald-500',
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
  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const [onMyWaySending, setOnMyWaySending] = useState(false);
  const [onMyWaySent, setOnMyWaySent] = useState(false);

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

  const leadScore = getLeadScore(quote as unknown as Quote);
  const tempStyle = temperatureStyles[leadScore.temperature];

  const beforePhotos = (quote.job_photos || []).filter((p: JobPhoto) => p.category === 'before');
  const afterPhotos = (quote.job_photos || []).filter((p: JobPhoto) => p.category === 'after');

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

  // ── Schedule bottom sheet state ──
  const [showScheduleSheet, setShowScheduleSheet] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(quote.scheduled_date || '');
  const [scheduleTime, setScheduleTime] = useState(quote.scheduled_time || '');
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [localScheduledDate, setLocalScheduledDate] = useState(quote.scheduled_date);
  const [localScheduledTime, setLocalScheduledTime] = useState(quote.scheduled_time);

  // ── Stage advance handler ──
  const [isAdvancing, setIsAdvancing] = useState(false);

  const advanceStage = useCallback(async (newStage: PipelineStage) => {
    setIsAdvancing(true);
    haptic('medium');
    const prevStage = currentStage;
    setCurrentStage(newStage);
    try {
      const res = await fetch(`/api/quotes/${quote.id}/pipeline`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipeline_stage: newStage }),
      });
      if (!res.ok) {
        setCurrentStage(prevStage);
      } else {
        router.refresh();
      }
    } catch {
      setCurrentStage(prevStage);
    } finally {
      setIsAdvancing(false);
    }
  }, [currentStage, quote.id, router]);

  const handleOnMyWay = useCallback(async () => {
    if (onMyWaySending || onMyWaySent) return;
    setOnMyWaySending(true);
    haptic('medium');
    try {
      const res = await fetch(`/api/quotes/${quote.id}/on-my-way`, { method: 'POST' });
      if (res.ok) {
        setOnMyWaySent(true);
        haptic('heavy');
        setTimeout(() => setOnMyWaySent(false), 5000);
      }
    } catch {
      // silent
    } finally {
      setOnMyWaySending(false);
    }
  }, [onMyWaySending, onMyWaySent, quote.id]);

  const handleSaveSchedule = useCallback(async () => {
    if (!scheduleDate) return;
    setIsSavingSchedule(true);
    haptic('light');
    try {
      const res = await fetch(`/api/quotes/${quote.id}/schedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduled_date: scheduleDate, scheduled_time: scheduleTime || null }),
      });
      if (res.ok) {
        setLocalScheduledDate(scheduleDate);
        setLocalScheduledTime(scheduleTime || null);
        setShowScheduleSheet(false);
        haptic('medium');
        router.refresh();
      }
    } catch {
      // silent
    } finally {
      setIsSavingSchedule(false);
    }
  }, [scheduleDate, scheduleTime, quote.id, router]);

  // ── Review request state ──
  const [isRequestingReview, setIsRequestingReview] = useState(false);
  const [reviewRequested, setReviewRequested] = useState(!!quote.review_requested_at);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const handleRequestReview = useCallback(async () => {
    setIsRequestingReview(true);
    setReviewError(null);
    haptic('medium');
    try {
      const res = await fetch(`/api/quotes/${quote.id}/request-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error || 'Failed to send review request');
      } else {
        setReviewRequested(true);
        haptic('medium');
      }
    } catch {
      setReviewError('Something went wrong. Please try again.');
    } finally {
      setIsRequestingReview(false);
    }
  }, [quote.id]);

  // ── Next action logic ──
  type NextAction = {
    icon: React.ReactNode;
    headline: string;
    description: string;
    actionLabel: string;
    actionHref?: string;
    actionHandler?: () => void;
    borderColor: string;
    bgColor: string;
    textColor: string;
    btnBg: string;
    btnText: string;
  };

  function getNextAction(): NextAction | null {
    const daysSinceSent = quote.sent_at
      ? Math.floor((Date.now() - new Date(quote.sent_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const tasksDone = (quote.job_tasks || []).filter((t) => t.done).length;
    const tasksTotal = (quote.job_tasks || []).length;

    switch (currentStage) {
      case 'lead':
        return {
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          ),
          headline: 'Send Quote',
          description: 'Create and send a quote to move this lead forward.',
          actionLabel: 'Edit Quote',
          actionHref: `/quotes/${quote.id}`,
          borderColor: 'border-l-blue-500',
          bgColor: 'bg-blue-50/50',
          textColor: 'text-blue-700',
          btnBg: 'bg-blue-500',
          btnText: 'text-white',
        };

      case 'quote_created':
        return {
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          ),
          headline: 'Send Quote',
          description: 'This quote is ready — send it to the customer.',
          actionLabel: 'Send Quote',
          actionHref: `/quotes/${quote.id}`,
          borderColor: 'border-l-blue-500',
          bgColor: 'bg-blue-50/50',
          textColor: 'text-blue-700',
          btnBg: 'bg-blue-500',
          btnText: 'text-white',
        };

      case 'quote_sent':
        if (quote.status === 'approved') {
          return {
            icon: (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            ),
            headline: 'Collect Deposit',
            description: 'Quote approved — share the proposal to collect payment.',
            actionLabel: 'Share Proposal',
            actionHref: `/q/${quote.id}`,
            borderColor: 'border-l-green-500',
            bgColor: 'bg-green-50/50',
            textColor: 'text-green-700',
            btnBg: 'bg-green-500',
            btnText: 'text-white',
          };
        }
        return {
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
          ),
          headline: 'Follow Up',
          description: `${daysSinceSent} day${daysSinceSent !== 1 ? 's' : ''} since sent — follow up with the customer.`,
          actionLabel: 'Call',
          actionHref: quote.customer_phone ? `tel:${quote.customer_phone}` : undefined,
          borderColor: 'border-l-amber-500',
          bgColor: 'bg-amber-50/50',
          textColor: 'text-amber-700',
          btnBg: 'bg-amber-500',
          btnText: 'text-white',
        };

      case 'deposit_collected':
        return {
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          ),
          headline: 'Schedule Job',
          description: 'Deposit collected — schedule the job with the customer.',
          actionLabel: 'Schedule',
          actionHandler: () => setShowScheduleSheet(true),
          borderColor: 'border-l-indigo-500',
          bgColor: 'bg-indigo-50/50',
          textColor: 'text-indigo-700',
          btnBg: 'bg-indigo-500',
          btnText: 'text-white',
        };

      case 'job_scheduled':
        return {
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
          ),
          headline: 'Start Job',
          description: localScheduledDate
            ? `Scheduled for ${new Date(localScheduledDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}${localScheduledTime ? ` at ${localScheduledTime}` : ''}`
            : 'Move to In Progress when you begin work.',
          actionLabel: 'Start Job',
          actionHandler: () => advanceStage('in_progress'),
          borderColor: 'border-l-indigo-500',
          bgColor: 'bg-indigo-50/50',
          textColor: 'text-indigo-700',
          btnBg: 'bg-indigo-500',
          btnText: 'text-white',
        };

      case 'in_progress':
        return {
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          headline: 'Complete Job',
          description: tasksTotal > 0
            ? `${tasksDone}/${tasksTotal} tasks done — upload photos and mark complete.`
            : 'Upload completion photos and mark complete.',
          actionLabel: 'Mark Complete',
          actionHandler: () => advanceStage('completed'),
          borderColor: 'border-l-purple-500',
          bgColor: 'bg-purple-50/50',
          textColor: 'text-purple-700',
          btnBg: 'bg-purple-500',
          btnText: 'text-white',
        };

      case 'completed':
        return {
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          headline: 'All Done',
          description: balance > 0 ? `Collect remaining balance of ${fmt(balance)}.` : 'This job is complete.',
          actionLabel: balance > 0 ? 'Share Invoice' : 'Done',
          actionHref: balance > 0 ? `/q/${quote.id}` : undefined,
          borderColor: 'border-l-green-500',
          bgColor: 'bg-green-50/50',
          textColor: 'text-green-700',
          btnBg: 'bg-green-500',
          btnText: 'text-white',
        };

      default:
        return null;
    }
  }

  const nextAction = getNextAction();

  const allStages: PipelineStage[] = ['lead', 'follow_up', 'quote_created', 'quote_sent', 'deposit_collected', 'job_scheduled', 'in_progress', 'completed'];
  const currentIdx = allStages.indexOf(currentStage);

  return (
    <div className="min-h-dvh bg-[#f2f2f7]">
      {/* ── HEADER COMMAND CENTER ──────────────────────── */}
      <div className="sticky top-0 z-10 bg-[#f2f2f7]/80 backdrop-blur-xl">
        {/* Top bar: back + quote number + status */}
        <div className="mx-auto max-w-lg lg:max-w-6xl px-4 pt-3 pb-0">
          <div className="flex items-center justify-between">
            <Link
              href="/pipeline"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 shadow-sm ring-1 ring-black/[0.04] active:scale-95 transition-all"
            >
              <svg className="h-[18px] w-[18px] text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>
            <div className="flex items-center gap-2">
              {quote.quote_number && (
                <span className="text-[12px] font-medium text-gray-400 tabular-nums">#{formatQuoteNumber(quote.quote_number)}</span>
              )}
              <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 ring-1 ring-black/[0.04]">
                {statusLabels[quote.status] || quote.status}
              </span>
            </div>
          </div>
        </div>

        {/* Customer name + address + value + stage */}
        <div className="mx-auto max-w-lg lg:max-w-6xl px-4 pt-3 pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-[22px] font-bold tracking-tight text-gray-900 truncate leading-tight">
                {quote.customer_name}
              </h1>
              {quote.job_address && (
                <p className="mt-0.5 text-[13px] text-gray-400 truncate">{quote.job_address}</p>
              )}
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${tempStyle.bg} ${tempStyle.text} ring-1 ${tempStyle.ring}`}>
                  {tempStyle.icon} {leadScore.label} · {leadScore.score}
                </span>
                <span className="text-[11px] text-gray-400">{leadScore.reason}</span>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <p className="text-[22px] font-bold tracking-tight text-gray-900 tabular-nums leading-tight">
                {fmt(total)}
              </p>
              <button
                onClick={() => setShowStagePicker(true)}
                className="mt-1 flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 ring-1 ring-black/[0.04] active:scale-95 transition-all"
              >
                <span className={`h-2 w-2 rounded-full ${stageDotColors[currentStage] || 'bg-gray-400'}`} />
                <span className={`text-[11px] font-semibold ${stageTextColors[currentStage] || 'text-gray-600'}`}>
                  {stageLabels[currentStage] || currentStage}
                </span>
                <svg className="h-3 w-3 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Quick-action bar */}
        <div className="mx-auto max-w-lg lg:max-w-6xl px-4 pt-1 pb-3">
          <div className="flex items-center justify-around lg:justify-start lg:gap-8">
            {/* Call */}
            {quote.customer_phone ? (
              <a href={`tel:${quote.customer_phone}`} className="flex flex-col items-center gap-1 group">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/[0.04] group-active:scale-95 transition-all">
                  <svg className="h-[18px] w-[18px] text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </span>
                <span className="text-[11px] font-medium text-gray-500">Call</span>
              </a>
            ) : (
              <div className="flex flex-col items-center gap-1 opacity-30">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/[0.04]">
                  <svg className="h-[18px] w-[18px] text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </span>
                <span className="text-[10px] font-medium text-gray-400">Call</span>
              </div>
            )}

            {/* Text */}
            {quote.customer_phone ? (
              <a href={`sms:${quote.customer_phone}`} className="flex flex-col items-center gap-1 group">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/[0.04] group-active:scale-95 transition-all">
                  <svg className="h-[18px] w-[18px] text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </span>
                <span className="text-[11px] font-medium text-gray-500">Text</span>
              </a>
            ) : (
              <div className="flex flex-col items-center gap-1 opacity-30">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/[0.04]">
                  <svg className="h-[18px] w-[18px] text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </span>
                <span className="text-[10px] font-medium text-gray-400">Text</span>
              </div>
            )}

            {/* Photos */}
            <button
              onClick={() => setActiveTab('job')}
              className="flex flex-col items-center gap-1 group"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/[0.04] group-active:scale-95 transition-all">
                <svg className="h-[18px] w-[18px] text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
              </span>
              <span className="text-[11px] font-medium text-gray-500">Photos</span>
            </button>

            {/* Proposal */}
            <Link
              href={`/q/${quote.id}`}
              target="_blank"
              className="flex flex-col items-center gap-1 group"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/[0.04] group-active:scale-95 transition-all">
                <svg className="h-[18px] w-[18px] text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </span>
              <span className="text-[11px] font-medium text-gray-500">Proposal</span>
            </Link>

            {/* Invoice */}
            {quote.status !== 'draft' && (
              <button
                onClick={() => {
                  const url = `${window.location.origin}/invoice/${quote.id}`;
                  navigator.clipboard.writeText(url).then(() => {
                    setCopiedInvoice(true);
                    haptic('light');
                    setTimeout(() => setCopiedInvoice(false), 2000);
                  });
                }}
                className="flex flex-col items-center gap-1 group"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/[0.04] group-active:scale-95 transition-all">
                  {copiedInvoice ? (
                    <svg className="h-[18px] w-[18px] text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg className="h-[18px] w-[18px] text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  )}
                </span>
                <span className="text-[11px] font-medium text-gray-500">
                  {copiedInvoice ? 'Copied!' : 'Invoice'}
                </span>
              </button>
            )}

            {/* Navigate */}
            {quote.job_address ? (
              <a
                href={`https://maps.apple.com/?daddr=${encodeURIComponent(quote.job_address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 group"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/[0.04] group-active:scale-95 transition-all">
                  <svg className="h-[18px] w-[18px] text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                  </svg>
                </span>
                <span className="text-[11px] font-medium text-gray-500">Navigate</span>
              </a>
            ) : null}

            {/* On My Way */}
            {quote.customer_phone && (currentStage === 'job_scheduled' || currentStage === 'in_progress') && (
              <button
                onClick={handleOnMyWay}
                disabled={onMyWaySending}
                className="flex flex-col items-center gap-1 group"
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-full shadow-sm ring-1 ring-black/[0.04] group-active:scale-95 transition-all ${onMyWaySent ? 'bg-green-50' : 'bg-white'}`}>
                  {onMyWaySent ? (
                    <svg className="h-[18px] w-[18px] text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : onMyWaySending ? (
                    <svg className="h-[18px] w-[18px] text-brand-600 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="h-[18px] w-[18px] text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                  )}
                </span>
                <span className="text-[11px] font-medium text-gray-500">
                  {onMyWaySent ? 'Sent!' : 'On My Way'}
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="h-px bg-black/5" />
      </div>

      {/* ── NEXT ACTION + SCHEDULE (side by side on desktop) ──────────────────────── */}
      <div className="mx-auto max-w-lg lg:max-w-6xl px-4 pt-3 lg:grid lg:grid-cols-[1fr_1fr] lg:gap-4 space-y-2 lg:space-y-0">
      {/* ── NEXT ACTION CARD ──────────────────────── */}
      {nextAction && (
        <div>
          <div className={`rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04] border-l-[3px] ${nextAction.borderColor} overflow-hidden`}>
            <div className="flex items-start gap-3 px-4 py-3.5">
              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${nextAction.bgColor} ${nextAction.textColor}`}>
                {nextAction.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-[14px] font-semibold ${nextAction.textColor}`}>{nextAction.headline}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-gray-500">{nextAction.description}</p>
              </div>
            </div>
            <div className="px-4 pb-3.5">
              {nextAction.actionHref ? (
                <Link
                  href={nextAction.actionHref}
                  target={nextAction.actionHref.startsWith('/q/') ? '_blank' : undefined}
                  className={`flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-[13px] font-semibold ${nextAction.btnBg} ${nextAction.btnText} active:scale-[0.98] transition-all`}
                >
                  {nextAction.actionLabel}
                </Link>
              ) : nextAction.actionHandler ? (
                <button
                  onClick={nextAction.actionHandler}
                  disabled={isAdvancing}
                  className={`flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-[13px] font-semibold ${nextAction.btnBg} ${nextAction.btnText} active:scale-[0.98] transition-all disabled:opacity-60`}
                >
                  {isAdvancing ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Updating...
                    </span>
                  ) : nextAction.actionLabel}
                </button>
              ) : (
                <div className={`flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-[13px] font-semibold ${nextAction.bgColor} ${nextAction.textColor}`}>
                  {nextAction.actionLabel}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Smart Follow-Up — shown for quote_sent stage */}
      {currentStage === 'quote_sent' && quote.status === 'sent' && (
        <div>
          <SmartFollowUpButton
            quoteId={quote.id}
            customerName={quote.customer_name}
            customerPhone={quote.customer_phone}
            brandColor={brandColor}
          />
        </div>
      )}

      {/* Request Google Review — shown for completed stage */}
      {currentStage === 'completed' && (
        <div>
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04] border-l-[3px] border-l-amber-400 overflow-hidden">
            <div className="flex items-start gap-3 px-4 py-3.5">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-amber-700">
                  {reviewRequested ? 'Review Request Sent' : 'Request Google Review'}
                </p>
                <p className="mt-0.5 text-[13px] leading-snug text-gray-500">
                  {reviewRequested
                    ? `Review request sent to ${quote.customer_name}.`
                    : `Ask ${quote.customer_name} to leave a Google review via text and email.`
                  }
                </p>
                {reviewError && (
                  <p className="mt-1 text-[12px] text-red-500">{reviewError}</p>
                )}
              </div>
            </div>
            <div className="px-4 pb-3.5">
              {reviewRequested ? (
                <button
                  onClick={handleRequestReview}
                  disabled={isRequestingReview}
                  className="flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-[13px] font-semibold bg-gray-100 text-gray-600 active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {isRequestingReview ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </span>
                  ) : 'Send Again'}
                </button>
              ) : (
                <button
                  onClick={handleRequestReview}
                  disabled={isRequestingReview}
                  className="flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-[13px] font-semibold bg-amber-500 text-white active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {isRequestingReview ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </span>
                  ) : 'Request Review'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SCHEDULE ROW ──────────────────────── */}
      <div>
        <div className="flex items-center justify-between rounded-xl bg-white/60 px-3.5 py-2.5 ring-1 ring-black/[0.04]">
          <div className="flex items-center gap-2.5">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            {localScheduledDate ? (
              <p className="text-[13px] font-medium text-gray-700">
                {new Date(localScheduledDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                {localScheduledTime && (
                  <span className="text-gray-400"> at {localScheduledTime}</span>
                )}
              </p>
            ) : (
              <p className="text-[13px] text-gray-400">Not yet scheduled</p>
            )}
          </div>
          <button
            onClick={() => setShowScheduleSheet(true)}
            className="text-[12px] font-semibold text-indigo-500 active:opacity-70 transition-opacity"
          >
            {localScheduledDate ? 'Change' : 'Schedule'}
          </button>
        </div>
      </div>
      </div>{/* end next action + schedule grid */}

      {/* Tabs */}
      <JobDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="mx-auto max-w-lg lg:max-w-6xl px-4 pb-24">
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8">
        {/* Left column: active tab content */}
        <div>

        {/* ── QUOTE TAB ──────────────────────── */}
        {activeTab === 'quote' && (
          <div className="space-y-3 pt-3">
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
                <div
                  key={i}
                  className={`flex items-start justify-between px-5 py-3 ${
                    i % 2 === 1 ? 'bg-gray-50/50' : ''
                  } ${i < quote.line_items.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="text-[14px] font-medium text-gray-900">{item.description}</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">{item.quantity} {item.unit} x {fmt(Number(item.unit_price))}</p>
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
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <span className="text-[15px] font-bold text-gray-900">Total</span>
                <span className="text-[17px] font-extrabold text-gray-900 tabular-nums">{fmt(total)}</span>
              </div>
              {/* Deposit row with colored left-border accent */}
              <div className="flex items-center justify-between px-5 py-3.5 border-l-[3px]" style={{ borderLeftColor: brandColor }}>
                <span className="text-[14px] font-semibold text-gray-700">
                  Deposit
                  <span className="ml-1 text-gray-400 font-normal">({quote.deposit_percent}%)</span>
                </span>
                <span className="text-[16px] font-bold tabular-nums" style={{ color: brandColor }}>{fmt(deposit)}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2" data-no-print>
              <Link
                href={`/quotes/${quote.id}`}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-[14px] font-semibold text-gray-700 shadow-sm ring-1 ring-black/[0.04] active:scale-[0.98] transition-all"
              >
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                Edit Quote
              </Link>
              <Link
                href={`/q/${quote.id}`}
                target="_blank"
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-[14px] font-semibold text-white shadow-sm active:scale-[0.98] transition-all"
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
            {/* Stepped Pipeline Progress */}
            <div className="rounded-2xl bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.04]">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Progress</p>
              <div className="flex items-center">
                {allStages.map((stage, i) => {
                  const isCompleted = i < currentIdx;
                  const isCurrent = i === currentIdx;
                  return (
                    <div key={stage} className="flex items-center flex-1 last:flex-none">
                      {/* Step circle */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div
                          className={`flex h-[22px] w-[22px] items-center justify-center rounded-full transition-all duration-300 ${
                            isCompleted
                              ? `${stageDotColors[currentStage]} border-2 border-transparent`
                              : isCurrent
                                ? `bg-white border-2 ${stageDotColors[currentStage]?.replace('bg-', 'border-') || 'border-gray-400'} shadow-[0_0_0_3px_rgba(0,0,0,0.04)]`
                                : 'bg-white border-2 border-gray-200'
                          }`}
                        >
                          {isCompleted && (
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                          {isCurrent && (
                            <div className={`h-2.5 w-2.5 rounded-full ${stageDotColors[currentStage] || 'bg-gray-400'}`} />
                          )}
                        </div>
                      </div>
                      {/* Connecting line (not after last) */}
                      {i < allStages.length - 1 && (
                        <div className="flex-1 h-[2px] mx-0.5">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              i < currentIdx
                                ? (stageTrackColors[currentStage] || 'bg-gray-400')
                                : 'bg-gray-200'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className={`mt-3 text-center text-[13px] font-semibold ${stageTextColors[currentStage] || 'text-gray-600'}`}>
                {stageLabels[currentStage]}
              </p>
            </div>

            {/* Schedule */}
            {(quote.scheduled_date || currentStage === 'job_scheduled' || currentStage === 'in_progress') && (
              <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/[0.04]">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Schedule</p>
                {quote.scheduled_date ? (
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-black/[0.04]">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                    </span>
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

            {/* Tasks — no double-wrapping */}
            <div className="space-y-1">
              <p className="px-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Tasks</p>
              <JobTaskList quoteId={quote.id} tasks={quote.job_tasks || []} />
            </div>

            {/* Job Photos — no double-wrapping */}
            <div className="space-y-1">
              <p className="px-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Job Photos</p>
              <JobPhotoManager quoteId={quote.id} jobPhotos={quote.job_photos || []} quotePhotos={quote.photos || []} />
            </div>

            {/* Before & After */}
            {(currentStage === 'completed' || currentStage === 'in_progress') &&
             beforePhotos.length > 0 && afterPhotos.length > 0 && (
              <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/[0.04]">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Before & After</p>
                <BeforeAfterGenerator
                  beforePhotos={beforePhotos}
                  afterPhotos={afterPhotos}
                  jobDescription={quote.scope_of_work || quote.ai_description || 'Job completed'}
                  businessName={profile?.business_name || ''}
                />
              </div>
            )}
          </div>
        )}

        {/* ── ACTIVITY TAB (mobile only) ──────────────────────── */}
        <div className="lg:hidden">
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
        </div>{/* end left column */}

        {/* ── ACTIVITY SIDEBAR (desktop always visible) ──────────────────────── */}
        <div className="hidden lg:block pt-3">
          <div className="sticky top-[200px]">
            <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Activity</p>
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
        </div>
        </div>{/* end grid */}
      </div>

      {/* Stage Picker */}
      {showStagePicker && (
        <StagePicker
          currentStage={currentStage}
          onSelect={handleStageChange}
          onClose={() => setShowStagePicker(false)}
        />
      )}

      {/* ── QUICK SCHEDULE BOTTOM SHEET ──────────────────────── */}
      {showScheduleSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowScheduleSheet(false)}
          />
          {/* Sheet */}
          <div
            className="relative w-full max-w-lg animate-[sheet-slide-up_0.3s_ease-out_both] rounded-t-3xl bg-white pb-8 pt-3 shadow-2xl"
          >
            {/* Handle */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300" />
            <div className="px-6">
              <h3 className="text-[17px] font-bold text-gray-900">Schedule Job</h3>
              <p className="mt-1 text-[13px] text-gray-400">Pick a date and time for this job.</p>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[15px] text-gray-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Time (optional)</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[15px] text-gray-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowScheduleSheet(false)}
                  className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-[14px] font-semibold text-gray-600 active:scale-[0.98] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSchedule}
                  disabled={!scheduleDate || isSavingSchedule}
                  className="flex-1 rounded-xl bg-indigo-500 px-4 py-3 text-[14px] font-semibold text-white active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSavingSchedule ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
