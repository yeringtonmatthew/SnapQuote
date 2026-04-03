'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import PhotoUpload from '@/components/ui/PhotoUpload';
import LineItemEditor from '@/components/ui/LineItemEditor';
import DraftRecovery, { saveDraft, clearDraft } from '@/components/DraftRecovery';
import type { DraftData } from '@/components/DraftRecovery';
import PhoneInput from '@/components/ui/PhoneInput';
import { formatPhoneNumber } from '@/lib/format-phone';
import PageTransition from '@/components/PageTransition';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import FormField from '@/components/ui/FormField';
import type { LineItem, InspectionFinding, AIQuoteResponse, User, QuoteTemplate } from '@/types/database';
import { DEFAULT_TERMS } from '@/lib/defaultTerms';
import { Spinner } from '@/components/ui/Spinner';

type Step = 'start' | 'details' | 'generating' | 'review';

function AIProgressSteps() {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    { label: 'Analyzing photos...', detail: 'Identifying materials, damage, and conditions' },
    { label: 'Inspecting for issues...', detail: 'Checking for damage, wear, and safety concerns' },
    { label: 'Building line items...', detail: 'Calculating materials, labor, and pricing' },
    { label: 'Generating inspection report...', detail: 'Creating findings with severity ratings' },
    { label: 'Finalizing your quote...', detail: 'Reviewing scope and preparing estimate' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2">
      <p className="text-[17px] font-semibold text-gray-900">{steps[currentStep].label}</p>
      <p className="text-[14px] text-gray-500">{steps[currentStep].detail}</p>
      <div className="mt-4 flex justify-center gap-1.5">
        {steps.map((_, i) => (
          <div key={i} className={`h-1.5 w-8 rounded-full transition-colors duration-500 ${i <= currentStep ? 'bg-brand-600' : 'bg-gray-200'}`} />
        ))}
      </div>
    </div>
  );
}

interface FieldErrors {
  customerName?: string;
  customerContact?: string;
  photos?: string;
  lineItems?: string;
}

