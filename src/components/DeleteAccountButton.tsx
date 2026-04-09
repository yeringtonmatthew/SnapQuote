'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/Spinner';

export function DeleteAccountButton() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfirmed = confirmText === 'DELETE';

  const handleDelete = useCallback(async () => {
    if (!isConfirmed || deleting) return;
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: 'DELETE' }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Something went wrong' }));
        setError(data.error || 'Failed to delete account');
        setDeleting(false);
        return;
      }

      // Account deleted successfully — redirect to login
      router.push('/auth/login');
    } catch {
      setError('Network error. Please try again.');
      setDeleting(false);
    }
  }, [isConfirmed, deleting, router]);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="w-full rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 py-3 text-[14px] font-semibold text-red-600 dark:text-red-400 press-scale transition-colors hover:bg-red-100 dark:hover:bg-red-900/30"
      >
        Delete My Account
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!deleting) {
                setShowModal(false);
                setConfirmText('');
                setError(null);
              }
            }}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-gray-900 dark:text-gray-100">
                    Delete Account
                  </h3>
                  <p className="text-[12px] text-gray-500 dark:text-gray-400">
                    This cannot be undone
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 mb-4">
                <p className="text-[13px] text-red-700 dark:text-red-400 leading-relaxed">
                  This will permanently delete your account, all quotes, clients, and data. This action cannot be undone.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="delete-confirm" className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                  Type <span className="font-mono font-bold text-red-600 dark:text-red-400">DELETE</span> to confirm
                </label>
                <input
                  id="delete-confirm"
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  disabled={deleting}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-colors disabled:opacity-50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isConfirmed) handleDelete();
                    if (e.key === 'Escape' && !deleting) {
                      setShowModal(false);
                      setConfirmText('');
                      setError(null);
                    }
                  }}
                />
              </div>

              {error && (
                <div className="mt-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-[13px] font-medium text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setShowModal(false);
                  setConfirmText('');
                  setError(null);
                }}
                className="flex-1 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-3 text-[14px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors press-scale disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!isConfirmed || deleting}
                onClick={handleDelete}
                className="flex-1 rounded-2xl bg-red-600 py-3 text-[14px] font-semibold text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors press-scale"
              >
                {deleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size="sm" />
                    Deleting...
                  </span>
                ) : (
                  'Delete Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
