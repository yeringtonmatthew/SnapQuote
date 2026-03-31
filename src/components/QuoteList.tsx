'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatQuoteNumber } from '@/lib/format-quote-number';
import { relativeTime } from '@/lib/relative-time';
import EmptyState from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { haptic } from '@/lib/haptic';
import { SwipeProvider } from '@/components/SwipeContext';
import SwipeableCard, { type SwipeAction } from '@/components/SwipeableCard';

type Quote = {
  id: string;
  customer_name: string;
  scope_of_work?: string;
  ai_description?: string;
  subtotal: number;
  status: string;
  quote_number?: number | null;
  photos?: string[];
  expires_at?: string | null;
  archived?: boolean;
  [key: string]: any;
};

const statusColors: Record<string, string> = {
  draft:        'bg-gray-100 text-gray-500',
  sent:         'bg-blue-100 text-blue-600',
  approved:     'bg-amber-100 text-amber-600',
  deposit_paid: 'bg-green-100 text-green-600',
  cancelled:    'bg-red-100 text-red-500',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft', sent: 'Sent', approved: 'Approved',
  deposit_paid: 'Paid', cancelled: 'Cancelled',
};

const FILTERS = ['All', 'Draft', 'Sent', 'Approved', 'Paid', 'Cancelled', 'Archived'] as const;

const filterToStatus: Record<string, string | null> = {
  All: null,
  Draft: 'draft',
  Sent: 'sent',
  Approved: 'approved',
  Paid: 'deposit_paid',
  Cancelled: 'cancelled',
  Archived: '__archived__',
};

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'name-az' | 'name-za';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'highest', label: 'Highest amount' },
  { value: 'lowest', label: 'Lowest amount' },
  { value: 'name-az', label: 'Customer A–Z' },
  { value: 'name-za', label: 'Customer Z–A' },
];

