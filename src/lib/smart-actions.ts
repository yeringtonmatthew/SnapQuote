/**
 * Smart Action Engine — the brain of SnapQuote.
 *
 * Evaluates every quote/job and outputs the single best action
 * a contractor should take RIGHT NOW to close more deals and make more money.
 */

import type { Quote, InspectionFinding, JobTask } from '@/types/database';

// ── Types ────────────────────────────────────────────
export type ActionPriority = 'critical' | 'high' | 'medium' | 'low';
export type ActionType =
  | 'send_quote'
  | 'follow_up'
  | 'collect_deposit'
  | 'schedule_job'
  | 'start_job'
  | 'complete_job'
  | 'send_invoice'
  | 'none';

export interface SmartAction {
  type: ActionType;
  priority: ActionPriority;
  headline: string;
  description: string;
  /** Revenue at stake */
  value: number;
  /** For sorting — higher = more urgent */
  score: number;
  /** Suggested CTA labels */
  cta: { label: string; variant: 'call' | 'text' | 'send' | 'schedule' | 'advance' | 'link' };
  /** Pipeline badge text */
  badge: { label: string; color: 'red' | 'amber' | 'blue' | 'green' | 'indigo' | 'gray' } | null;
}

// ── Helpers ──────────────────────────────────────────
function daysBetween(from: string | null, to: Date = new Date()): number {
  if (!from) return 0;
  return Math.floor((to.getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24));
}

function hasCriticalFindings(findings: InspectionFinding[] | null): boolean {
  return (findings || []).some(f => f.severity === 'critical');
}

