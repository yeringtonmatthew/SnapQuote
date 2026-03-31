'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { getUserMessage } from '@/lib/error-messages';

interface QuotePreviewModalProps {
  quoteId: string;
  currentStatus: string;
  hasPhone: boolean;
  hasEmail?: boolean;
  onClose: () => void;
}

export function QuotePreviewModal({
  quoteId,
  currentStatus,
  hasPhone,
  hasEmail,
  onClose,
}: QuotePreviewModalProps) {
  const hasContact = hasPhone || !!hasEmail;
  const router = useRouter();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const proposalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/q/${quoteId}`
    : `/q/${quoteId}`;

  async function handleSend() {
    setSending(true);
    try {
      const res = await fetch(`/api/quotes/${quoteId}/send`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        toast({ message: getUserMessage(data.error || 'Failed to send quote'), type: 'error' });
        return;
      }
      toast({ message: 'Quote sent!', type: 'success' });
      router.refresh();
      onClose();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-modal-backdrop">
      {/* Top bar */}
      <div className="flex w-full items-center justify-between px-4 py-3 sm:px-6">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Close Preview
        </button>
        <span className="text-sm font-medium text-white/50">Customer Preview</span>
      </div>

      {/* Phone frame */}
      <div className="flex flex-1 items-center justify-center overflow-hidden px-4 pb-4">
        <div
          className="relative overflow-hidden rounded-[2.5rem] border-[6px] border-gray-700 bg-black shadow-2xl"
          style={{ width: 375, height: 667 }}
        >
          {/* Notch */}
          <div className="absolute left-1/2 top-0 z-10 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-black" />
          <iframe
            src={`/q/${quoteId}`}
            className="h-full w-full bg-white"
            title="Quote preview"
            style={{ border: 'none' }}
          />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex w-full items-center justify-center gap-3 px-4 pb-5 pt-2">
        <button
          onClick={handleSend}
          disabled={sending || !hasContact}
          title={!hasContact ? 'Add a phone number or email to send' : undefined}
          className="flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {sending ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          )}
          {sending ? 'Sending...' : currentStatus === 'draft' ? 'Send Quote' : 'Resend Quote'}
        </button>
      </div>
    </div>
  );
}
