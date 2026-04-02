import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import QuoteList from '@/components/QuoteList';
import RevenueChart from '@/components/RevenueChart';
import InstallPrompt from '@/components/InstallPrompt';
import ExportDropdown from '@/components/ExportDropdown';
import { NotificationBell } from '@/components/NotificationBell';
import { DashboardThemeToggle } from '@/components/DashboardThemeToggle';
import DashboardPullToRefresh from '@/components/DashboardPullToRefresh';
import DashboardStats from '@/components/DashboardStats';
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
    // Fetch today's events with quote and client joins
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
      // Fallback: try 'events' table
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
    // Events table may not exist yet — that's fine
  }

  // ── Also include quotes with scheduled_date = today (backcompat) ──
  const allQuotes = quotes || [];
  const activeQuotes = allQuotes.filter(q => !q.archived);

  const quotesScheduledToday = activeQuotes.filter(q => q.scheduled_date === todayStr);
  // Merge into today's events (avoid duplicates by quote_id)
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

  const hasActionableQuotes = activeQuotes.some(q => q.status === 'sent' || q.status === 'approved');
  const defaultFilter = hasActionableQuotes ? 'Sent' : 'All';

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

  // ── Today's Focus — powered by Smart Action Engine ──────────
  const topFocusItems = smartActions;

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

  return (
    <PageTransition>
    <DesktopSidebar active="home" />
    <DashboardPullToRefresh>
    <div className="min-h-dvh bg-[#f2f2f7] dark:bg-gray-950 pb-28 lg:pb-8 lg:pl-[220px]">

      {/* ── Header ─────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-[#f2f2f7]/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-5 pt-14 lg:pt-6 pb-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 font-medium">{greeting}</p>
            <h1 className="text-[22px] font-bold tracking-tight text-gray-900 dark:text-gray-100">{firstName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/quotes/new"
              className="flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm press-scale transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Quote
            </Link>
            <DashboardThemeToggle />
            <NotificationBell />
            <ExportDropdown />
            <Link href="/settings" aria-label="Settings" className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
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

      <main className="mx-auto max-w-7xl px-4 pt-5 space-y-5 lg:px-8 lg:grid lg:grid-cols-[1fr_380px] lg:gap-8 lg:space-y-0 lg:auto-rows-min">

        {/* ══════════════════════════════════════════
            0. SMART ACTIONS — "What to do right now"
            ══════════════════════════════════════════ */}
        {topFocusItems.length > 0 && (
          <div className="lg:col-start-1">
            <DoThisNow
              actions={topFocusItems}
              leadScores={leadScoreMap}
            />
          </div>
        )}

        {/* ══════════════════════════════════════════
            1. TODAY'S SCHEDULE
            ══════════════════════════════════════════ */}
        <section className="lg:col-start-2 lg:row-start-1">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                Today&apos;s Schedule
              </h2>
              {allTodayEvents.length > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                  {allTodayEvents.length}
                </span>
              )}
            </div>
            <Link href="/schedule" className="text-[12px] font-medium text-brand-600 dark:text-brand-400">
              View Full Schedule &rarr;
            </Link>
          </div>

          {allTodayEvents.length > 0 ? (
            <div className="space-y-2">
              {allTodayEvents.map((event: Record<string, unknown>) => {
                const eventType = (event.event_type as string) || 'default';
                const colors = getEventColor(eventType);
                const quoteId = event.quote_id as string | null;
                const cardClass = `block rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] border-l-[3px] ${colors.border} px-4 py-3 transition-colors ${quoteId ? 'active:bg-gray-50 dark:active:bg-gray-800' : ''}`;
                const cardContent = (
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center pt-0.5">
                        <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {(event.customer_name as string) || (event.title as string)}
                          </span>
                          <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                            {formatTime(event.start_time as string | null)}
                          </span>
                        </div>
                        {typeof event.job_address === 'string' && event.job_address && (
                          <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {event.job_address}
                          </p>
                        )}
                      </div>
                      {quoteId && (
                        <svg className="h-4 w-4 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      )}
                    </div>
                );

                return quoteId ? (
                  <Link key={event.id as string} href={`/jobs/${quoteId}`} className={cardClass}>
                    {cardContent}
                  </Link>
                ) : (
                  <div key={event.id as string} className={cardClass}>
                    {cardContent}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] px-5 py-6 text-center">
              <svg className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <p className="text-[13px] text-gray-400 dark:text-gray-500">Nothing scheduled today</p>
              <Link href="/schedule" className="inline-block mt-2 text-[12px] font-medium text-brand-600 dark:text-brand-400">
                Open Schedule &rarr;
              </Link>
            </div>
          )}
        </section>

        {/* ══════════════════════════════════════════
            2. NEEDS ATTENTION
            ══════════════════════════════════════════ */}
        {hasAttentionItems && (
          <section className="lg:col-start-2">
            <h2 className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              Needs Attention
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none lg:flex-wrap lg:mx-0 lg:px-0 lg:gap-3">
              {awaitingResponse.length > 0 && (
                <Link
                  href="/pipeline?stage=quote_sent"
                  className="flex-shrink-0 flex items-center gap-2.5 rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] px-4 py-3 active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20">
                    <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100">{awaitingResponse.length}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">Awaiting reply</p>
                  </div>
                </Link>
              )}

              {depositsToCollect.length > 0 && (
                <Link
                  href="/pipeline?stage=deposit_collected"
                  className="flex-shrink-0 flex items-center gap-2.5 rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] px-4 py-3 active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                    <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100">{depositsToCollect.length}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">Deposits to collect</p>
                  </div>
                </Link>
              )}

              {jobsToSchedule.length > 0 && (
                <Link
                  href="/schedule"
                  className="flex-shrink-0 flex items-center gap-2.5 rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] px-4 py-3 active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
                    <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100">{jobsToSchedule.length}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">Jobs to schedule</p>
                  </div>
                </Link>
              )}

              {followUpNeeded.length > 0 && (
                <Link
                  href="/pipeline?stage=quote_sent"
                  className="flex-shrink-0 flex items-center gap-2.5 rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] px-4 py-3 active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-900/20">
                    <svg className="h-4 w-4 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100">{followUpNeeded.length}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">Follow up needed</p>
                  </div>
                </Link>
              )}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════
            3. ACTIVE JOBS
            ══════════════════════════════════════════ */}
        {activeJobs.length > 0 && (
          <section className="lg:col-start-1">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                Active Jobs
              </h2>
              <Link href="/pipeline" className="text-[12px] font-medium text-brand-600 dark:text-brand-400">
                View All &rarr;
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
                    className="block rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] px-4 py-3 active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
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
                                className="h-full rounded-full bg-brand-500 transition-all"
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

        {/* ── Stats ──────────────────────────────── */}
        <div className="lg:col-start-2">
          <DashboardStats
            monthlyRevenue={monthlyRevenue}
            quotesSentCount={quotesSentCount}
            approvalRate={approvalRate}
            pendingValue={pendingValue}
            pendingCount={pendingQuotes.length}
            revenueTrend={revenueTrend}
            sentTrend={sentTrend}
          />
        </div>

        {/* ── Revenue Intelligence ───────────────── */}
        {activeQuotes.length > 0 && (
          <div className="lg:col-start-2">
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

        {/* ── Scheduling Intelligence ───────────────── */}
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

        {/* ── Revenue Chart ────────────────────────── */}
        {hasPaidQuotes && (
          <div className="lg:col-start-2">
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

        {/* ── Quotes ─────────────────────────────── */}
        <div className="lg:col-start-1 min-w-0">
          <h2 className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Recent Quotes
          </h2>

          {!quotes || quotes.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
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
            <QuoteList quotes={quotes} defaultFilter={defaultFilter} />
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
