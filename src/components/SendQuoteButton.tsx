'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { getUserMessage } from '@/lib/error-messages';
import { haptic } from '@/lib/haptic';
import { Spinner } from '@/components/ui/Spinner';
import { SuccessAnimation } from '@/components/ui/SuccessAnimation';

interface SendQuoteButtonProps {
  quoteId: string;
  currentStatus: string;
  hasPhone: boolean;
  hasEmail?: boolean;
}

export function SendQuoteButton({ quoteId, currentStatus, hasPhone, hasEmail }: SendQuoteButtonProps) {
  const hasContact = hasPhone || !!hasEmail;
  const router = useRouter();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ url?: string; smsError?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const proposalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/q/${quoteId}`
    : `/q/${quoteId}`;

  async function handleCopyLink() {
    await navigator.clipboard.writeText(proposalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const alreadySent = currentStatus !== 'draft';

  async function handleSend() {
    setSending(true);
    try {
      const res = await fetch(`/api/quotes/${quoteId}/send`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        toast({ message: getUserMessage(data.error || 'Failed to send quote'), type: 'error' });
        return;
      }
      haptic('medium');
      setShowSuccess(true);
      setResult(data);
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  if (result) {
    return (
      <div className="flex flex-col items-end gap-1">
        <SuccessAnimation show={showSuccess} onComplete={() => setShowSuccess(false)} />
        <div className="flex items-center gap-2">
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white shadow-sm press-scale focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            View
          </a>
          <button
            onClick={handleCopyLink}
            aria-label={copied ? 'Link copied' : 'Copy proposal link'}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 press-scale focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            title="Copy proposal link to share via other channels"
          >
            {copied ? (
              <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
            )}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
        {result.smsError && (
          <p role="alert" className="text-xs text-red-500">SMS failed</p>
        )}
      </div>
    );
  }

  if (alreadySent) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={`/q/${quoteId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 press-scale focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
          View Link
        </a>
        <button
          onClick={handleSend}
          disabled={sending || !hasContact}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 press-scale focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          {sending ? (
            <Spinner size="sm" className="text-gray-700" />
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          )}
          {sending ? 'Sending…' : 'Resend'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSend}
        disabled={sending || !hasContact}
        title={!hasContact ? 'Add a phone number or email to send' : undefined}
        className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-50 press-scale focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        {sending ? (
          <Spinner size="sm" />
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        )}
        {sending ? 'Sending…' : 'Send'}
      </button>
      <button
        onClick={handleCopyLink}
        aria-label={copied ? 'Link copied' : 'Copy proposal link'}
        className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 press-scale focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        title="Copy proposal link"
      >
        {copied ? (
          <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
        )}
        {copied ? 'Copied!' : 'Link'}
      </button>
    </div>
  );
}
