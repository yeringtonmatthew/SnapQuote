'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PipelineCard, { type PipelineCardProps } from './PipelineCard';
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
  { stage: 'lead', label: 'Lead' },
  { stage: 'quote_created', label: 'Quote Created' },
  { stage: 'quote_sent', label: 'Quote Sent' },
  { stage: 'deposit_collected', label: 'Deposit Collected' },
  { stage: 'job_scheduled', label: 'Scheduled' },
  { stage: 'in_progress', label: 'In Progress' },
  { stage: 'completed', label: 'Completed' },
];

// Map color strings to Tailwind bg classes for the dot
const dotColorMap: Record<string, string> = {
  'gray-400': 'bg-gray-400',
  'slate-500': 'bg-slate-500',
  'blue-500': 'bg-blue-500',
  'green-500': 'bg-green-500',
  'amber-500': 'bg-amber-500',
  'indigo-500': 'bg-indigo-500',
  'emerald-600': 'bg-emerald-600',
};

export default function PipelineBoard({ columns: initialColumns }: PipelineBoardProps) {
  const router = useRouter();
  const [columns, setColumns] = useState<PipelineColumn[]>(initialColumns);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [stagePickerQuoteId, setStagePickerQuoteId] = useState<string | null>(null);
  const [stagePickerCurrentStage, setStagePickerCurrentStage] = useState<string | null>(null);
  const dragQuoteId = useRef<string | null>(null);

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
        router.refresh();
      } catch {
        // Revert on error
        setColumns(initialColumns);
      }
    },
    [initialColumns, router],
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

  // Mobile stage picker
  const handleStageChange = useCallback((quoteId: string, currentStage: string) => {
    setStagePickerQuoteId(quoteId);
    setStagePickerCurrentStage(currentStage);
  }, []);

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

  return (
    <>
      <div className="overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -webkit-overflow-scrolling-touch">
        <div className="flex gap-3 px-4 pb-4" style={{ width: 'max-content' }}>
          {columns.map((col) => {
            const colTotal = col.quotes.reduce((s, q) => s + Number(q.total), 0);
            const formattedTotal = `$${colTotal.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}`;
            const isDragOver = dragOverStage === col.stage;

            return (
              <div
                key={col.stage}
                className={`min-w-[300px] w-[85vw] max-w-[340px] snap-center flex flex-col rounded-2xl transition-all ${
                  isDragOver
                    ? 'border-2 border-dashed border-brand-500/30 bg-brand-50/30 dark:bg-brand-950/20'
                    : 'border-2 border-transparent'
                }`}
                onDragOver={(e) => handleDragOver(e, col.stage)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.stage)}
              >
                {/* Column header */}
                <div className="flex items-center gap-2 px-1 pb-3">
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${dotColorMap[col.color] || 'bg-gray-400'}`}
                  />
                  <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">
                    {col.label}
                  </span>
                  <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 tabular-nums">
                    {col.quotes.length}
                  </span>
                  <span className="ml-auto text-[12px] text-gray-400 tabular-nums">
                    {formattedTotal}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-2 overflow-y-auto max-h-[calc(100dvh-240px)] pr-0.5 pb-2">
                  {col.quotes.length === 0 ? (
                    <div className="flex items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 py-8">
                      <p className="text-[13px] text-gray-400">No jobs</p>
                    </div>
                  ) : (
                    col.quotes.map((quote) => (
                      <div
                        key={quote.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, quote.id)}
                        className="cursor-grab active:cursor-grabbing"
                      >
                        <PipelineCard
                          quote={quote}
                          onStageChange={handleStageChange}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage picker modal (mobile) */}
      {stagePickerQuoteId && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => {
            setStagePickerQuoteId(null);
            setStagePickerCurrentStage(null);
          }}
        >
          <div
            className="w-full max-w-lg rounded-t-2xl bg-white dark:bg-gray-900 p-5 pb-10 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-700" />
            <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Move to stage
            </h3>
            <div className="space-y-1">
              {STAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.stage}
                  onClick={() => handleStageSelect(opt.stage)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[14px] font-medium transition-colors press-scale ${
                    opt.stage === stagePickerCurrentStage
                      ? 'bg-brand-50 dark:bg-brand-950/30 text-brand-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {opt.label}
                  {opt.stage === stagePickerCurrentStage && (
                    <svg className="ml-auto h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
