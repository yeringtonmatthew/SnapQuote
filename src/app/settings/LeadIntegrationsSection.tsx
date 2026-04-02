'use client';

import { useState, useEffect, useCallback } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import type { LeadSource } from '@/types/database';

const WEBHOOK_URL = 'https://snapquote.dev/api/leads/inbound';

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

export function LeadIntegrationsSection() {
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  // Newly created source (shows API key one time)
  const [newlyCreated, setNewlyCreated] = useState<LeadSource | null>(null);
  const [newKeyCopied, setNewKeyCopied] = useState(false);

  // Per-source UI state
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; ok: boolean; message: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchSources = useCallback(async () => {
    try {
      const res = await fetch('/api/lead-sources');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setSources(data);
    } catch {
      setError('Failed to load lead sources.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/lead-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Failed to create');
        return;
      }
      const created = await res.json();
      setNewlyCreated(created);
      setNewKeyCopied(false);
      setSources((prev) => [created, ...prev]);
      setNewName('');
      setShowAddForm(false);
    } catch {
      setError('Failed to create lead source.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (source: LeadSource) => {
    setTogglingId(source.id);
    try {
      const res = await fetch(`/api/lead-sources/${source.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !source.is_active }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSources((prev) => prev.map((s) => (s.id === source.id ? updated : s)));
      }
    } catch {
      // silently fail
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/lead-sources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSources((prev) => prev.filter((s) => s.id !== id));
        if (newlyCreated?.id === id) setNewlyCreated(null);
      }
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleTest = async (source: LeadSource) => {
    setTestingId(source.id);
    setTestResult(null);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': source.api_key,
        },
        body: JSON.stringify({
          name: 'Test Lead',
          phone: '555-000-0000',
          email: 'test@example.com',
          address: '123 Test St',
          notes: 'This is a test lead from SnapQuote settings.',
        }),
      });
      if (res.ok) {
        setTestResult({ id: source.id, ok: true, message: 'Test lead created successfully!' });
        // Refresh to update counts
        fetchSources();
      } else {
        const err = await res.json();
        setTestResult({ id: source.id, ok: false, message: err.error || 'Test failed' });
      }
    } catch {
      setTestResult({ id: source.id, ok: false, message: 'Network error.' });
    } finally {
      setTestingId(null);
    }
  };

  const getWebhookInstructions = (apiKey: string) =>
    `Webhook URL: ${WEBHOOK_URL}\nMethod: POST\nHeaders: \n  Content-Type: application/json\n  x-api-key: ${apiKey}\n\nExample body:\n{\n  "name": "John Smith",\n  "phone": "555-123-4567",\n  "email": "john@example.com",\n  "address": "123 Main St",\n  "notes": "Needs roof inspection"\n}`;

  const toggleKeyVisible = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const maskKey = (key: string) => {
    if (key.length <= 6) return key;
    return key.slice(0, 3) + '\u2022'.repeat(16) + key.slice(-4);
  };

  if (loading) {
    return (
      <div className="card flex items-center justify-center py-12">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Lead Integrations</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Connect your lead services to automatically add new leads to your pipeline.
          </p>
        </div>

        {!showAddForm ? (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="w-full rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-3 text-[13px] font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors press-scale"
          >
            + Add Lead Source
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Angie's Leads, Roofing Calculator"
              className="input-field flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') { setShowAddForm(false); setNewName(''); }
              }}
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={!newName.trim() || creating}
              className="shrink-0 rounded-2xl bg-brand-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors press-scale"
            >
              {creating ? <Spinner size="sm" /> : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => { setShowAddForm(false); setNewName(''); }}
              className="shrink-0 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-[13px] font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors press-scale"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* New key banner */}
      {newlyCreated && (
        <div className="card space-y-3 border-2 border-amber-400 dark:border-amber-500">
          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">
                Save this API key -- it won&apos;t be shown again
              </p>
              <p className="mt-1 text-xs text-gray-500">
                &ldquo;{newlyCreated.name}&rdquo; has been created. Copy the API key below before closing this.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 px-3 py-2.5">
            <code className="flex-1 text-[12px] font-mono text-gray-800 dark:text-gray-200 break-all">
              {newlyCreated.api_key}
            </code>
            <button
              type="button"
              onClick={() => {
                copyToClipboard(newlyCreated.api_key);
                setNewKeyCopied(true);
                setTimeout(() => setNewKeyCopied(false), 2000);
              }}
              className="shrink-0 rounded-lg bg-brand-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              {newKeyCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setNewlyCreated(null)}
            className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 py-2 text-[12px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            I&apos;ve saved it — dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-[13px] font-medium text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Empty state */}
      {sources.length === 0 && !loading && (
        <div className="card py-8 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            No lead sources configured. Add one above to start receiving leads automatically.
          </p>
        </div>
      )}

      {/* Source cards */}
      {sources.map((source) => (
        <div key={source.id} className="card space-y-4">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  source.is_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
              <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100">
                {source.name}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle(source)}
              disabled={togglingId === source.id}
              className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors ${
                source.is_active ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm mt-1 transition-transform ${
                  source.is_active ? 'translate-x-6 ml-0.5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Webhook URL */}
          <div>
            <p className="text-[11px] font-medium text-gray-400 mb-1">Webhook URL</p>
            <div className="flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 px-3 py-2.5">
              <code className="flex-1 text-[12px] font-mono text-gray-600 dark:text-gray-300 truncate">
                {WEBHOOK_URL}
              </code>
              <button
                type="button"
                onClick={() => {
                  copyToClipboard(getWebhookInstructions(source.api_key));
                  setCopiedId(source.id);
                  setTimeout(() => setCopiedId(null), 2000);
                }}
                className="shrink-0 rounded-lg bg-gray-200 dark:bg-gray-700 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {copiedId === source.id ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* API Key */}
          <div>
            <p className="text-[11px] font-medium text-gray-400 mb-1">API Key</p>
            <div className="flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 px-3 py-2.5">
              <code className="flex-1 text-[12px] font-mono text-gray-600 dark:text-gray-300 truncate">
                {visibleKeys.has(source.id) ? source.api_key : maskKey(source.api_key)}
              </code>
              <button
                type="button"
                onClick={() => toggleKeyVisible(source.id)}
                className="shrink-0 rounded-lg bg-gray-200 dark:bg-gray-700 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {visibleKeys.has(source.id) ? 'Hide' : 'Show'}
              </button>
              <button
                type="button"
                onClick={() => {
                  copyToClipboard(source.api_key);
                  setCopiedKeyId(source.id);
                  setTimeout(() => setCopiedKeyId(null), 2000);
                }}
                className="shrink-0 rounded-lg bg-gray-200 dark:bg-gray-700 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {copiedKeyId === source.id ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Stats */}
          <p className="text-[12px] text-gray-400">
            {source.lead_count} lead{source.lead_count !== 1 ? 's' : ''} received
            {source.last_lead_at && (
              <> &middot; Last: {formatTimeAgo(source.last_lead_at)}</>
            )}
          </p>

          {/* Test result */}
          {testResult && testResult.id === source.id && (
            <div
              className={`rounded-xl border px-3 py-2 text-[13px] font-medium ${
                testResult.ok
                  ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                  : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
              }`}
            >
              {testResult.message}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => handleTest(source)}
              disabled={testingId === source.id || !source.is_active}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-[12px] font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors press-scale"
            >
              {testingId === source.id ? (
                <span className="flex items-center gap-1.5">
                  <Spinner size="sm" />
                  Testing...
                </span>
              ) : (
                'Test Webhook'
              )}
            </button>

            {confirmDeleteId === source.id ? (
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-red-500 font-medium">Delete?</span>
                <button
                  type="button"
                  onClick={() => handleDelete(source.id)}
                  disabled={deletingId === source.id}
                  className="rounded-xl bg-red-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deletingId === source.id ? <Spinner size="sm" /> : 'Yes, delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-[11px] font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDeleteId(source.id)}
                className="rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-gray-900 px-4 py-2 text-[12px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors press-scale"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
