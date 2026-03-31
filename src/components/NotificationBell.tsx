'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Notification } from '@/types/database';
import { relativeTime } from '@/lib/relative-time';
import EmptyState from '@/components/EmptyState';

function NotificationIcon({ type }: { type: string }) {
  if (type === 'quote_viewed') {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
        <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
    );
  }
  if (type === 'quote_approved') {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50">
        <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
    );
  }
  if (type === 'quote_paid') {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50">
        <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  }
  return null;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      // silent
    }
  }, []);

  // Fetch on mount and poll every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        open &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  async function markAllRead() {
    setLoading(true);
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 press-scale focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg className="h-4.5 w-4.5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none animate-badge-pop">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Mobile backdrop */}
          <div className="fixed inset-0 z-30 bg-black/20 sm:hidden" onClick={() => setOpen(false)} />

          <div
            ref={panelRef}
            role="dialog"
            aria-label="Notifications"
            className="fixed left-0 right-0 top-0 z-40 sm:absolute sm:right-0 sm:left-auto sm:top-full sm:mt-2 sm:w-80
              animate-in slide-in-from-top-2 duration-200
              max-h-[80dvh] sm:max-h-[460px] overflow-hidden
              rounded-b-2xl sm:rounded-2xl bg-white shadow-xl border border-gray-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-14 pb-3 sm:pt-4 border-b border-gray-100">
              <h3 className="text-[15px] font-bold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    disabled={loading}
                    className="text-[12px] font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-[calc(80dvh-60px)] sm:max-h-[400px]">
              {notifications.length === 0 ? (
                <EmptyState
                  icon={
                    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                  }
                  title="All caught up"
                  description="You'll see notifications here when customers view or approve your quotes."
                />
              ) : (
                notifications.map((n) => (
                  <a
                    key={n.id}
                    href={`/quotes/${n.quote_id}`}
                    onClick={() => setOpen(false)}
                    className={`flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 transition-colors hover:bg-gray-50 ${
                      !n.read ? 'bg-brand-50/30' : ''
                    }`}
                  >
                    <NotificationIcon type={n.type} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-[13px] leading-snug ${!n.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                        {n.message}
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-400">{relativeTime(n.created_at)}</p>
                    </div>
                    {!n.read && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
                    )}
                  </a>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
