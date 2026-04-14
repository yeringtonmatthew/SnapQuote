'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { CalendarEvent, EventType } from '@/types/database';
import { haptic } from '@/lib/haptic';

// ── Constants ────────────────────────────────────────────
const EVENT_TYPES: { value: EventType; label: string; color: string }[] = [
  { value: 'estimate', label: 'Inspection', color: 'bg-blue-500' },
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
  defaultEventType?: EventType;
  createLabel?: string;
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
  defaultEventType,
  createLabel,
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

  // Live server-side client search results
  const [clientResults, setClientResults] = useState<ClientOption[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sheetRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Debounced live search against the full clients table
  const searchClients = useCallback(async (query: string) => {
    setSearching(true);
    try {
      const params = new URLSearchParams({ limit: '20' });
      if (query.trim()) params.set('search', query.trim());
      const res = await fetch(`/api/clients?${params}`);
      if (res.ok) {
        const data = await res.json();
        setClientResults(Array.isArray(data) ? data : (data.clients || []));
      }
    } catch { /* silent */ } finally {
      setSearching(false);
    }
  }, []);

  // Fire search on query change with debounce
  useEffect(() => {
    if (!showDropdown) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchClients(searchQuery), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, showDropdown, searchClients]);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      // Pre-load recent clients immediately when sheet opens
      searchClients('');
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
        setEventType(defaultEventType || 'job_scheduled');
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
      setClientResults([]);
      setSaving(false);
    }
  }, [isOpen, editingEvent, defaultDate, defaultTime, defaultEventType, searchClients]);

  // Filter quotes client-side (small list passed as prop)
  const filteredQuotes = searchQuery.trim()
    ? quotes.filter(q => q.customer_name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : quotes.slice(0, 5);

  const hasResults = clientResults.length > 0 || filteredQuotes.length > 0;
  const createSheetTitle = editingEvent ? 'Edit Event' : (createLabel || 'New Event');
  const titlePlaceholder = !editingEvent && createLabel === 'Add Task'
    ? 'Task title'
    : !editingEvent && createLabel === 'Schedule Job'
      ? 'Job title'
      : 'Event title';

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
            {createSheetTitle}
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
            ) : (
              /* Live search input */
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
                    placeholder="Search clients..."
                    className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 pl-10 pr-4 py-3 text-[15px] text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                  {searching && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-brand-600" />
                    </div>
                  )}
                </div>

                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl ring-1 ring-black/[0.08] dark:ring-white/[0.08] shadow-lg max-h-64 overflow-y-auto z-20">
                    {/* Clients */}
                    {clientResults.length > 0 && (
                      <>
                        {clientResults.map((c) => (
                          <button
                            key={`c-${c.id}`}
                            onClick={() => handleSelectClient(c)}
                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors flex items-center gap-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0"
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

                    {/* Jobs section */}
                    {filteredQuotes.length > 0 && (
                      <>
                        {clientResults.length > 0 && (
                          <div className="px-3.5 py-1.5 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Jobs</p>
                          </div>
                        )}
                        {filteredQuotes.map((q) => (
                          <button
                            key={`q-${q.id}`}
                            onClick={() => handleSelectQuote(q)}
                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors flex items-center gap-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0"
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

                    {/* No results */}
                    {!searching && !hasResults && searchQuery.trim() && (
                      <div className="px-4 py-4 text-center">
                        <p className="text-[13px] text-gray-400">No clients found for &ldquo;{searchQuery}&rdquo;</p>
                      </div>
                    )}

                    {/* Empty state — no query yet */}
                    {!searching && !hasResults && !searchQuery.trim() && (
                      <div className="px-4 py-4 text-center">
                        <p className="text-[13px] text-gray-400">Start typing to search all clients</p>
                      </div>
                    )}
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
              placeholder={titlePlaceholder}
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
