'use client';

import Link from 'next/link';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface RecentQuote {
  id: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
  sent_at?: string | null;
  approved_at?: string | null;
  paid_at?: string | null;
}

interface Props {
  quotes: RecentQuote[];
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  draft: { label: 'Draft', classes: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  sent: { label: 'Sent', classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  viewed: { label: 'Viewed', classes: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
  approved: { label: 'Approved', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  deposit_paid: { label: 'Paid', classes: 'bg-emerald-600 text-white dark:bg-emerald-500' },
  declined: { label: 'Declined', classes: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  expired: { label: 'Expired', classes: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500' },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

const fmtMoney = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

function SwipeableQuoteCard({ q }: { q: RecentQuote }) {
  const [offset, setOffset] = useState(0);
  const [archiving, setArchiving] = useState(false);
  const [archived, setArchived] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isDragging = useRef(false);
  const cardWidth = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const config = statusConfig[q.status] || statusConfig.draft;
  const latestDate = q.paid_at || q.approved_at || q.sent_at || q.created_at;

  const doArchive = useCallback(async () => {
    if (archiving) return;
    setArchiving(true);
    setOffset(-9999); // slide fully off screen
    try {
      await fetch(`/api/quotes/${q.id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: true }),
      });
      setTimeout(() => {
        setArchived(true);
        router.refresh();
      }, 300);
    } catch {
      setOffset(0);
      setArchiving(false);
    }
  }, [q.id, router, archiving]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (archiving) return;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isDragging.current = false;
    if (cardRef.current) {
      cardWidth.current = cardRef.current.offsetWidth;
    }
  }, [archiving]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (archiving) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    if (!isDragging.current && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
      isDragging.current = true;
    }

    if (isDragging.current && dx < 0) {
      setOffset(dx);
    }
  }, [archiving]);

  const handleTouchEnd = useCallback(() => {
    if (archiving) return;
    if (!isDragging.current) return;

    const threshold = cardWidth.current * 0.4; // 40% of card width = auto archive
    if (Math.abs(offset) > threshold) {
      doArchive();
    } else {
      setOffset(0);
    }
  }, [offset, doArchive, archiving]);

  if (archived) return null;

  // How far swiped as a percentage
  const swipePercent = cardWidth.current > 0 ? Math.min(Math.abs(offset) / cardWidth.current, 1) : 0;

  return (
    <div ref={cardRef} className="relative overflow-hidden rounded-2xl">
      {/* Red archive background */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center rounded-2xl bg-red-500"
        style={{ width: '100%', opacity: Math.min(swipePercent * 2, 1) }}
      >
        <div className="flex items-center gap-2 text-white font-semibold text-[13px] pr-4" style={{ position: 'absolute', right: 16 }}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          Archive
        </div>
      </div>

      {/* Swipeable card */}
      <Link
        href={`/quotes/${q.id}`}
        onClick={(e) => { if (isDragging.current) e.preventDefault(); }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative flex items-center gap-3 bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] px-4 py-3 min-h-[56px] rounded-2xl"
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.25s ease-out',
        }}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <span className="text-[13px] font-bold text-gray-500 dark:text-gray-400">
            {q.customer_name.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100 truncate leading-tight">
            {q.customer_name}
          </p>
          <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">
            {timeAgo(latestDate)}
          </p>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-1">
          <p className="text-[14px] font-bold text-gray-900 dark:text-gray-100 tabular-nums">
            {fmtMoney(q.total)}
          </p>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none ${config.classes}`}>
            {config.label}
          </span>
        </div>
      </Link>
    </div>
  );
}

export default function RecentActivity({ quotes }: Props) {
  if (quotes.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {quotes.map((q) => (
        <SwipeableQuoteCard key={q.id} q={q} />
      ))}
    </div>
  );
}
