'use client';

import { useState } from 'react';
import Link from 'next/link';
import QuickAddMenu from './QuickAddMenu';
import MoreMenu from './MoreMenu';
import { haptic } from '@/lib/haptic';

interface BottomNavProps {
  active: 'home' | 'jobs' | 'new' | 'invoices' | 'more';
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
    key: 'jobs',
    href: '/jobs',
    label: 'Jobs',
    outlineIcon: (
      <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    ),
    filledIcon: (
      <svg className="h-[22px] w-[22px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M7.5 5.25a3 3 0 013-3h3a3 3 0 013 3v.205c4.566.456 8.044 2.602 8.044 5.131v4.164c0 2.982-4.477 5.4-10.044 5.4S4.456 17.732 4.456 14.75v-4.164c0-2.529 3.478-4.675 8.044-5.131V5.25zm3-1.5a1.5 1.5 0 00-1.5 1.5v.128a49.558 49.558 0 016 0V5.25a1.5 1.5 0 00-1.5-1.5h-3zM12 14.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        <path d="M3.75 18.469c1.82 1.386 4.835 2.381 8.25 2.381s6.43-.995 8.25-2.381V21a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.531z" />
      </svg>
    ),
  },
  'fab',
  {
    key: 'invoices',
    href: '/invoices',
    label: 'Invoices',
    outlineIcon: (
      <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    filledIcon: (
      <svg className="h-[22px] w-[22px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875zm5.845 17.03a.75.75 0 001.06 0l3-3a.75.75 0 10-1.06-1.06l-1.72 1.72V12a.75.75 0 00-1.5 0v4.19l-1.72-1.72a.75.75 0 00-1.06 1.06l3 3z" clipRule="evenodd" />
        <path d="M14.25 5.25a5.23 5.23 0 00-1.279-3.434 9.768 9.768 0 016.963 6.963A5.23 5.23 0 0016.5 7.5h-1.875a.375.375 0 01-.375-.375V5.25z" />
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
                    <span className={`transition-colors duration-200 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'}`}>
                      {isActive ? tab.filledIcon : tab.outlineIcon}
                    </span>
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-[3px] w-[3px] rounded-full bg-brand-600 dark:bg-brand-400 animate-tab-active" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] leading-tight ${
                      isActive
                        ? 'font-semibold text-brand-600 dark:text-brand-400'
                        : 'font-medium text-gray-400 dark:text-gray-500'
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
                  <span className={`transition-colors duration-200 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'}`}>
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
                  className={`text-[10px] leading-tight ${
                    isActive
                      ? 'font-semibold text-brand-600 dark:text-brand-400'
                      : 'font-medium text-gray-400 dark:text-gray-500'
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
