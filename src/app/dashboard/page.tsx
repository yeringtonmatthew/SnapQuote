import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
// QuoteList moved to /pipeline — dashboard shows compact recent quotes
import RevenueChart from '@/components/RevenueChart';
import InstallPrompt from '@/components/InstallPrompt';
import ExportDropdown from '@/components/ExportDropdown';
import { NotificationBell } from '@/components/NotificationBell';
import { DashboardThemeToggle } from '@/components/DashboardThemeToggle';
import DashboardPullToRefresh from '@/components/DashboardPullToRefresh';
import DashboardStats from '@/components/DashboardStats';
import SmartActionsBar from '@/components/SmartActionsBar';
import RecentActivity from '@/components/RecentActivity';
import QuickActions from '@/components/QuickActions';
import PageTransition from '@/components/PageTransition';
import BottomNav from '@/components/BottomNav';
import DesktopSidebar from '@/components/DesktopSidebar';
import RevenueIntelligenceCard from '@/components/RevenueIntelligenceCard';
import DoThisNow from '@/components/DoThisNow';
import { getTopActions } from '@/lib/smart-actions';
import { calculateRevenueIntelligence } from '@/lib/revenue-intelligence';
import { getLeadScore, temperatureStyles } from '@/lib/lead-temperature';
import { getSchedulingInsights } from '@/lib/scheduling-intelligence';
import type { Quote } from '@/types/database';

// ── Event type color mapping ──────────────────────────
const EVENT_TYPE_COLORS: Record<string, { dot: string; border: string }> = {
  job_scheduled: { dot: 'bg-blue-500', border: 'border-l-blue-500' },
  site_visit: { dot: 'bg-violet-500', border: 'border-l-violet-500' },
  estimate: { dot: 'bg-amber-500', border: 'border-l-amber-500' },
  follow_up: { dot: 'bg-orange-500', border: 'border-l-orange-500' },
  meeting: { dot: 'bg-emerald-500', border: 'border-l-emerald-500' },
  reminder: { dot: 'bg-rose-500', border: 'border-l-rose-500' },
  default: { dot: 'bg-gray-400', border: 'border-l-gray-400' },
};

function getEventColor(type: string) {
  return EVENT_TYPE_COLORS[type] || EVENT_TYPE_COLORS.default;
}

