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
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Activity</h3>

      {/* Add note input */}
      <div className="flex items-center gap-2 mb-5">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
          placeholder="Add a note..."
          className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
        />
        <button
          type="button"
          onClick={handleAddNote}
          disabled={!newNote.trim() || submitting}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition-all hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {entries.map((entry, i) => {
          const isLast = i === entries.length - 1;
          const isAuto = entry.type === 'auto';
          const isEditing = editingId === entry.noteId;

          return (
            <div key={entry.id} className="relative flex gap-3 pb-4 group">
              {/* Line */}
              {!isLast && (
                <div className="absolute left-[7px] top-5 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
              )}

              {/* Dot */}
              <div
                className={`relative z-10 mt-1.5 h-[14px] w-[14px] shrink-0 rounded-full border-2 ${
                  isAuto
                    ? 'border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800'
                    : 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-900/30'
                }`}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                {isAuto ? (
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[13px] italic text-gray-400 dark:text-gray-500">{entry.text}</p>
                    <span className="shrink-0 text-[11px] text-gray-300 dark:text-gray-600">
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
                      className="flex-1 rounded-lg border border-brand-300 bg-white px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleEditNote(entry.noteId!)}
                      className="text-brand-600 hover:text-brand-700"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditingId(null); setEditText(''); }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] text-gray-700 dark:text-gray-300">{entry.text}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[11px] text-gray-300 dark:text-gray-600">
                        {formatRelativeTime(entry.timestamp)}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setEditingId(entry.noteId!); setEditText(entry.text); }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-300 hover:text-gray-500 transition-opacity"
                        aria-label="Edit note"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(entry.noteId!)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-300 hover:text-red-500 transition-opacity"
                        aria-label="Delete note"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
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

        {entries.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-4">No activity yet</p>
        )}
      </div>
    </div>
  );
}
