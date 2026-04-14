'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ClientCreateSheet from '@/components/ClientCreateSheet';
import ClientImportModal from '@/components/ClientImportModal';

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

type SortOption = 'name' | 'recent' | 'revenue';

/** Format phone number as (XXX) XXX-XXXX */
function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  // Handle 10-digit US numbers (with or without leading 1)
  const d = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  if (d.length === 10) {
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  return phone; // Return as-is if not a standard 10-digit number
}

/** Deterministic pastel from name */
function avatarColor(name: string): string {
  const colors = [
    'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400',
    'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400',
    'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
    'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// Loading skeleton for client cards
function ClientCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white dark:bg-gray-900 p-3 lg:px-5 lg:py-4 ring-1 ring-black/[0.04] dark:ring-white/[0.06] animate-pulse">
      <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-100 dark:bg-gray-800" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="h-4 w-32 rounded-md bg-gray-100 dark:bg-gray-800" />
          <div className="h-4 w-16 rounded-md bg-gray-100 dark:bg-gray-800" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-24 rounded-md bg-gray-100 dark:bg-gray-800" />
          <div className="h-3 w-12 rounded-md bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

interface ClientsListContentProps {
  initialClients: ClientItem[];
  totalClients: number;
  pageSize: number;
}

export default function ClientsListContent({ initialClients, totalClients, pageSize }: ClientsListContentProps) {
  const router = useRouter();
  const [clients, setClients] = useState<ClientItem[]>(initialClients);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialClients.length < totalClients);
  const [serverSearchResults, setServerSearchResults] = useState<ClientItem[] | null>(null);
  const [serverSearchTotal, setServerSearchTotal] = useState(0);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setClients(initialClients);
    setHasMore(initialClients.length < totalClients);
  }, [initialClients, totalClients]);

  const loadMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const offset = serverSearchResults ? serverSearchResults.length : clients.length;
      const params = new URLSearchParams({
        offset: String(offset),
        limit: String(pageSize),
        withStats: '1',
      });
      if (search) params.set('search', search);

      const res = await fetch(`/api/clients?${params}`);
      if (!res.ok) throw new Error('Failed to load');
      const json = await res.json();
      const newClients: ClientItem[] = json.clients;

      if (serverSearchResults) {
        const merged = [...serverSearchResults, ...newClients];
        setServerSearchResults(merged);
        setHasMore(merged.length < json.total);
      } else {
        const merged = [...clients, ...newClients];
        setClients(merged);
        setHasMore(merged.length < json.total);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [clients, serverSearchResults, loading, pageSize, search]);

  const triggerServerSearch = useCallback(async (term: string) => {
    if (!term) {
      setServerSearchResults(null);
      setServerSearchTotal(0);
      setHasMore(clients.length < totalClients);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        offset: '0',
        limit: String(pageSize),
        search: term,
        withStats: '1',
      });
      const res = await fetch(`/api/clients?${params}`);
      if (!res.ok) throw new Error('Failed to search');
      const json = await res.json();
      setServerSearchResults(json.clients);
      setServerSearchTotal(json.total);
      setHasMore(json.clients.length < json.total);
    } catch {
      setServerSearchResults(null);
    } finally {
      setLoading(false);
    }
  }, [clients.length, totalClients, pageSize]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (!value) {
      setServerSearchResults(null);
      setServerSearchTotal(0);
      setHasMore(clients.length < totalClients);
      return;
    }

    searchTimerRef.current = setTimeout(() => {
      triggerServerSearch(value);
    }, 300);
  };

  // Determine which clients to display
  const displayClients = (() => {
    if (serverSearchResults !== null) return serverSearchResults;
    if (!search) return clients;
    return clients.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    );
  })();

  // Sort clients
  const sortedClients = useMemo(() => {
    const arr = [...displayClients];
    switch (sortBy) {
      case 'recent':
        return arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'revenue':
        return arr.sort((a, b) => b.total_revenue - a.total_revenue);
      case 'name':
      default:
        return arr.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [displayClients, sortBy]);

  // Group by first letter (only for name sort)
  const grouped: Record<string, ClientItem[]> = {};
  if (sortBy === 'name') {
    for (const c of sortedClients) {
      const raw = c.name.charAt(0).toUpperCase();
      const letter = /^[A-Z]$/.test(raw) ? raw : '#';
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(c);
    }
  }
  // Sort A-Z first, then '#' at end
  const letters = Object.keys(grouped).sort((a, b) => {
    if (a === '#') return 1;
    if (b === '#') return -1;
    return a.localeCompare(b);
  });

  // Alphabet quick-scroll
  const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const availableLetters = new Set(letters.filter((l) => l !== '#'));

  const scrollToLetter = (letter: string) => {
    if (!availableLetters.has(letter)) return;
    const el = document.getElementById(`letter-${letter}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'name', label: 'Name' },
    { value: 'recent', label: 'Recent' },
    { value: 'revenue', label: 'Revenue' },
  ];

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 pt-4 lg:px-8">
        {/* Search bar - prominent */}
        <div className="relative mb-3">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400 dark:text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-xl bg-white dark:bg-gray-900 pl-11 pr-4 py-3 text-[15px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ring-1 ring-black/[0.04] dark:ring-white/[0.06] focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm transition-shadow"
          />
          {search && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700"
            >
              <svg className="h-3 w-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Sort + Actions row */}
        <div className="flex items-center gap-2 mb-4">
          {/* Sort pills */}
          <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-none">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`shrink-0 rounded-lg px-3.5 py-2 min-h-[36px] text-[13px] font-semibold transition-all active:scale-[0.96] ${
                  sortBy === opt.value
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                    : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 ring-1 ring-black/[0.04] dark:ring-white/[0.06]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Import button */}
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-gray-900 px-3.5 py-2 text-[13px] font-semibold text-gray-600 dark:text-gray-400 ring-1 ring-black/[0.04] dark:ring-white/[0.06] shadow-sm press-scale hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[44px]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="hidden sm:inline">Import</span>
          </button>

          {/* Add Customer button */}
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm press-scale min-h-[44px]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="hidden sm:inline">Add Customer</span>
          </button>
        </div>

        {/* Client list with alphabet sidebar */}
        <div className="relative" ref={listRef}>
          {/* Alphabet quick-scroll rail (name sort only, mobile) */}
          {sortBy === 'name' && sortedClients.length > 10 && (
            <div className="fixed right-1 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center lg:hidden">
              {allLetters.map((letter) => (
                <button
                  key={letter}
                  onClick={() => scrollToLetter(letter)}
                  className={`text-[9px] font-bold leading-tight py-[1.5px] px-1 min-h-[14px] ${
                    availableLetters.has(letter)
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-gray-300 dark:text-gray-700'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          )}

          {/* Empty state */}
          {sortedClients.length === 0 && !loading && !initialLoading ? (
            <div className="flex flex-col items-center justify-center pt-20 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-950/40 dark:to-brand-900/30 mb-5">
                <svg className="h-10 w-10 text-brand-500/80" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h2 className="text-[20px] font-bold text-gray-900 dark:text-gray-100 mb-1.5">
                {search ? 'No matches' : 'Add your first customer'}
              </h2>
              <p className="text-[15px] text-gray-500 dark:text-gray-400 max-w-[260px] mb-7 leading-relaxed">
                {search
                  ? 'Try a different search term or clear the filter.'
                  : 'Start building your customer list to track jobs, money, and follow-ups.'}
              </p>
              {!search && (
                <div className="flex flex-col gap-3 w-full max-w-[240px]">
                  <button
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-3.5 text-[15px] font-semibold text-white shadow-sm press-scale min-h-[48px]"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Customer
                  </button>
                  <button
                    onClick={() => setShowImport(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white dark:bg-gray-900 px-5 py-3 text-[14px] font-semibold text-gray-700 dark:text-gray-300 ring-1 ring-black/[0.04] dark:ring-white/[0.06] press-scale min-h-[48px]"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Import Contacts
                  </button>
                </div>
              )}
            </div>
          ) : initialLoading ? (
            /* Loading skeletons */
            <div className="space-y-1 lg:grid lg:grid-cols-2 lg:gap-2 lg:space-y-0">
              {Array.from({ length: 8 }).map((_, i) => (
                <ClientCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              {/* Grouped by letter (name sort) */}
              {sortBy === 'name' ? (
                <div className="space-y-1 pr-4 lg:pr-0">
                  {letters.map((letter) => (
                    <div key={letter} id={`letter-${letter}`}>
                      <div className="sticky top-[105px] z-[5] px-1 py-1.5 bg-[#f2f2f7]/95 dark:bg-gray-950/95 backdrop-blur-sm">
                        <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                          {letter}
                        </span>
                      </div>
                      <div className="space-y-1 lg:grid lg:grid-cols-2 lg:gap-2 lg:space-y-0">
                        {grouped[letter].map((client) => (
                          <ClientCard key={client.id} client={client} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Flat list for other sorts */
                <div className="space-y-1 lg:grid lg:grid-cols-2 lg:gap-2 lg:space-y-0">
                  {sortedClients.map((client) => (
                    <ClientCard key={client.id} client={client} showDate={sortBy === 'recent'} />
                  ))}
                </div>
              )}

              {/* Load More */}
              {hasMore && !loading && (
                <div className="flex justify-center pt-6 pb-2">
                  <button
                    onClick={loadMore}
                    className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-gray-900 px-6 py-3 text-[14px] font-semibold text-gray-700 dark:text-gray-300 ring-1 ring-black/[0.04] dark:ring-white/[0.06] shadow-sm press-scale hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[44px]"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                    </svg>
                    Load More
                    {serverSearchResults !== null && (
                      <span className="text-[12px] text-gray-400 ml-1">
                        ({serverSearchResults.length} of {serverSearchTotal})
                      </span>
                    )}
                    {serverSearchResults === null && (
                      <span className="text-[12px] text-gray-400 ml-1">
                        ({clients.length} of {totalClients})
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* Loading indicator */}
              {loading && (
                <div className="flex justify-center pt-6 pb-2">
                  <div className="flex items-center gap-2 text-[13px] text-gray-400 dark:text-gray-500">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {search ? 'Searching...' : 'Loading...'}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ClientCreateSheet
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />

      <ClientImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onComplete={() => router.refresh()}
      />
    </>
  );
}

// ── Client Card ─────────────────────────────────────────
function ClientCard({ client, showDate = false }: { client: ClientItem; showDate?: boolean }) {
  const initial = client.name.charAt(0).toUpperCase();
  const colors = avatarColor(client.name);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Link
      href={`/clients/${client.id}`}
      className="flex items-center gap-3 rounded-xl bg-white dark:bg-gray-900 p-3 lg:px-5 lg:py-4 ring-1 ring-black/[0.04] dark:ring-white/[0.06] press-scale transition-all hover:shadow-md hover:ring-black/[0.08] dark:hover:ring-white/[0.1] min-h-[64px]"
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
            <span className="text-[12px] text-gray-400 dark:text-gray-500 truncate">
              {client.company}
            </span>
          )}
          {!client.company && client.phone && (
            <span className="text-[12px] text-gray-400 dark:text-gray-500 tabular-nums">
              {formatPhone(client.phone)}
            </span>
          )}
          {client.job_count > 0 && (
            <>
              <span className="text-gray-300 dark:text-gray-600">&middot;</span>
              <span className="text-[12px] text-gray-400 dark:text-gray-500">
                {client.job_count} job{client.job_count !== 1 ? 's' : ''}
              </span>
            </>
          )}
          {showDate && (
            <>
              <span className="text-gray-300 dark:text-gray-600">&middot;</span>
              <span className="text-[12px] text-gray-400 dark:text-gray-500">
                {formatDate(client.created_at)}
              </span>
            </>
          )}
          {/* Desktop extras */}
          {client.phone && client.company && (
            <span className="hidden lg:inline text-[12px] text-gray-400 dark:text-gray-500 tabular-nums">
              <span className="text-gray-300 dark:text-gray-600">&middot;</span> {formatPhone(client.phone)}
            </span>
          )}
          {client.email && (
            <span className="hidden lg:inline text-[12px] text-gray-400 dark:text-gray-500 truncate">
              <span className="text-gray-300 dark:text-gray-600">&middot;</span> {client.email}
            </span>
          )}
        </div>
      </div>
      <svg className="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
}
