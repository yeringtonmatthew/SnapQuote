'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatQuoteNumber } from '@/lib/format-quote-number';
import PipelineCard, { type PipelineCardProps } from './PipelineCard';
import PipelineCustomerGroupCard, { type PipelineCustomerGroup } from './PipelineCustomerGroupCard';
import LeadCreateSheet from './LeadCreateSheet';
import { haptic } from '@/lib/haptic';

export interface PipelineColumn {
  stage: string;
  label: string;
  color: string;
  quotes: PipelineCardProps['quote'][];
}

interface PipelineBoardProps {
  columns: PipelineColumn[];
}

const STAGE_OPTIONS = [
  { stage: 'lead', label: 'New Lead', color: 'gray-400' },
  { stage: 'follow_up', label: 'Check Back', color: 'orange-500' },
  { stage: 'quote_created', label: 'Draft Quote', color: 'slate-500' },
  { stage: 'quote_sent', label: 'Sent', color: 'blue-500' },
  { stage: 'deposit_collected', label: 'Sold', color: 'green-500' },
  { stage: 'job_scheduled', label: 'Scheduled', color: 'amber-500' },
  { stage: 'in_progress', label: 'Working', color: 'indigo-500' },
  { stage: 'completed', label: 'Done', color: 'emerald-600' },
];

// Map color strings to Tailwind bg classes for the dot
const dotColorMap: Record<string, string> = {
  'gray-400': 'bg-gray-400',
  'orange-500': 'bg-orange-500',
  'slate-500': 'bg-slate-500',
  'blue-500': 'bg-blue-500',
  'green-500': 'bg-green-500',
  'amber-500': 'bg-amber-500',
  'indigo-500': 'bg-indigo-500',
  'emerald-600': 'bg-emerald-600',
};

const borderColorMap: Record<string, string> = {
  'gray-400': 'border-gray-400',
  'orange-500': 'border-orange-500',
  'slate-500': 'border-slate-500',
  'blue-500': 'border-blue-500',
  'green-500': 'border-green-500',
  'amber-500': 'border-amber-500',
  'indigo-500': 'border-indigo-500',
  'emerald-600': 'border-emerald-600',
};

