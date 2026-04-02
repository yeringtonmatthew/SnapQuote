'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';

interface LeadCreateSheetProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

interface ClientOption {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export default function LeadCreateSheet({ open, onClose, onCreated }: LeadCreateSheetProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Client search
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);

  // Fetch clients when opened
  useEffect(() => {
    if (open) {
      fetch('/api/clients')
        .then((r) => r.json())
        .then((data) => setClients(Array.isArray(data) ? data : []))
        .catch(() => setClients([]));
    }
  }, [open]);

  const reset = useCallback(() => {
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
    setSelectedClient(null);
    setClientSearch('');
    setShowClientSearch(false);
  }, []);

  const handleSelectClient = (client: ClientOption) => {
    setSelectedClient(client);
    setName(client.name);
    setPhone(client.phone || '');
    setEmail(client.email || '');
    setAddress(client.address || '');
    setShowClientSearch(false);
    setClientSearch('');
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      // Create as a lead in the pipeline — lightweight quote with pipeline_stage='lead'
      const res = await fetch('/api/quotes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name.trim(),
          customer_phone: phone.trim() || null,
          customer_email: email.trim() || null,
          job_address: address.trim() || null,
          notes: notes.trim() || null,
          pipeline_stage: 'lead',
          client_id: selectedClient?.id || null,
          line_items: [],
          subtotal: 0,
          total: 0,
          deposit_amount: 0,
          deposit_percent: 0,
        }),
      });
      if (!res.ok) throw new Error('Failed to create lead');
      reset();
      onClose();
      onCreated?.();
      router.refresh();
    } catch {
      // Silent fail
    } finally {
      setSaving(false);
    }
  };

  // Submit on Enter from name field
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      e.preventDefault();
      handleSave();
    }
  };

  if (!open) return null;

  const filteredClients = clientSearch.trim()
    ? clients.filter((c) =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        (c.phone && c.phone.includes(clientSearch))
      )
    : clients;

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
              Add Lead
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
            {/* Link existing client option */}
            {!selectedClient && !showClientSearch && clients.length > 0 && (
              <button
                onClick={() => setShowClientSearch(true)}
                className="w-full flex items-center gap-2 rounded-xl bg-brand-50 dark:bg-brand-950/30 px-4 py-2.5 text-[13px] font-medium text-brand-600 dark:text-brand-400 press-scale transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                Link existing client
              </button>
            )}

            {/* Client search dropdown */}
            {showClientSearch && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  autoFocus
                  className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3 text-[15px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 ring-1 ring-black/[0.04] dark:ring-white/[0.06] focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <div className="max-h-40 overflow-y-auto rounded-xl bg-gray-50 dark:bg-gray-800 ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
                  {filteredClients.length === 0 ? (
                    <p className="px-4 py-3 text-[13px] text-gray-400">No clients found</p>
                  ) : (
                    filteredClients.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleSelectClient(c)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        <div className="h-8 w-8 shrink-0 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-[12px] font-semibold text-brand-600">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-medium text-gray-900 dark:text-gray-100 truncate">{c.name}</p>
                          {c.phone && <p className="text-[12px] text-gray-400 truncate">{c.phone}</p>}
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <button
                  onClick={() => { setShowClientSearch(false); setClientSearch(''); }}
                  className="text-[13px] font-medium text-gray-400 press-scale"
                >
                  Cancel search
                </button>
              </div>
            )}

            {/* Selected client badge */}
            {selectedClient && (
              <div className="flex items-center gap-2 rounded-xl bg-brand-50 dark:bg-brand-950/30 px-4 py-2.5">
                <div className="h-7 w-7 shrink-0 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-[11px] font-semibold text-brand-600">
                  {selectedClient.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-[14px] font-medium text-brand-700 dark:text-brand-300 flex-1 truncate">
                  {selectedClient.name}
                </span>
                <button
                  onClick={() => {
                    setSelectedClient(null);
                    setName('');
                    setPhone('');
                    setEmail('');
                    setAddress('');
                  }}
                  className="text-[12px] text-brand-500 font-medium press-scale"
                >
                  Change
                </button>
              </div>
            )}

            {/* Name */}
            <input
              type="text"
              placeholder="Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus={!showClientSearch}
              className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3 text-[15px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 ring-1 ring-black/[0.04] dark:ring-white/[0.06] focus:outline-none focus:ring-2 focus:ring-brand-500"
            />

            {/* Phone */}
            <input
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3 text-[15px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 ring-1 ring-black/[0.04] dark:ring-white/[0.06] focus:outline-none focus:ring-2 focus:ring-brand-500"
            />

            {/* Address */}
            <AddressAutocomplete
              value={address}
              onChange={setAddress}
              placeholder="Job address"
              className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3 text-[15px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 ring-1 ring-black/[0.04] dark:ring-white/[0.06] focus:outline-none focus:ring-2 focus:ring-brand-500"
              inline
            />

            {/* Notes */}
            <textarea
              placeholder="Notes (e.g. roof type, damage details, referral source...)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3 text-[15px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 ring-1 ring-black/[0.04] dark:ring-white/[0.06] focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          {/* Fixed button at bottom */}
          <div className="px-5 pb-8 pt-3 shrink-0 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleSave}
              disabled={!name.trim() || saving}
              className="w-full rounded-xl bg-brand-600 py-3.5 text-[15px] font-semibold text-white shadow-sm disabled:opacity-50 press-scale transition-colors"
            >
              {saving ? 'Adding...' : 'Add to Pipeline'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
