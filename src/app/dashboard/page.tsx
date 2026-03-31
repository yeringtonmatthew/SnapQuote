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
        />

        {/* ── Revenue Chart ────────────────────────── */}
        {hasPaidQuotes && (
          <div className="rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-sm border border-gray-100 dark:border-gray-800 card-interactive">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Revenue</p>
            <RevenueChart data={revenueData} />
          </div>
        )}

        {/* ── Quotes ─────────────────────────────── */}
        <div>
          <h2 className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Recent Quotes
          </h2>

          {!quotes || quotes.length === 0 ? (
            <div className="space-y-4">
              {/* Getting Started card */}
              <div className="rounded-2xl bg-white px-6 py-6 shadow-sm border border-gray-100">
                <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100 mb-5">Getting Started</p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                      <svg className="h-[18px] w-[18px] text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100">Snap a photo of the job</p>
                      <p className="text-[13px] text-gray-500 mt-0.5">Take a picture of the work area or the issue</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                      <svg className="h-[18px] w-[18px] text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100">AI generates your quote</p>
                      <p className="text-[13px] text-gray-500 mt-0.5">We build a line-by-line estimate automatically</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                      <svg className="h-[18px] w-[18px] text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100">Send it to your customer</p>
                      <p className="text-[13px] text-gray-500 mt-0.5">Share a professional quote via text or email</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Link
                href="/quotes/new"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-4 text-[15px] font-semibold text-white shadow-sm press-scale transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create Your First Quote
              </Link>
            </div>
          ) : (
            <QuoteList quotes={quotes} />
          )}
        </div>
      </main>

      {/* ── Bottom Nav ─────────────────────────── */}
      <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200/60 dark:border-gray-800/60 px-4 pb-6 pt-2">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          <Link href="/dashboard" aria-current="page" className="flex flex-col items-center gap-1 rounded-xl press-scale focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600">
              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11.47 3.841a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.061l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.689z" />
                <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.432z" />
              </svg>
            </div>
            <span className="text-[10px] font-semibold text-brand-600">Home</span>
          </Link>

          <Link href="/schedule" className="flex flex-col items-center gap-1 rounded-xl press-scale focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <span className="text-[10px] font-semibold text-gray-500">Schedule</span>
          </Link>

          <Link href="/quotes/new" aria-label="Create new quote" className="flex flex-col items-center gap-1 -mt-5 rounded-full press-scale focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 shadow-lg shadow-brand-500/30">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="text-[10px] font-semibold text-gray-500">Quote</span>
          </Link>

          <Link href="/settings" className="flex flex-col items-center gap-1 rounded-xl press-scale focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <span className="text-[10px] font-semibold text-gray-500">Profile</span>
          </Link>
        </div>
      </nav>

      <InstallPrompt />
    </div>
    </DashboardPullToRefresh>
    </PageTransition>
  );
}
