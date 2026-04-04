'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface InternalNotesProps {
  quoteId: string;
  initialNotes: string | null;
}

export function InternalNotes({ quoteId, initialNotes }: InternalNotesProps) {
  const [notes, setNotes] = useState(initialNotes || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const lastSaved = useRef(initialNotes || '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(async (text: string) => {
    const trimmed = text.trim();
    const lastTrimmed = lastSaved.current.trim();
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
  }, [quoteId]);

  // Auto-save after 1.5s of inactivity
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      save(notes);
    }, 1500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [notes, save]);

  // Also save on blur immediately
  function handleBlur() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    save(notes);
  }

  return (
    <div className="rounded-2xl border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
            <svg className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <p className="text-[13px] font-semibold text-amber-700 dark:text-amber-300">Internal Notes</p>
        </div>
        <div className="flex items-center gap-2">
          {saving && (
            <span className="flex items-center gap-1 text-[11px] text-amber-500">
              <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving
            </span>
          )}
          {saved && (
            <span className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Saved
            </span>
          )}
          <span className="text-[10px] text-amber-400/80 dark:text-amber-600">Private</span>
        </div>
      </div>
      <div className="px-4 pb-3">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleBlur}
          rows={3}
          placeholder="Add private notes about this job..."
          className="w-full resize-none rounded-xl border border-amber-200/60 dark:border-amber-800/40 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-base leading-relaxed text-gray-700 dark:text-gray-200 placeholder:text-amber-300 dark:placeholder:text-amber-700 transition-all focus:border-amber-300 dark:focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-200/50 dark:focus:ring-amber-700/30"
        />
      </div>
    </div>
  );
}
