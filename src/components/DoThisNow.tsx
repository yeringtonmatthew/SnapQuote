'use client';

import { useState } from 'react';
import Link from 'next/link';
import { haptic } from '@/lib/haptic';

// ── Types from smart-actions (re-declared to avoid server/client boundary issues) ──
type ActionPriority = 'critical' | 'high' | 'medium' | 'low';
type ActionType = 'send_quote' | 'follow_up' | 'collect_deposit' | 'schedule_job' | 'start_job' | 'complete_job' | 'send_invoice' | 'none';

interface SmartActionItem {
  type: ActionType;
  priority: ActionPriority;
  headline: string;
  description: string;
  value: number;
  score: number;
  cta: { label: string; variant: 'call' | 'text' | 'send' | 'schedule' | 'advance' | 'link' };
  quoteId: string;
  customerName: string;
  customerPhone?: string | null;
}

interface LeadScoreInfo {
  temperature: 'hot' | 'warm' | 'cold' | 'at_risk';
  score: number;
  icon: string;
}

interface Props {
  actions: SmartActionItem[];
  leadScores: Record<string, LeadScoreInfo>;
}

// ── Group actions into categories ──
function groupActions(actions: SmartActionItem[]) {
  const moneyNow: SmartActionItem[] = [];
  const atRisk: SmartActionItem[] = [];
  const today: SmartActionItem[] = [];

  for (const a of actions) {
    if (a.type === 'collect_deposit' || a.type === 'send_invoice') {
      moneyNow.push(a);
    } else if (a.priority === 'critical' || a.type === 'follow_up') {
      atRisk.push(a);
    } else {
      today.push(a);
    }
  }

  return { moneyNow, atRisk, today };
}

const fmtValue = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const priorityColors: Record<string, { border: string; badgeBg: string }> = {
  critical: { border: 'border-l-red-500', badgeBg: 'bg-red-500 text-white' },
  high: { border: 'border-l-amber-500', badgeBg: 'bg-amber-500 text-white' },
  medium: { border: 'border-l-blue-500', badgeBg: 'bg-blue-500 text-white' },
  low: { border: 'border-l-gray-300', badgeBg: 'bg-gray-400 text-white' },
};

const tempColors: Record<string, string> = {
  hot: 'text-orange-500',
  warm: 'text-amber-500',
  cold: 'text-blue-500',
  at_risk: 'text-red-500',
};

