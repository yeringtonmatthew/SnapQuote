'use client';

import { useState, useRef, useEffect } from 'react';

interface ExportOption {
  label: string;
  description: string;
  endpoint: string;
  icon: React.ReactNode;
}

const exportOptions: ExportOption[] = [
  {
    label: 'Export All (CSV)',
    description: 'All quotes, basic fields',
    endpoint: '/api/quotes/export',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    label: 'Export for QuickBooks',
    description: 'Paid jobs as invoices',
    endpoint: '/api/quotes/export/quickbooks',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    label: 'Export Accounting',
    description: 'Full financial detail',
    endpoint: '/api/quotes/export/accounting',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008H18v-.008zm0 2.25h.008v.008H18V13.5zM4.5 4.5h15A2.25 2.25 0 0121.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 014.5 4.5z" />
      </svg>
    ),
  },
];

export default function ExportDropdown() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  async function handleExport(endpoint: string) {
    setLoading(endpoint);
    setOpen(false);
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download =
        res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] ||
        'snapquote-export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // User will notice if the download doesn't start
    } finally {
      setLoading(null);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        disabled={!!loading}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 press-scale disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        aria-label="Export quotes"
        aria-expanded={open}
        aria-haspopup="true"
        title="Export"
      >
        {loading ? (
          <svg className="h-4 w-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {exportOptions.map((opt) => (
            <button
              key={opt.endpoint}
              onClick={() => handleExport(opt.endpoint)}
              className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
            >
              <span className="mt-0.5 text-gray-400 dark:text-gray-500">{opt.icon}</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{opt.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{opt.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
