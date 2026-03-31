'use client';

import type { PipelineStage } from '@/types/database';

interface StagePickerProps {
  currentStage: PipelineStage;
  onSelect: (stage: PipelineStage) => void;
  onClose: () => void;
}

const STAGES: { value: PipelineStage; label: string; color: string }[] = [
  { value: 'lead', label: 'Lead', color: 'bg-gray-400' },
  { value: 'quote_created', label: 'Quote Created', color: 'bg-slate-500' },
  { value: 'quote_sent', label: 'Quote Sent', color: 'bg-blue-500' },
  { value: 'deposit_collected', label: 'Deposit Collected', color: 'bg-green-500' },
  { value: 'job_scheduled', label: 'Job Scheduled', color: 'bg-amber-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-indigo-500' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-500' },
];

export default function StagePicker({ currentStage, onSelect, onClose }: StagePickerProps) {
  function handleSelect(stage: PipelineStage) {
    onSelect(stage);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Change pipeline stage"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-t-2xl bg-white pb-8 overflow-y-auto max-h-[85dvh] animate-modal-content">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        <div className="px-5 pb-2 space-y-4">
          {/* Title */}
          <h2 className="text-[18px] font-bold text-gray-900 pt-2">Move to...</h2>

          {/* Stage list */}
          <div className="space-y-1">
            {STAGES.map((stage) => {
              const isCurrent = stage.value === currentStage;
              return (
                <button
                  key={stage.value}
                  onClick={() => handleSelect(stage.value)}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-gray-50 active:bg-gray-100 press-scale"
                >
                  {/* Colored dot */}
                  <div className={`h-3 w-3 shrink-0 rounded-full ${stage.color}`} />

                  {/* Label */}
                  <span className="flex-1 text-[14px] font-semibold text-gray-900">
                    {stage.label}
                  </span>

                  {/* Checkmark if current */}
                  {isCurrent && (
                    <svg
                      className="h-5 w-5 text-brand-600 shrink-0"
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

          {/* Cancel */}
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-gray-100 py-3.5 text-[14px] font-semibold text-gray-600 transition-colors hover:bg-gray-200 active:bg-gray-300 press-scale"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
