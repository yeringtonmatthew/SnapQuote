import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import InstallPrompt from '@/components/InstallPrompt';
import ExportDropdown from '@/components/ExportDropdown';
import { NotificationBell } from '@/components/NotificationBell';
import { DashboardThemeToggle } from '@/components/DashboardThemeToggle';
import DashboardPullToRefresh from '@/components/DashboardPullToRefresh';
import PageTransition from '@/components/PageTransition';
import BottomNav from '@/components/BottomNav';
import DesktopSidebar from '@/components/DesktopSidebar';

// Section components (async, streamed via Suspense)
import DashboardStatsSection from '@/components/dashboard/DashboardStats.section';
import DashboardScheduleSection from '@/components/dashboard/DashboardSchedule.section';
import DashboardActionsSection from '@/components/dashboard/DashboardActions.section';
import DashboardActivitySection from '@/components/dashboard/DashboardActivity.section';

// Section skeletons
import { StatsSkeleton } from '@/components/dashboard/StatsSkeleton';
import { ScheduleSkeleton } from '@/components/dashboard/ScheduleSkeleton';
import { ActionsSkeleton } from '@/components/dashboard/ActionsSkeleton';
import { ActivitySkeleton } from '@/components/dashboard/ActivitySkeleton';

export default async function DashboardPage() {
  // Only auth + profile — fast, renders shell immediately
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (profile && !profile.onboarded) redirect('/onboarding');

  // ── Greeting + date — computed instantly ──────────────
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = profile?.full_name?.split(' ')[0] || profile?.business_name || 'there';
  const todayFormatted = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <PageTransition>
    <DesktopSidebar active="home" />
    <DashboardPullToRefresh>
    <div className="min-h-dvh bg-[#f2f2f7] dark:bg-gray-950 pb-28 lg:pb-8 lg:pl-[220px]">

      {/* ── Header — renders instantly ─────────────────────────────── */}
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

        {/* Stats + SmartActionsBar + Revenue Chart + Revenue Intelligence — streams in */}
        <Suspense fallback={<StatsSkeleton />}>
          <DashboardStatsSection userId={user.id} />
        </Suspense>

        {/* Today's Schedule + Scheduling Intelligence — streams in */}
        <Suspense fallback={<ScheduleSkeleton />}>
          <DashboardScheduleSection userId={user.id} />
        </Suspense>

        {/* Smart Actions (DoThisNow) — streams in */}
        <Suspense fallback={<ActionsSkeleton />}>
          <DashboardActionsSection userId={user.id} />
        </Suspense>

        {/* QuickActions + Active Jobs + Recent Activity + Recent Quotes — streams in */}
        <Suspense fallback={<ActivitySkeleton />}>
          <DashboardActivitySection userId={user.id} />
        </Suspense>

      </main>

      {/* ── Bottom Nav ─────────────────────────── */}
      <BottomNav active="home" />

      <InstallPrompt />
    </div>
    </DashboardPullToRefresh>
    </PageTransition>
  );
}
