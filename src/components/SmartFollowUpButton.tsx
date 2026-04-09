'use client';

import { useState } from 'react';
import { haptic } from '@/lib/haptic';
import { Spinner } from '@/components/ui/Spinner';

interface Props {
  quoteId: string;
  customerName: string;
  customerPhone: string | null;
  /** Brand color for button styling */
  brandColor?: string;
}

export function SmartFollowUpButton({ quoteId, customerName, customerPhone, brandColor = '#4f46e5' }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstName = customerName.split(' ')[0];

  async function generateMessage() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/quotes/${quoteId}/generate-followup`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to generate');
      const data = await res.json();
      setMessage(data.message);
      haptic('light');
    } catch {
      setError('Could not generate message. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function copyMessage() {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      haptic('light');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fallback for iOS WebView
    }
  }

  function sendSMS() {
    if (!message || !customerPhone) return;
    const encoded = encodeURIComponent(message);
    window.open(`sms:${customerPhone}?body=${encoded}`, '_self');
  }

  // Not generated yet — show generate button
  if (!message) {
    return (
      <button
        onClick={generateMessage}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-3 text-[14px] font-semibold text-white shadow-sm press-scale transition-all disabled:opacity-60"
      >
        {loading ? (
          <>
            <Spinner size="sm" />
            Generating...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            Generate Smart Follow-Up
          </>
        )}
      </button>
    );
  }

  // Message generated — show preview + actions
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] overflow-hidden animate-fade-up">
      {/* Message preview */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-2">
          <svg className="h-3.5 w-3.5 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">AI-Generated Follow-Up</span>
        </div>
        <p className="text-[14px] text-gray-700 dark:text-gray-300 leading-relaxed">
          {message}
        </p>
      </div>

      {/* Action buttons */}
      <div className="px-4 py-3 flex gap-2">
        {customerPhone && (
          <button
            onClick={sendSMS}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-white press-scale transition-all"
            style={{ backgroundColor: brandColor }}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            Text {firstName}
          </button>
        )}
        <button
          onClick={copyMessage}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2.5 text-[13px] font-semibold text-gray-600 dark:text-gray-300 press-scale transition-all hover:bg-gray-50"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
              Copy
            </>
          )}
        </button>
        <button
          onClick={() => { setMessage(null); generateMessage(); }}
          className="flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 px-2.5 py-2.5 text-gray-400 press-scale transition-all hover:bg-gray-50"
          aria-label="Regenerate"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="px-4 pb-3">
          <p className="text-[12px] text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
}