export default function QuoteList({ quotes }: { quotes: Quote[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [confirmBulkArchive, setConfirmBulkArchive] = useState(false);

  const isArchivedView = activeFilter === 'Archived';

  const filtered = useMemo(() => {
    let result = quotes;

    // Archive filtering
    if (isArchivedView) {
      result = result.filter((q) => q.archived);
    } else {
      // By default, hide archived quotes
      result = result.filter((q) => !q.archived);

      // Status filter
      const statusKey = filterToStatus[activeFilter];
      if (statusKey && statusKey !== '__archived__') {
        result = result.filter((q) => q.status === statusKey);
      }
    }

    // Search filter
    const term = search.toLowerCase().trim();
    if (term) {
      result = result.filter(
        (q) =>
          q.customer_name?.toLowerCase().includes(term) ||
          q.scope_of_work?.toLowerCase().includes(term) ||
          (q.quote_number && formatQuoteNumber(q.quote_number).toLowerCase().includes(term))
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'highest':
          return Number(b.subtotal) - Number(a.subtotal);
        case 'lowest':
          return Number(a.subtotal) - Number(b.subtotal);
        case 'name-az':
          return (a.customer_name || '').localeCompare(b.customer_name || '');
        case 'name-za':
          return (b.customer_name || '').localeCompare(a.customer_name || '');
        default:
          return 0;
      }
    });

    return result;
  }, [quotes, search, activeFilter, isArchivedView, sortBy]);

  const toggleSelect = useCallback((id: string) => {
    haptic('light');
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelected(new Set(filtered.map((q) => q.id)));
  }, [filtered]);

  const exitSelectMode = useCallback(() => {
    setSelectMode(false);
    setSelected(new Set());
  }, []);

  const handleBulkAction = useCallback(async (action: 'archive' | 'unarchive') => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    try {
      const res = await fetch('/api/quotes/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected), action }),
      });
      if (res.ok) {
        exitSelectMode();
        router.refresh();
      }
    } catch (err) {
      console.error('Bulk action failed:', err);
    } finally {
      setBulkLoading(false);
    }
  }, [selected, exitSelectMode, router]);

  const handleUnarchiveSingle = useCallback(async (id: string) => {
    try {
      const res = await fetch('/api/quotes/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id], action: 'unarchive' }),
      });
      if (res.ok) router.refresh();
    } catch (err) {
      console.error('Unarchive failed:', err);
    }
  }, [router]);

  const handleArchiveSingle = useCallback(async (id: string) => {
    try {
      const res = await fetch('/api/quotes/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id], action: 'archive' }),
      });
      if (res.ok) {
        haptic('medium');
        router.refresh();
      }
    } catch (err) {
      console.error('Archive failed:', err);
    }
  }, [router]);

  const getSwipeActions = useCallback((quote: Quote): SwipeAction[] => {
    if (quote.archived) {
      return [
        {
          label: 'Unarchive',
          color: '#16a34a', // green-600
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          ),
          onClick: () => handleUnarchiveSingle(quote.id),
        },
      ];
    }
    return [
      {
        label: 'Archive',
        color: '#d97706', // amber-600
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        ),
        onClick: () => handleArchiveSingle(quote.id),
      },
      {
        label: 'View',
        color: '#4f46e5', // indigo-600
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
        onClick: () => router.push(`/quotes/${quote.id}`),
      },
    ];
  }, [handleArchiveSingle, handleUnarchiveSingle, router]);

  return (
    <div>
      {/* Search + Select toggle */}
      <div className="relative mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quotes..."
            aria-label="Search quotes"
            data-shortcut-search
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 pl-9 text-sm placeholder:text-gray-500 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        {/* Sort dropdown */}
        <div className="relative shrink-0">
          <svg className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
          </svg>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            aria-label="Sort quotes"
            className="appearance-none rounded-xl border border-gray-200 bg-gray-50 py-2 pl-7 pr-7 text-xs font-medium text-gray-600 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:focus:bg-gray-700"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>

        <button
          onClick={() => selectMode ? exitSelectMode() : setSelectMode(true)}
          className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition-colors press-scale ${
            selectMode
              ? 'bg-brand-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          {selectMode ? 'Done' : 'Select'}
        </button>
      </div>

      {/* Select All (visible in select mode) */}
      {selectMode && filtered.length > 0 && (
        <div className="mb-2 flex items-center justify-between px-1">
          <button
            onClick={selectAll}
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Select All ({filtered.length})
          </button>
          <span className="text-xs text-gray-500">
            {selected.size} selected
          </span>
        </div>
      )}

      {/* Status Filter Pills */}
      <div role="group" aria-label="Filter quotes by status" className="mb-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => {
              haptic('light');
              setActiveFilter(filter);
              exitSelectMode();
            }}
            aria-pressed={activeFilter === filter}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all press-scale focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
              activeFilter === filter
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Result Count */}
      <p className="mb-3 text-xs text-gray-500">
        {filtered.length} {filtered.length === 1 ? 'quote' : 'quotes'}
      </p>

      {/* Quote Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm">
          {quotes.length === 0 ? (
            <EmptyState
              icon={
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.334a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
              }
              title="No quotes yet"
              description="Create your first quote and send it to a customer in under a minute."
              action={{ label: 'Create Quote', href: '/quotes/new' }}
            />
          ) : isArchivedView ? (
            <EmptyState
              icon={
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              }
              title="No archived quotes"
              description="Quotes you archive will appear here."
            />
          ) : (
            <EmptyState
              icon={
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                </svg>
              }
              title="No quotes match your filters"
              description="Try adjusting your search or filter criteria."
            />
          )}
        </div>
      ) : (
        <SwipeProvider>
        <div className="space-y-2.5">
          {filtered.map((quote, index) => {
            const thumb = quote.photos?.[0];
            const isExpired = quote.status === 'sent' && quote.expires_at
              ? new Date(quote.expires_at) < new Date()
              : false;
            const expiresDate = quote.expires_at
              ? new Date(quote.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : null;
            const isSelected = selected.has(quote.id);

            const cardContent = (
              <>
                {/* Checkbox in select mode */}
                {selectMode && (
                  <div className="shrink-0">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors ${
                        isSelected
                          ? 'border-brand-600 bg-brand-600'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                  </div>
                )}

                {/* Photo thumb or placeholder */}
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  {thumb ? (
                    <img src={thumb} alt={`Photo for ${quote.customer_name} quote`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-gray-900">
                    {quote.quote_number ? <span className="text-gray-500 font-medium">{formatQuoteNumber(quote.quote_number)}</span> : null}
                    {quote.quote_number ? ' ' : ''}{quote.customer_name}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-[12px] text-gray-500">
                    <span className="truncate">{quote.scope_of_work || quote.ai_description || 'No description'}</span>
                    {quote.internal_notes && (
                      <svg className="h-3 w-3 shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-label="Has internal notes">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                    )}
                    <span className="shrink-0 text-gray-300">·</span>
                    <span className="shrink-0">
                      {quote.status === 'deposit_paid' && quote.paid_at
                        ? `Paid ${relativeTime(quote.paid_at)}`
                        : quote.status === 'sent' && quote.sent_at
                        ? `Sent ${relativeTime(quote.sent_at)}`
                        : quote.status === 'approved' && quote.approved_at
                        ? `Approved ${relativeTime(quote.approved_at)}`
                        : relativeTime(quote.created_at)}
                    </span>
                  </p>
                </div>

                {/* Right */}
                <div className="shrink-0 text-right">
                  <p className="text-[16px] font-bold text-gray-900 tabular-nums">
                    ${Number(quote.subtotal).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </p>
                  {isArchivedView ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUnarchiveSingle(quote.id);
                      }}
                      className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      Unarchive
                    </button>
                  ) : (
                    <>
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold transition-all ${statusColors[quote.status] || 'bg-gray-100 text-gray-500'}`}>
                        {statusLabels[quote.status] || quote.status}
                      </span>
                      {quote.status === 'sent' && expiresDate && (
                        <span className={`mt-0.5 block text-[10px] ${isExpired ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                          {isExpired ? 'Expired' : `Expires ${expiresDate}`}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </>
            );

            const staggerStyle = index < 20 ? { animationDelay: `${index * 30}ms` } : undefined;

            if (selectMode) {
              return (
                <div key={quote.id} className="animate-list-item" style={staggerStyle}>
                <button
                  onClick={() => toggleSelect(quote.id)}
                  className="flex w-full items-center gap-4 rounded-2xl bg-white px-4 py-3.5 shadow-sm hover-lift press-scale text-left focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  {cardContent}
                </button>
                </div>
              );
            }

            return (
              <div key={quote.id} className="animate-list-item" style={staggerStyle}>
              <SwipeableCard id={quote.id} actions={getSwipeActions(quote)}>
              <Link
                href={`/quotes/${quote.id}`}
                className="flex items-center gap-4 rounded-2xl bg-white px-4 py-3.5 shadow-sm hover-lift press-scale focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                {cardContent}
              </Link>
              </SwipeableCard>
              </div>
            );
          })}
        </div>
        </SwipeProvider>
      )}

      {/* Floating Action Bar */}
      {selectMode && selected.size > 0 && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-2xl bg-gray-900 px-5 py-3 shadow-lg">
            <span className="text-sm font-medium text-white">
              {selected.size} selected
            </span>
            <div className="h-4 w-px bg-gray-600" />
            <button
              onClick={() => {
                haptic('light');
                if (isArchivedView) {
                  handleBulkAction('unarchive');
                } else {
                  setConfirmBulkArchive(true);
                }
              }}
              disabled={bulkLoading}
              className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors press-scale"
            >
              {bulkLoading ? 'Updating...' : isArchivedView ? 'Unarchive' : 'Archive'}
            </button>
            <button
              onClick={exitSelectMode}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors press-scale"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmBulkArchive}
        onConfirm={() => {
          handleBulkAction('archive');
          setConfirmBulkArchive(false);
        }}
        onCancel={() => setConfirmBulkArchive(false)}
        title={`Archive ${selected.size} ${selected.size === 1 ? 'quote' : 'quotes'}?`}
        message="They'll be hidden from your main list but can be unarchived later."
        confirmLabel={bulkLoading ? 'Archiving...' : 'Archive'}
        confirmVariant="primary"
        loading={bulkLoading}
      />
    </div>
  );
}
