'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { CalendarEvent, EventType } from '@/types/database';
import { haptic } from '@/lib/haptic';

// ── Constants ────────────────────────────────────────────
const EVENT_TYPES: { value: EventType; label: string; color: string }[] = [
  { value: 'estimate', label: 'Estimate', color: 'bg-blue-500' },
  { value: 'follow_up', label: 'Follow Up', color: 'bg-amber-500' },
  { value: 'job_scheduled', label: 'Job', color: 'bg-indigo-500' },
  { value: 'material_dropoff', label: 'Materials', color: 'bg-orange-500' },
  { value: 'production', label: 'Production', color: 'bg-purple-500' },
  { value: 'walkthrough', label: 'Walkthrough', color: 'bg-cyan-500' },
  { value: 'payment_collection', label: 'Payment', color: 'bg-green-500' },
  { value: 'blocked_time', label: 'Blocked', color: 'bg-gray-400' },
];

interface QuoteOption {
  id: string;
  customer_name: string;
  job_address: string | null;
}

interface ClientOption {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
}

interface EventCreateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<CalendarEvent> & { client_id?: string | null }) => void;
  defaultDate?: string;
  defaultTime?: string;
  quotes?: QuoteOption[];
  editingEvent?: CalendarEvent;
  saveError?: string | null;
}

