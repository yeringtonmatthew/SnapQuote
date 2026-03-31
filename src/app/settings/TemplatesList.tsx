'use client';

import { useState } from 'react';
import type { QuoteTemplate } from '@/types/database';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { haptic } from '@/lib/haptic';
import EmptyState from '@/components/EmptyState';

interface Props {
  initialTemplates: QuoteTemplate[];
}

export function TemplatesList({ initialTemplates }: Props) {
  const [templates, setTemplates] = useState<QuoteTemplate[]>(initialTemplates);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeleting(id);

    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
      }
    } catch {
      // Silently fail
    } finally {
      setDeleting(null);
      setConfirmDeleteId(null);
    }
  }

  if (templates.length === 0) {
    return (
      <div className="card">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Quote Templates</p>
        <EmptyState
          icon={
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          }
          title="No templates yet"
          description="Save a quote as a template to reuse line items for similar jobs."
        />
      </div>
    );
  }

  return (
    <div className="card space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Quote Templates</p>
      <p className="text-xs text-gray-500">Saved templates for quick quote creation.</p>

      <div className="space-y-2">
        {templates.map((template) => (
          <div
            key={template.id}
            className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">{template.name}</p>
              <p className="text-xs text-gray-500">
                {template.line_items.length} line item{template.line_items.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => {
                haptic('light');
                setConfirmDeleteId(template.id);
              }}
              disabled={deleting === template.id}
              className="ml-3 shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {deleting === template.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
        title="Delete this template?"
        message="This can't be undone."
        confirmLabel={deleting ? 'Deleting...' : 'Delete Template'}
        confirmVariant="danger"
        loading={deleting !== null}
      />
    </div>
  );
}