export default function DoThisNow({ actions, leadScores }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [advancingId, setAdvancingId] = useState<string | null>(null);

  if (actions.length === 0) return null;

  const visibleCount = expanded ? actions.length : 3;
  const visibleActions = actions
    .filter(a => !completedIds.has(a.quoteId))
    .slice(0, visibleCount);

  const groups = groupActions(actions.filter(a => !completedIds.has(a.quoteId)));
  const totalMoney = groups.moneyNow.reduce((s, a) => s + a.value, 0);
  const totalAtRisk = groups.atRisk.reduce((s, a) => s + a.value, 0);

  // ── One-tap stage advance ──
  async function handleAdvance(quoteId: string, targetStage: string) {
    setAdvancingId(quoteId);
    haptic('medium');
    try {
      const res = await fetch(`/api/quotes/${quoteId}/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: targetStage }),
      });
      if (res.ok) {
        setCompletedIds(prev => new Set(prev).add(quoteId));
        haptic('heavy');
      }
    } catch {
      // Silent fail — user can retry
    } finally {
      setAdvancingId(null);
    }
  }

  // ── Render a single action card ──
  function renderAction(action: SmartActionItem, idx: number) {
    const colors = priorityColors[action.priority] || priorityColors.medium;
    const lead = leadScores[action.quoteId];
    const isAdvancing = advancingId === action.quoteId;

    // Determine one-tap action
    const oneTap = getOneTapAction(action);

    return (
      <div
        key={`${action.quoteId}-${idx}`}
        className={`flex items-center gap-3 rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] border-l-[3px] ${colors.border} pl-3 pr-2 py-2.5 transition-all ${completedIds.has(action.quoteId) ? 'opacity-40 scale-95' : ''}`}
        style={{ animationDelay: `${idx * 0.05}s` }}
      >
        {/* Priority number */}
        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${colors.badgeBg}`}>
          {idx + 1}
        </span>

        {/* Content */}
        <Link href={`/jobs/${action.quoteId}`} className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100 truncate leading-tight">
              {action.headline}
            </p>
            {lead && (
              <span className={`text-[10px] ${tempColors[lead.temperature]}`}>
                {lead.icon}
              </span>
            )}
          </div>
          <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {action.customerName}
            {action.value > 0 && <span className="text-gray-400"> · {fmtValue(action.value)}</span>}
          </p>
        </Link>

        {/* One-tap action button */}
        <div className="shrink-0">
          {oneTap.type === 'advance' ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                handleAdvance(action.quoteId, oneTap.targetStage!);
              }}
              disabled={isAdvancing}
              className="flex items-center gap-1 rounded-xl bg-brand-600 px-3 py-1.5 text-[11px] font-semibold text-white press-scale transition-all disabled:opacity-60"
            >
              {isAdvancing ? (
                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                </svg>
              ) : (
                oneTap.label
              )}
            </button>
          ) : oneTap.type === 'sms' ? (
            <a
              href={`sms:${action.customerPhone || ''}?body=${encodeURIComponent(`Hi ${action.customerName.split(' ')[0]}`)}`}
              onClick={() => {
                haptic('medium');
                // Mark as done after tap — user is being sent to Messages
                setTimeout(() => {
                  setCompletedIds(prev => new Set(prev).add(action.quoteId));
                }, 500);
              }}
              className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white press-scale transition-all"
            >
              {oneTap.label}
            </a>
          ) : oneTap.type === 'call' ? (
            <a
              href={`tel:${action.customerPhone || ''}`}
              onClick={() => {
                haptic('medium');
                setTimeout(() => {
                  setCompletedIds(prev => new Set(prev).add(action.quoteId));
                }, 500);
              }}
              className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white press-scale transition-all"
            >
              {oneTap.label}
            </a>
          ) : oneTap.type === 'link' ? (
            <Link
              href={oneTap.href!}
              target={oneTap.external ? '_blank' : undefined}
              className="flex items-center gap-1 rounded-xl bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-[11px] font-semibold text-gray-600 dark:text-gray-300 press-scale transition-all"
            >
              {oneTap.label}
            </Link>
          ) : (
            <Link
              href={`/jobs/${action.quoteId}`}
              className="flex items-center gap-1 rounded-xl bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-[11px] font-semibold text-gray-600 dark:text-gray-300 press-scale transition-all"
            >
              View
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <section>
      {/* Header with summary chips */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <svg className="h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          Do This Now
        </h2>

        {/* Summary chips */}
        <div className="flex items-center gap-1.5 ml-auto">
          {totalMoney > 0 && (
            <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              {fmtValue(totalMoney)} collectible
            </span>
          )}
          {totalAtRisk > 0 && (
            <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950/30 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400">
              {fmtValue(totalAtRisk)} at risk
            </span>
          )}
        </div>
      </div>

      {/* Action cards */}
      <div className="space-y-2">
        {visibleActions.map((action, idx) => renderAction(action, idx))}
      </div>

      {/* Expand / collapse */}
      {actions.filter(a => !completedIds.has(a.quoteId)).length > 3 && (
        <button
          onClick={() => { setExpanded(!expanded); haptic('light'); }}
          className="mt-2 w-full flex items-center justify-center gap-1 rounded-xl py-2 text-[12px] font-medium text-gray-400 dark:text-gray-500 hover:text-gray-600 transition-colors"
        >
          {expanded ? 'Show less' : `Show ${actions.filter(a => !completedIds.has(a.quoteId)).length - 3} more`}
          <svg
            className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      )}

      {/* Completion feedback */}
      {completedIds.size > 0 && (
        <div className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 py-2 text-[12px] font-medium text-emerald-600 dark:text-emerald-400 animate-fade-up">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          {completedIds.size} action{completedIds.size !== 1 ? 's' : ''} completed
        </div>
      )}
    </section>
  );
}

// ── Determine the one-tap action for each smart action type ──
function getOneTapAction(action: SmartActionItem): {
  type: 'advance' | 'sms' | 'call' | 'link' | 'default';
  label: string;
  targetStage?: string;
  href?: string;
  external?: boolean;
} {
  switch (action.type) {
    case 'follow_up':
      if (action.customerPhone) {
        return action.priority === 'critical'
          ? { type: 'call', label: 'Call' }
          : { type: 'sms', label: 'Text' };
      }
      return { type: 'link', label: 'Follow Up', href: `/jobs/${action.quoteId}` };

    case 'collect_deposit':
      return { type: 'link', label: 'Share Link', href: `/q/${action.quoteId}`, external: true };

    case 'schedule_job':
      return { type: 'link', label: 'Schedule', href: `/jobs/${action.quoteId}` };

    case 'start_job':
      return { type: 'advance', label: 'Start', targetStage: 'in_progress' };

    case 'complete_job':
      return { type: 'advance', label: 'Complete', targetStage: 'completed' };

    case 'send_quote':
      return { type: 'link', label: 'Send', href: `/jobs/${action.quoteId}` };

    case 'send_invoice':
      return { type: 'link', label: 'Invoice', href: `/jobs/${action.quoteId}` };

    default:
      return { type: 'default', label: 'View' };
  }
}
