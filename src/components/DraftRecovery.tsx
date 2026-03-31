'use client';

import { useEffect, useState } from 'react';
import type { LineItem } from '@/types/database';

export interface DraftData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  lineItems: LineItem[];
  notes: string;
  scopeOfWork: string;
  aiDescription: string;
  photos: string[];
  savedAt: string;
}

const DRAFT_KEY = 'snapquote-draft';

export function saveDraft(data: Omit<DraftData, 'savedAt'>) {
  try {
    const draft: DraftData = { ...data, savedAt: new Date().toISOString() };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

export function loadDraft(): DraftData | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DraftData;
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // fail silently
  }
}

interface DraftRecoveryProps {
  onResume: (draft: DraftData) => void;
}

export default function DraftRecovery({ onResume }: DraftRecoveryProps) {
  const [draft, setDraft] = useState<DraftData | null>(null);

  useEffect(() => {
    setDraft(loadDraft());
  }, []);

  if (!draft) return null;

  const savedDate = new Date(draft.savedAt);
  const timeAgo = getTimeAgo(savedDate);

  return (
    <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-amber-900">
          You have an unsaved draft
        </p>
        <p className="text-xs text-amber-600">
          {draft.customerName ? `${draft.customerName} — ` : ''}Saved {timeAgo}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            onResume(draft);
            setDraft(null);
          }}
          className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
        >
          Resume
        </button>
        <button
          onClick={() => {
            clearDraft();
            setDraft(null);
          }}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
        >
          Discard
        </button>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
