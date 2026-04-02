'use client';

import { useState, useCallback } from 'react';
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
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, address, company }),
      });
      if (!res.ok) throw new Error('Failed to create client');
      const client = await res.json();
      reset();
      onClose();
      onCreated?.(client);
      router.push(`/clients/${client.id}`);
    } catch {
      // Silent fail
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

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 animate-sheet-backdrop"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-sheet-up flex flex-col" style={{ maxHeight: '85vh' }}>
        <div className="mx-auto w-full max-w-lg rounded-t-2xl bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-hidden">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="h-1 w-8 rounded-full bg-gray-300 dark:bg-gray-700" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3 shrink-0">
            <h2 className="text-[17px] font-bold text-gray-900 dark:text-gray-100">
              New Client
            </h2>
            <button
              onClick={onClose}
              className="text-[15px] font-medium text-gray-400 press-scale"
            >
              Cancel
            </button>
          </div>

          {/* Scrollable form area */}
          <div className="overflow-y-auto overscroll-contain px-5 pb-4 space-y-3 flex-1 min-h-0">
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
              <div className="space-y-3 animate-sheet-up">
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
          <div className="px-5 pb-8 pt-3 shrink-0 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleSave}
              disabled={!name.trim() || saving}
              className="w-full rounded-xl bg-brand-600 py-3.5 text-[15px] font-semibold text-white shadow-sm disabled:opacity-50 press-scale transition-colors"
            >
              {saving ? 'Creating...' : 'Create Client'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
