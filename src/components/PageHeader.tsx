'use client';

import { useEffect, useState, useRef } from 'react';

interface PageHeaderProps {
  /** Page title displayed large */
  title: string;
  /** Optional subtitle below the title */
  subtitle?: string;
  /** Right-side action elements (notification bell, buttons, etc.) */
  actions?: React.ReactNode;
  /** Optional left-side back button or element */
  leading?: React.ReactNode;
  /** Extra padding-top for safe area (already included by default) */
  className?: string;
}

/**
 * iOS-style sticky page header with backdrop blur on scroll.
 * Automatically detects scroll position and applies the translucent
 * frosted-glass effect when the user scrolls down.
 */
export default function PageHeader({ title, subtitle, actions, leading, className = '' }: PageHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    // Check initial position
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-20 transition-[background-color,border-color,backdrop-filter] duration-200 ${
        scrolled
          ? 'bg-[#f2f2f7]/80 dark:bg-gray-950/80 backdrop-blur-2xl backdrop-saturate-[1.8] border-b border-gray-200/50 dark:border-gray-700/40'
          : 'bg-[#f2f2f7] dark:bg-gray-950 border-b border-transparent'
      } px-5 pt-14 lg:pt-6 pb-3 ${className}`}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {leading}
          <div className="min-w-0">
            <h1 className="text-[22px] font-bold tracking-tight text-gray-900 dark:text-gray-100 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
