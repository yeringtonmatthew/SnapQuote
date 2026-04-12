'use client';

import { useState } from 'react';
import Link from 'next/link';
import QuickAddMenu from './QuickAddMenu';
import MoreMenu from './MoreMenu';
import { haptic } from '@/lib/haptic';

interface BottomNavProps {
  active: 'home' | 'schedule' | 'new' | 'search' | 'more';
  /** Optional unread notification count to show on Dashboard tab */
  notificationCount?: number;
}

/* ────────────────────────────────────────────────
   Tab definition — five visible tabs with FAB in center
   ──────────────────────────────────────────────── */

interface TabDef {
  key: BottomNavProps['active'];
  href: string;
  label: string;
  /** Outline icon (inactive) */
  outlineIcon: React.ReactNode;
  /** Filled icon (active) */
  filledIcon: React.ReactNode;
  /** If true, this tab toggles the More menu instead of navigating */
  isMore?: boolean;
}

const TABS: (TabDef | 'fab')[] = [
  {
    key: 'home',
    href: '/dashboard',
    label: 'Dashboard',
    outlineIcon: (
      <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
    filledIcon: (
      <svg className="h-[22px] w-[22px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M11.47 3.841a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.061l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.689z" />
        <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.432z" />
      </svg>
    ),
  },
  {
    key: 'schedule',
    href: '/schedule',
    label: 'Schedule',
    outlineIcon: (
      <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    filledIcon: (
      <svg className="h-[22px] w-[22px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
        <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
      </svg>
    ),
  },
  'fab',
  {
    key: 'search',
    href: '/clients',
    label: 'Clients',
    outlineIcon: (
      <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    filledIcon: (
      <svg className="h-[22px] w-[22px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    key: 'more',
    href: '#',
    label: 'More',
    isMore: true,
    outlineIcon: (
      <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>
    ),
    filledIcon: (
      <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>
    ),
  },
];

export default function BottomNav({ active, notificationCount }: BottomNavProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      <MoreMenu open={showMore} onClose={() => setShowMore(false)} />

      <nav
        aria-label="Main navigation"
        data-no-print
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl backdrop-saturate-[1.8] border-t border-gray-200/50 dark:border-gray-700/50 lg:hidden"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
      >
        <div className="mx-auto flex max-w-lg items-end justify-around px-2 pt-1.5">
          {TABS.map((tab, i) => {
            if (tab === 'fab') {
              return <QuickAddMenu key="fab" />;
            }

            const isActive = tab.isMore ? active === 'more' || showMore : active === tab.key;
            const showBadge = tab.key === 'home' && notificationCount && notificationCount > 0;

            /* More tab toggles sheet instead of navigating */
            if (tab.isMore) {
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    haptic('light');
                    setShowMore((v) => !v);
                  }}
                  className="relative flex flex-col items-center gap-0.5 tab-press rounded-lg px-3 py-1 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  <div className="relative flex h-7 w-7 items-center justify-center">
                    <span className={`transition-colors duration-200 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {isActive ? tab.filledIcon : tab.outlineIcon}
                    </span>
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-[3px] w-[3px] rounded-full bg-brand-600 dark:bg-brand-400 animate-tab-active" />
                    )}
                  </div>
                  <span
                    className={`text-[11px] leading-tight ${
                      isActive
                        ? 'font-semibold text-brand-600 dark:text-brand-400'
                        : 'font-medium text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={tab.key}
                href={tab.href}
                aria-current={isActive ? 'page' : undefined}
                className="relative flex flex-col items-center gap-0.5 tab-press rounded-lg px-3 py-1 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <div className="relative flex h-7 w-7 items-center justify-center">
                  <span className={`transition-colors duration-200 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {isActive ? tab.filledIcon : tab.outlineIcon}
                  </span>

                  {/* Active indicator dot */}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-[3px] w-[3px] rounded-full bg-brand-600 dark:bg-brand-400 animate-tab-active" />
                  )}

                  {/* Notification badge */}
                  {showBadge && (
                    <span className="absolute -right-1.5 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white leading-none animate-badge-pop">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[11px] leading-tight ${
                    isActive
                      ? 'font-semibold text-brand-600 dark:text-brand-400'
                      : 'font-medium text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
