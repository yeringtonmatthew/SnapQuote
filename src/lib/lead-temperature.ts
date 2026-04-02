/**
 * Lead Temperature Scoring — instant read on deal health.
 *
 * Scores every quote/job from 0-100 and assigns a temperature:
 *   🔥 Hot (75-100)   — high close probability, act now
 *   🟡 Warm (50-74)   — good prospects, nurture
 *   🔵 Cold (25-49)   — needs attention or stale
 *   🔴 At Risk (0-24) — slipping away, urgent intervention
 */

import type { Quote, InspectionFinding } from '@/types/database';

export type LeadTemperature = 'hot' | 'warm' | 'cold' | 'at_risk';

export interface LeadScore {
  temperature: LeadTemperature;
  score: number; // 0-100
  label: string;
  reason: string; // one-line explanation
}

// ── Helpers ──────────────────────────────────────────
function daysSince(dateStr: string | null, now: Date = new Date()): number {
  if (!dateStr) return 999;
  return Math.max(0, Math.floor((now.getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)));
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

// ── Scoring Engine ───────────────────────────────────
export function getLeadScore(quote: Quote, now: Date = new Date()): LeadScore {
  const total = Number(quote.total ?? quote.subtotal);
  const stage = quote.pipeline_stage;
  const status = quote.status;
  const findings = (quote.inspection_findings || []) as InspectionFinding[];

  // ─── Already closed stages: always hot ─────────
  if (stage === 'deposit_collected' || stage === 'job_scheduled' || stage === 'in_progress') {
    return { temperature: 'hot', score: 90, label: 'Hot', reason: 'Committed — deposit paid or in progress' };
  }
  if (stage === 'completed') {
    return { temperature: 'hot', score: 100, label: 'Closed', reason: 'Job completed' };
  }

  // ─── Approved but awaiting deposit ─────────────
  if (status === 'approved') {
    const days = daysSince(quote.approved_at, now);
    if (days <= 2) return { temperature: 'hot', score: 85, label: 'Hot', reason: 'Just approved — collect deposit' };
    if (days <= 5) return { temperature: 'warm', score: 65, label: 'Warm', reason: `Approved ${days}d ago, deposit pending` };
    return { temperature: 'cold', score: 40, label: 'Cold', reason: `Approved ${days}d ago, no deposit yet` };
  }

  // ─── Quote sent — the critical evaluation zone ──
  if (status === 'sent' || stage === 'quote_sent') {
    let score = 50; // base

    // Time decay — the longer without response, the colder
    const daysSent = daysSince(quote.sent_at, now);
    if (daysSent <= 1) score += 20;
    else if (daysSent <= 3) score += 10;
    else if (daysSent <= 7) score -= 10;
    else if (daysSent <= 14) score -= 25;
    else score -= 40;

    // Value signal — higher value = more engaged lead (they requested a big scope)
    if (total >= 10000) score += 10;
    else if (total >= 5000) score += 5;

    // Inspection urgency — critical findings = motivated buyer
    const criticals = findings.filter(f => f.severity === 'critical').length;
    const moderates = findings.filter(f => f.severity === 'moderate').length;
    if (criticals >= 2) score += 15;
    else if (criticals === 1) score += 10;
    else if (moderates >= 2) score += 5;

    // Recent follow-up activity is positive signal
    const lastFollowUp = daysSince(quote.reminder_sent_at, now);
    if (lastFollowUp < 999 && lastFollowUp <= 2) score += 5;

    // Expiry urgency
    if (quote.expires_at) {
      const daysUntilExpiry = daysSince(now.toISOString(), new Date(quote.expires_at));
      if (daysUntilExpiry < 0) score -= 30; // expired
      else if (daysUntilExpiry <= 3) score += 5; // urgency helps
    }

    score = clamp(score, 0, 100);

    if (score >= 75) return { temperature: 'hot', score, label: 'Hot', reason: highScoreReason(daysSent, criticals, total) };
    if (score >= 50) return { temperature: 'warm', score, label: 'Warm', reason: warmReason(daysSent, total) };
    if (score >= 25) return { temperature: 'cold', score, label: 'Cold', reason: coldReason(daysSent) };
    return { temperature: 'at_risk', score, label: 'At Risk', reason: atRiskReason(daysSent) };
  }

  // ─── Draft / Lead — not yet scored ────────────
  if (stage === 'lead' || stage === 'quote_created') {
    const days = daysSince(quote.created_at, now);
    if (days <= 1) return { temperature: 'warm', score: 55, label: 'New', reason: 'New lead — send quote quickly' };
    if (days <= 3) return { temperature: 'warm', score: 45, label: 'New', reason: `Lead created ${days}d ago` };
    return { temperature: 'cold', score: 30, label: 'Cold', reason: `Unsent for ${days} days` };
  }

  return { temperature: 'cold', score: 25, label: 'Unknown', reason: 'Needs evaluation' };
}

// ── Reason generators ────────────────────────────────
function highScoreReason(daysSent: number, criticals: number, total: number): string {
  if (criticals > 0 && daysSent <= 3) return 'Critical findings + recently sent';
  if (total >= 10000 && daysSent <= 3) return 'High value, recently sent';
  if (daysSent <= 1) return 'Just sent — momentum is high';
  return 'Strong engagement signals';
}

function warmReason(daysSent: number, total: number): string {
  if (daysSent <= 3) return 'Recently sent, awaiting response';
  if (total >= 5000) return 'High value opportunity, follow up soon';
  return `Sent ${daysSent}d ago — worth a follow-up`;
}

function coldReason(daysSent: number): string {
  if (daysSent > 14) return `No response in ${daysSent} days`;
  return `${daysSent} days without response`;
}

function atRiskReason(daysSent: number): string {
  if (daysSent > 21) return `${daysSent} days silent — likely lost`;
  return `${daysSent}+ days, no engagement`;
}

// ── UI helpers ───────────────────────────────────────
export const temperatureStyles: Record<LeadTemperature, {
  bg: string;
  text: string;
  ring: string;
  dot: string;
  icon: string;
}> = {
  hot: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: 'text-orange-600 dark:text-orange-400',
    ring: 'ring-orange-200/60 dark:ring-orange-800/40',
    dot: 'bg-orange-500',
    icon: '🔥',
  },
  warm: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-200/60 dark:ring-amber-800/40',
    dot: 'bg-amber-400',
    icon: '🟡',
  },
  cold: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-200/60 dark:ring-blue-800/40',
    dot: 'bg-blue-400',
    icon: '🔵',
  },
  at_risk: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-600 dark:text-red-400',
    ring: 'ring-red-200/60 dark:ring-red-800/40',
    dot: 'bg-red-500',
    icon: '🔴',
  },
};
