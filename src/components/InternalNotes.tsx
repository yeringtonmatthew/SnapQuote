'use client';

import { useState, useRef } from 'react';

interface InternalNotesProps {
  quoteId: string;
  initialNotes: string | null;
}

export function InternalNotes({ quoteId, initialNotes }: InternalNotesProps) {
  const [notes, setNotes] = useState(initialNotes || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const lastSaved = useRef(initialNotes || '');

  async function handleBlur() {
    const trimmed = notes.trim();
    const lastTrimmed = lastSaved.current.trim();

    // Skip if nothing changed
    if (trimmed === lastTrimmed) return;

    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/quotes/${quoteId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internal_notes: trimmed || null }),
      });
      if (res.ok) {
        lastSaved.current = trimmed;
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <p className="text-xs font-medium text-amber-700">Internal Notes</p>
        </div>
        <div className="flex items-center gap-1.5">
          {saving && (
            <span className="text-[11px] text-amber-500">Saving...</span>
          )}
          {saved && (
            <span className="text-[11px] text-green-600">Saved</span>
          )}
          <span className="text-[11px] text-amber-400">Private — only visible to you</span>
        </div>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={handleBlur}
        rows={3}
        placeholder="Add private notes about this job..."
        className="w-full resize-none rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-amber-300 transition-all focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300 focus:shadow-[0_0_0_3px_rgba(217,119,6,0.08)]"
      />
    </div>
  );
}
