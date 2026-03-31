'use client';

import { useState, useCallback } from 'react';
import PhoneInput from '@/components/ui/PhoneInput';

type QuoteResult = {
  id: string;
  customer_name: string;
  business_name: string;
  subtotal: number;
  status: string;
  created_at: string;
  expires_at: string | null;
};

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-600' },
  sent: { label: 'Sent', bg: 'bg-blue-50', text: 'text-blue-600' },
  approved: { label: 'Approved', bg: 'bg-green-50', text: 'text-green-600' },
  deposit_paid: { label: 'Deposit Paid', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-600' },
  expired: { label: 'Expired', bg: 'bg-amber-50', text: 'text-amber-600' },
};

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getDisplayStatus(quote: QuoteResult): string {
  if (
    quote.status === 'sent' &&
    quote.expires_at &&
    new Date(quote.expires_at) < new Date()
  ) {
    return 'expired';
  }
  return quote.status;
}

export default function QuoteLookupPage() {
  const [mode, setMode] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [quotes, setQuotes] = useState<QuoteResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = useCallback(async () => {
    setError('');
    setQuotes(null);

    const payload: { phone?: string; email?: string } = {};
    if (mode === 'phone') {
      const digits = phone.replace(/\D/g, '');
      if (digits.length < 10) {
        setError('Please enter a valid 10-digit phone number.');
        return;
      }
      payload.phone = digits;
    } else {
      const trimmed = email.trim();
      if (!trimmed || !trimmed.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      payload.email = trimmed;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/quotes/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        return;
      }
      setQuotes(data.quotes);
    } catch {
      setError('Unable to reach server. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [mode, phone, email]);

  return (
    <div className="force-light min-h-dvh bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white px-4 pt-12 pb-6">
        <div className="mx-auto max-w-lg">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-600 mb-1">
            SnapQuote
          </p>
          <h1 className="text-[24px] font-bold tracking-tight text-gray-900">
            Find Your Quotes
          </h1>
          <p className="mt-1 text-[14px] text-gray-500">
            Enter your phone number or email to view all quotes sent to you.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-lg px-4 pt-6 pb-12">
        {/* Mode toggle */}
        <div className="mb-4 flex gap-1 rounded-xl bg-gray-100 p-1">
          <button
            onClick={() => { setMode('phone'); setError(''); setQuotes(null); }}
            className={`flex-1 rounded-lg py-2 text-[13px] font-semibold transition-colors ${
              mode === 'phone'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Phone Number
          </button>
          <button
            onClick={() => { setMode('email'); setError(''); setQuotes(null); }}
            className={`flex-1 rounded-lg py-2 text-[13px] font-semibold transition-colors ${
              mode === 'email'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Email Address
          </button>
        </div>

        {/* Input */}
        {mode === 'phone' ? (
          <PhoneInput
            value={phone}
            onChange={setPhone}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-[16px] text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
          />
        ) : (
          <input
            type="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-[16px] text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
          />
        )}

        {error && (
          <p className="mt-2 text-[13px] text-red-500">{error}</p>
        )}

        <button
          onClick={handleLookup}
          disabled={loading}
          className="mt-4 w-full rounded-2xl bg-brand-600 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Looking up...' : 'Look Up My Quotes'}
        </button>

        {/* Results */}
        {quotes !== null && (
          <div className="mt-8">
            {quotes.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </div>
                <p className="text-[15px] font-medium text-gray-900">
                  No quotes found
                </p>
                <p className="mt-1 text-[13px] text-gray-500">
                  No quotes found for this {mode === 'phone' ? 'number' : 'email'}. Check that you entered it correctly.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 px-1">
                  {quotes.length} {quotes.length === 1 ? 'Quote' : 'Quotes'} Found
                </p>
                {quotes.map((q) => {
                  const displayStatus = getDisplayStatus(q);
                  const badge = statusConfig[displayStatus] || statusConfig.sent;
                  return (
                    <a
                      key={q.id}
                      href={`/q/${q.id}`}
                      className="block rounded-2xl bg-white border border-gray-100 px-5 py-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-semibold text-gray-900 truncate">
                            {q.business_name}
                          </p>
                          <p className="mt-0.5 text-[13px] text-gray-500">
                            {new Date(q.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="ml-3 text-right shrink-0">
                          <p className="text-[17px] font-bold text-gray-900 tabular-nums">
                            {fmt(Number(q.subtotal))}
                          </p>
                          <span
                            className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badge.bg} ${badge.text}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center text-[12px] text-brand-600 font-medium">
                        View Quote
                        <svg
                          className="ml-1 h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                          />
                        </svg>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-[11px] text-gray-300">Powered by SnapQuote</p>
        </div>
      </main>
    </div>
  );
}
