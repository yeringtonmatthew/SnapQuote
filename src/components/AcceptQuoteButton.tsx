'use client';

import { useState } from 'react';
import { SignaturePad } from './SignaturePad';
import { getUserMessage } from '@/lib/error-messages';
import { haptic } from '@/lib/haptic';
import { Spinner } from '@/components/ui/Spinner';
import { triggerConfetti } from '@/components/ConfettiEffect';

interface AcceptQuoteButtonProps {
  quoteId: string;
  depositAmount: number;
  currentStatus: string;
  stripeEnabled?: boolean;
  brandColor?: string;
}

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function AcceptQuoteButton({ quoteId, depositAmount, currentStatus, stripeEnabled, brandColor = '#4f46e5' }: AcceptQuoteButtonProps) {
  const [accepted, setAccepted] = useState(currentStatus === 'approved' || currentStatus === 'deposit_paid');
  const [accepting, setAccepting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    if (!name.trim() || !signature || !agreed) return;
    setAccepting(true);
    setError(null);
    try {
      const res = await fetch(`/api/quotes/${quoteId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_name: name, customer_signature: signature }),
      });
      if (res.ok) {
        haptic('heavy');
        if (stripeEnabled) {
          window.location.href = `/api/quotes/${quoteId}/checkout`;
        } else {
          setAccepted(true);
          setShowModal(false);
          triggerConfetti();
        }
      } else {
        const data = await res.json();
        setError(getUserMessage(data.error || ''));
      }
    } catch {
      setError(getUserMessage('Network Error'));
    } finally {
      setAccepting(false);
    }
  }

  if (accepted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm animate-page-enter">
        <div className="text-center px-8 space-y-5 max-w-sm mx-auto">
          {/* Animated checkmark */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 shadow-lg shadow-green-100/50">
            <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <div>
            <h2 className="text-[26px] font-bold text-gray-900">You&apos;re All Set!</h2>
            <p className="text-[15px] text-gray-500 mt-1.5 leading-relaxed">
              Your project has been confirmed. We&apos;re excited to get started on your home.
            </p>
          </div>

          {/* Timeline steps */}
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5 text-left space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Here&apos;s What Happens Now</p>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 mt-0.5">
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-gray-900">Confirmation sent</p>
                <p className="text-[12px] text-gray-500">A receipt and project details are on the way to your email.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 mt-0.5">
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-gray-900">Your contractor has been notified</p>
                <p className="text-[12px] text-gray-500">They&apos;re already preparing for your project.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 bg-white mt-0.5">
                <span className="text-[10px] font-bold text-gray-400">3</span>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-gray-900">Scheduling call coming soon</p>
                <p className="text-[12px] text-gray-500">Expect a call within 24 hours to lock in your project date.</p>
              </div>
            </div>
          </div>

          {/* Reassurance */}
          <div className="flex items-center justify-center gap-2 text-[12px] text-gray-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Your payment is secure and your deposit is protected.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        aria-expanded={showModal}
        className="w-full rounded-2xl py-3.5 text-[15px] font-semibold text-white shadow-sm press-scale transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        style={{ backgroundColor: brandColor }}
      >
        {stripeEnabled ? `Approve & Secure Your Project — ${fmt(depositAmount)}` : `Approve & Secure Your Project — ${fmt(depositAmount)}`}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-modal-backdrop" role="dialog" aria-modal="true" aria-label="Sign and accept quote">
          <div className="w-full max-w-lg rounded-t-3xl bg-white pb-8 overflow-y-auto max-h-[92dvh] animate-modal-content">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-gray-200" />
            </div>

            <div className="px-6 pb-8 space-y-5">
              <div className="text-center pt-2">
                <h2 className="text-[22px] font-bold text-gray-900">Sign & Accept</h2>
                <p className="text-[14px] text-gray-500 mt-1">
                  Review, sign, and accept this quote to get started.
                </p>
              </div>

              {error && (
                <div role="alert" className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Name */}
              <div>
                <label htmlFor="accept-full-name" className="block text-[13px] font-semibold text-gray-700 mb-1.5">Your Full Name</label>
                <input
                  id="accept-full-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="First and last name"
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[15px] text-gray-900 placeholder-gray-400 transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)] focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                />
              </div>

              {/* Signature */}
              <SignaturePad onChange={setSignature} />

              {/* Agreement */}
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => { haptic('light'); setAgreed(e.target.checked); }}
                    className="peer sr-only"
                  />
                  <div className={`h-5 w-5 rounded-md border-2 transition-colors flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2 ${agreed ? 'border-brand-600 bg-brand-600' : 'border-gray-300'}`}>
                    {agreed && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                </div>
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  I agree to the scope of work, pricing, and terms outlined in this quote. I understand a deposit of {fmt(depositAmount)} is required to begin work.
                </p>
              </label>

              {/* Submit */}
              <button
                onClick={handleAccept}
                disabled={!name.trim() || !signature || !agreed || accepting}
                className="w-full rounded-2xl py-4 text-[16px] font-bold text-white disabled:opacity-40 transition-all press-scale focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                style={{ backgroundColor: brandColor }}
              >
                {accepting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size="sm" />
                    Accepting...
                  </span>
                ) : `Sign & Approve — ${fmt(depositAmount)} Deposit`}
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 text-[14px] text-gray-500 rounded-lg focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
