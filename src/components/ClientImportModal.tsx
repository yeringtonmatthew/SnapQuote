'use client';

import { useState, useRef, useCallback } from 'react';
import { Spinner } from '@/components/ui/Spinner';

interface ClientImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ROWS = 5000;

const fieldPatterns: Record<string, string[]> = {
  name: ['name', 'client name', 'customer name', 'full name', 'contact name', 'client', 'customer', 'first name and last name'],
  first_name: ['first name', 'first_name', 'firstname', 'fname', 'given name'],
  last_name: ['last name', 'last_name', 'lastname', 'lname', 'surname', 'family name'],
  phone: ['phone', 'phone number', 'phone_number', 'mobile', 'cell', 'telephone', 'primary phone', 'home phone', 'work phone', 'mobile phone'],
  email: ['email', 'email address', 'email_address', 'e-mail', 'primary email'],
  address: ['address', 'street address', 'street', 'property address', 'service address', 'billing address', 'full address', 'location'],
  city: ['city', 'town'],
  state: ['state', 'province', 'region'],
  zip: ['zip', 'zip code', 'zipcode', 'postal code', 'postal_code', 'postcode'],
  company: ['company', 'company name', 'business', 'business name', 'organization'],
  notes: ['notes', 'note', 'comments', 'description', 'internal notes', 'memo'],
  tags: ['tags', 'labels', 'categories', 'type', 'client type'],
};

// Display-friendly field names
const fieldLabels: Record<string, string> = {
  name: 'Name',
  first_name: 'First Name',
  last_name: 'Last Name',
  phone: 'Phone',
  email: 'Email',
  address: 'Address',
  city: 'City',
  state: 'State',
  zip: 'Zip',
  company: 'Company',
  notes: 'Notes',
  tags: 'Tags',
};

// Primary fields to show in mapping preview
const primaryFields = ['name', 'phone', 'email', 'address', 'company', 'notes', 'tags'];

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  // Remove BOM character if present (Excel adds this)
  let cleaned = text;
  if (cleaned.charCodeAt(0) === 0xfeff) {
    cleaned = cleaned.slice(1);
  }

  // Normalize line endings
  cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const lines: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < cleaned.length && cleaned[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === '\n' && !inQuotes) {
      lines.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) {
    lines.push(current);
  }

  if (lines.length === 0) return { headers: [], rows: [] };

  function parseLine(line: string): string[] {
    const fields: string[] = [];
    let field = '';
    let quoted = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (quoted && i + 1 < line.length && line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = !quoted;
        }
      } else if (ch === ',' && !quoted) {
        fields.push(field.trim());
        field = '';
      } else {
        field += ch;
      }
    }
    fields.push(field.trim());
    return fields;
  }

  const headers = parseLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseLine(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || '';
    }
    rows.push(row);
  }

  return { headers, rows };
}

function detectFieldMapping(headers: string[]): Record<string, string | null> {
  const normalized = headers.map((h) => h.toLowerCase().trim());
  const mapping: Record<string, string | null> = {};

  for (const [field, patterns] of Object.entries(fieldPatterns)) {
    const idx = normalized.findIndex((h) => patterns.includes(h));
    mapping[field] = idx >= 0 ? headers[idx] : null;
  }

  return mapping;
}

function getPreviewValue(row: Record<string, string>, mapping: Record<string, string | null>, field: string): string {
  // For name, try combining first + last if name column not found
  if (field === 'name') {
    const nameCol = mapping['name'];
    if (nameCol && row[nameCol]) return row[nameCol];
    const first = mapping['first_name'] ? (row[mapping['first_name']] || '') : '';
    const last = mapping['last_name'] ? (row[mapping['last_name']] || '') : '';
    return [first, last].filter(Boolean).join(' ');
  }
  // For address, try combining city/state/zip if address column not found
  if (field === 'address') {
    const addrCol = mapping['address'];
    if (addrCol && row[addrCol]) return row[addrCol];
    const city = mapping['city'] ? (row[mapping['city']] || '') : '';
    const state = mapping['state'] ? (row[mapping['state']] || '') : '';
    const zip = mapping['zip'] ? (row[mapping['zip']] || '') : '';
    return [city, state, zip].filter(Boolean).join(', ');
  }
  const col = mapping[field];
  if (!col) return '';
  return row[col] || '';
}

type Step = 'upload' | 'preview' | 'importing' | 'results';

