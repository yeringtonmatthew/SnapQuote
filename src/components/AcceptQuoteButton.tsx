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
  const [typedSignature, setTypedSignature] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSignature = !!signature || !!typedSignature.trim();

  async function handleAccept() {
    if (!name.trim() || !hasSignature || !agreed) return;
    setAccepting(true);
    setError(null);
    try {
      const res = await fetch(`/api/quotes/${quoteId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name,
          customer_signature: signature || null,
          customer_signed_name: typedSignature.trim() || name.trim(),
        }),
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md" style={{ animation: 'successFadeIn 0.4s ease-out' }}>
        <div className="mx-4 max-w-md w-full rounded-3xl bg-white shadow-2xl overflow-hidden" style={{ animation: 'successCardIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both' }}>
          {/* Green gradient header */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 px-6 pt-10 pb-7 text-center relative overflow-hidden">
            {/* Subtle radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.15),transparent_70%)]" />
            <div className="relative">
              <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm mb-5" style={{ height: 72, width: 72, animation: 'successCheckIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both' }}>
                <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ animation: 'successDrawCheck 0.4s ease-out 0.6s both' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" style={{ strokeDasharray: 30, strokeDashoffset: 30, animation: 'successStrokeDraw 0.5s ease-out 0.7s forwards' }} />
                </svg>
              </div>
              <h2 className="text-[24px] font-bold text-white" style={{ animation: 'successTextIn 0.4s ease-out 0.5s both' }}>Project Confirmed</h2>
              <p className="text-[14px] text-white/80 mt-1.5" style={{ animation: 'successTextIn 0.4s ease-out 0.6s both' }}>
                You&apos;re officially on the schedule. We&apos;ll take it from here.
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Here&apos;s What Happens Now</p>

            <div className="space-y-4">
              <div className="flex items-start gap-3" style={{ animation: 'successStepIn 0.3s ease-out 0.7s both' }}>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500 mt-0.5">
                  <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-900">Confirmation sent to your inbox</p>
                  <p className="text-[12px] text-gray-400">Full receipt and project summary included.</p>
                </div>
              </div>
              <div className="flex items-start gap-3" style={{ animation: 'successStepIn 0.3s ease-out 0.8s both' }}>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500 mt-0.5">
                  <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-900">Your team is preparing</p>
                  <p className="text-[12px] text-gray-400">Materials and scheduling are already in motion.</p>
                </div>
              </div>
              <div className="flex items-start gap-3" style={{ animation: 'successStepIn 0.3s ease-out 0.9s both' }}>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200 mt-0.5">
                  <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-900">Expect a call within 24 hours</p>
                  <p className="text-[12px] text-gray-400">We&apos;ll confirm your preferred start date.</p>
                </div>
              </div>
            </div>

            {/* Reassurance */}
            <div className="flex items-center justify-center gap-2 pt-3 pb-1 text-[11px] text-gray-400 border-t border-gray-100">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              Secure payment processed. You&apos;re in good hands.
            </div>
          </div>
        </div>
        <style>{`
          @keyframes successFadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes successCardIn { from { opacity: 0; transform: scale(0.92) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
          @keyframes successCheckIn { from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: scale(1); } }
          @keyframes successDrawCheck { from { opacity: 0; } to { opacity: 1; } }
          @keyframes successStrokeDraw { to { stroke-dashoffset: 0; } }
          @keyframes successTextIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes successStepIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
        `}</style>
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
        {depositAmount > 0 ? `Approve & Secure Your Project — ${fmt(depositAmount)}` : 'Approve & Secure Your Project'}
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
              <SignaturePad onChange={setSignature} onTypedName={setTypedSignature} />

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
                  I agree to the scope of work, pricing, and terms outlined in this quote.{depositAmount > 0 ? ` I understand a deposit of ${fmt(depositAmount)} is required to begin work.` : ''}
                </p>
              </label>

              {/* Submit */}
              <button
                onClick={handleAccept}
                disabled={!name.trim() || !hasSignature || !agreed || accepting}
                className="w-full rounded-2xl py-4 text-[16px] font-bold text-white disabled:opacity-40 transition-all press-scale focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                style={{ backgroundColor: brandColor }}
              >
                {accepting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size="sm" />
                    Accepting...
                  </span>
                ) : depositAmount > 0 ? `Sign & Approve — ${fmt(depositAmount)} Deposit` : 'Sign & Approve'}
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
