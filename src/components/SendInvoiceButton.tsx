'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { haptic } from '@/lib/haptic';

interface SendInvoiceButtonProps {
  quoteId: string;
  isPaid: boolean;
  hasEmail: boolean;
  hasPhone: boolean;
  /** When true, renders as a full-width card-style button */
  prominent?: boolean;
}

export function SendInvoiceButton({
  quoteId,
  isPaid,
  hasEmail,
  hasPhone,
  prominent = false,
}: SendInvoiceButtonProps) {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [sendEmail, setSendEmail] = useState(hasEmail);
  const [sendSms, setSendSms] = useState(!hasEmail && hasPhone);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    if (!sendEmail && !sendSms) {
      toast({ message: 'Select at least one delivery method', type: 'error' });
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`/api/quotes/${quoteId}/send-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sendEmail, sendSmsMsg: sendSms }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ message: data.error || 'Failed to send invoice', type: 'error' });
        return;
      }
      haptic('heavy');
      setSent(true);
      const channels: string[] = [];
      if (data.emailSent) channels.push('email');
      if (data.smsSent) channels.push('text');
      toast({ message: `Invoice sent via ${channels.length ? channels.join(' & ') : 'selected channels'}!`, type: 'success' });
      setTimeout(() => {
        setShowModal(false);
        setSent(false);
      }, 1500);
    } finally {
      setSending(false);
    }
  }

  const label = isPaid ? 'Send Paid Invoice' : 'Send Invoice';
  const icon = isPaid ? (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ) : (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );

  const trigger = prominent ? (
    <button
      onClick={() => { haptic('light'); setShowModal(true); }}
      className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold shadow-sm press-scale transition-colors ${
        isPaid
          ? 'bg-green-600 text-white hover:bg-green-700'
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      {label}
    </button>
  ) : (
    <button
      onClick={() => { haptic('light'); setShowModal(true); }}
      className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 press-scale"
    >
      {icon}
      {label}
    </button>
  );

  return (
    <>
      {trigger}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-modal-backdrop">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-gray-900 p-6 space-y-5 animate-modal-content">
            {sent ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <p className="text-[18px] font-bold text-gray-900 dark:text-gray-100">Invoice Sent!</p>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="text-[20px] font-bold text-gray-900 dark:text-gray-100">{label}</h2>
                  <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {isPaid ? 'Send a paid receipt & invoice to the customer.' : 'Send an invoice to the customer for payment.'}
                  </p>
                </div>

                {/* Delivery method */}
                <div className="space-y-2">
                  <p className="label">Deliver via</p>
                  {hasEmail && (
                    <button
                      onClick={() => { haptic('light'); setSendEmail(!sendEmail); }}
                      className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                        sendEmail
                          ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/30'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                        sendEmail ? 'border-brand-600 bg-brand-600' : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {sendEmail && (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className={`text-[14px] font-semibold ${sendEmail ? 'text-brand-700 dark:text-brand-300' : 'text-gray-900 dark:text-gray-100'}`}>Email</p>
                        <p className="text-[12px] text-gray-400">Send invoice to customer's email</p>
                      </div>
                      <svg className="ml-auto h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </button>
                  )}
                  {hasPhone && (
                    <button
                      onClick={() => { haptic('light'); setSendSms(!sendSms); }}
                      className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                        sendSms
                          ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/30'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                        sendSms ? 'border-brand-600 bg-brand-600' : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {sendSms && (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className={`text-[14px] font-semibold ${sendSms ? 'text-brand-700 dark:text-brand-300' : 'text-gray-900 dark:text-gray-100'}`}>Text (SMS)</p>
                        <p className="text-[12px] text-gray-400">Send link via text message</p>
                      </div>
                      <svg className="ml-auto h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                      </svg>
                    </button>
                  )}
                  {!hasEmail && !hasPhone && (
                    <p className="rounded-xl bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-[13px] text-amber-700 dark:text-amber-400">
                      No email or phone on file for this customer.
                    </p>
                  )}
                </div>

                {/* Download link */}
                <a
                  href={`/api/quotes/${quoteId}/invoice`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-[14px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download Invoice PDF
                  <span className="ml-auto text-[12px] text-gray-400">for your records</span>
                </a>

                <button
                  onClick={handleSend}
                  disabled={sending || (!hasEmail && !hasPhone)}
                  className="w-full rounded-2xl bg-green-600 py-3.5 text-[15px] font-semibold text-white hover:bg-green-700 disabled:opacity-60 press-scale"
                >
                  {sending ? 'Sending…' : `Send ${label}`}
                </button>

                <button onClick={() => setShowModal(false)} className="w-full py-2 text-[14px] text-gray-400">
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