export default function ClientImportModal({ isOpen, onClose, onComplete }: ClientImportModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string | null>>({});
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [results, setResults] = useState<{ imported: number; updated: number; skipped: number; duplicates: number; errors: string[] } | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStep('upload');
    setFileName('');
    setHeaders([]);
    setRows([]);
    setMapping({});
    setError(null);
    setResults(null);
    setProgress(0);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  function processFile(file: File) {
    setError(null);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);

      if (parsed.rows.length === 0) {
        setError('No data rows found in the CSV file.');
        return;
      }
      if (parsed.rows.length > MAX_ROWS) {
        setError(`Too many rows (${parsed.rows.length.toLocaleString()}). Maximum is ${MAX_ROWS.toLocaleString()}.`);
        return;
      }

      const detected = detectFieldMapping(parsed.headers);

      // Check if we can detect at least a name
      const hasName = detected.name || (detected.first_name && detected.last_name);
      if (!hasName) {
        setError('Could not detect a Name column. Make sure your CSV has a "Name", "Client Name", or "First Name" + "Last Name" columns.');
        return;
      }

      setFileName(file.name);
      setHeaders(parsed.headers);
      setRows(parsed.rows);
      setMapping(detected);
      setStep('preview');
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsText(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  async function handleImport() {
    setStep('importing');
    setProgress(0);

    // For large files, send in chunks and report progress
    const CHUNK_SIZE = 500;
    let totalImported = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalDuplicates = 0;
    const allErrors: string[] = [];
    const totalChunks = Math.ceil(rows.length / CHUNK_SIZE);

    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);
      try {
        const res = await fetch('/api/clients/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows: chunk }),
        });
        const data = await res.json();
        if (!res.ok) {
          allErrors.push(data.error || `Chunk ${Math.floor(i / CHUNK_SIZE) + 1} failed`);
        } else {
          totalImported += data.imported || 0;
          totalUpdated += data.updated || 0;
          totalSkipped += data.skipped || 0;
          totalDuplicates += data.duplicates || 0;
          if (data.errors?.length) allErrors.push(...data.errors);
        }
      } catch {
        allErrors.push(`Network error on chunk ${Math.floor(i / CHUNK_SIZE) + 1}`);
      }
      setProgress(Math.round(((Math.floor(i / CHUNK_SIZE) + 1) / totalChunks) * 100));
    }

    setResults({ imported: totalImported, updated: totalUpdated, skipped: totalSkipped, duplicates: totalDuplicates, errors: allErrors });
    setStep('results');
    if (totalImported > 0 || totalUpdated > 0) onComplete();
  }

  if (!isOpen) return null;

  // Determine which primary fields are detected
  const nameDetected = !!(mapping.name || (mapping.first_name && mapping.last_name));
  const addressDetected = !!(mapping.address || mapping.city || mapping.state || mapping.zip);

  const previewRows = rows.slice(0, 5);
  const previewColumns = ['name', 'phone', 'email', 'address'].filter((f) => {
    if (f === 'name') return nameDetected;
    if (f === 'address') return addressDetected;
    return !!mapping[f];
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-gray-900 overflow-hidden shadow-2xl max-h-[90dvh] flex flex-col">
        {/* Stepper */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            {(['upload', 'preview', 'results'] as const).map((s, i) => {
              const labels = ['Upload', 'Preview', 'Results'];
              const isActive = step === s || (step === 'importing' && s === 'preview');
              const isDone =
                (s === 'upload' && step !== 'upload') ||
                (s === 'preview' && (step === 'results' || step === 'importing'));
              return (
                <div key={s} className="flex items-center gap-2">
                  {i > 0 && <div className={`w-6 h-px ${isDone || isActive ? 'bg-brand-400' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                  <div className="flex items-center gap-1.5">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold ${isDone ? 'bg-brand-600 text-white' : isActive ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 ring-2 ring-brand-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                      {isDone ? (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span className={`text-[12px] font-medium hidden sm:inline ${isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}>
                      {labels[i]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* STEP: Upload */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <h2 className="text-[20px] font-bold text-gray-900 dark:text-gray-100">Import Clients from CSV</h2>
                <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">
                  Supports exports from Jobber, Housecall Pro, ServiceTitan, and most CRMs.
                </p>
              </div>

              {/* Drop zone */}
              <div
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-colors cursor-pointer ${dragOver ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950/30 mb-3">
                  <svg className="h-7 w-7 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100">
                  Drag & drop your CSV file here
                </p>
                <p className="text-[13px] text-gray-400 mt-0.5">or click to browse</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 px-4 py-3 text-[13px] text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="text-center">
                <a
                  href="/templates/client-import-template.csv"
                  download
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download sample CSV template
                </a>
              </div>
            </div>
          )}

          {/* STEP: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-[20px] font-bold text-gray-900 dark:text-gray-100">
                  Preview Import
                </h2>
                <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {rows.length.toLocaleString()} client{rows.length !== 1 ? 's' : ''} found in <span className="font-medium text-gray-600 dark:text-gray-300">{fileName}</span>
                </p>
              </div>

              {/* Detected mappings */}
              <div className="space-y-1.5">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-gray-400">Detected Columns</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {primaryFields.map((field) => {
                    let detected = false;
                    let colName = '';

                    if (field === 'name') {
                      if (mapping.name) {
                        detected = true;
                        colName = mapping.name;
                      } else if (mapping.first_name && mapping.last_name) {
                        detected = true;
                        colName = `${mapping.first_name} + ${mapping.last_name}`;
                      }
                    } else if (field === 'address') {
                      if (mapping.address) {
                        detected = true;
                        colName = mapping.address;
                      } else if (mapping.city || mapping.state || mapping.zip) {
                        detected = true;
                        colName = [mapping.city, mapping.state, mapping.zip].filter(Boolean).join(' + ');
                      }
                    } else if (mapping[field]) {
                      detected = true;
                      colName = mapping[field]!;
                    }

                    return (
                      <div key={field} className="flex items-center gap-2 text-[13px]">
                        {detected ? (
                          <svg className="h-4 w-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span className={detected ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}>
                          <span className="font-medium">{fieldLabels[field]}</span>
                          {detected && <span className="text-gray-400 dark:text-gray-500"> &rarr; &ldquo;{colName}&rdquo;</span>}
                          {!detected && <span> &mdash; not found</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Preview table */}
              <div className="rounded-xl border border-gray-100 dark:border-white/5 overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      {previewColumns.map((col) => (
                        <th key={col} className="text-left px-3 py-2 font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {fieldLabels[col]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, i) => (
                      <tr key={i} className="border-t border-gray-50 dark:border-white/[0.03]">
                        {previewColumns.map((col) => (
                          <td key={col} className="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap truncate max-w-[180px]">
                            {getPreviewValue(row, mapping, col) || <span className="text-gray-300 dark:text-gray-600">&mdash;</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length > 5 && (
                <p className="text-[12px] text-gray-400 text-center">
                  Showing 5 of {rows.length.toLocaleString()} rows
                </p>
              )}
            </div>
          )}

          {/* STEP: Importing */}
          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Spinner size="md" />
              <div className="text-center">
                <h2 className="text-[18px] font-bold text-gray-900 dark:text-gray-100">Importing clients...</h2>
                <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">
                  {progress}% complete
                </p>
              </div>
              <div className="w-full max-w-xs h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full bg-brand-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* STEP: Results */}
          {step === 'results' && results && (
            <div className="flex flex-col items-center py-8 space-y-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 dark:bg-green-950/30">
                <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="text-[20px] font-bold text-gray-900 dark:text-gray-100">Import Complete!</h2>

              <div className="w-full max-w-xs space-y-2">
                <div className="flex items-center justify-between rounded-xl bg-green-50 dark:bg-green-950/20 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-[13px] font-medium text-green-700 dark:text-green-400">{results.imported} clients imported</span>
                  </div>
                </div>
                {results.updated > 0 && (
                  <div className="flex items-center justify-between rounded-xl bg-blue-50 dark:bg-blue-950/20 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                      </svg>
                      <span className="text-[13px] font-medium text-blue-700 dark:text-blue-400">{results.updated} existing clients updated</span>
                    </div>
                  </div>
                )}
                {results.duplicates > 0 && (
                  <div className="flex items-center justify-between rounded-xl bg-amber-50 dark:bg-amber-950/20 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      <span className="text-[13px] font-medium text-amber-700 dark:text-amber-400">{results.duplicates} duplicates skipped</span>
                    </div>
                  </div>
                )}
                {results.skipped > 0 && (
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">{results.skipped} rows skipped (no name)</span>
                    </div>
                  </div>
                )}
                {results.errors.length > 0 && (
                  <div className="rounded-xl bg-red-50 dark:bg-red-950/20 px-4 py-2.5">
                    <p className="text-[13px] font-medium text-red-600 dark:text-red-400 mb-1">Errors:</p>
                    {results.errors.map((err, i) => (
                      <p key={i} className="text-[12px] text-red-500 dark:text-red-400">{err}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="px-6 pb-5 pt-3 border-t border-gray-100 dark:border-white/5">
          {step === 'preview' && (
            <div className="flex gap-3">
              <button
                onClick={() => { reset(); }}
                className="flex-1 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                className="flex-1 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm press-scale transition-colors"
              >
                Import {rows.length.toLocaleString()} Client{rows.length !== 1 ? 's' : ''}
              </button>
            </div>
          )}
          {step === 'results' && (
            <button
              onClick={handleClose}
              className="w-full rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm press-scale transition-colors"
            >
              Done
            </button>
          )}
          {step === 'upload' && (
            <button
              onClick={handleClose}
              className="w-full rounded-xl px-4 py-2.5 text-[13px] font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
