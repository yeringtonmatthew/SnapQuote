/**
 * Revenue Intelligence — SnapQuote's killer feature.
 *
 * Calculates pipeline health, at-risk revenue, projected income,
 * and performance trends so contractors know exactly where their money is.
 */

import type { Quote } from '@/types/database';

// ── Types ────────────────────────────────────────────
export interface RevenueIntelligence {
  /** Total value of all active, non-completed pipeline */
  totalPipeline: number;
  /** Quotes sent >3 days with no response */
  atRiskRevenue: number;
  atRiskCount: number;
  atRiskQuotes: { id: string; name: string; value: number; daysSince: number }[];
  /** Approved or deposit collected — likely to close */
  likelyToClose: number;
  likelyToCloseCount: number;
  /** Expired quotes — lost opportunities */
  lostOpportunities: number;
  lostCount: number;
  /** This week's closed revenue (deposits collected) */
  weeklyRevenue: number;
  weeklyRevenueChange: number | null; // percent vs last week
  /** Monthly pace (extrapolated from current month) */
  monthlyProjection: number;
  /** Win rate: approved / sent */
  closeRate: number;
  /** Quotes needing attention right now */
  quotesNeedingAttention: number;
  /** Average job size */
  avgDealSize: number;
}

// ── Helpers ──────────────────────────────────────────
function daysSince(dateStr: string | null, now: Date = new Date()): number {
  if (!dateStr) return 0;
  return Math.floor((now.getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day;
  const start = new Date(d);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

// ── Core Calculator ──────────────────────────────────
export function calculateRevenueIntelligence(
  quotes: Quote[],
  now: Date = new Date(),
): RevenueIntelligence {
  const active = quotes.filter(q => !q.archived && q.status !== 'cancelled');

  // Pipeline: everything that isn't completed
  const pipelineQuotes = active.filter(q => q.pipeline_stage !== 'completed');
  const totalPipeline = pipelineQuotes.reduce((s, q) => s + Number(q.total ?? q.subtotal), 0);

  // At risk: sent >3 days, no approval
  const atRiskQuotes = active
    .filter(q => q.status === 'sent' && q.sent_at && daysSince(q.sent_at, now) > 3)
    .map(q => ({
      id: q.id,
      name: q.customer_name,
      value: Number(q.total ?? q.subtotal),
      daysSince: daysSince(q.sent_at, now),
    }))
    .sort((a, b) => b.value - a.value);
  const atRiskRevenue = atRiskQuotes.reduce((s, q) => s + q.value, 0);

  // Likely to close: approved or deposit collected
  const likelyQuotes = active.filter(
    q => q.status === 'approved' || q.pipeline_stage === 'deposit_collected' || q.pipeline_stage === 'job_scheduled',
  );
  const likelyToClose = likelyQuotes.reduce((s, q) => s + Number(q.total ?? q.subtotal), 0);

  // Lost: expired quotes
  const lostQuotes = active.filter(
    q => q.expires_at && new Date(q.expires_at) < now && q.status === 'sent',
  );
  const lostOpportunities = lostQuotes.reduce((s, q) => s + Number(q.total ?? q.subtotal), 0);

  // Weekly revenue
  const thisWeekStart = startOfWeek(now);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const thisWeekPaid = active.filter(
    q => q.paid_at && new Date(q.paid_at) >= thisWeekStart,
  );
  const weeklyRevenue = thisWeekPaid.reduce((s, q) => s + Number(q.deposit_amount), 0);

  const lastWeekPaid = active.filter(
    q => q.paid_at && new Date(q.paid_at) >= lastWeekStart && new Date(q.paid_at) < thisWeekStart,
  );
  const lastWeekRevenue = lastWeekPaid.reduce((s, q) => s + Number(q.deposit_amount), 0);
  const weeklyRevenueChange = lastWeekRevenue > 0
    ? Math.round(((weeklyRevenue - lastWeekRevenue) / lastWeekRevenue) * 100)
    : null;

  // Monthly projection
  const monthStart = startOfMonth(now);
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthPaid = active.filter(
    q => q.paid_at && new Date(q.paid_at) >= monthStart,
  );
  const monthRevenueSoFar = monthPaid.reduce((s, q) => s + Number(q.deposit_amount), 0);
  const monthlyProjection = dayOfMonth > 0
    ? Math.round((monthRevenueSoFar / dayOfMonth) * daysInMonth)
    : 0;

  // Win rate
  const totalSent = active.filter(q => q.status !== 'draft' && q.pipeline_stage !== 'lead' && q.pipeline_stage !== 'follow_up' && q.pipeline_stage !== 'quote_created').length;
  const totalClosed = active.filter(q => q.status === 'approved' || q.status === 'deposit_paid').length;
  const closeRate = totalSent > 0 ? Math.round((totalClosed / totalSent) * 100) : 0;

  // Quotes needing attention
  const quotesNeedingAttention = atRiskQuotes.length
    + active.filter(q => q.status === 'approved' && !q.paid_at).length
    + active.filter(q => q.pipeline_stage === 'deposit_collected' && !q.scheduled_date).length;

  // Avg deal size
  const closedQuotes = active.filter(q => q.status === 'deposit_paid');
  const avgDealSize = closedQuotes.length > 0
    ? Math.round(closedQuotes.reduce((s, q) => s + Number(q.total ?? q.subtotal), 0) / closedQuotes.length)
    : 0;

  return {
    totalPipeline,
    atRiskRevenue,
    atRiskCount: atRiskQuotes.length,
    atRiskQuotes,
    likelyToClose,
    likelyToCloseCount: likelyQuotes.length,
    lostOpportunities,
    lostCount: lostQuotes.length,
    weeklyRevenue,
    weeklyRevenueChange,
    monthlyProjection,
    closeRate,
    quotesNeedingAttention,
    avgDealSize,
  };
}
