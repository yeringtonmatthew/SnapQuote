import { createClient } from '@/lib/supabase/server';
import SmartActionsBar from '@/components/SmartActionsBar';
import DashboardStats from '@/components/DashboardStats';
import RevenueChart from '@/components/RevenueChart';
import RevenueIntelligenceCard from '@/components/RevenueIntelligenceCard';
import { calculateRevenueIntelligence } from '@/lib/revenue-intelligence';
import type { Quote } from '@/types/database';

export default async function DashboardStatsSection({ userId }: { userId: string }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: quotes } = await supabase
    .from('quotes')
    .select('id, customer_name, customer_phone, customer_email, status, subtotal, total, deposit_amount, deposit_percent, quote_number, created_at, sent_at, approved_at, paid_at, archived, pipeline_stage, scheduled_date, scheduled_time, reminder_sent_at, job_address, expires_at, client_id, started_at, completed_at, payment_method, quote_options, selected_option, photos, scope_of_work, ai_description, job_tasks')
    .eq('contractor_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);

  const allQuotes = quotes || [];
  const activeQuotes = allQuotes.filter(q => !q.archived);
  const now = new Date();

  // ── Single-pass computation ──────────────────────────
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endOfLastMonth = startOfMonth;

  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const threeDaysAgoStr = threeDaysAgo.toISOString();

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString();

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const stats = {
    awaitingResponse: 0,
    depositsToCollect: 0,
    collectableAmount: 0,
    jobsToSchedule: 0,
    followUpNeeded: 0,
    paidThisMonthRevenue: 0,
    paidLastMonthRevenue: 0,
    sentThisMonth: 0,
    sentLastMonth: 0,
    approvedCount: 0,
    sentCount: 0,
    pendingValue: 0,
    pendingCount: 0,
    totalWithValue: 0,
    totalValueSum: 0,
    todayJobsCount: 0,
    revenueByMonth: {} as Record<string, number>,
    hasPaidQuotes: false,
  };

  // Build month keys for 6-month revenue chart
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthBuckets: { key: string; start: string; end: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const key = monthNames[d.getMonth()];
    stats.revenueByMonth[key] = 0;
    monthBuckets.push({ key, start: monthStart.toISOString(), end: monthEnd.toISOString() });
  }

  for (const q of activeQuotes) {
    const status = q.status;
    const sentAt = q.sent_at;
    const paidAt = q.paid_at;
    const pipelineStage = q.pipeline_stage;
    const total = Number(q.total ?? q.subtotal ?? 0);
    const depositAmount = Number(q.deposit_amount || q.total || q.subtotal || 0);

    // Awaiting response: sent > 3 days ago
    if (status === 'sent' && sentAt && sentAt < threeDaysAgoStr) {
      stats.awaitingResponse++;
    }

    // Deposits to collect: approved but not paid
    if (status === 'approved' && !paidAt) {
      stats.depositsToCollect++;
      stats.collectableAmount += depositAmount;
    }

    // Jobs to schedule: deposit collected but no date
    if (pipelineStage === 'deposit_collected' && !q.scheduled_date) {
      stats.jobsToSchedule++;
    }

    // Follow-up needed: sent > 7 days, no recent reminder
    if (status === 'sent' && sentAt && sentAt < sevenDaysAgoStr
        && (!q.reminder_sent_at || q.reminder_sent_at < sevenDaysAgoStr)) {
      stats.followUpNeeded++;
    }

    // Paid this month
    if (status === 'deposit_paid' && paidAt && paidAt >= startOfMonth) {
      stats.paidThisMonthRevenue += Number(q.deposit_amount);
    }

    // Paid last month
    if (status === 'deposit_paid' && paidAt && paidAt >= startOfLastMonth && paidAt < endOfLastMonth) {
      stats.paidLastMonthRevenue += Number(q.deposit_amount);
    }

    // Sent this month
    if (sentAt && sentAt >= startOfMonth) {
      stats.sentThisMonth++;
    }

    // Sent last month
    if (sentAt && sentAt >= startOfLastMonth && sentAt < endOfLastMonth) {
      stats.sentLastMonth++;
    }

    // Approval rate: total sent (non-draft) and approved
    if (status !== 'draft') {
      stats.sentCount++;
    }
    if (status === 'approved' || status === 'deposit_paid') {
      stats.approvedCount++;
    }

    // Pending value
    if (status === 'sent' || status === 'approved') {
      stats.pendingValue += total;
      stats.pendingCount++;
    }

    // Avg quote value
    if (q.total && Number(q.total) > 0) {
      stats.totalWithValue++;
      stats.totalValueSum += Number(q.total);
    }

    // Today's scheduled
    if (q.scheduled_date === todayStr) {
      stats.todayJobsCount++;
    }
  }

  // Revenue chart: iterate all quotes (including archived) for chart data
  for (const q of allQuotes) {
    if (q.status === 'deposit_paid' && q.paid_at) {
      stats.hasPaidQuotes = true;
      for (const bucket of monthBuckets) {
        if (q.paid_at >= bucket.start && q.paid_at < bucket.end) {
          stats.revenueByMonth[bucket.key] += Number(q.deposit_amount);
          break;
        }
      }
    }
  }

  const approvalRate = stats.sentCount > 0 ? Math.round((stats.approvedCount / stats.sentCount) * 100) : 0;
  const avgQuoteValue = stats.totalWithValue > 0 ? Math.round(stats.totalValueSum / stats.totalWithValue) : 0;

  const revenueTrend = stats.paidLastMonthRevenue > 0
    ? Math.round(((stats.paidThisMonthRevenue - stats.paidLastMonthRevenue) / stats.paidLastMonthRevenue) * 100)
    : null;
  const sentTrend = stats.sentLastMonth > 0
    ? Math.round(((stats.sentThisMonth - stats.sentLastMonth) / stats.sentLastMonth) * 100)
    : null;

  const hasAttentionItems = stats.awaitingResponse > 0 || stats.depositsToCollect > 0 || stats.jobsToSchedule > 0 || stats.followUpNeeded > 0;

  const revenueData = stats.hasPaidQuotes
    ? monthBuckets.map(b => ({ month: b.key, revenue: stats.revenueByMonth[b.key] }))
    : [];

  // Revenue Intelligence
  const revenueIntel = calculateRevenueIntelligence(activeQuotes as unknown as Quote[], now);

  return (
    <>
      {/* SmartActionsBar */}
      {hasAttentionItems && (
        <div className="lg:col-span-2">
          <SmartActionsBar
            awaitingCount={stats.awaitingResponse}
            depositsCount={stats.depositsToCollect}
            collectableAmount={stats.collectableAmount}
            todayJobsCount={stats.todayJobsCount}
            followUpCount={stats.followUpNeeded}
            jobsToScheduleCount={stats.jobsToSchedule}
          />
        </div>
      )}

      {/* Stats Cards */}
      <div className="lg:col-start-1">
        <DashboardStats
          monthlyRevenue={stats.paidThisMonthRevenue}
          quotesSentCount={stats.sentThisMonth}
          approvalRate={approvalRate}
          pendingValue={stats.pendingValue}
          pendingCount={stats.pendingCount}
          revenueTrend={revenueTrend}
          sentTrend={sentTrend}
          avgQuoteValue={avgQuoteValue}
        />
      </div>

      {/* Revenue Intelligence */}
      {activeQuotes.length > 0 && (
        <div className="lg:col-start-1">
          <RevenueIntelligenceCard
            totalPipeline={revenueIntel.totalPipeline}
            atRiskRevenue={revenueIntel.atRiskRevenue}
            atRiskCount={revenueIntel.atRiskCount}
            atRiskQuotes={revenueIntel.atRiskQuotes}
            likelyToClose={revenueIntel.likelyToClose}
            likelyToCloseCount={revenueIntel.likelyToCloseCount}
            weeklyRevenue={revenueIntel.weeklyRevenue}
            weeklyRevenueChange={revenueIntel.weeklyRevenueChange}
            monthlyProjection={revenueIntel.monthlyProjection}
            closeRate={revenueIntel.closeRate}
            dealsNeedingAttention={revenueIntel.dealsNeedingAttention}
          />
        </div>
      )}

      {/* Revenue Chart */}
      {stats.hasPaidQuotes && (
        <div className="lg:col-start-1">
          {/* Mobile: collapsible */}
          <details className="lg:hidden rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] overflow-hidden">
            <summary className="flex cursor-pointer items-center justify-between px-5 py-4 [&::-webkit-details-marker]:hidden [&::marker]:hidden list-none">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Revenue Trend</span>
              <svg className="h-4 w-4 text-gray-400 transition-transform [[open]>&]:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </summary>
            <div className="px-4 pb-4">
              <RevenueChart data={revenueData} />
            </div>
          </details>
          {/* Desktop: always visible */}
          <div className="hidden lg:block rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] overflow-hidden">
            <div className="px-5 py-4">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Revenue Trend</span>
            </div>
            <div className="px-4 pb-4">
              <RevenueChart data={revenueData} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