function formatTime(time: string | null): string {
  if (!time) return 'All day';
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile && !profile.onboarded) redirect('/onboarding');

  const { data: quotes } = await supabase
    .from('quotes')
    .select('id, customer_name, customer_phone, customer_email, job_address, status, subtotal, total, deposit_amount, deposit_percent, photos, scope_of_work, ai_description, quote_number, created_at, sent_at, approved_at, paid_at, archived, internal_notes, pipeline_stage, scheduled_date, scheduled_time, reminder_sent_at, job_tasks, inspection_findings, started_at, completed_at, expires_at')
    .eq('contractor_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  // ── Today's date string ──────────────────────────
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // ── Fetch today's calendar events (gracefully handle if table doesn't exist) ──
  let todayEvents: Record<string, unknown>[] = [];
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        quotes:quote_id (
          customer_name,
          job_address,
          customer_phone,
          quote_number
        ),
        clients:client_id (
          name,
          phone,
          address
        )
      `)
      .eq('contractor_id', user.id)
      .eq('event_date', todayStr)
      .order('start_time', { ascending: true });

    if (!error && data) {
      todayEvents = data.map((e: Record<string, unknown>) => {
        const quote = e.quotes as Record<string, unknown> | null;
        const client = e.clients as Record<string, unknown> | null;
        return {
          ...e,
          quotes: undefined,
          clients: undefined,
          customer_name: client?.name ?? quote?.customer_name ?? e.title,
          job_address: client?.address ?? quote?.job_address ?? null,
          customer_phone: client?.phone ?? quote?.customer_phone ?? null,
          quote_number: quote?.quote_number ?? null,
        };
      });
    } else if (error) {
      const { data: evData } = await supabase
        .from('events')
        .select(`
          *,
          quotes:quote_id (
            customer_name,
            job_address,
            customer_phone,
            quote_number
          )
        `)
        .eq('contractor_id', user.id)
        .eq('event_date', todayStr)
        .order('start_time', { ascending: true });

      if (evData) {
        todayEvents = evData.map((e: Record<string, unknown>) => {
          const quote = e.quotes as Record<string, unknown> | null;
          return {
            ...e,
            quotes: undefined,
            customer_name: quote?.customer_name ?? e.title,
            job_address: quote?.job_address ?? null,
            customer_phone: quote?.customer_phone ?? null,
            quote_number: quote?.quote_number ?? null,
          };
        });
      }
    }
  } catch {
    // Events table may not exist yet
  }

  // ── Also include quotes with scheduled_date = today (backcompat) ──
  const allQuotes = quotes || [];
  const activeQuotes = allQuotes.filter(q => !q.archived);

  const quotesScheduledToday = activeQuotes.filter(q => q.scheduled_date === todayStr);
  const eventQuoteIds = new Set(todayEvents.map(e => e.quote_id).filter(Boolean));
  const extraScheduleEvents = quotesScheduledToday
    .filter(q => !eventQuoteIds.has(q.id))
    .map(q => ({
      id: `quote-${q.id}`,
      title: q.customer_name,
      event_type: 'job_scheduled',
      event_date: q.scheduled_date,
      start_time: q.scheduled_time || null,
      end_time: null,
      all_day: !q.scheduled_time,
      quote_id: q.id,
      customer_name: q.customer_name,
      job_address: q.job_address || null,
      quote_number: q.quote_number,
    }));
  const allTodayEvents = [...todayEvents, ...extraScheduleEvents];

  // ── Needs Attention calculations ──────────────────
  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const threeDaysAgoStr = threeDaysAgo.toISOString();

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString();

  const awaitingResponse = activeQuotes.filter(
    q => q.status === 'sent' && q.sent_at && q.sent_at < threeDaysAgoStr
  );

  const depositsToCollect = activeQuotes.filter(
    q => q.status === 'approved' && !q.paid_at
  );

  const collectableAmount = depositsToCollect.reduce(
    (sum, q) => sum + Number(q.deposit_amount || q.total || q.subtotal || 0), 0
  );

  const jobsToSchedule = activeQuotes.filter(
    q => q.pipeline_stage === 'deposit_collected' && !q.scheduled_date
  );

  const followUpNeeded = activeQuotes.filter(
    q => q.status === 'sent' && q.sent_at && q.sent_at < sevenDaysAgoStr
      && (!q.reminder_sent_at || q.reminder_sent_at < sevenDaysAgoStr)
  );

  const hasAttentionItems = awaitingResponse.length > 0 || depositsToCollect.length > 0 || jobsToSchedule.length > 0 || followUpNeeded.length > 0;

  // ── Active Jobs ──────────────────────────────────
  const activeJobs = activeQuotes
    .filter(q => q.pipeline_stage === 'in_progress' || q.pipeline_stage === 'job_scheduled')
    .slice(0, 3);

  // ── Existing stats ──────────────────────────────
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = profile?.full_name?.split(' ')[0] || profile?.business_name || 'there';

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const paidThisMonth = activeQuotes.filter(
    q => q.status === 'deposit_paid' && q.paid_at && q.paid_at >= startOfMonth
  );
  const monthlyRevenue = paidThisMonth.reduce((sum, q) => sum + Number(q.deposit_amount), 0);

  const sentThisMonth = activeQuotes.filter(
    q => q.sent_at && q.sent_at >= startOfMonth
  );
  const quotesSentCount = sentThisMonth.length;

  const totalSent = activeQuotes.filter(q => q.status !== 'draft').length;
  const totalApproved = activeQuotes.filter(q => q.status === 'approved' || q.status === 'deposit_paid').length;
  const approvalRate = totalSent > 0 ? Math.round((totalApproved / totalSent) * 100) : 0;

  const pendingQuotes = activeQuotes.filter(q => q.status === 'sent' || q.status === 'approved');
  const pendingValue = pendingQuotes.reduce((sum, q) => sum + Number(q.total ?? q.subtotal), 0);

  // ── Average Quote Value ──────────────────────────
  const quotesWithTotal = activeQuotes.filter(q => q.total && Number(q.total) > 0);
  const avgQuoteValue = quotesWithTotal.length > 0
    ? Math.round(quotesWithTotal.reduce((sum, q) => sum + Number(q.total), 0) / quotesWithTotal.length)
    : 0;

  // ── Trend calculations: this month vs last month ──
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endOfLastMonth = startOfMonth;

  const paidLastMonth = activeQuotes.filter(
    q => q.status === 'deposit_paid' && q.paid_at && q.paid_at >= startOfLastMonth && q.paid_at < endOfLastMonth
  );
  const lastMonthRevenue = paidLastMonth.reduce((sum, q) => sum + Number(q.deposit_amount), 0);

  const sentLastMonth = activeQuotes.filter(
    q => q.sent_at && q.sent_at >= startOfLastMonth && q.sent_at < endOfLastMonth
  );
  const lastMonthSentCount = sentLastMonth.length;

  const revenueTrend = lastMonthRevenue > 0
    ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : null;
  const sentTrend = lastMonthSentCount > 0
    ? Math.round(((quotesSentCount - lastMonthSentCount) / lastMonthSentCount) * 100)
    : null;

  // Revenue chart data
  const hasPaidQuotes = allQuotes.some(q => q.status === 'deposit_paid' && q.paid_at);
  const revenueData: { month: string; revenue: number }[] = [];
  if (hasPaidQuotes) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const monthRevenue = allQuotes
        .filter(q => q.status === 'deposit_paid' && q.paid_at && q.paid_at >= monthStart.toISOString() && q.paid_at < monthEnd.toISOString())
        .reduce((sum, q) => sum + Number(q.deposit_amount), 0);
      revenueData.push({ month: monthNames[d.getMonth()], revenue: monthRevenue });
    }
  }

  // Dashboard shows compact recent quotes — full list is on /pipeline

  // ── Smart Action Engine ──────────────────────────
  const smartActions = getTopActions(activeQuotes as unknown as Quote[], 5, now);

  // ── Revenue Intelligence ─────────────────────────
  const revenueIntel = calculateRevenueIntelligence(activeQuotes as unknown as Quote[], now);

  // ── Lead Scores for each action ─────────────────
  const leadScoreMap: Record<string, { temperature: 'hot' | 'warm' | 'cold' | 'at_risk'; score: number; icon: string }> = {};
  for (const action of smartActions) {
    const q = activeQuotes.find(q => q.id === action.quoteId);
    if (q) {
      const ls = getLeadScore(q as unknown as Quote, now);
      leadScoreMap[action.quoteId] = {
        temperature: ls.temperature,
        score: ls.score,
        icon: temperatureStyles[ls.temperature].icon,
      };
    }
  }

  // ── Scheduling Intelligence ─────────────────────
  const schedulingInsights = getSchedulingInsights(activeQuotes as unknown as Quote[], now);

  // ── Recent Activity — last 8 quotes ──────────────
  const recentQuotes = activeQuotes.slice(0, 8).map(q => ({
    id: q.id,
    customer_name: q.customer_name,
    total: Number(q.total ?? q.subtotal ?? 0),
    status: q.status,
    created_at: q.created_at,
    sent_at: q.sent_at,
    approved_at: q.approved_at,
    paid_at: q.paid_at,
  }));

  // ── Stage badge helpers ──────────────────────────
  const stageBadge = (stage: string) => {
    const map: Record<string, { label: string; classes: string }> = {
      job_scheduled: { label: 'Scheduled', classes: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
      in_progress: { label: 'In Progress', classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
      deposit_collected: { label: 'Deposit Paid', classes: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
      completed: { label: 'Completed', classes: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    };
    const info = map[stage] || { label: stage, classes: 'bg-gray-100 text-gray-600' };
    return info;
  };

  // ── Today's date formatted ──────────────────────
  const todayFormatted = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <PageTransition>
    <DesktopSidebar active="home" />
    <DashboardPullToRefresh>
    <div className="min-h-dvh bg-[#f2f2f7] dark:bg-gray-950 pb-28 lg:pb-8 lg:pl-[220px]">

      {/* ── Header ─────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-[#f2f2f7]/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-5 pt-14 lg:pt-6 pb-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <p className="text-[12px] text-gray-400 dark:text-gray-500 font-medium">{todayFormatted}</p>
            <h1 className="text-[28px] font-bold tracking-tight text-gray-900 dark:text-gray-100 leading-tight">
              {greeting}, {firstName}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <DashboardThemeToggle />
            <NotificationBell />
            <ExportDropdown />
            <Link href="/settings" aria-label="Settings" className="flex h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
              {profile?.logo_url ? (
                <img src={profile.logo_url} alt="Your business logo" className="h-full w-full rounded-full object-cover" />
              ) : (
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400" aria-hidden="true">
                  {firstName.slice(0, 2).toUpperCase()}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 pt-5 space-y-6 lg:px-8 lg:grid lg:grid-cols-[1fr_380px] lg:gap-8 lg:space-y-0 lg:auto-rows-min">

        {/* ══════════════════════════════════════════
            0. SMART ACTIONS BAR — Horizontal scroll on mobile
            ══════════════════════════════════════════ */}
        {hasAttentionItems && (
          <div className="lg:col-span-2">
            <SmartActionsBar
              awaitingCount={awaitingResponse.length}
              depositsCount={depositsToCollect.length}
              collectableAmount={collectableAmount}
              todayJobsCount={allTodayEvents.length}
              followUpCount={followUpNeeded.length}
              jobsToScheduleCount={jobsToSchedule.length}
            />
          </div>
        )}

        {/* ══════════════════════════════════════════
            1. STATS CARDS — Big numbers that pop
            ══════════════════════════════════════════ */}
        <div className="lg:col-start-1">
          <DashboardStats
            monthlyRevenue={monthlyRevenue}
            quotesSentCount={quotesSentCount}
            approvalRate={approvalRate}
            pendingValue={pendingValue}
            pendingCount={pendingQuotes.length}
            revenueTrend={revenueTrend}
            sentTrend={sentTrend}
            avgQuoteValue={avgQuoteValue}
          />
        </div>

        {/* ══════════════════════════════════════════
            2. TODAY'S SCHEDULE
            ══════════════════════════════════════════ */}
        <section className="lg:col-start-2 lg:row-start-2 lg:row-span-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <h2 className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">
                Today
              </h2>
              {allTodayEvents.length > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                  {allTodayEvents.length}
                </span>
              )}
            </div>
            <Link href="/schedule" className="text-[12px] font-medium text-brand-600 dark:text-brand-400 active:opacity-70 transition-opacity">
              Full Schedule
            </Link>
          </div>

          {allTodayEvents.length > 0 ? (
            <div className="space-y-2">
              {allTodayEvents.map((event: Record<string, unknown>) => {
                const eventType = (event.event_type as string) || 'default';
                const colors = getEventColor(eventType);
                const quoteId = event.quote_id as string | null;
                const address = typeof event.job_address === 'string' ? event.job_address : '';

                return (
                  <div key={event.id as string} className={`rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] border-l-[3px] ${colors.border} overflow-hidden`}>
                    {quoteId ? (
                      <Link href={`/jobs/${quoteId}`} className="block px-4 pt-3.5 pb-2.5 active:bg-gray-50 dark:active:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {(event.customer_name as string) || (event.title as string)}
                            </p>
                          </div>
                          <span className="text-[12px] font-medium text-gray-400 dark:text-gray-500 tabular-nums whitespace-nowrap">
                            {formatTime(event.start_time as string | null)}
                          </span>
                          <svg className="h-4 w-4 text-gray-300 dark:text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </div>
                      </Link>
                    ) : (
                      <div className="px-4 pt-3.5 pb-2.5">
                        <div className="flex items-center gap-3">
                          <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
                          <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100 truncate flex-1">
                            {(event.customer_name as string) || (event.title as string)}
                          </p>
                          <span className="text-[12px] font-medium text-gray-400 dark:text-gray-500 tabular-nums whitespace-nowrap">
                            {formatTime(event.start_time as string | null)}
                          </span>
                        </div>
                      </div>
                    )}
                    {address && (
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 pb-3 pt-0 ml-[23px] text-[12px] text-brand-600 dark:text-brand-400 active:text-brand-700"
                      >
                        <svg className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <span className="truncate underline underline-offset-2">{address}</span>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] px-5 py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 mb-3">
                <svg className="h-6 w-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <p className="text-[14px] font-medium text-gray-500 dark:text-gray-400">No jobs scheduled today</p>
              <Link href="/schedule" className="inline-flex items-center gap-1.5 mt-3 rounded-full bg-brand-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm active:scale-[0.97] transition-all">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Schedule a Job
              </Link>
            </div>
          )}
        </section>

        {/* ══════════════════════════════════════════
            3. DO THIS NOW — Smart Actions
            ══════════════════════════════════════════ */}
        {smartActions.length > 0 && (
          <div className="lg:col-start-1">
            <DoThisNow
              actions={smartActions}
              leadScores={leadScoreMap}
            />
          </div>
        )}

        {/* ══════════════════════════════════════════
            4. QUICK ACTIONS — Big tap targets
            ══════════════════════════════════════════ */}
        <div className="lg:col-start-1">
          <h2 className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            Quick Actions
          </h2>
          <QuickActions />
        </div>

        {/* ══════════════════════════════════════════
            5. ACTIVE JOBS
            ══════════════════════════════════════════ */}
        {activeJobs.length > 0 && (
          <section className="lg:col-start-1">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-5.1m0 0L12 4.37m-5.68 5.7h15.08" />
                </svg>
                <h2 className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">
                  Active Jobs
                </h2>
              </div>
              <Link href="/jobs" className="text-[12px] font-medium text-brand-600 dark:text-brand-400 active:opacity-70 transition-opacity">
                View All
              </Link>
            </div>
            <div className="space-y-2">
              {activeJobs.map(job => {
                const badge = stageBadge(job.pipeline_stage);
                const tasks = (job.job_tasks as { id: string; text: string; done: boolean; created_at: string }[]) || [];
                const doneTasks = tasks.filter(t => t.done).length;
                const totalTasks = tasks.length;
                const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
                const scheduledDate = job.scheduled_date
                  ? new Date(job.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : null;

                return (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="block rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] px-4 py-3.5 active:bg-gray-50 dark:active:bg-gray-800 transition-all min-h-[56px]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {job.customer_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.classes}`}>
                            {badge.label}
                          </span>
                          {scheduledDate && (
                            <span className="text-[11px] text-gray-400 dark:text-gray-500">{scheduledDate}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {totalTasks > 0 && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-brand-500 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 tabular-nums">
                              {doneTasks}/{totalTasks}
                            </span>
                          </div>
                        )}
                        <svg className="h-4 w-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════
            6. RECENT ACTIVITY — Last quotes with status pills
            ══════════════════════════════════════════ */}
        {recentQuotes.length > 0 && (
          <section className="lg:col-start-2">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">
                  Recent Activity
                </h2>
              </div>
              <Link href="/quotes" className="text-[12px] font-medium text-brand-600 dark:text-brand-400 active:opacity-70 transition-opacity">
                All Quotes
              </Link>
            </div>
            <RecentActivity quotes={recentQuotes} />
          </section>
        )}

        {/* ══════════════════════════════════════════
            7. REVENUE INTELLIGENCE
            ══════════════════════════════════════════ */}
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

        {/* ══════════════════════════════════════════
            8. SCHEDULING INTELLIGENCE
            ══════════════════════════════════════════ */}
        {schedulingInsights.length > 0 && (
          <section className="lg:col-start-2">
            <h2 className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              Scheduling
            </h2>
            <div className="space-y-2">
              {schedulingInsights.slice(0, 3).map((insight, idx) => {
                const iconMap: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
                  unscheduled_paid: {
                    bg: 'bg-amber-50 dark:bg-amber-900/20',
                    text: 'text-amber-600 dark:text-amber-400',
                    icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>,
                  },
                  same_day_cluster: {
                    bg: 'bg-blue-50 dark:bg-blue-900/20',
                    text: 'text-blue-600 dark:text-blue-400',
                    icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
                  },
                  gap_day: {
                    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                    text: 'text-emerald-600 dark:text-emerald-400',
                    icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
                  },
                };
                const style = iconMap[insight.type] || iconMap.gap_day;
                return (
                  <div
                    key={`sched-${idx}`}
                    className="flex items-start gap-3 rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] px-4 py-3"
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${style.bg} ${style.text}`}>
                      {style.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">{insight.headline}</p>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">{insight.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════
            9. REVENUE CHART
            ══════════════════════════════════════════ */}
        {hasPaidQuotes && (
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

        {/* ══════════════════════════════════════════
            10. RECENT QUOTES — Compact preview, not full list
            ══════════════════════════════════════════ */}
        <div className="lg:col-start-1 min-w-0">
          {!quotes || quotes.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/20">
                <svg className="h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </div>
              <h2 className="text-[20px] font-bold text-gray-900 dark:text-gray-100">Create Your First Quote</h2>
              <p className="text-[14px] text-gray-500 max-w-xs mx-auto">
                Take photos of a job site and let AI generate a professional quote with inspection findings in under 60 seconds.
              </p>
              <Link
                href="/quotes/new"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-[15px] font-semibold text-white hover:bg-brand-700 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create Your First Quote
              </Link>
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Quick Setup</p>
                <Link href="/settings" className="flex items-center gap-3 rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                    <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-gray-900 dark:text-gray-100">Set up your profile</p>
                    <p className="text-[12px] text-gray-500">Add your logo, business name, and rates</p>
                  </div>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Recent Quotes
                </h2>
                <Link href="/pipeline" className="text-[12px] font-medium text-brand-600 dark:text-brand-400 active:opacity-70 transition-opacity">
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {activeQuotes.filter(q => !q.archived && q.status !== 'draft').slice(0, 5).map((quote) => {
                  const thumb = quote.photos?.[0];
                  const statusColor: Record<string, string> = {
                    sent: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
                    approved: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
                    deposit_paid: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',
                    cancelled: 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-300',
                    draft: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
                  };
                  const statusLabel: Record<string, string> = {
                    draft: 'Draft', sent: 'Sent', approved: 'Approved', deposit_paid: 'Paid', cancelled: 'Cancelled',
                  };
                  return (
                    <Link
                      key={quote.id}
                      href={`/quotes/${quote.id}`}
                      className="flex items-center gap-3 rounded-2xl bg-white dark:bg-gray-900 px-4 py-3 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] active:bg-gray-50 dark:active:bg-gray-800 transition-all min-h-[64px]"
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                        {thumb ? (
                          <img src={thumb} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <svg className="h-5 w-5 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-gray-900 dark:text-gray-100">
                          {quote.customer_name}
                        </p>
                        <p className="text-[12px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                          {quote.scope_of_work || quote.ai_description || 'No description'}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                          ${Number(quote.total ?? quote.subtotal).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </p>
                        <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColor[quote.status] || 'bg-gray-100 text-gray-500'}`}>
                          {statusLabel[quote.status] || quote.status}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
              {activeQuotes.filter(q => !q.archived && q.status !== 'draft').length > 5 && (
                <div className="flex justify-center pt-4">
                  <Link
                    href="/pipeline"
                    className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-gray-900 px-5 py-3 text-[13px] font-semibold text-gray-700 dark:text-gray-300 ring-1 ring-black/[0.04] dark:ring-white/[0.06] shadow-sm active:scale-[0.97] transition-all min-h-[44px]"
                  >
                    View All Quotes
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── Bottom Nav ─────────────────────────── */}
      <BottomNav active="home" />

      <InstallPrompt />
    </div>
    </DashboardPullToRefresh>
    </PageTransition>
  );
}
