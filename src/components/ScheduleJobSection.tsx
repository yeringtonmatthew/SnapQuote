'use client';

import { useState } from 'react';

interface ScheduleJobSectionProps {
  quoteId: string;
  status: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  estimatedDuration: string | null;
}

export function ScheduleJobSection({
  quoteId,
  status,
  scheduledDate,
  scheduledTime,
  estimatedDuration,
}: ScheduleJobSectionProps) {
  const [date, setDate] = useState(scheduledDate || '');
  const [time, setTime] = useState(scheduledTime || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Only show for sent, approved, or deposit_paid quotes
  if (status === 'draft' || status === 'cancelled') return null;

  async function handleSave() {
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const res = await fetch(`/api/quotes/${quoteId}/schedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduled_date: date || null,
          scheduled_time: time || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save schedule');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card space-y-3">
      <div className="flex items-center gap-2">
        <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Schedule Job</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="schedule-date" className="block text-xs font-medium text-gray-600 mb-1">
            Date
          </label>
          <input
            id="schedule-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)] focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="schedule-time" className="block text-xs font-medium text-gray-600 mb-1">
            Time
          </label>
          <input
            id="schedule-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)] focus:outline-none"
          />
        </div>
      </div>

      {estimatedDuration && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Estimated duration: {estimatedDuration}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 press-scale transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving...' : saved ? 'Saved!' : date ? 'Update Schedule' : 'Save Schedule'}
      </button>

      {scheduledDate && !date && (
        <p className="text-xs text-amber-600">Clear the date to remove the schedule.</p>
      )}

      {/* Add to Calendar links — show when a date is saved */}
      {scheduledDate && (
        <div className="flex items-center gap-3 pt-1">
          <span className="text-xs text-gray-400">Add to calendar:</span>
          <a
            href={`/api/quotes/${quoteId}/calendar?format=google`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-brand-600 hover:text-brand-700 underline underline-offset-2"
          >
            Google
          </a>
          <a
            href={`/api/quotes/${quoteId}/calendar?format=ical`}
            className="text-xs font-medium text-brand-600 hover:text-brand-700 underline underline-offset-2"
          >
            Apple / Outlook
          </a>
        </div>
      )}
    </div>
  );
}
