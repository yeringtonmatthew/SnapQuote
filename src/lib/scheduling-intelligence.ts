import { Quote } from '@/types/database';

export interface SchedulingInsight {
  type: 'unscheduled_paid' | 'same_day_cluster' | 'gap_day';
  headline: string;
  description: string;
  quoteIds: string[];
  priority: 'high' | 'medium' | 'low';
}

const priorityOrder: Record<SchedulingInsight['priority'], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatDay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getSchedulingInsights(
  quotes: Quote[],
  now: Date = new Date()
): SchedulingInsight[] {
  const insights: SchedulingInsight[] = [];

  // 1. Unscheduled Paid Jobs (high priority)
  const unscheduledPaid = quotes.filter(
    (q) => q.pipeline_stage === 'deposit_collected' && !q.scheduled_date
  );

  if (unscheduledPaid.length > 0) {
    const count = unscheduledPaid.length;
    const s = count === 1 ? '' : 's';
    insights.push({
      type: 'unscheduled_paid',
      headline: `${count} paid job${s} need${count === 1 ? 's' : ''} scheduling`,
      description: unscheduledPaid.map((q) => q.customer_name).join(', '),
      quoteIds: unscheduledPaid.map((q) => q.id),
      priority: 'high',
    });
  }

  // 2. Same-Day Clusters (medium priority)
  const scheduledQuotes = quotes.filter(
    (q) =>
      q.scheduled_date &&
      (q.pipeline_stage === 'job_scheduled' || q.pipeline_stage === 'in_progress')
  );

  const byDate = new Map<string, Quote[]>();
  for (const q of scheduledQuotes) {
    const date = q.scheduled_date!;
    const group = byDate.get(date) || [];
    group.push(q);
    byDate.set(date, group);
  }

  byDate.forEach((group: Quote[], date: string) => {
    if (group.length >= 2) {
      insights.push({
        type: 'same_day_cluster',
        headline: `${group.length} jobs on ${formatDate(date)}`,
        description: group.map((q: Quote) => q.customer_name).join(', '),
        quoteIds: group.map((q: Quote) => q.id),
        priority: 'medium',
      });
    }
  });

  // 3. Gap Days (low priority)
  const scheduledDates = new Set(
    scheduledQuotes.map((q) => q.scheduled_date!)
  );

  const gapDays: Date[] = [];
  for (let i = 1; i <= 7 && gapDays.length < 3; i++) {
    const day = new Date(now);
    day.setDate(day.getDate() + i);
    const dayOfWeek = day.getDay();
    // Weekdays only (Mon=1 through Fri=5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const dateStr = toDateString(day);
      if (!scheduledDates.has(dateStr)) {
        gapDays.push(day);
      }
    }
  }

  for (const day of gapDays) {
    insights.push({
      type: 'gap_day',
      headline: `${formatDay(day)} is open`,
      description: 'No jobs scheduled — good day to book',
      quoteIds: [],
      priority: 'low',
    });
  }

  // Sort by priority
  insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return insights;
}
