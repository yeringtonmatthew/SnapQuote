'use client';

import { useState, useRef, useEffect } from 'react';

interface AddToCalendarButtonProps {
  quoteId: string;
  scheduledDate: string | null;
}

export function AddToCalendarButton({ quoteId, scheduledDate }: AddToCalendarButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [open]);

  if (!scheduledDate) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 press-scale"
      >
        <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
        Calendar
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          <a
            href={`/api/quotes/${quoteId}/calendar?format=google`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M9 14l2 2 4-4" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Google Calendar
          </a>
          <a
            href={`/api/quotes/${quoteId}/calendar?format=ical`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M7 13h10M7 17h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Apple / Outlook (.ics)
          </a>
        </div>
      )}
    </div>
  );
}