export default function NewQuotePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('start');
  const [profile, setProfile] = useState<User | null>(null);
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Job details — File objects are compressed client-side by PhotoUpload
  const [files, setFiles] = useState<File[]>([]);
  // Persisted photo URLs — uploaded to Supabase as soon as files are added
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [jobAddress, setJobAddress] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // Client picker
  const [clients, setClients] = useState<any[]>([]);
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const clientPickerRef = useRef<HTMLDivElement>(null);

  // AI result
  const [aiDescription, setAiDescription] = useState('');
  const [scopeOfWork, setScopeOfWork] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [inspectionFindings, setInspectionFindings] = useState<InspectionFinding[]>([]);
  const [notes, setNotes] = useState(DEFAULT_TERMS);
  const [estimatedDuration, setEstimatedDuration] = useState('');

  // Calculated
  const [depositPercent, setDepositPercent] = useState(0);
  const [taxRate, setTaxRate] = useState<string>('');
  const [discountType, setDiscountType] = useState<'none' | 'amount' | 'percent'>('none');
  const [discountValue, setDiscountValue] = useState<string>('');

  // UI state
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Clear a specific field error when user starts typing
  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) {
        setProfile(data);
        setDepositPercent(data.default_deposit_percent ?? 0);
        if (data.default_tax_rate != null) {
          setTaxRate(String(data.default_tax_rate));
        }
      }
    }
    async function loadTemplates() {
      try {
        const res = await fetch('/api/templates');
        if (res.ok) {
          const data = await res.json();
          setTemplates(data);
        }
      } catch {
        // Templates are optional — fail silently
      } finally {
        setLoadingTemplates(false);
      }
    }
    async function loadClients() {
      try {
        const res = await fetch('/api/clients');
        if (res.ok) {
          const data = await res.json();
          setClients(data);
        }
      } catch {
        // Clients are optional — fail silently
      }
    }
    loadProfile();
    loadTemplates();
    loadClients();
  }, []);

  // Close client dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (clientPickerRef.current && !clientPickerRef.current.contains(e.target as Node)) {
        setShowClientDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter clients based on search input
  const filteredClients = clientSearch.trim()
    ? clients.filter(c => {
        const q = clientSearch.toLowerCase();
        return (
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.phone && c.phone.includes(q))
        );
      })
    : clients;

  function selectClient(client: any) {
    setClientId(client.id);
    setCustomerName(client.name || '');
    setCustomerPhone(client.phone || '');
    setCustomerEmail(client.email || '');
    setJobAddress(client.address || '');
    setClientSearch('');
    setShowClientDropdown(false);
    clearFieldError('customerName');
    clearFieldError('customerContact');
  }

  function deselectClient() {
    setClientId(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setJobAddress('');
  }

  // --- Upload photos to Supabase immediately when files are added ---
  async function uploadPhotosToStorage(newFiles: File[]) {
    if (newFiles.length === 0) return;
    setUploadingPhotos(true);
    try {
      const supabase = createClient();
      const newUrls: string[] = [];
      for (const file of newFiles) {
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const filePath = `quotes/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, file, { contentType: file.type || 'image/jpeg' });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('photos').getPublicUrl(filePath);
          newUrls.push(urlData.publicUrl);
        } else {
          // Upload error — skip this photo
        }
      }
      setPhotoUrls(prev => [...prev, ...newUrls]);
    } catch {
      // Photo upload failed silently
    } finally {
      setUploadingPhotos(false);
    }
  }

  // Wrap file change: update local File[] state AND upload to storage in background
  function handleFilesChange(newFiles: File[]) {
    clearFieldError('photos');

    if (newFiles.length > files.length) {
      // Addition: upload only the newly added files
      const addedFiles = newFiles.slice(files.length);
      setFiles(newFiles);
      uploadPhotosToStorage(addedFiles);
    } else if (newFiles.length < files.length) {
      // Removal: find which file was removed by checking which one is missing
      const removedIndex = files.findIndex(f => !newFiles.includes(f));
      setFiles(newFiles);
      if (removedIndex !== -1) {
        setPhotoUrls(prev => prev.filter((_, i) => i !== removedIndex));
      } else {
        // Fallback: last file was removed (e.g., same object references)
        setPhotoUrls(prev => prev.slice(0, newFiles.length));
      }
    } else {
      // Reorder: update files and reorder photoUrls to match
      const newOrder = newFiles.map(f => files.indexOf(f));
      setFiles(newFiles);
      setPhotoUrls(prev => {
        if (prev.length === 0) return prev;
        return newOrder.map(i => prev[i]).filter(Boolean);
      });
    }
  }

  // --- Auto-save draft logic ---
  const getDraftData = useCallback(() => ({
    customerName,
    customerPhone,
    customerEmail,
    jobAddress,
    lineItems,
    notes,
    scopeOfWork,
    aiDescription,
    photos: photoUrls, // NOW persists uploaded photo URLs
  }), [customerName, customerPhone, customerEmail, jobAddress, lineItems, notes, scopeOfWork, aiDescription, photoUrls]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const data = getDraftData();
      // Only save if there's meaningful content
      if (data.customerName || data.lineItems.length > 0 || data.aiDescription || data.photos.length > 0) {
        saveDraft(data);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [getDraftData]);

  // Save on beforeunload
  useEffect(() => {
    function handleBeforeUnload() {
      const data = getDraftData();
      if (data.customerName || data.lineItems.length > 0 || data.aiDescription || data.photos.length > 0) {
        saveDraft(data);
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [getDraftData]);

  // Resume draft handler
  function handleResumeDraft(draft: DraftData) {
    setCustomerName(draft.customerName || '');
    setCustomerPhone(draft.customerPhone || '');
    setCustomerEmail(draft.customerEmail || '');
    setJobAddress((draft as any).jobAddress || '');
    setLineItems(draft.lineItems || []);
    setNotes(draft.notes || DEFAULT_TERMS);
    setScopeOfWork(draft.scopeOfWork || '');
    setAiDescription(draft.aiDescription || '');
    // Restore persisted photo URLs
    if (draft.photos && draft.photos.length > 0) {
      setPhotoUrls(draft.photos);
    }
    // Jump to review if we have line items, otherwise details
    if (draft.lineItems && draft.lineItems.length > 0) {
      setStep('review');
    } else if (draft.customerName || (draft.photos && draft.photos.length > 0)) {
      setStep('details');
    }
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);

  // Discount calculation
  const parsedDiscountValue = parseFloat(discountValue) || 0;
  const discountAmount = discountType === 'amount'
    ? Math.round(Math.min(parsedDiscountValue, subtotal) * 100) / 100
    : discountType === 'percent'
      ? Math.round(subtotal * (Math.min(parsedDiscountValue, 100) / 100) * 100) / 100
      : 0;
  const afterDiscount = Math.round((subtotal - discountAmount) * 100) / 100;

  // Tax calculation (applied after discount)
  const parsedTaxRate = parseFloat(taxRate) || 0;
  const taxAmount = Math.round(afterDiscount * (parsedTaxRate / 100) * 100) / 100;

  // Total and deposit
  const total = Math.round((afterDiscount + taxAmount) * 100) / 100;
  const depositAmount = Math.round(total * (depositPercent / 100) * 100) / 100;

  // Compress a File to a raw base64 string (no data URI prefix) using Canvas
  function compressToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const maxDim = 1024;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          const scale = maxDim / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        const dataUri = canvas.toDataURL('image/jpeg', 0.7);
        // Strip the data URI prefix — only send raw base64
        resolve(dataUri.replace(/^data:image\/\w+;base64,/, ''));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
      img.src = url;
    });
  }

  function handleSelectTemplate(template: QuoteTemplate) {
    setLineItems(template.line_items);
    if (template.notes) setNotes(template.notes);
    if (template.scope_of_work) setScopeOfWork(template.scope_of_work);
    setStep('review');
  }

  async function handleGenerateQuote() {
    const errors: FieldErrors = {};
    if (!customerName.trim()) errors.customerName = 'Customer name is required';
    if (!customerPhone.trim() && !customerEmail.trim()) errors.customerContact = 'Phone or email is required';
    if (files.length === 0 && photoUrls.length === 0) errors.photos = 'Add at least one photo for AI generation';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setError(null);
    setFieldErrors({});
    setGenerating(true);
    setStep('generating');

    try {
      // Compress each file client-side, then send as JSON (avoids FormData/multipart issues)
      let images: string[];
      if (files.length > 0) {
        images = await Promise.all(files.map(compressToBase64));
      } else if (photoUrls.length > 0) {
        // Draft recovery: files are gone but URLs exist — fetch and convert to base64
        images = await Promise.all(
          photoUrls.map(async (url) => {
            const resp = await fetch(url);
            const blob = await resp.blob();
            const file = new File([blob], 'photo.jpg', { type: blob.type });
            return compressToBase64(file);
          })
        );
      } else {
        images = [];
      }

      const res = await fetch('/api/quotes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images, description: jobDescription }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate quote');
      }

      const data: AIQuoteResponse = await res.json();

      setAiDescription(data.job_summary);
      setScopeOfWork(data.scope_of_work || '');
      setLineItems(data.line_items);
      setInspectionFindings(data.inspection_findings || []);
      setNotes(data.notes || '');
      setEstimatedDuration(data.estimated_duration || '');
      setStep('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStep('details');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveQuote(status: 'draft' | 'sent') {
    const hasLineItem = lineItems.some(item => item.description?.trim());
    if (!hasLineItem) {
      setFieldErrors({ lineItems: 'Add at least one line item with a description' });
      return;
    }

    setSaving(true);
    setError(null);
    setFieldErrors({});

    try {
      // Photos are already uploaded to Supabase storage (uploaded on add).
      // Only upload any remaining files that might not have URLs yet.
      const supabase = createClient();
      let finalPhotoUrls = [...photoUrls];

      // If there are more files than URLs, upload the extras
      if (files.length > photoUrls.length) {
        const remainingFiles = files.slice(photoUrls.length);
        for (const file of remainingFiles) {
          const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
          const filePath = `quotes/${fileName}`;
          const { error: uploadError } = await supabase.storage
            .from('photos')
            .upload(filePath, file, { contentType: file.type || 'image/jpeg' });
          if (!uploadError) {
            const { data: urlData } = supabase.storage.from('photos').getPublicUrl(filePath);
            finalPhotoUrls.push(urlData.publicUrl);
          } else {
            // Upload error — skip this photo
          }
        }
      }

      const res = await fetch('/api/quotes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          job_address: jobAddress,
          photos: finalPhotoUrls,
          ai_description: aiDescription,
          scope_of_work: scopeOfWork,
          line_items: lineItems,
          inspection_findings: inspectionFindings.length > 0 ? inspectionFindings : null,
          subtotal,
          tax_rate: parsedTaxRate > 0 ? parsedTaxRate : null,
          discount_amount: discountType === 'amount' ? discountAmount : null,
          discount_percent: discountType === 'percent' ? parsedDiscountValue : null,
          total,
          deposit_amount: depositAmount,
          deposit_percent: depositPercent,
          notes,
          status: 'draft', // Always save as draft first
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save quote');
      }

      const savedQuote = await res.json();

      // If user clicked "Send Quote", fire the send route (SMS + status update)
      if (status === 'sent') {
        try {
          await fetch(`/api/quotes/${savedQuote.id}/send`, { method: 'POST' });
        } catch {
          // Send failed but quote is saved — they can resend from detail page
        }
      }

      // Clear auto-saved draft on successful save
      clearDraft();

      // Go to the quote detail page so they can see the result
      router.push(`/quotes/${savedQuote.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageTransition>
    <div className="min-h-dvh bg-gray-50 pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <Link href="/dashboard" aria-label="Back to dashboard" className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">New Quote</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-6">
        {step === 'start' && (
          <DraftRecovery onResume={handleResumeDraft} />
        )}
        {error && (
          <div role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ========== STEP 0: Choose Starting Point ========== */}
        {step === 'start' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">How do you want to start?</h2>
              <p className="mt-1 text-sm text-gray-500">Snap photos for an AI quote, or start from a saved template.</p>
            </div>

            {/* Snap a Photo option */}
            <button
              onClick={() => setStep('details')}
              className="w-full rounded-2xl border-2 border-brand-200 bg-brand-50 p-5 text-left transition-colors hover:border-brand-400 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Snap a Photo</p>
                  <p className="mt-0.5 text-xs text-gray-500">AI generates a quote from your job photos</p>
                </div>
              </div>
            </button>

            {/* Templates section */}
            {!loadingTemplates && templates.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Or start from a template</p>
                <div className="space-y-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50 active:bg-brand-100 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-900">{template.name}</p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {template.line_items.length} line item{template.line_items.length !== 1 ? 's' : ''}
                            {template.scope_of_work ? ' · Has scope' : ''}
                          </p>
                        </div>
                        <svg className="ml-3 h-5 w-5 shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loadingTemplates && (
              <div className="flex justify-center py-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-brand-600" />
              </div>
            )}

            {/* Quick Quote option */}
            <button
              onClick={() => {
                setStep('details');
              }}
              className="w-full py-2 text-center text-sm text-gray-500 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-lg"
            >
              Or build a quote manually
            </button>
          </div>
        )}

        {/* ========== STEP 1: Job Details ========== */}
        {step === 'details' && (
          <div className="space-y-6">
            <div>
              <h2 className="mb-3 text-sm font-semibold text-gray-700">Job Photos</h2>
              <PhotoUpload files={files} onFilesChange={handleFilesChange} photoUrls={photoUrls} />
              {fieldErrors.photos && (
                <p role="alert" className="mt-1.5 text-xs text-red-500 animate-shake">
                  {fieldErrors.photos}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-gray-700">Customer Info</h2>

              {/* Client search / picker */}
              {clients.length > 0 && (
                <>
                  {clientId ? (
                    <div className="flex items-center gap-2 rounded-xl bg-brand-50 border border-brand-200 px-3 py-2.5">
                      <svg className="h-4 w-4 text-brand-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      <span className="text-[15px] font-medium text-brand-700 flex-1 truncate">{customerName}</span>
                      <button
                        type="button"
                        onClick={deselectClient}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-brand-400 hover:bg-brand-100 hover:text-brand-600"
                        aria-label="Deselect client"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="relative" ref={clientPickerRef}>
                      <div className="relative">
                        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        <input
                          type="text"
                          value={clientSearch}
                          onChange={(e) => { setClientSearch(e.target.value); setShowClientDropdown(true); }}
                          onFocus={() => setShowClientDropdown(true)}
                          placeholder="Search existing clients..."
                          className="input-field pl-9"
                        />
                      </div>
                      {showClientDropdown && filteredClients.length > 0 && (
                        <ul className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                          {filteredClients.slice(0, 20).map((c) => (
                            <li key={c.id}>
                              <button
                                type="button"
                                onClick={() => selectClient(c)}
                                className="flex w-full flex-col gap-0.5 px-3 py-2.5 text-left hover:bg-gray-50 active:bg-gray-100"
                              >
                                <span className="text-[15px] font-medium text-gray-900">{c.name}</span>
                                <span className="text-[13px] text-gray-500">
                                  {[c.phone, c.email].filter(Boolean).join(' · ')}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {showClientDropdown && clientSearch.trim() && filteredClients.length === 0 && (
                        <div className="absolute z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-lg">
                          <p className="text-[13px] text-gray-500">No clients found</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs text-gray-400">or enter manually</span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>
                </>
              )}

              <FormField label="Customer Name" required error={fieldErrors.customerName} htmlFor="customerName">
                <input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={(e) => { setCustomerName(e.target.value); clearFieldError('customerName'); }}
                  placeholder="John Doe"
                  className="input-field"
                />
              </FormField>
              <FormField label="Phone Number" error={fieldErrors.customerContact} htmlFor="customerPhone">
                <PhoneInput
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(v) => { setCustomerPhone(v); clearFieldError('customerContact'); }}
                />
              </FormField>
              <FormField label="Customer Email" htmlFor="customerEmail">
                <input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => { setCustomerEmail(e.target.value); clearFieldError('customerContact'); }}
                  placeholder="john@example.com"
                  className="input-field"
                />
              </FormField>
              <div>
                <label htmlFor="jobAddress" className="label">
                  Job Address <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <AddressAutocomplete
                  id="jobAddress"
                  value={jobAddress}
                  onChange={setJobAddress}
                  placeholder="123 Main St, Indianapolis, IN"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label htmlFor="jobDescription" className="label">
                Describe the Job <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="e.g. Replace 50-gallon water heater, Bradford White. Old unit is leaking from bottom."
                rows={3}
                className="input-field resize-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                The more detail you add, the better the AI quote will be
              </p>
            </div>

            <button
              onClick={handleGenerateQuote}
              disabled={generating || uploadingPhotos}
              className="btn-primary flex items-center justify-center gap-2"
            >
              {uploadingPhotos ? (
                <>
                  <Spinner size="md" />
                  Uploading photos...
                </>
              ) : generating ? (
                <Spinner size="md" />
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              )}
              {generating ? 'Generating...' : 'Generate AI Quote'}
            </button>

            <button
              onClick={() => {
                const errors: FieldErrors = {};
                if (!customerName.trim()) errors.customerName = 'Customer name is required';
                if (!customerPhone.trim() && !customerEmail.trim()) errors.customerContact = 'Phone or email is required';
                if (Object.keys(errors).length > 0) {
                  setFieldErrors(errors);
                  return;
                }
                setError(null);
                setFieldErrors({});
                setLineItems([]);
                setAiDescription('');
                setScopeOfWork('');
                setStep('review');
              }}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
              Quick Quote — Skip AI
            </button>
          </div>
        )}

        {/* ========== STEP 2: Generating ========== */}
        {step === 'generating' && (
          <div className="step-enter flex flex-col items-center justify-center py-16 px-4 text-center" aria-live="polite">
            <div className="relative mb-8">
              {/* Animated ring */}
              <div className="h-20 w-20 rounded-full border-4 border-gray-200">
                <div className="h-full w-full rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
              </div>
            </div>
            <AIProgressSteps />
          </div>
        )}

        {/* ========== STEP 3: Review & Edit ========== */}
        {step === 'review' && (
          <div className="space-y-6 pb-24">
            {aiDescription && (
              <div className="card !bg-brand-50 !border-brand-200">
                <div className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-brand-900">{aiDescription}</p>
                    {estimatedDuration && (
                      <p className="mt-1 text-xs text-brand-600">Estimated: {estimatedDuration}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Scope of Work */}
            {scopeOfWork && (
              <div className="card">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Scope of Work</p>
                <p className="text-sm leading-relaxed text-gray-700">{scopeOfWork}</p>
              </div>
            )}

            <div className="card">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Customer</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{customerName}</p>
              {customerPhone && <p className="text-xs text-gray-500">{formatPhoneNumber(customerPhone)}</p>}
              {customerEmail && <p className="text-xs text-gray-500">{customerEmail}</p>}
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold text-gray-700">Line Items</h2>
              <LineItemEditor lineItems={lineItems} onChange={(items) => { setLineItems(items); clearFieldError('lineItems'); }} />
              {fieldErrors.lineItems && (
                <p role="alert" className="mt-1.5 text-xs text-red-500 animate-shake">
                  {fieldErrors.lineItems}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="label">Notes</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="input-field resize-none"
                placeholder="Additional notes for the customer..."
              />
            </div>

            <div className="card space-y-3">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm font-semibold text-gray-900">
                  ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Discount */}
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Discount</span>
                  <div className="flex items-center gap-1.5">
                    {(['none', 'amount', 'percent'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => { setDiscountType(type); if (type === 'none') setDiscountValue(''); }}
                        className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                          discountType === type
                            ? 'bg-brand-100 text-brand-700'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {type === 'none' ? 'No Discount' : type === 'amount' ? '$ Amount' : '% Percent'}
                      </button>
                    ))}
                  </div>
                </div>
                {discountType !== 'none' && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-lg border border-gray-200 px-2">
                      {discountType === 'amount' && (
                        <span className="text-xs text-gray-400 mr-1">$</span>
                      )}
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        max={discountType === 'percent' ? 100 : undefined}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        placeholder="0"
                        aria-label={`Discount ${discountType === 'amount' ? 'amount in dollars' : 'percentage'}`}
                        className="w-20 border-0 bg-transparent p-1 text-sm text-gray-700 focus:outline-none focus:ring-0"
                      />
                      {discountType === 'percent' && (
                        <span className="text-xs text-gray-400 ml-1">%</span>
                      )}
                    </div>
                    {discountAmount > 0 && (
                      <span className="text-sm font-medium text-red-500">
                        -${discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Tax */}
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Tax</span>
                    <div className="flex items-center rounded-lg border border-gray-200 px-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={taxRate}
                        onChange={(e) => setTaxRate(e.target.value)}
                        placeholder="0"
                        aria-label="Tax rate percentage"
                        className="w-12 border-0 bg-transparent p-1 text-center text-xs text-gray-700 focus:outline-none focus:ring-0"
                      />
                      <span className="text-xs text-gray-400">%</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    ${taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">
                    ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Deposit */}
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Deposit</span>
                    <div className="flex items-center rounded-lg border border-gray-200 px-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={depositPercent}
                        onChange={(e) => setDepositPercent(parseInt(e.target.value) || 0)}
                        aria-label="Deposit percentage"
                        className="w-10 border-0 bg-transparent p-1 text-center text-xs text-gray-700 focus:outline-none focus:ring-0"
                      />
                      <span className="text-xs text-gray-400">%</span>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-brand-600">
                    ${depositAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pb-4">
              <button
                onClick={() => handleSaveQuote('sent')}
                disabled={saving || lineItems.length === 0}
                className="btn-primary"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size="md" />
                    Sending...
                  </span>
                ) : 'Send Quote'}
              </button>
              <button
                onClick={() => handleSaveQuote('draft')}
                disabled={saving}
                className="btn-secondary"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size="md" className="text-gray-700" />
                    Saving...
                  </span>
                ) : 'Save as Draft'}
              </button>
              <button
                onClick={() => { setStep('details'); setError(null); setFieldErrors({}); }}
                className="w-full py-2 text-center text-sm text-gray-500 hover:text-gray-700 rounded-lg focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Re-generate Quote
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Sticky footer with running total */}
      {step === 'review' && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur-xl px-4 py-3 safe-area-bottom">
          <div className="mx-auto flex max-w-sm items-center justify-between">
            <div>
              <p className="text-[12px] text-gray-500">Quote Total</p>
              <p className="text-[20px] font-bold text-gray-900">
                ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <button
              onClick={() => handleSaveQuote('sent')}
              disabled={saving || lineItems.length === 0}
              className="rounded-xl bg-brand-600 px-6 py-3 text-[15px] font-semibold text-white active:bg-brand-700 disabled:opacity-50"
            >
              {saving ? 'Sending...' : 'Send Quote'}
            </button>
          </div>
        </div>
      )}
    </div>
    </PageTransition>
  );
}
