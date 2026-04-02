'use client';

import Link from 'next/link';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';

interface DesktopSidebarProps {
  active: 'home' | 'pipeline' | 'schedule' | 'clients' | 'profile';
}

const navItems = [
  {
    key: 'home',
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <path d="M11.47 3.841a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.061l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.689z" />
    ),
    icon2: (
      <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.432z" />
    ),
    filled: true,
  },
  {
    key: 'pipeline',
    label: 'Pipeline',
    href: '/pipeline',
    svgContent: (active: boolean) => (
      <>
        <rect x="3" y="4" width="4" height="16" rx="1" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} />
        <rect x="10" y="4" width="4" height="12" rx="1" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} />
        <rect x="17" y="4" width="4" height="8" rx="1" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} />
      </>
    ),
  },
  {
    key: 'clients',
    label: 'Clients',
    href: '/clients',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    ),
  },
  {
    key: 'schedule',
    label: 'Schedule',
    href: '/schedule',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    ),
  },
  {
    key: 'profile',
    label: 'Settings',
    href: '/settings',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    ),
    icon2: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    ),
  },
];

export default function DesktopSidebar({ active }: DesktopSidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-[220px] lg:border-r border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-30">
      {/* Logo */}
      <div className="px-5 pt-6 pb-6">
        <SnapQuoteLogo size="sm" />
      </div>

      {/* Quick add */}
      <div className="px-3 mb-4">
        <Link
          href="/quotes/new"
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm press-scale transition-colors w-full justify-center"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Quote
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = active === item.key;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <svg
                className={`h-[18px] w-[18px] ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}`}
                fill={item.filled && isActive ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                strokeWidth={isActive ? 2 : 1.75}
                stroke="currentColor"
              >
                {'svgContent' in item && item.svgContent
                  ? item.svgContent(isActive)
                  : (
                    <>
                      {item.icon}
                      {item.icon2}
                    </>
                  )}
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
