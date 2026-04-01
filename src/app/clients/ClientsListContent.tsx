'use client';

import { useState } from 'react';
import Link from 'next/link';
import ClientCreateSheet from '@/components/ClientCreateSheet';

interface ClientItem {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  company: string | null;
  job_count: number;
  total_revenue: number;
  created_at: string;
}

/** Deterministic pastel from name */
function avatarColor(name: string): string {
  const colors = [
    'bg-blue-50 text-blue-600',
    'bg-violet-50 text-violet-600',
    'bg-amber-50 text-amber-600',
    'bg-emerald-50 text-emerald-600',
    'bg-rose-50 text-rose-600',
    'bg-cyan-50 text-cyan-600',
    'bg-orange-50 text-orange-600',
    'bg-indigo-50 text-indigo-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function ClientsListContent({ clients }: { clients: ClientItem[] }) {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Group by first letter
  const grouped: Record<string, ClientItem[]> = {};
  for (const c of filtered) {
    const letter = c.name.charAt(0).toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(c);
  }
  const letters = Object.keys(grouped).sort();

  return (
    <>
      <div className="mx-auto max-w-5xl px-5 pt-4">
        {/* Search + Add */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl bg-white dark:bg-gray-900 pl-10 pr-4 py-2.5 text-[14px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 ring-1 ring-black/[0.04] dark:ring-white/[0.06] focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm press-scale"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="hidden sm:inline">Add Client</span>
          </button>
        </div>

        {/* Client list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-950/40 dark:to-brand-900/30 mb-4">
              <svg className="h-8 w-8 text-brand-500/80" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h2 className="text-[18px] font-bold text-gray-900 dark:text-gray-100 mb-1">
              {search ? 'No matches' : 'No clients yet'}
            </h2>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 max-w-[240px] mb-6">
              {search ? 'Try a different search term.' : 'Add your first client to start building your customer base.'}
            </p>
            {!search && (
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 text-[14px] font-semibold text-white shadow-sm press-scale"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add First Client
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {letters.map((letter) => (
              <div key={letter}>
                <div className="sticky top-[105px] z-[5] px-1 py-1.5">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {letter}
                  </span>
                </div>
                <div className="space-y-1">
                  {grouped[letter].map((client) => {
                    const initial = client.name.charAt(0).toUpperCase();
                    const colors = avatarColor(client.name);
                    return (
                      <Link
                        key={client.id}
                        href={`/clients/${client.id}`}
                        className="flex items-center gap-3 rounded-xl bg-white dark:bg-gray-900 p-3 ring-1 ring-black/[0.04] dark:ring-white/[0.06] press-scale transition-all hover:shadow-sm"
                      >
                        <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-[13px] font-semibold ${colors}`}>
                          {initial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-[14px] font-semibold text-gray-900 dark:text-gray-100">
                              {client.name}
                            </p>
                            {client.total_revenue > 0 && (
                              <span className="shrink-0 text-[13px] font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                                ${client.total_revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {client.company && (
                              <span className="text-[12px] text-gray-400 truncate">
                                {client.company}
                              </span>
                            )}
                            {!client.company && client.phone && (
                              <span className="text-[12px] text-gray-400 tabular-nums">
                                {client.phone}
                              </span>
                            )}
                            {client.job_count > 0 && (
                              <>
                                <span className="text-gray-300 dark:text-gray-600">&middot;</span>
                                <span className="text-[12px] text-gray-400">
                                  {client.job_count} job{client.job_count !== 1 ? 's' : ''}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <svg className="h-4 w-4 shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ClientCreateSheet
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </>
  );
}
