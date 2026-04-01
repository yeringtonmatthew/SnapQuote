'use client';

import { useState, useEffect, useRef } from 'react';
import type { CalendarEvent, EventType } from '@/types/database';

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

interface EventCreateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<CalendarEvent>) => void;
  defaultDate?: string;
  defaultTime?: string;
  quotes?: QuoteOption[];
  editingEvent?: CalendarEvent;
}

export default function EventCreateSheet({
  isOpen,
  onClose,
  onSave,
  defaultDate,
  defaultTime,
  quotes = [],
  editingEvent,
}: EventCreateSheetProps) {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<EventType>('job_scheduled');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [notes, setNotes] = useState('');
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [quoteSearch, setQuoteSearch] = useState('');
  const [showQuoteList, setShowQuoteList] = useState(false);
  const [saving, setSaving] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      if (editingEvent) {
        setTitle(editingEvent.title || '');
        setEventType(editingEvent.event_type);
        setEventDate(editingEvent.event_date);
        setStartTime(editingEvent.start_time || '');
        setEndTime(editingEvent.end_time || '');
        setAllDay(editingEvent.all_day);
        setNotes(editingEvent.notes || '');
        setQuoteId(editingEvent.quote_id || null);
        setQuoteSearch(editingEvent.customer_name || '');
      } else {
        setTitle('');
        setEventType('job_scheduled');
        setEventDate(defaultDate || new Date().toISOString().split('T')[0]);
        setStartTime(defaultTime || '09:00');
        setEndTime(defaultTime ? `${String(Number(defaultTime.split(':')[0]) + 1).padStart(2, '0')}:00` : '10:00');
        setAllDay(false);
        setNotes('');
        setQuoteId(null);
        setQuoteSearch('');
      }
      setShowQuoteList(false);
      setSaving(false);
    }
  }, [isOpen, editingEvent, defaultDate, defaultTime]);

  // Filter quotes
  const filteredQuotes = quotes.filter((q) =>
    q.customer_name.toLowerCase().includes(quoteSearch.toLowerCase())
  );

  const handleSelectQuote = (q: QuoteOption) => {
    setQuoteId(q.id);
    setQuoteSearch(q.customer_name);
    setTitle(q.customer_name);
    setShowQuoteList(false);
  };

  const handleClearQuote = () => {
    setQuoteId(null);
    setQuoteSearch('');
    setShowQuoteList(false);
  };

  const handleSave = async () => {
    if (!title.trim() && !quoteId) return;
    setSaving(true);

    const eventData: Partial<CalendarEvent> = {
      title: title.trim() || quoteSearch.trim(),
      event_type: eventType,
      event_date: eventDate,
      start_time: allDay ? null : startTime || null,
      end_time: allDay ? null : endTime || null,
      all_day: allDay,
      notes: notes.trim() || null,
      quote_id: quoteId,
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
        // Trigger parent refresh
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to delete event:', err);
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
        className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl animate-sheet-up max-h-[92dvh] overflow-y-auto"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100">
          <button
            onClick={onClose}
            className="text-[15px] font-medium text-gray-500 press-scale"
          >
            Cancel
          </button>
          <h2 className="text-[16px] font-bold text-gray-900">
            {editingEvent ? 'Edit Event' : 'New Event'}
          </h2>
          <button
            onClick={handleSave}
            disabled={saving || (!title.trim() && !quoteId)}
            className="text-[15px] font-semibold text-brand-600 disabled:text-gray-300 press-scale"
          >
            {saving ? 'Saving...' : editingEvent ? 'Update' : 'Create'}
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className="w-full rounded-xl bg-gray-100 px-4 py-3 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
          </div>

          {/* Event Type Pills */}
          <div>
            <label className="block text-[13px] font-medium text-gray-500 mb-2">Type</label>
            <div
              ref={pillsRef}
              className="flex gap-2 overflow-x-auto scrollbar-none pb-1 -mx-5 px-5"
            >
              {EVENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setEventType(type.value)}
                  className={`shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-all active:scale-[0.96] ${
                    eventType === type.value
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600'
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
            <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-xl bg-gray-100 px-4 py-3 text-[15px] text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-[14px] font-medium text-gray-900">All day</label>
            <button
              onClick={() => setAllDay(!allDay)}
              className={`relative h-7 w-12 rounded-full transition-colors toggle-switch ${
                allDay ? 'bg-brand-600' : 'bg-gray-300'
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
                <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Start</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl bg-gray-100 px-4 py-3 text-[15px] text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-500 mb-1.5">End</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl bg-gray-100 px-4 py-3 text-[15px] text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </div>
            </div>
          )}

          {/* Link to Job */}
          <div>
            <label className="block text-[13px] font-medium text-gray-500 mb-1.5">
              Link to job <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            {quoteId ? (
              <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-gray-900 truncate">{quoteSearch}</p>
                </div>
                <button
                  onClick={handleClearQuote}
                  className="shrink-0 text-[13px] font-medium text-red-500 press-scale"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={quoteSearch}
                  onChange={(e) => {
                    setQuoteSearch(e.target.value);
                    setShowQuoteList(true);
                  }}
                  onFocus={() => setShowQuoteList(true)}
                  placeholder="Search customer name..."
                  className="w-full rounded-xl bg-gray-100 px-4 py-3 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
                {showQuoteList && filteredQuotes.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl ring-1 ring-black/[0.08] shadow-lg max-h-40 overflow-y-auto z-10">
                    {filteredQuotes.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => handleSelectQuote(q)}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <p className="text-[14px] font-semibold text-gray-900">{q.customer_name}</p>
                        {q.job_address && (
                          <p className="text-[12px] text-gray-400 truncate">{q.job_address}</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[13px] font-medium text-gray-500 mb-1.5">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes..."
              rows={3}
              className="w-full rounded-xl bg-gray-100 px-4 py-3 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-500/20 transition-all resize-none"
            />
          </div>

          {/* Delete button for editing */}
          {editingEvent && (
            <button
              onClick={handleDelete}
              className="w-full rounded-xl bg-red-50 px-4 py-3 text-[15px] font-semibold text-red-600 active:scale-[0.98] transition-transform"
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
