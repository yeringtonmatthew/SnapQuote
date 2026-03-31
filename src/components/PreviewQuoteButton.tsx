'use client';

import { useState } from 'react';
import { QuotePreviewModal } from '@/components/QuotePreviewModal';

interface PreviewQuoteButtonProps {
  quoteId: string;
  currentStatus: string;
  hasPhone: boolean;
  hasEmail?: boolean;
}

export function PreviewQuoteButton({
  quoteId,
  currentStatus,
  hasPhone,
  hasEmail,
}: PreviewQuoteButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 press-scale"
        title="Preview what the customer sees"
      >
        <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Preview
      </button>

      {open && (
        <QuotePreviewModal
          quoteId={quoteId}
          currentStatus={currentStatus}
          hasPhone={hasPhone}
          hasEmail={hasEmail}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