export default function EventCreateSheet({
  isOpen,
  onClose,
  onSave,
  defaultDate,
  defaultTime,
  quotes = [],
  editingEvent,
  saveError,
}: EventCreateSheetProps) {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<EventType>('job_scheduled');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [notes, setNotes] = useState('');
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Client/quote search
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [linkedName, setLinkedName] = useState('');
  const [linkedType, setLinkedType] = useState<'client' | 'quote' | null>(null);

  // Clients fetched from API
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [clientsLoaded, setClientsLoaded] = useState(false);

  // Inline client creation
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [creatingClient, setCreatingClient] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Fetch clients when sheet opens
  const fetchClients = useCallback(async () => {
    if (clientsLoaded) return;
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(Array.isArray(data) ? data : (data.clients || []));
      }
    } catch { /* silent */ }
    setClientsLoaded(true);
  }, [clientsLoaded]);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      fetchClients();
      if (editingEvent) {
        setTitle(editingEvent.title || '');
        setEventType(editingEvent.event_type);
        setEventDate(editingEvent.event_date);
        setStartTime(editingEvent.start_time || '');
        setEndTime(editingEvent.end_time || '');
        setAllDay(editingEvent.all_day);
        setNotes(editingEvent.notes || '');
        setQuoteId(editingEvent.quote_id || null);
        setClientId((editingEvent as CalendarEvent & { client_id?: string | null }).client_id || null);
        setLinkedName(editingEvent.customer_name || editingEvent.title || '');
        setLinkedType(editingEvent.quote_id ? 'quote' : (editingEvent as CalendarEvent & { client_id?: string | null }).client_id ? 'client' : null);
      } else {
        setTitle('');
        setEventType('job_scheduled');
        setEventDate(defaultDate || new Date().toISOString().split('T')[0]);
        setStartTime(defaultTime || '09:00');
        setEndTime(defaultTime ? `${String(Number(defaultTime.split(':')[0]) + 1).padStart(2, '0')}:00` : '10:00');
        setAllDay(false);
        setNotes('');
        setQuoteId(null);
        setClientId(null);
        setLinkedName('');
        setLinkedType(null);
      }
      setSearchQuery('');
      setShowDropdown(false);
      setShowNewClient(false);
      setSaving(false);
    }
  }, [isOpen, editingEvent, defaultDate, defaultTime, fetchClients]);

  // Combined search results: clients + quotes
  const searchResults = (() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return { clients: clients.slice(0, 5), quotes: quotes.slice(0, 5) };
    return {
      clients: clients.filter(c => c.name.toLowerCase().includes(q)).slice(0, 5),
      quotes: quotes.filter(qo => qo.customer_name.toLowerCase().includes(q)).slice(0, 5),
    };
  })();

  const hasResults = searchResults.clients.length > 0 || searchResults.quotes.length > 0;

  const handleSelectClient = (client: ClientOption) => {
    setClientId(client.id);
    setQuoteId(null);
    setLinkedName(client.name);
    setLinkedType('client');
    if (!title.trim()) setTitle(client.name);
    setSearchQuery('');
    setShowDropdown(false);
    haptic('light');
  };

  const handleSelectQuote = (quote: QuoteOption) => {
    setQuoteId(quote.id);
    setClientId(null);
    setLinkedName(quote.customer_name);
    setLinkedType('quote');
    if (!title.trim()) setTitle(quote.customer_name);
    setSearchQuery('');
    setShowDropdown(false);
    haptic('light');
  };

  const handleClearLink = () => {
    setQuoteId(null);
    setClientId(null);
    setLinkedName('');
    setLinkedType(null);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleCreateClient = async () => {
    if (!newClientName.trim()) return;
    setCreatingClient(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClientName.trim(),
          phone: newClientPhone.trim() || null,
          address: newClientAddress.trim() || null,
        }),
      });
      if (res.ok) {
        const newClient = await res.json();
        // Add to local clients list
        setClients(prev => [...prev, newClient]);
        // Select the new client
        handleSelectClient(newClient);
        setShowNewClient(false);
        setNewClientName('');
        setNewClientPhone('');
        setNewClientAddress('');
        haptic('medium');
      }
    } catch {
      // Client creation failed silently — user can retry
    } finally {
      setCreatingClient(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() && !linkedName) return;
    setSaving(true);

    const eventData: Partial<CalendarEvent> & { client_id?: string | null } = {
      title: title.trim() || linkedName,
      event_type: eventType,
      event_date: eventDate,
      start_time: allDay ? null : startTime || null,
      end_time: allDay ? null : endTime || null,
      all_day: allDay,
      notes: notes.trim() || null,
      quote_id: quoteId,
      client_id: clientId,
    };

    await onSave(eventData);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!editingEvent) return;
    if (!confirm('Delete this event?')) return;

    try {
      const res = await fetch(`/api/events/${editingEvent.id}`, { method: 'DELETE' });
      if (res.ok) {
        window.location.reload();
      }
    } catch {
      // Delete failed silently — user can retry
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 animate-sheet-backdrop"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="fixed inset-x-0 bottom-0 lg:inset-y-0 lg:left-auto lg:right-0 lg:bottom-auto lg:w-[420px] z-50 bg-white dark:bg-gray-900 lg:rounded-none rounded-t-2xl animate-sheet-up lg:animate-none max-h-[92dvh] lg:max-h-none lg:h-full overflow-y-auto"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden">
          <div className="h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 pt-1 lg:pt-4 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="text-[15px] font-medium text-gray-500 dark:text-gray-400 press-scale min-h-[44px] min-w-[44px] flex items-center"
          >
            Cancel
          </button>
          <h2 className="text-[16px] font-bold text-gray-900 dark:text-gray-100">
            {editingEvent ? 'Edit Event' : 'New Event'}
          </h2>
          <button
            onClick={handleSave}
            disabled={saving || (!title.trim() && !linkedName)}
            className="text-[15px] font-semibold text-brand-600 dark:text-brand-400 disabled:text-gray-300 dark:disabled:text-gray-600 press-scale min-h-[44px] min-w-[44px] flex items-center justify-end"
          >
            {saving ? 'Saving...' : editingEvent ? 'Update' : 'Create'}
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Client / Job Link */}
          <div>
            <label className="block text-[13px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">Client</label>
            {(linkedType && linkedName) ? (
              <div className="flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40 shrink-0">
                  <span className="text-[13px] font-bold text-brand-700 dark:text-brand-300">
                    {linkedName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100 truncate">{linkedName}</p>
                  <p className="text-[11px] text-gray-400">
                    {linkedType === 'quote' ? 'Linked to quote' : 'Client'}
                  </p>
                </div>
                <button
                  onClick={handleClearLink}
                  className="shrink-0 text-[13px] font-medium text-red-500 press-scale"
                >
                  Remove
                </button>
              </div>
            ) : showNewClient ? (
              /* Inline new client form */
              <div className="rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50/30 dark:bg-brand-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">New Client</p>
                  <button
                    onClick={() => setShowNewClient(false)}
                    className="text-[12px] font-medium text-gray-400 press-scale"
                  >
                    Cancel
                  </button>
                </div>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Client name *"
                  autoFocus
                  className="w-full rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2.5 text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
                />
                <input
                  type="tel"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="Phone (optional)"
                  className="w-full rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2.5 text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
                />
                <input
                  type="text"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  placeholder="Address (optional)"
                  className="w-full rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2.5 text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
                />
                <button
                  onClick={handleCreateClient}
                  disabled={!newClientName.trim() || creatingClient}
                  className="w-full rounded-lg bg-brand-600 py-2.5 text-[15px] font-semibold text-white disabled:opacity-40 press-scale"
                >
                  {creatingClient ? 'Creating...' : 'Create Client'}
                </button>
              </div>
            ) : (
              /* Search input */
              <div className="relative">
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search clients or jobs..."
                    className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 pl-10 pr-4 py-3 text-[15px] text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>

                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl ring-1 ring-black/[0.08] dark:ring-white/[0.08] shadow-lg max-h-60 overflow-y-auto z-20">
                    {/* Clients section */}
                    {searchResults.clients.length > 0 && (
                      <>
                        <div className="px-3.5 py-2 border-b border-gray-100 dark:border-gray-700">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Clients</p>
                        </div>
                        {searchResults.clients.map((c) => (
                          <button
                            key={`c-${c.id}`}
                            onClick={() => handleSelectClient(c)}
                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors flex items-center gap-3"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 shrink-0">
                              <span className="text-[12px] font-bold text-gray-600 dark:text-gray-300">{c.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100 truncate">{c.name}</p>
                              {c.phone && <p className="text-[12px] text-gray-400">{c.phone}</p>}
                            </div>
                          </button>
                        ))}
                      </>
                    )}

                    {/* Quotes section */}
                    {searchResults.quotes.length > 0 && (
                      <>
                        <div className="px-3.5 py-2 border-b border-gray-100 dark:border-gray-700">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Jobs</p>
                        </div>
                        {searchResults.quotes.map((q) => (
                          <button
                            key={`q-${q.id}`}
                            onClick={() => handleSelectQuote(q)}
                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors flex items-center gap-3"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 shrink-0">
                              <svg className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100 truncate">{q.customer_name}</p>
                              {q.job_address && <p className="text-[12px] text-gray-400 truncate">{q.job_address}</p>}
                            </div>
                          </button>
                        ))}
                      </>
                    )}

                    {/* No results + create new */}
                    {!hasResults && searchQuery.trim() && (
                      <div className="px-4 py-3 text-center">
                        <p className="text-[13px] text-gray-400">No matches found</p>
                      </div>
                    )}

                    {/* Create new client option */}
                    <button
                      onClick={() => {
                        setShowNewClient(true);
                        setNewClientName(searchQuery.trim());
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-brand-50 dark:hover:bg-brand-950/30 active:bg-brand-100 dark:active:bg-brand-950/50 transition-colors flex items-center gap-3 border-t border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40 shrink-0">
                        <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-brand-600">
                          {searchQuery.trim() ? `Create "${searchQuery.trim()}"` : 'Create new client'}
                        </p>
                        <p className="text-[11px] text-gray-400">Add a new client to your list</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-[13px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-3 text-[15px] text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
          </div>

          {/* Event Type Pills */}
          <div>
            <label className="block text-[13px] font-medium text-gray-500 dark:text-gray-400 mb-2">Type</label>
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 -mx-5 px-5">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setEventType(type.value)}
                  className={`shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-all active:scale-[0.96] ${
                    eventType === type.value
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <div className={`h-2 w-2 rounded-full ${type.color}`} />
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-[13px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-3 text-[15px] text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-[14px] font-medium text-gray-900 dark:text-gray-100">All day</label>
            <button
              onClick={() => setAllDay(!allDay)}
              className={`relative h-7 w-12 rounded-full transition-colors toggle-switch ${
                allDay ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`toggle-dot absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm ${
                  allDay ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Time inputs */}
          {!allDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">Start</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-3 text-[15px] text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">End</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-3 text-[15px] text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[13px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes..."
              rows={3}
              className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-3 text-[15px] text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-500/20 transition-all resize-none"
            />
          </div>

          {/* Save error */}
          {saveError && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3">
              <p className="text-[14px] font-medium text-red-700 dark:text-red-400">{saveError}</p>
            </div>
          )}

          {/* Delete button for editing */}
          {editingEvent && (
            <button
              onClick={handleDelete}
              className="w-full rounded-xl bg-red-50 dark:bg-red-950/30 px-4 py-3 text-[15px] font-semibold text-red-600 dark:text-red-400 active:scale-[0.98] transition-transform"
            >
              Delete Event
            </button>
          )}

          {/* Bottom safe area spacer */}
          <div className="h-8" />
        </div>
      </div>
    </>
  );
}
