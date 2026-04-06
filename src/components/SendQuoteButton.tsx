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
  customerName?: string;
  customerPhone?: string;
  total?: number;
  businessName?: string;
}

export function SendQuoteButton({
  quoteId,
  currentStatus,
  hasPhone,
  hasEmail,
  customerName,
  customerPhone,
  total,
  businessName,
}: SendQuoteButtonProps) {
  const hasContact = hasPhone || !!hasEmail;
  const router = useRouter();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  const proposalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/q/${quoteId}`
    : `/q/${quoteId}`;

  const alreadySent = currentStatus !== 'draft';

  async function handleCopyLink() {
    await navigator.clipboard.writeText(proposalUrl);
    setCopied(true);
    toast({ message: 'Link copied to clipboard', type: 'success' });
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSendEmail() {
    setSending(true);
    setShowOptions(false);
    try {
      const res = await fetch(`/api/quotes/${quoteId}/send`, { method: 'POST' });
      if (!res.ok) {
        let errorMsg = 'Failed to send';
        try { const data = await res.json(); errorMsg = data.error || errorMsg; } catch {}
        toast({ message: getUserMessage(errorMsg), type: 'error' });
        return;
      }
      haptic('medium');
      setShowSuccess(true);
      setSent(true);
      toast({ message: 'Quote emailed to customer', type: 'success' });
      router.refresh();
    } catch (err) {
      toast({ message: 'Something went wrong. Please try again.', type: 'error' });
    } finally {
      setSending(false);
    }
  }

  function handleSendText() {
    setShowOptions(false);
    if (!customerPhone) return;
    const digits = customerPhone.replace(/\D/g, '');
    const amount = total
      ? `$${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      : 'your project';
    const name = customerName || 'there';
    const biz = businessName || 'us';
    const msg = `Hi ${name}, ${biz} sent you a quote for ${amount}. View and approve here: ${proposalUrl}`;
    // Also mark as sent in the backend (fire-and-forget)
    fetch(`/api/quotes/${quoteId}/send`, { method: 'POST' }).then(() => {
      router.refresh();
    });
    // Open native SMS
    window.location.href = `sms:${digits}?body=${encodeURIComponent(msg)}`;
    setSent(true);
    haptic('medium');
  }

  // After sending — show view + copy link
  if (sent) {
    return (
      <div className="flex flex-col items-end gap-1">
        <SuccessAnimation show={showSuccess} onComplete={() => setShowSuccess(false)} />
        <div className="flex items-center gap-2">
          <a
            href={proposalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white shadow-sm press-scale"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            View
          </a>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 press-scale"
          >
            {copied ? (
              <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            ) : (
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
            )}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
    );
  }

  // Already sent — show resend options
  if (alreadySent) {
    return (
      <div className="relative flex items-center gap-2">
        <button
          onClick={() => setShowOptions(!showOptions)}
          disabled={sending || !hasContact}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 press-scale"
        >
          {sending ? (
            <Spinner size="sm" className="text-gray-700" />
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
          )}
          {sending ? 'Sending...' : 'Resend'}
        </button>
        <a
          href={proposalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 press-scale"
        >
          <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
          View
        </a>
        {showOptions && (
          <div className="absolute top-full right-0 mt-2 w-52 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 z-50 overflow-hidden animate-sheet-up">
            {hasEmail && (
              <button
                onClick={handleSendEmail}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100"
              >
                <svg className="h-5 w-5 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                Send via Email
              </button>
            )}
            {hasPhone && customerPhone && (
              <button
                onClick={handleSendText}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100"
              >
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
                Send via Text
              </button>
            )}
            <button
              onClick={handleCopyLink}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 border-t border-gray-100"
            >
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
              Copy Link
            </button>
          </div>
        )}
      </div>
    );
  }

  // Draft — show send options
  return (
    <div className="relative flex items-center gap-2">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={sending || !hasContact}
        title={!hasContact ? 'Add a phone number or email to send' : undefined}
        className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-500 disabled:opacity-50 press-scale"
      >
        {sending ? (
          <Spinner size="sm" />
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
        )}
        {sending ? 'Sending...' : 'Send Quote'}
        <svg className="h-3 w-3 ml-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
      </button>
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 press-scale"
      >
        {copied ? (
          <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
        ) : (
          <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
            )}
        {copied ? 'Copied!' : 'Link'}
      </button>

      {showOptions && (
        <div className="absolute top-full left-0 mt-2 w-52 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 z-50 overflow-hidden animate-sheet-up">
          {hasEmail && (
            <button
              onClick={handleSendEmail}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100"
            >
              <svg className="h-5 w-5 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
              Send via Email
            </button>
          )}
          {hasPhone && customerPhone && (
            <button
              onClick={handleSendText}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100"
            >
              <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
              Send via Text
            </button>
          )}
        </div>
      )}
    </div>
  );
}
