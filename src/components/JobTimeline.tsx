'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { JobNote } from '@/types/database';

interface JobTimelineProps {
  quoteId: string;
  notes: JobNote[];
  createdAt: string;
  sentAt: string | null;
  approvedAt: string | null;
  paidAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

interface TimelineEntry {
  id: string;
  type: 'auto' | 'note';
  text: string;
  timestamp: string;
  noteId?: string;
  eventType?: string;
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

/* ── Auto-event icon configs ── */
function EventIcon({ eventType }: { eventType: string }) {
  switch (eventType) {
    case 'Quote created':
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <svg className="h-3 w-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
      );
    case 'Quote sent':
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
          <svg className="h-3 w-3 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </div>
      );
    case 'Quote approved':
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/30">
          <svg className="h-3 w-3 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
      );
    case 'Deposit collected':
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/30">
          <svg className="h-3 w-3 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    case 'Job started':
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30">
          <svg className="h-3 w-3 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-3.06a1.5 1.5 0 010-2.58l5.1-3.06a1.5 1.5 0 012.08.54l.27.48a1.5 1.5 0 01-.54 2.08L10.2 12l3.03 2.43a1.5 1.5 0 01.54 2.08l-.27.48a1.5 1.5 0 01-2.08.54z" />
          </svg>
        </div>
      );
    case 'Job completed':
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30">
          <svg className="h-3 w-3 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <div className="h-2 w-2 rounded-full bg-gray-400" />
        </div>
      );
  }
}

export function JobTimeline({
  quoteId,
  notes,
  createdAt,
  sentAt,
  approvedAt,
  paidAt,
  startedAt,
  completedAt,
}: JobTimelineProps) {
  const router = useRouter();
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Build timeline entries
  const entries: TimelineEntry[] = [];

  // Auto events
  const autoEvents: { label: string; ts: string | null }[] = [
    { label: 'Quote created', ts: createdAt },
    { label: 'Quote sent', ts: sentAt },
    { label: 'Quote approved', ts: approvedAt },
    { label: 'Deposit collected', ts: paidAt },
    { label: 'Job started', ts: startedAt },
    { label: 'Job completed', ts: completedAt },
  ];

  for (const evt of autoEvents) {
    if (evt.ts) {
      entries.push({
        id: `auto-${evt.label}`,
        type: 'auto',
        text: evt.label,
        timestamp: evt.ts,
        eventType: evt.label,
      });
    }
  }

  // Manual notes
  for (const note of notes) {
    entries.push({
      id: note.id,
      type: 'note',
      text: note.text,
      timestamp: note.created_at,
      noteId: note.id,
    });
  }

  // Sort newest first
  entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  async function handleAddNote() {
    const text = newNote.trim();
    if (!text || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/quotes/${quoteId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        setNewNote('');
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditNote(noteId: string) {
    const text = editText.trim();
    if (!text) return;

    try {
      const res = await fetch(`/api/quotes/${quoteId}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: noteId, text }),
      });
      if (res.ok) {
        setEditingId(null);
        setEditText('');
        router.refresh();
      }
    } catch {
      // silently fail
    }
  }

  async function handleDeleteNote(noteId: string) {
    try {
      const res = await fetch(`/api/quotes/${quoteId}/notes`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: noteId }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // silently fail
    }
  }

  return (
    <div>
      {/* Note input */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
            placeholder="Add a note..."
            className="w-full rounded-xl bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 transition-all border border-transparent focus:border-brand-500/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:bg-gray-800/60 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:bg-gray-800 dark:focus:border-brand-400/30"
          />
        </div>
        <button
          type="button"
          onClick={handleAddNote}
          disabled={!newNote.trim() || submitting}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none active:scale-95"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>

      {/* Timeline */}
      {entries.length > 0 ? (
        <div className="relative">
          {entries.map((entry, i) => {
            const isLast = i === entries.length - 1;
            const isAuto = entry.type === 'auto';
            const isEditing = editingId === entry.noteId;

            return (
              <div key={entry.id} className="relative flex gap-3 group" style={{ paddingBottom: isLast ? 0 : '20px' }}>
                {/* Connector line */}
                {!isLast && (
                  <div
                    className="absolute left-[11.5px] top-[28px] bottom-0 w-px bg-gray-200 dark:bg-gray-700/60"
                  />
                )}

                {/* Icon / Dot */}
                <div className="relative z-10 shrink-0 mt-0.5">
                  {isAuto ? (
                    <EventIcon eventType={entry.eventType || ''} />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center">
                      <div className="h-[10px] w-[10px] rounded-full bg-brand-500 ring-[3px] ring-brand-500/10 dark:bg-brand-400 dark:ring-brand-400/15" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-[3px]">
                  {isAuto ? (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[13px] font-medium text-gray-600 dark:text-gray-400">
                        {entry.text}
                      </span>
                      <span className="shrink-0 text-[11px] tabular-nums text-gray-400 dark:text-gray-500">
                        {formatRelativeTime(entry.timestamp)}
                      </span>
                    </div>
                  ) : isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditNote(entry.noteId!);
                          if (e.key === 'Escape') { setEditingId(null); setEditText(''); }
                        }}
                        autoFocus
                        className="flex-1 rounded-lg border border-brand-200 bg-white px-2.5 py-1 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleEditNote(entry.noteId!)}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-brand-600 hover:bg-brand-50 transition-colors dark:hover:bg-brand-900/20"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingId(null); setEditText(''); }}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors dark:hover:bg-gray-700"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed">
                        {entry.text}
                      </p>
                      <div className="flex items-center gap-0.5 shrink-0 pt-px">
                        <span className="text-[11px] tabular-nums text-gray-400 dark:text-gray-500">
                          {formatRelativeTime(entry.timestamp)}
                        </span>
                        <button
                          type="button"
                          onClick={() => { setEditingId(entry.noteId!); setEditText(entry.text); }}
                          className="opacity-0 group-hover:opacity-100 flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:text-gray-600 transition-all dark:hover:text-gray-300"
                          aria-label="Edit note"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(entry.noteId!)}
                          className="opacity-0 group-hover:opacity-100 flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:text-red-500 transition-all dark:hover:text-red-400"
                          aria-label="Delete note"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 mb-3 dark:bg-gray-800">
            <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[13px] text-gray-400 dark:text-gray-500">
            No activity yet. Add a note to get started.
          </p>
        </div>
      )}
    </div>
  );
}
