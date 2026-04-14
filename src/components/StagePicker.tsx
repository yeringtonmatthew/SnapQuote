'use client';

import { useState } from 'react';
import type { PipelineStage } from '@/types/database';

interface StagePickerProps {
  currentStage: PipelineStage;
  onSelect: (stage: PipelineStage) => void;
  onClose: () => void;
}

const STAGES: { value: PipelineStage; label: string; color: string; description: string }[] = [
  { value: 'lead', label: 'New Lead', color: 'bg-gray-400', description: 'New customer or homeowner to work up' },
  { value: 'follow_up', label: 'Check Back', color: 'bg-orange-500', description: 'Needs a call, visit, or another touch' },
  { value: 'quote_created', label: 'Draft Quote', color: 'bg-slate-500', description: 'Quote is being built, not sent yet' },
  { value: 'quote_sent', label: 'Quote Sent', color: 'bg-blue-500', description: 'Waiting on the customer to reply' },
  { value: 'deposit_collected', label: 'Sold / Deposit In', color: 'bg-green-500', description: 'Deposit is paid, ready to get on the calendar' },
  { value: 'job_scheduled', label: 'On Calendar', color: 'bg-amber-500', description: 'Job date is locked in' },
  { value: 'in_progress', label: 'Working', color: 'bg-indigo-500', description: 'Crew is on the job' },
  { value: 'completed', label: 'Done', color: 'bg-emerald-500', description: 'Job is finished and ready for final payment' },
];

// Stages that require confirmation before moving to
const CONFIRM_STAGES: PipelineStage[] = ['completed'];

export default function StagePicker({ currentStage, onSelect, onClose }: StagePickerProps) {
  const [confirmStage, setConfirmStage] = useState<PipelineStage | null>(null);

  function handleSelect(stage: PipelineStage) {
    if (stage === currentStage) {
      onClose();
      return;
    }
    if (CONFIRM_STAGES.includes(stage)) {
      setConfirmStage(stage);
      return;
    }
    onSelect(stage);
    onClose();
  }

  function handleConfirm() {
    if (confirmStage) {
      onSelect(confirmStage);
      onClose();
    }
  }

  const currentIdx = STAGES.findIndex((s) => s.value === currentStage);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Change quote board stage"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-t-2xl bg-white dark:bg-gray-900 pb-8 overflow-y-auto max-h-[85dvh] animate-sheet-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        <div className="px-5 pb-2 space-y-4">
          {/* Title */}
          <h2 className="text-[18px] font-bold text-gray-900 dark:text-gray-100 pt-2">Move on quote board</h2>

          {/* Confirmation dialog */}
          {confirmStage && (
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 p-4 space-y-3 animate-scale-up">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                <div>
                  <p className="text-[14px] font-semibold text-emerald-800 dark:text-emerald-200">Mark as Completed?</p>
                  <p className="text-[12px] text-emerald-600 dark:text-emerald-400">This will mark the job as done.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmStage(null)}
                  className="flex-1 rounded-xl bg-white dark:bg-gray-800 py-2.5 text-[13px] font-semibold text-gray-600 dark:text-gray-300 ring-1 ring-black/[0.04] dark:ring-white/[0.06] press-scale"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-[13px] font-semibold text-white press-scale"
                >
                  Complete Job
                </button>
              </div>
            </div>
          )}

          {/* Stage list */}
          {!confirmStage && (
            <div className="space-y-1">
              {STAGES.map((stage, i) => {
                const isCurrent = stage.value === currentStage;
                const isPast = i < currentIdx;

                return (
                  <button
                    key={stage.value}
                    onClick={() => handleSelect(stage.value)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-150 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-800 press-scale ${
                      isCurrent ? 'bg-brand-50/50 dark:bg-brand-950/20 ring-1 ring-brand-200/40 dark:ring-brand-800/40' : ''
                    }`}
                  >
                    {/* Colored dot with check for past stages */}
                    <div className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${stage.color}`}>
                      {isPast && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                      {isCurrent && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>

                    {/* Label + description */}
                    <div className="min-w-0 flex-1">
                      <span className={`text-[14px] font-semibold ${
                        isCurrent ? 'text-brand-600 dark:text-brand-400' : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {stage.label}
                      </span>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{stage.description}</p>
                    </div>

                    {/* Checkmark if current */}
                    {isCurrent && (
                      <svg
                        className="h-5 w-5 text-brand-600 dark:text-brand-400 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Cancel */}
          {!confirmStage && (
            <button
              onClick={onClose}
              className="w-full rounded-2xl bg-gray-100 dark:bg-gray-800 py-3.5 text-[14px] font-semibold text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 press-scale"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