/** Abbreviate dollar amounts: $1,234 -> $1.2K, $134,230 -> $134K */
function abbrevDollars(cents: number): string {
  if (cents >= 1_000_000) return `$${(cents / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (cents >= 1_000) return `$${(cents / 1_000).toFixed(cents >= 10_000 ? 0 : 1).replace(/\.0$/, '')}K`;
  return `$${cents.toLocaleString()}`;
}

function getQuoteLastTouch(quote: PipelineCardProps['quote']): string {
  const timestamps = [quote.created_at, quote.paid_at, quote.sent_at, quote.reminder_sent_at]
    .filter(Boolean) as string[];
  timestamps.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  return timestamps[0];
}

function getCustomerGroupKey(quote: PipelineCardProps['quote']): string {
  if (quote.client_id) return `client:${quote.client_id}`;

  const normalizedName = quote.customer_name.trim().toLowerCase();
  const normalizedPhone = quote.customer_phone?.replace(/\D/g, '').slice(-10) || 'no-phone';

  return `${normalizedName}|${normalizedPhone}`;
}

function groupQuotesByCustomer(quotes: PipelineCardProps['quote'][]): PipelineCustomerGroup[] {
  const groups = new Map<string, PipelineCustomerGroup>();

  for (const quote of quotes) {
    const key = getCustomerGroupKey(quote);
    const lastActivity = getQuoteLastTouch(quote);
    const existing = groups.get(key);

    if (existing) {
      existing.total += Number(quote.total);
      existing.quotes.push(quote);

      if (new Date(lastActivity).getTime() > new Date(existing.lastActivity).getTime()) {
        existing.lastActivity = lastActivity;
      }
    } else {
      groups.set(key, {
        key,
        customerName: quote.customer_name,
        customerPhone: quote.customer_phone,
        total: Number(quote.total),
        lastActivity,
        quotes: [quote],
      });
    }
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      quotes: [...group.quotes].sort(
        (a, b) => new Date(getQuoteLastTouch(b)).getTime() - new Date(getQuoteLastTouch(a)).getTime(),
      ),
    }))
    .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
}

export default function PipelineBoard({ columns: initialColumns }: PipelineBoardProps) {
  const router = useRouter();
  const [columns, setColumns] = useState<PipelineColumn[]>(initialColumns);
  const lastGoodColumns = useRef<PipelineColumn[]>(initialColumns);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  // Stage picker state
  const [stagePickerQuoteId, setStagePickerQuoteId] = useState<string | null>(null);
  const [stagePickerCurrentStage, setStagePickerCurrentStage] = useState<string | null>(null);

  // Quick actions state
  const [quickActionsQuote, setQuickActionsQuote] = useState<PipelineCardProps['quote'] | null>(null);
  const [showStagePicker, setShowStagePicker] = useState(false);

  // Add Lead sheet
  const [showLeadSheet, setShowLeadSheet] = useState(false);

  // Column sub-filters
  const [scheduledFilter, setScheduledFilter] = useState<'all' | 'shingle' | 'metal'>('all');

  const dragQuoteId = useRef<string | null>(null);

  /** Find a quote by ID across all columns. */
  const findQuote = useCallback(
    (quoteId: string): PipelineCardProps['quote'] | null => {
      for (const col of columns) {
        const found = col.quotes.find((q) => q.id === quoteId);
        if (found) return found;
      }
      return null;
    },
    [columns],
  );

  const moveQuote = useCallback(
    async (quoteId: string, newStage: string) => {
      // Optimistic update
      setColumns((prev) => {
        const updated = prev.map((col) => ({
          ...col,
          quotes: col.quotes.filter((q) => q.id !== quoteId),
        }));

        let movedQuote: PipelineCardProps['quote'] | null = null;
        for (const col of prev) {
          const found = col.quotes.find((q) => q.id === quoteId);
          if (found) {
            movedQuote = { ...found, pipeline_stage: newStage };
            break;
          }
        }

        if (movedQuote) {
          const targetCol = updated.find((c) => c.stage === newStage);
          if (targetCol) {
            targetCol.quotes = [movedQuote, ...targetCol.quotes];
          }
        }

        return updated;
      });

      haptic('medium');

      // Persist
      try {
        const res = await fetch(`/api/quotes/${quoteId}/pipeline`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pipeline_stage: newStage }),
        });
        if (!res.ok) throw new Error('Failed to update');
        // Persist succeeded — update last-known-good state
        setColumns((current) => {
          lastGoodColumns.current = current;
          return current;
        });
        router.refresh();
      } catch {
        // Revert to last successfully persisted state (not stale initialColumns)
        setColumns(lastGoodColumns.current);
      }
    },
    [router],
  );

  // Desktop drag handlers
  const handleDragStart = useCallback((e: React.DragEvent, quoteId: string) => {
    dragQuoteId.current = quoteId;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', quoteId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, stage: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverStage(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, stage: string) => {
      e.preventDefault();
      setDragOverStage(null);
      const quoteId = e.dataTransfer.getData('text/plain') || dragQuoteId.current;
      if (quoteId) {
        moveQuote(quoteId, stage);
      }
      dragQuoteId.current = null;
    },
    [moveQuote],
  );

  // Quick actions handler (3-dot menu)
  const handleQuickActions = useCallback(
    (quoteId: string, _currentStage: string) => {
      const quote = findQuote(quoteId);
      if (quote) {
        setQuickActionsQuote(quote);
        setShowStagePicker(false);
      }
    },
    [findQuote],
  );

  // Delete state
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Close quick actions
  const closeQuickActions = useCallback(() => {
    setQuickActionsQuote(null);
    setShowStagePicker(false);
    setConfirmDelete(false);
  }, []);

  // Delete quote
  const handleDelete = useCallback(async () => {
    if (!quickActionsQuote) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/quotes/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [quickActionsQuote.id], action: 'delete' }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      // Remove from local state
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          quotes: col.quotes.filter((q) => q.id !== quickActionsQuote.id),
        }))
      );
      haptic('medium');
      closeQuickActions();
      router.refresh();
    } catch {
      // Silent fail
    } finally {
      setDeleting(false);
    }
  }, [quickActionsQuote, closeQuickActions, router]);

  // Switch from quick actions to stage picker within the same sheet
  const openStagePickerFromQuickActions = useCallback(() => {
    if (quickActionsQuote) {
      setStagePickerQuoteId(quickActionsQuote.id);
      setStagePickerCurrentStage(quickActionsQuote.pipeline_stage);
      setQuickActionsQuote(null);
      setShowStagePicker(false);
    }
  }, [quickActionsQuote]);

  // Stage picker select
  const handleStageSelect = useCallback(
    (stage: string) => {
      if (stagePickerQuoteId && stage !== stagePickerCurrentStage) {
        moveQuote(stagePickerQuoteId, stage);
      }
      setStagePickerQuoteId(null);
      setStagePickerCurrentStage(null);
    },
    [stagePickerQuoteId, stagePickerCurrentStage, moveQuote],
  );

  // ── Global filter pills ──
  type QuickFilter = 'all' | 'this_week' | 'high_value' | 'needs_follow_up';
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');

  const filterQuote = useCallback(
    (q: PipelineCardProps['quote'], filter: QuickFilter): boolean => {
      if (filter === 'all') return true;
      if (filter === 'high_value') return Number(q.total) >= 5000;
      if (filter === 'this_week') {
        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        return new Date(q.created_at).getTime() >= weekAgo;
      }
      if (filter === 'needs_follow_up') {
        if (q.pipeline_stage !== 'quote_sent') return false;
        const sentDate = q.sent_at || q.created_at;
        const daysSince = (Date.now() - new Date(sentDate).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince > 3;
      }
      return true;
    },
    [],
  );

  // Apply global filter to get display columns
  const displayColumns = useMemo(
    () =>
      columns.map((col) => ({
        ...col,
        quotes: col.quotes.filter((q) => filterQuote(q, quickFilter)),
      })),
    [columns, quickFilter, filterQuote],
  );

  const columnViews = useMemo(
    () =>
      displayColumns.map((col) => {
        let filteredQuotes = col.quotes;

        if (col.stage === 'job_scheduled' && scheduledFilter !== 'all') {
          filteredQuotes = col.quotes.filter((q) => {
            const notes = (q.notes || '').toLowerCase();
            if (scheduledFilter === 'shingle') return notes.includes('shingle');
            if (scheduledFilter === 'metal') return notes.includes('metal');
            return true;
          });
        }

        return {
          ...col,
          filteredQuotes,
          total: filteredQuotes.reduce((sum, q) => sum + Number(q.total), 0),
          groups: groupQuotesByCustomer(filteredQuotes),
        };
    }),
    [displayColumns, scheduledFilter],
  );

  // Filter pill definitions
  const FILTER_PILLS: { key: QuickFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'this_week', label: 'New This Week' },
    { key: 'high_value', label: 'Big Jobs' },
    { key: 'needs_follow_up', label: 'Need Attention' },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(
    Math.max(0, initialColumns.findIndex((c) => c.quotes.length > 0)),
  );
  const activeColumn = columnViews[activeIndex] || columnViews[0];

  const scrollToColumn = useCallback((index: number) => {
    setActiveIndex(index);
    if (!scrollRef.current) return;
    const children = scrollRef.current.children;
    if (children[index]) {
      (children[index] as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
    }
  }, []);

  // Track which column is visible during scroll
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;
    const colWidth = container.scrollWidth / columnViews.length;
    const idx = Math.round(scrollLeft / colWidth);
    setActiveIndex(Math.min(idx, columnViews.length - 1));
  }, [columnViews.length]);

  return (
    <>
      {/* Quick filter pills */}
      <div className="px-4 mb-3">
        <div className="flex gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {FILTER_PILLS.map((pill) => {
            const isActive = quickFilter === pill.key;
            return (
              <button
                key={pill.key}
                onClick={() => setQuickFilter(pill.key)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all duration-200 press-scale ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white/80 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 ring-1 ring-black/[0.04] dark:ring-white/[0.06] hover:bg-white dark:hover:bg-gray-800'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tappable stage pills -- horizontally scrollable */}
      <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mb-3">
        <div className="flex gap-1.5 px-4" style={{ width: 'max-content' }}>
          {columnViews.map((col, i) => {
            const isActive = activeIndex === i;
            const count = col.filteredQuotes.length;
            const total = col.total;
            return (
              <button
                key={col.stage}
                onClick={() => scrollToColumn(i)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all press-scale whitespace-nowrap ${
                  isActive
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 ring-1 ring-black/[0.04] dark:ring-white/[0.06]'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${isActive ? 'bg-white dark:bg-gray-900' : (dotColorMap[col.color] || 'bg-gray-400')}`} />
                {col.label}
                {count > 0 && (
                  <span className={`text-[10px] tabular-nums ${isActive ? 'text-white/60 dark:text-gray-900/60' : 'text-gray-400'}`}>
                    {count}
                  </span>
                )}
                {total > 0 && (
                  <span className={`text-[10px] tabular-nums ${isActive ? 'text-white/40 dark:text-gray-900/40' : 'text-gray-300 dark:text-gray-600'}`}>
                    {abbrevDollars(total)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile stage view */}
      <div className="px-4 pb-4 lg:hidden">
        {activeColumn && (
          <div className="rounded-[26px] bg-white/85 dark:bg-gray-900/85 p-4 ring-1 ring-black/[0.04] dark:ring-white/[0.06] shadow-[0_6px_24px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full shrink-0 ${dotColorMap[activeColumn.color] || 'bg-gray-400'}`}
              />
              <span className="text-[15px] font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                {activeColumn.label}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                {activeColumn.filteredQuotes.length}
              </span>
              <span className="ml-auto text-[13px] font-semibold text-gray-500 dark:text-gray-400 tabular-nums">
                {abbrevDollars(activeColumn.total)}
              </span>
            </div>

            <p className="mt-2 text-[12px] leading-relaxed text-gray-500 dark:text-gray-400">
              Quotes are grouped by customer here, so repeat jobs stay together and are easier to work from on your phone.
            </p>

            {activeColumn.stage === 'job_scheduled' && (
              <div className="mt-3 flex gap-1.5">
                {([
                  { key: 'all', label: 'All' },
                  { key: 'shingle', label: 'Shingle' },
                  { key: 'metal', label: 'Metal' },
                ] as const).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setScheduledFilter(tab.key)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all press-scale ${
                      scheduledFilter === tab.key
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 space-y-3">
              {activeColumn.filteredQuotes.length === 0 && activeColumn.stage === 'lead' ? (
                <button
                  onClick={() => setShowLeadSheet(true)}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-10 text-gray-400 dark:border-gray-700 dark:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="text-[14px] font-medium">Add your first lead</span>
                </button>
              ) : activeColumn.filteredQuotes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 px-5 py-10 text-center dark:border-gray-700">
                  <p className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">
                    Nothing in {activeColumn.label}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-gray-500 dark:text-gray-400">
                    When quotes land here, you&apos;ll see them grouped by customer for quicker follow-up on mobile.
                  </p>
                </div>
              ) : (
                activeColumn.groups.map((group) => (
                  <PipelineCustomerGroupCard
                    key={group.key}
                    accentClass={borderColorMap[activeColumn.color] || 'border-gray-400'}
                    group={group}
                    onQuickActions={handleQuickActions}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Desktop kanban columns */}
      <div
        className="hidden overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -webkit-overflow-scrolling-touch lg:block"
        onScroll={handleScroll}
      >
        <div ref={scrollRef} className="flex gap-3 px-4 pb-4" style={{ width: 'max-content' }}>
          {columnViews.map((col) => {
            const isScheduled = col.stage === 'job_scheduled';
            const formattedTotal = abbrevDollars(col.total);
            const isDragOver = dragOverStage === col.stage;

            return (
              <div
                key={col.stage}
                className={`w-[72vw] min-w-[260px] max-w-[320px] snap-start flex flex-col rounded-2xl transition-all duration-200 ${
                  isDragOver
                    ? 'ring-2 ring-brand-500/40 bg-brand-50/50 dark:bg-brand-950/20 shadow-[0_0_20px_-4px_rgba(99,102,241,0.25)] animate-drag-pulse'
                    : 'ring-0 ring-transparent bg-transparent'
                }`}
                onDragOver={(e) => handleDragOver(e, col.stage)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.stage)}
              >
                {/* Column header -- sticky within scroll */}
                <div className="sticky top-0 z-[5] px-1 pb-3 bg-[#f2f2f7] dark:bg-gray-950">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${dotColorMap[col.color] || 'bg-gray-400'}`}
                    />
                    <span className="text-[14px] font-semibold text-gray-800 dark:text-gray-200 tracking-tight">
                      {col.label}
                    </span>
                    <span className="rounded-full bg-gray-200/60 dark:bg-gray-800 px-1.5 py-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 tabular-nums leading-none">
                      {col.filteredQuotes.length}
                    </span>
                    <span className="ml-auto text-[12px] text-gray-400 dark:text-gray-500 tabular-nums font-medium">
                      {formattedTotal}
                    </span>
                  </div>

                  {/* Sub-filter tabs for Scheduled column */}
                  {isScheduled && (
                    <div className="flex gap-1 mt-2">
                      {([
                        { key: 'all', label: 'All' },
                        { key: 'shingle', label: 'Shingle' },
                        { key: 'metal', label: 'Metal' },
                      ] as const).map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setScheduledFilter(tab.key)}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all press-scale ${
                            scheduledFilter === tab.key
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 ring-1 ring-black/[0.04] dark:ring-white/[0.06]'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-2 overflow-y-auto max-h-[calc(100dvh-280px)] pr-0.5 pb-2">
                  {col.filteredQuotes.length === 0 && col.stage !== 'lead' ? (
                    <div className="flex items-center justify-center py-10">
                      <span className="text-[14px] text-gray-300 dark:text-gray-700 select-none">&mdash;</span>
                    </div>
                  ) : col.filteredQuotes.length === 0 && col.stage === 'lead' ? (
                    <button
                      onClick={() => setShowLeadSheet(true)}
                      className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-8 text-gray-400 dark:text-gray-500 hover:border-brand-300 hover:text-brand-500 dark:hover:border-brand-700 dark:hover:text-brand-400 transition-colors press-scale"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      <span className="text-[13px] font-medium">Add your first lead</span>
                    </button>
                  ) : (
                    col.filteredQuotes.map((quote, qi) => (
                      <div
                        key={quote.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, quote.id)}
                        className="cursor-grab active:cursor-grabbing animate-card-enter"
                        style={{ animationDelay: `${qi * 30}ms` }}
                      >
                        <PipelineCard
                          quote={quote}
                          onQuickActions={handleQuickActions}
                        />
                      </div>
                    ))
                  )}

                  {/* Add Lead button at bottom of Lead column when it has items */}
                  {col.stage === 'lead' && col.filteredQuotes.length > 0 && (
                    <button
                      onClick={() => setShowLeadSheet(true)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 py-2.5 text-[13px] font-medium text-gray-400 dark:text-gray-500 hover:border-brand-300 hover:text-brand-500 dark:hover:border-brand-700 dark:hover:text-brand-400 transition-colors press-scale"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      New Lead
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions bottom sheet */}
      {quickActionsQuote && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center animate-sheet-backdrop"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
          onClick={closeQuickActions}
        >
          <div
            className="w-full max-w-lg rounded-t-2xl bg-white dark:bg-gray-900 p-5 pb-10 animate-sheet-up overflow-y-auto"
            style={{ maxHeight: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />

            {/* Header with customer name */}
            <div className="mb-4">
              <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">
                {quickActionsQuote.customer_name}
              </h3>
              {quickActionsQuote.quote_number && (
                <p className="text-[12px] text-gray-400 mt-0.5 tabular-nums">
                  {formatQuoteNumber(quickActionsQuote.quote_number)}
                </p>
              )}
            </div>

            {/* Contact section */}
            {quickActionsQuote.customer_phone && (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-4 mb-1">
                  Contact
                </p>
                <div className="space-y-0.5 mb-3">
                  {/* Call */}
                  <a
                    href={`tel:${quickActionsQuote.customer_phone}`}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[14px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-800 transition-colors press-scale"
                  >
                    <svg className="h-5 w-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    Call
                  </a>

                  {/* Text */}
                  <a
                    href={`sms:${quickActionsQuote.customer_phone}`}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[14px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-800 transition-colors press-scale"
                  >
                    <svg className="h-5 w-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                    Text
                  </a>
                </div>
              </>
            )}

            {/* Actions section */}
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-4 mb-1">
              Actions
            </p>
            <div className="space-y-0.5">
              {/* View Proposal */}
              <Link
                href={`/q/${quickActionsQuote.id}`}
                prefetch
                onClick={closeQuickActions}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[14px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-800 transition-colors press-scale"
              >
                <svg className="h-5 w-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Open Proposal
              </Link>

              {/* Add Note */}
              <Link
                href={`/jobs/${quickActionsQuote.id}#activity`}
                prefetch
                onClick={closeQuickActions}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[14px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-800 transition-colors press-scale"
              >
                <svg className="h-5 w-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                Open Job Notes
              </Link>

              {/* Move Stage */}
              <button
                onClick={openStagePickerFromQuickActions}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[14px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-800 transition-colors press-scale"
              >
                <svg className="h-5 w-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
                Move on Board
              </button>

              {/* Delete */}
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[14px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 active:bg-red-100 dark:active:bg-red-950/50 transition-colors press-scale"
                >
                  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Delete
                </button>
              ) : (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/30 p-3 space-y-2">
                  <p className="text-[13px] text-red-600 dark:text-red-400 font-medium">
                    Delete {quickActionsQuote.customer_name}? This can&apos;t be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex-1 rounded-lg bg-red-600 py-2 text-[13px] font-semibold text-white press-scale disabled:opacity-50"
                    >
                      {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 rounded-lg bg-white dark:bg-gray-800 py-2 text-[13px] font-semibold text-gray-600 dark:text-gray-300 ring-1 ring-black/[0.04] dark:ring-white/[0.06] press-scale"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cancel button */}
            <button
              onClick={closeQuickActions}
              className="mt-3 w-full rounded-xl bg-gray-100 dark:bg-gray-800 py-3 text-[14px] font-semibold text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 press-scale"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Lead sheet */}
      <LeadCreateSheet
        open={showLeadSheet}
        onClose={() => setShowLeadSheet(false)}
        onCreated={() => router.refresh()}
      />

      {/* Stage picker modal (mobile) */}
      {stagePickerQuoteId && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center animate-sheet-backdrop"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
          onClick={() => {
            setStagePickerQuoteId(null);
            setStagePickerCurrentStage(null);
          }}
        >
          <div
            className="w-full max-w-lg rounded-t-2xl bg-white dark:bg-gray-900 p-5 pb-10 animate-sheet-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Move on quote board
            </h3>
            <div className="space-y-0.5">
              {STAGE_OPTIONS.map((opt) => {
                const isCurrent = opt.stage === stagePickerCurrentStage;
                return (
                  <button
                    key={opt.stage}
                    onClick={() => handleStageSelect(opt.stage)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[14px] font-medium transition-colors press-scale ${
                      isCurrent
                        ? 'bg-brand-50 dark:bg-brand-950/30 text-brand-600'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-800'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full shrink-0 ${dotColorMap[opt.color] || 'bg-gray-400'}`} />
                    {opt.label}
                    {isCurrent && (
                      <svg className="ml-auto h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Cancel button */}
            <button
              onClick={() => {
                setStagePickerQuoteId(null);
                setStagePickerCurrentStage(null);
              }}
              className="mt-3 w-full rounded-xl bg-gray-100 dark:bg-gray-800 py-3 text-[14px] font-semibold text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 press-scale"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
