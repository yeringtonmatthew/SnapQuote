'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';

interface ClientCreateSheetProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (client: { id: string; name: string }) => void;
}

export default function ClientCreateSheet({ open, onClose, onCreated }: ClientCreateSheetProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [company, setCompany] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const reset = useCallback(() => {
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setCompany('');
    setShowMore(false);
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, address, company }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create client');
      }
      const client = await res.json();
      reset();
      onClose();
      onCreated?.(client);
      router.push(`/clients/${client.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Submit on Enter from phone field
  const handlePhoneKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      e.preventDefault();
      handleSave();
    }
  };

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-modal-backdrop p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Create new client"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-hidden max-h-[90dvh] animate-modal-content">
        {/* Header */}
        <div className="px-6 pb-3 pt-6 text-center shrink-0">
          <h2 className="text-[22px] font-bold text-gray-900 dark:text-gray-100">
            New Client
          </h2>
          <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-1">
            Add a new client to your account.
          </p>
        </div>

        {/* Scrollable form area */}
        <div className="overflow-y-auto overscroll-contain px-6 pb-4 space-y-3 flex-1 min-h-0">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <input
            type="text"
            placeholder="Client name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3 text-[15px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 ring-1 ring-black/[0.04] dark:ring-white/[0.06] focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={handlePhoneKeyDown}
            className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3 text-[15px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 ring-1 ring-black/[0.04] dark:ring-white/[0.06] focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          {/* Expandable section */}
          {!showMore ? (
            <button
              onClick={() => setShowMore(true)}
              className="text-[13px] font-medium text-brand-600 press-scale"
            >
              + More details
            </button>
          ) : (
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3 text-[15px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 ring-1 ring-black/[0.04] dark:ring-white/[0.06] focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="text"
                placeholder="Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3 text-[15px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 ring-1 ring-black/[0.04] dark:ring-white/[0.06] focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <AddressAutocomplete
                value={address}
                onChange={setAddress}
                placeholder="Address"
                className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3 text-[15px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 ring-1 ring-black/[0.04] dark:ring-white/[0.06] focus:outline-none focus:ring-2 focus:ring-brand-500"
                inline
              />
            </div>
          )}
        </div>

        {/* Fixed button at bottom */}
        <div className="px-6 pb-8 pt-3 shrink-0 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="w-full rounded-2xl bg-brand-600 py-3.5 text-[15px] font-semibold text-white shadow-sm disabled:opacity-50 press-scale transition-colors"
          >
            {saving ? 'Creating...' : 'Create Client'}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 mt-2 text-[14px] text-gray-500 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
