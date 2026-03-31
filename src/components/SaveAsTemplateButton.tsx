'use client';

import { useState } from 'react';

interface Props {
  lineItems: any[];
  notes: string | null;
  scopeOfWork: string | null;
}

export function SaveAsTemplateButton({ lineItems, notes, scopeOfWork }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          line_items: lineItems,
          notes,
          scope_of_work: scopeOfWork,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save template');
      }

      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setName('');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 press-scale"
      >
        <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
        Template
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center animate-modal-backdrop">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl animate-modal-content">
        {success ? (
          <div className="flex flex-col items-center py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-900">Template Saved!</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-gray-900">Save as Template</h3>
            <p className="mt-1 text-sm text-gray-500">
              Reuse this quote&apos;s line items and details for similar jobs.
            </p>

            {error && (
              <div className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>
            )}

            <div className="mt-4">
              <label htmlFor="templateName" className="label">Template Name</label>
              <input
                id="templateName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Water Heater Install"
                className="input-field"
                autoFocus
              />
            </div>

            <div className="mt-2 rounded-xl bg-gray-50 px-3 py-2">
              <p className="text-xs text-gray-500">
                {lineItems.length} line item{lineItems.length !== 1 ? 's' : ''} will be saved
                {scopeOfWork ? ' with scope of work' : ''}
                {notes ? ' and notes' : ''}
              </p>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => { setOpen(false); setName(''); setError(null); }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="btn-primary flex-1"
              >
                {saving ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
