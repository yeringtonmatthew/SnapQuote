'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { relativeTime } from '@/lib/relative-time';

interface ClientData {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  company: string | null;
  notes: string | null;
  tags: string[];
  created_at: string;
}

interface QuoteItem {
  id: string;
  customer_name: string;
  total: number;
  status: string;
  pipeline_stage: string;
  quote_number: number | null;
  created_at: string;
  paid_at: string | null;
  sent_at: string | null;
  scheduled_date: string | null;
  job_address: string | null;
  photos: string[];
}

const stageLabels: Record<string, string> = {
  lead: 'Lead',
  quote_created: 'Quote Created',
  quote_sent: 'Quote Sent',
  deposit_collected: 'Deposit Collected',
  job_scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const stageDotColors: Record<string, string> = {
  lead: 'bg-gray-400',
  quote_created: 'bg-slate-400',
  quote_sent: 'bg-blue-500',
  deposit_collected: 'bg-green-500',
  job_scheduled: 'bg-amber-500',
  in_progress: 'bg-indigo-500',
  completed: 'bg-emerald-500',
};

function avatarColor(name: string): string {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-violet-500 to-violet-600',
    'from-amber-500 to-amber-600',
    'from-emerald-500 to-emerald-600',
    'from-rose-500 to-rose-600',
    'from-cyan-500 to-cyan-600',
    'from-orange-500 to-orange-600',
    'from-indigo-500 to-indigo-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

interface Props {
  client: ClientData;
  quotes: QuoteItem[];
  totalRevenue: number;
  totalQuoted: number;
}

export default function ClientProfileContent({ client, quotes, totalRevenue, totalQuoted }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(client.phone || '');
  const [email, setEmail] = useState(client.email || '');
  const [address, setAddress] = useState(client.address || '');
  const [company, setCompany] = useState(client.company || '');
  const [notes, setNotes] = useState(client.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, address, company, notes }),
      });
      setEditing(false);
      router.refresh();
    } catch {
      // Silent
    } finally {
      setSaving(false);
    }
  };

  const initial = client.name.charAt(0).toUpperCase();
  const gradientColor = avatarColor(client.name);
  const activeJobs = quotes.filter((q) => q.pipeline_stage !== 'completed').length;
  const completedJobs = quotes.filter((q) => q.pipeline_stage === 'completed').length;

  return (
    <>
      {/* Header with gradient */}
      <header className="relative bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-900 dark:to-black px-5 pt-14 pb-8">
        {/* Back button */}
        <div className="absolute top-14 left-5">
          <Link
            href="/clients"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm press-scale"
          >
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
        </div>

        {/* Edit button */}
        <div className="absolute top-14 right-5">
          <button
            onClick={() => setEditing(!editing)}
            className="flex h-8 items-center gap-1 rounded-full bg-white/10 backdrop-blur-sm px-3 text-[12px] font-semibold text-white press-scale"
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {/* Avatar + Name */}
        <div className="flex flex-col items-center pt-8">
          <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${gradientColor} flex items-center justify-center text-[28px] font-bold text-white shadow-lg mb-4`}>
            {initial}
          </div>
          <h1 className="text-[22px] font-bold text-white tracking-tight text-center">
            {client.name}
          </h1>
          {client.company && (
            <p className="text-[14px] text-white/60 mt-0.5">{client.company}</p>
          )}

          {/* Quick contact actions */}
          <div className="flex items-center gap-3 mt-4">
            {client.phone && (
              <a
                href={`tel:${client.phone}`}
                className="flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-[12px] font-semibold text-white press-scale"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                Call
              </a>
            )}
            {client.phone && (
              <a
                href={`sms:${client.phone}`}
                className="flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-[12px] font-semibold text-white press-scale"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
                Text
              </a>
            )}
            {client.email && (
              <a
                href={`mailto:${client.email}`}
                className="flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-[12px] font-semibold text-white press-scale"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Email
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Stats row */}
      <div className="mx-auto max-w-5xl px-5 -mt-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white dark:bg-gray-900 p-3 ring-1 ring-black/[0.04] dark:ring-white/[0.06] text-center">
            <p className="text-[18px] font-bold text-gray-900 dark:text-gray-100 tabular-nums">
              ${totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">Revenue</p>
          </div>
          <div className="rounded-xl bg-white dark:bg-gray-900 p-3 ring-1 ring-black/[0.04] dark:ring-white/[0.06] text-center">
            <p className="text-[18px] font-bold text-gray-900 dark:text-gray-100 tabular-nums">
              {quotes.length}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">Total Jobs</p>
          </div>
          <div className="rounded-xl bg-white dark:bg-gray-900 p-3 ring-1 ring-black/[0.04] dark:ring-white/[0.06] text-center">
            <p className="text-[18px] font-bold text-gray-900 dark:text-gray-100 tabular-nums">
              {activeJobs}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">Active</p>
          </div>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="mx-auto max-w-5xl px-5 mt-4">
          <div className="rounded-2xl bg-white dark:bg-gray-900 p-4 ring-1 ring-black/[0.04] dark:ring-white/[0.06] space-y-3">
            <h3 className="text-[14px] font-bold text-gray-900 dark:text-gray-100">Edit Client</h3>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-[14px] text-gray-900 dark:text-gray-100 ring-1 ring-black/[0.04] dark:ring-white/[0.06] focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-[14px] text-gray-900 dark:text-gray-100 ring-1 ring-black/[0.04] dark:ring-white/[0.06] focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-[14px] text-gray-900 dark:text-gray-100 ring-1 ring-black/[0.04] dark:ring-white/[0.06] focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              type="text"
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-[14px] text-gray-900 dark:text-gray-100 ring-1 ring-black/[0.04] dark:ring-white/[0.06] focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-[14px] text-gray-900 dark:text-gray-100 ring-1 ring-black/[0.04] dark:ring-white/[0.06] focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <textarea
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-[14px] text-gray-900 dark:text-gray-100 ring-1 ring-black/[0.04] dark:ring-white/[0.06] focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="w-full rounded-xl bg-brand-600 py-3 text-[14px] font-semibold text-white disabled:opacity-50 press-scale"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Contact details */}
      {!editing && (client.phone || client.email || client.address) && (
        <div className="mx-auto max-w-5xl px-5 mt-4">
          <div className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-black/[0.04] dark:ring-white/[0.06] divide-y divide-gray-100 dark:divide-gray-800">
            {client.phone && (
              <div className="flex items-center gap-3 px-4 py-3">
                <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <div>
                  <p className="text-[13px] text-gray-900 dark:text-gray-100">{client.phone}</p>
                  <p className="text-[11px] text-gray-400">Phone</p>
                </div>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-3 px-4 py-3">
                <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <div>
                  <p className="text-[13px] text-gray-900 dark:text-gray-100">{client.email}</p>
                  <p className="text-[11px] text-gray-400">Email</p>
                </div>
              </div>
            )}
            {client.address && (
              <div className="flex items-center gap-3 px-4 py-3">
                <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <div>
                  <p className="text-[13px] text-gray-900 dark:text-gray-100">{client.address}</p>
                  <p className="text-[11px] text-gray-400">Address</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {!editing && client.notes && (
        <div className="mx-auto max-w-5xl px-5 mt-4">
          <div className="rounded-2xl bg-white dark:bg-gray-900 p-4 ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
            <h3 className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</h3>
            <p className="text-[13px] text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{client.notes}</p>
          </div>
        </div>
      )}

      {/* Jobs list */}
      <div className="mx-auto max-w-5xl px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-bold text-gray-900 dark:text-gray-100">
            Jobs ({quotes.length})
          </h3>
          <Link
            href={`/quotes/new?client_id=${client.id}`}
            className="text-[12px] font-semibold text-brand-600 press-scale"
          >
            + New Quote
          </Link>
        </div>

        {quotes.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-gray-900 p-6 ring-1 ring-black/[0.04] dark:ring-white/[0.06] text-center">
            <p className="text-[13px] text-gray-400">No jobs yet for this client.</p>
            <Link
              href={`/quotes/new?client_id=${client.id}`}
              className="inline-flex items-center gap-1.5 mt-3 text-[13px] font-semibold text-brand-600 press-scale"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create First Quote
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {quotes.map((q) => {
              const thumb = q.photos?.[0];
              const stage = q.pipeline_stage || 'quote_created';
              const dotColor = stageDotColors[stage] || 'bg-gray-400';

              return (
                <Link
                  key={q.id}
                  href={`/jobs/${q.id}`}
                  className="flex items-center gap-3 rounded-xl bg-white dark:bg-gray-900 p-3 ring-1 ring-black/[0.04] dark:ring-white/[0.06] press-scale transition-all hover:shadow-sm"
                >
                  {thumb ? (
                    <img src={thumb} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover bg-gray-100" />
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {q.quote_number && (
                          <span className="text-[11px] text-gray-400 tabular-nums">
                            #{String(q.quote_number).padStart(4, '0')}
                          </span>
                        )}
                        <p className="truncate text-[13px] text-gray-500">
                          {q.job_address || 'No address'}
                        </p>
                      </div>
                      <span className="shrink-0 text-[14px] font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                        ${Number(q.total).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                      <span className="text-[11px] text-gray-400">
                        {stageLabels[stage] || stage}
                      </span>
                      <span className="flex-1" />
                      <span className="text-[11px] text-gray-300 dark:text-gray-600 tabular-nums">
                        {relativeTime(q.created_at)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