function taskProgress(tasks: JobTask[] | null): { done: number; total: number } {
  const t = tasks || [];
  return { done: t.filter(x => x.done).length, total: t.length };
}

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// ── Core Engine ──────────────────────────────────────
export function getSmartAction(quote: Quote, now: Date = new Date()): SmartAction {
  const total = Number(quote.total ?? quote.subtotal);
  const deposit = Number(quote.deposit_amount);
  const balance = total - deposit;
  const stage = quote.pipeline_stage;
  const status = quote.status;

  // ─── DRAFT / LEAD → Send Quote ─────────────────
  if (stage === 'lead' || stage === 'quote_created') {
    const daysSinceCreated = daysBetween(quote.created_at, now);
    const urgency = daysSinceCreated > 2 ? 'high' : 'medium';
    return {
      type: 'send_quote',
      priority: urgency,
      headline: 'Send this quote',
      description: daysSinceCreated > 0
        ? `Created ${daysSinceCreated} day${daysSinceCreated !== 1 ? 's' : ''} ago — send before the lead goes cold`
        : `${fmt(total)} quote ready to send`,
      value: total,
      score: urgency === 'high' ? 80 : 60,
      cta: { label: status === 'draft' ? 'Edit & Send' : 'Send Quote', variant: 'send' },
      badge: daysSinceCreated > 2
        ? { label: 'Send', color: 'amber' }
        : { label: 'Draft', color: 'gray' },
    };
  }

  // ─── QUOTE SENT → Follow Up or Collect Deposit ──
  if (stage === 'quote_sent') {
    // Approved but no deposit yet
    if (status === 'approved') {
      const daysSinceApproved = daysBetween(quote.approved_at, now);
      return {
        type: 'collect_deposit',
        priority: daysSinceApproved > 2 ? 'critical' : 'high',
        headline: `Collect deposit — ${fmt(deposit)}`,
        description: `Approved ${daysSinceApproved > 0 ? daysSinceApproved + ' days ago' : 'today'} — collect the ${fmt(deposit)} deposit to lock it in`,
        value: total,
        score: 95 + Math.min(daysSinceApproved, 10),
        cta: { label: 'Share Proposal', variant: 'link' },
        badge: { label: 'Collect', color: 'green' },
      };
    }

    // Still waiting for response
    const daysSinceSent = daysBetween(quote.sent_at, now);
    const isCritical = hasCriticalFindings(quote.inspection_findings);
    const isHighValue = total >= 5000;
    const isOverdue = daysSinceSent > 7;
    const needsFollowUp = daysSinceSent > 3;

    if (isOverdue) {
      return {
        type: 'follow_up',
        priority: 'critical',
        headline: `Follow up — ${fmt(total)} at risk`,
        description: `No response in ${daysSinceSent} days${isCritical ? ' (critical issues found)' : ''}. This deal needs attention now.`,
        value: total,
        score: 90 + Math.min(daysSinceSent, 14),
        cta: { label: 'Call Now', variant: 'call' },
        badge: { label: 'Overdue', color: 'red' },
      };
    }

    if (needsFollowUp) {
      return {
        type: 'follow_up',
        priority: isHighValue || isCritical ? 'high' : 'medium',
        headline: `Follow up with ${quote.customer_name}`,
        description: `Sent ${daysSinceSent} day${daysSinceSent !== 1 ? 's' : ''} ago — ${fmt(total)} opportunity`,
        value: total,
        score: 70 + Math.min(daysSinceSent * 3, 20) + (isHighValue ? 5 : 0) + (isCritical ? 5 : 0),
        cta: { label: 'Send Follow-Up', variant: 'text' },
        badge: { label: 'Follow Up', color: 'amber' },
      };
    }

    // Recently sent — no action needed yet
    return {
      type: 'none',
      priority: 'low',
      headline: 'Waiting for response',
      description: `Sent ${daysSinceSent > 0 ? daysSinceSent + ' day' + (daysSinceSent !== 1 ? 's' : '') + ' ago' : 'today'} — give it time`,
      value: total,
      score: 20,
      cta: { label: 'View Proposal', variant: 'link' },
      badge: null,
    };
  }

  // ─── DEPOSIT COLLECTED → Schedule Job ──────────
  if (stage === 'deposit_collected') {
    const daysSincePaid = daysBetween(quote.paid_at, now);
    return {
      type: 'schedule_job',
      priority: daysSincePaid > 3 ? 'high' : 'medium',
      headline: 'Schedule this job',
      description: `${fmt(deposit)} deposit collected${daysSincePaid > 0 ? ` ${daysSincePaid} days ago` : ''} — get ${quote.customer_name} on the calendar`,
      value: total,
      score: 75 + Math.min(daysSincePaid * 2, 20),
      cta: { label: 'Schedule', variant: 'schedule' },
      badge: { label: 'Schedule', color: 'indigo' },
    };
  }

  // ─── JOB SCHEDULED → Start Job ────────────────
  if (stage === 'job_scheduled') {
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const isToday = quote.scheduled_date === todayStr;
    const isPast = quote.scheduled_date ? quote.scheduled_date < todayStr : false;

    if (isToday || isPast) {
      return {
        type: 'start_job',
        priority: 'critical',
        headline: isToday ? 'Start job today' : 'Overdue — start this job',
        description: isToday
          ? `${quote.customer_name}${quote.scheduled_time ? ` at ${quote.scheduled_time}` : ''} — mark as In Progress when you begin`
          : `Was scheduled for ${quote.scheduled_date} — needs to be started`,
        value: total,
        score: isToday ? 100 : 105,
        cta: { label: 'Start Job', variant: 'advance' },
        badge: isToday ? { label: 'Today', color: 'amber' } : { label: 'Overdue', color: 'red' },
      };
    }

    const daysUntil = quote.scheduled_date ? daysBetween(todayStr, new Date(quote.scheduled_date + 'T00:00:00')) : 0;
    return {
      type: 'none',
      priority: 'low',
      headline: `Scheduled in ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''}`,
      description: `${quote.customer_name} — ${quote.scheduled_date ? new Date(quote.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Date TBD'}`,
      value: total,
      score: 30,
      cta: { label: 'View Details', variant: 'link' },
      badge: null,
    };
  }

  // ─── IN PROGRESS → Complete Job ───────────────
  if (stage === 'in_progress') {
    const { done, total: taskTotal } = taskProgress(quote.job_tasks);
    const daysSinceStarted = daysBetween(quote.started_at || quote.created_at, now);
    const allDone = taskTotal > 0 && done === taskTotal;

    return {
      type: 'complete_job',
      priority: allDone ? 'high' : daysSinceStarted > 14 ? 'high' : 'medium',
      headline: allDone ? 'Mark complete — all tasks done' : 'Complete this job',
      description: taskTotal > 0
        ? `${done}/${taskTotal} tasks done${daysSinceStarted > 7 ? ` — in progress for ${daysSinceStarted} days` : ''}`
        : `In progress${daysSinceStarted > 0 ? ` for ${daysSinceStarted} days` : ''} — upload final photos and mark complete`,
      value: balance,
      score: allDone ? 85 : 50 + Math.min(daysSinceStarted, 20),
      cta: { label: allDone ? 'Mark Complete' : 'Update Progress', variant: 'advance' },
      badge: allDone
        ? { label: 'Ready', color: 'green' }
        : daysSinceStarted > 14
          ? { label: 'Stalled', color: 'amber' }
          : null,
    };
  }

  // ─── COMPLETED → Collect Balance or Done ──────
  if (stage === 'completed') {
    if (balance > 0 && status !== 'deposit_paid') {
      return {
        type: 'send_invoice',
        priority: 'high',
        headline: `Collect remaining ${fmt(balance)}`,
        description: `Job complete — send final invoice to ${quote.customer_name}`,
        value: balance,
        score: 80,
        cta: { label: 'Send Invoice', variant: 'link' },
        badge: { label: 'Invoice', color: 'green' },
      };
    }

    return {
      type: 'none',
      priority: 'low',
      headline: 'Job complete',
      description: `Finished — ${fmt(total)} project with ${quote.customer_name}`,
      value: 0,
      score: 0,
      cta: { label: 'View', variant: 'link' },
      badge: null,
    };
  }

  // Fallback
  return {
    type: 'none',
    priority: 'low',
    headline: 'No action needed',
    description: '',
    value: 0,
    score: 0,
    cta: { label: 'View', variant: 'link' },
    badge: null,
  };
}

// ── Batch: get top actions across all quotes ─────────
export function getTopActions(quotes: Quote[], limit = 5, now: Date = new Date()): (SmartAction & { quoteId: string; customerName: string; customerPhone: string | null })[] {
  return quotes
    .filter(q => !q.archived && q.status !== 'cancelled' && q.pipeline_stage !== 'completed')
    .map(q => ({ ...getSmartAction(q, now), quoteId: q.id, customerName: q.customer_name, customerPhone: q.customer_phone }))
    .filter(a => a.type !== 'none')
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
