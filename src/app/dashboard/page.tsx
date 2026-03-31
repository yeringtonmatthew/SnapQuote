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
    .select('id, customer_name, customer_phone, status, subtotal, deposit_amount, photos, scope_of_work, ai_description, quote_number, created_at, sent_at, approved_at, paid_at, archived, internal_notes')
    .eq('contractor_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = profile?.full_name?.split(' ')[0] || profile?.business_name || 'there';

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const allQuotes = quotes || [];
  // Exclude archived quotes from dashboard stats
  const activeQuotes = allQuotes.filter(q => !q.archived);
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
  const pendingValue = pendingQuotes.reduce((sum, q) => sum + Number(q.subtotal), 0);

  // ── Trend calculations: this month vs last month ──
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endOfLastMonth = startOfMonth; // start of this month = end of last month

  const paidLastMonth = activeQuotes.filter(
    q => q.status === 'deposit_paid' && q.paid_at && q.paid_at >= startOfLastMonth && q.paid_at < endOfLastMonth
  );
  const lastMonthRevenue = paidLastMonth.reduce((sum, q) => sum + Number(q.deposit_amount), 0);

  const sentLastMonth = activeQuotes.filter(
    q => q.sent_at && q.sent_at >= startOfLastMonth && q.sent_at < endOfLastMonth
  );
  const lastMonthSentCount = sentLastMonth.length;

  // Calculate trend percentages (null if no data to compare)
  const revenueTrend = lastMonthRevenue > 0
    ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : null;
  const sentTrend = lastMonthSentCount > 0
    ? Math.round(((quotesSentCount - lastMonthSentCount) / lastMonthSentCount) * 100)
    : null;

  // Revenue chart data: last 6 months of deposit_paid quotes grouped by paid_at month
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

  // Determine if there are any active (non-archived) "sent" or "approved" quotes for default filter
  const hasActionableQuotes = activeQuotes.some(q => q.status === 'sent' || q.status === 'approved');
  const defaultFilter = hasActionableQuotes ? 'Sent' : 'All';

  return (
    <PageTransition>
    <DashboardPullToRefresh>
    <div className="min-h-dvh bg-[#f2f2f7] dark:bg-gray-950 pb-28">

      {/* ── Header ─────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-[#f2f2f7]/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-5 pt-14 pb-4">
        <div className="mx-auto max-w-lg flex items-center justify-between">
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

      <main className="mx-auto max-w-lg px-4 pt-5 space-y-5">

        {/* ── Stats ──────────────────────────────── */}
        <DashboardStats
          monthlyRevenue={monthlyRevenue}
          quotesSentCount={quotesSentCount}
          approvalRate={approvalRate}
          pendingValue={pendingValue}
          pendingCount={pendingQuotes.length}
          revenueTrend={revenueTrend}
          sentTrend={sentTrend}
        />

        {/* ── Revenue Chart (collapsible) ────────────────────────── */}
        {hasPaidQuotes && (
          <details className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
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
        )}

        {/* ── Quotes ─────────────────────────────── */}
        <div>
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
