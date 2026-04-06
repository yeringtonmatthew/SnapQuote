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
import type { LineItem, InspectionFinding, AIQuoteResponse, User, QuoteTemplate, LeadSourceValue, QuoteOption } from '@/types/database';
import { TierEditor } from '@/components/TierEditor';
import { DEFAULT_TERMS } from '@/lib/defaultTerms';
import { Spinner } from '@/components/ui/Spinner';
import { LEAD_SOURCES } from '@/lib/constants';
import { triggerConfetti } from '@/components/ConfettiEffect';

type Step = 'start' | 'details' | 'generating' | 'review' | 'send';

// ---- Progress Indicator (Apple setup wizard style) ----
const STEP_LABELS = ['Start', 'Details', 'AI', 'Review', 'Send'];
const STEP_MAP: Record<Step, number> = { start: 0, details: 1, generating: 2, review: 3, send: 4 };

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const stepIndex = STEP_MAP[currentStep];
  return (
    <div className="flex items-center justify-center gap-1 py-2">
      {STEP_LABELS.map((label, i) => (
        <div key={label} className="flex items-center gap-1">
          <div className="flex flex-col items-center">
            <div
              className={`h-2 w-2 rounded-full transition-all duration-500 ${
                i < stepIndex
                  ? 'bg-brand-600 scale-100'
                  : i === stepIndex
                    ? 'bg-brand-600 scale-125 ring-4 ring-brand-100 dark:ring-brand-900/40'
                    : 'bg-gray-200 dark:bg-gray-700 scale-100'
              }`}
            />
            <span
              className={`mt-1 text-[10px] font-medium transition-colors duration-300 ${
                i <= stepIndex ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div
              className={`mx-0.5 mb-3 h-px w-6 sm:w-8 transition-colors duration-500 ${
                i < stepIndex ? 'bg-brand-400' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ---- Draft Saved Toast ----
function DraftSavedIndicator({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="draft-saved-indicator fixed bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-full bg-gray-900/80 px-4 py-2 text-[13px] font-medium text-white backdrop-blur-sm">
      <span className="flex items-center gap-1.5">
        <svg className="h-3.5 w-3.5 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        Draft saved
      </span>
    </div>
  );
}

// ---- AI Generation Animation ----
function AIGeneratingView({ photoUrls }: { photoUrls: string[] }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [analyzingPhotoIndex, setAnalyzingPhotoIndex] = useState(0);
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
  }, [steps.length]);

  useEffect(() => {
    if (photoUrls.length <= 1) return;
    const interval = setInterval(() => {
      setAnalyzingPhotoIndex(prev => (prev + 1) % photoUrls.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [photoUrls.length]);

  return (
    <div className="step-enter flex flex-col items-center justify-center py-10 px-4" aria-live="polite">
      {/* Photo being "analyzed" */}
      {photoUrls.length > 0 && (
        <div className="relative mb-8">
          <div className="h-32 w-32 overflow-hidden rounded-2xl analyze-pulse">
            <img
              src={photoUrls[analyzingPhotoIndex]}
              alt="Analyzing"
              className="h-full w-full object-cover transition-all duration-500"
            />
          </div>
          {/* Scanning line animation */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <div
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-400 to-transparent"
              style={{
                animation: 'scan-line 2s ease-in-out infinite',
              }}
            />
            <style>{`
              @keyframes scan-line {
                0% { top: 0%; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { top: 100%; opacity: 0; }
              }
            `}</style>
          </div>
          {/* Photo count badge */}
          {photoUrls.length > 1 && (
            <div className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white shadow-lg">
              {analyzingPhotoIndex + 1}/{photoUrls.length}
            </div>
          )}
        </div>
      )}

      {/* Shimmer preview cards */}
      <div className="mb-8 w-full max-w-xs space-y-2">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="flex items-center gap-3 rounded-xl bg-white dark:bg-gray-900 p-3 shadow-sm border border-gray-100 dark:border-gray-800"
            style={{ animationDelay: `${n * 200}ms` }}
          >
            <div className="shimmer-line h-4 w-4 rounded-md" style={{ animationDelay: `${n * 150}ms` }} />
            <div className="flex-1 space-y-1.5">
              <div className="shimmer-line h-3 rounded" style={{ width: `${70 + n * 8}%`, animationDelay: `${n * 100}ms` }} />
              <div className="shimmer-line h-2.5 w-12 rounded" style={{ animationDelay: `${n * 100 + 50}ms` }} />
            </div>
            <div className="shimmer-line h-3 w-14 rounded" style={{ animationDelay: `${n * 100 + 100}ms` }} />
          </div>
        ))}
      </div>

      {/* Step text */}
      <div className="text-center space-y-2">
        <p className="text-[17px] font-semibold text-gray-900 dark:text-gray-100 transition-all duration-300">{steps[currentStep].label}</p>
        <p className="text-[14px] text-gray-500 dark:text-gray-400 transition-all duration-300">{steps[currentStep].detail}</p>
        <div className="mt-4 flex justify-center gap-1.5">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 w-8 rounded-full transition-colors duration-500 ${i <= currentStep ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Send Confirmation View ----
function SendView({
  customerName,
  customerPhone,
  customerEmail,
  total,
  lineItemCount,
  sending,
  onSend,
  onSaveDraft,
  onBack,
}: {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  total: number;
  lineItemCount: number;
  sending: boolean;
  onSend: (method: 'sms' | 'email' | 'both') => void;
  onSaveDraft: () => void;
  onBack: () => void;
}) {
  const hasPhone = !!customerPhone.trim();
  const hasEmail = !!customerEmail.trim();

  return (
    <div className="step-enter space-y-6 pb-8">
      {/* Mini quote preview card */}
      <div className="card !bg-gradient-to-br !from-brand-50 dark:!from-brand-950/30 !to-white dark:!to-gray-900 !border-brand-200 dark:!border-brand-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Quote for</p>
            <p className="text-[17px] font-bold text-gray-900 dark:text-gray-100">{customerName}</p>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-brand-100 dark:border-brand-800 pt-3">
          <span className="text-[13px] text-gray-500 dark:text-gray-400">{lineItemCount} item{lineItemCount !== 1 ? 's' : ''}</span>
          <span className="text-[22px] font-bold text-gray-900 dark:text-gray-100">
            ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Delivery method buttons */}
      <div>
        <h3 className="mb-3 text-[15px] font-semibold text-gray-900 dark:text-gray-100">How do you want to send it?</h3>
        <div className="space-y-2">
          {hasPhone && (
            <button
              onClick={() => onSend('sms')}
              disabled={sending}
              className="flex w-full min-h-[56px] items-center gap-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 text-left shadow-sm transition-all hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/20 active:scale-[0.98] disabled:opacity-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">Send via SMS</p>
                <p className="text-[13px] text-gray-500 truncate">{formatPhoneNumber(customerPhone)}</p>
              </div>
              <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}
          {hasEmail && (
            <button
              onClick={() => onSend('email')}
              disabled={sending}
              className="flex w-full min-h-[56px] items-center gap-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 text-left shadow-sm transition-all hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/20 active:scale-[0.98] disabled:opacity-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">Send via Email</p>
                <p className="text-[13px] text-gray-500 truncate">{customerEmail}</p>
              </div>
              <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}
          {hasPhone && hasEmail && (
            <button
              onClick={() => onSend('both')}
              disabled={sending}
              className="flex w-full min-h-[56px] items-center gap-4 rounded-2xl border-2 border-brand-200 dark:border-brand-700 bg-brand-50 dark:bg-brand-950/30 p-4 text-left shadow-sm transition-all hover:border-brand-400 active:scale-[0.98] disabled:opacity-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">Send via SMS + Email</p>
                <p className="text-[13px] text-gray-500">Best chance they see it</p>
              </div>
              <svg className="h-5 w-5 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {sending && (
        <div className="flex items-center justify-center gap-2 py-4">
          <Spinner size="md" />
          <span className="text-[15px] font-medium text-gray-600 dark:text-gray-400">Sending your quote...</span>
        </div>
      )}

      <div className="space-y-3 pt-2">
        <button
          onClick={onSaveDraft}
          disabled={sending}
          className="btn-secondary"
        >
          Save as Draft Instead
        </button>
        <button
          onClick={onBack}
          disabled={sending}
          className="w-full py-2 text-center text-[14px] text-gray-500 hover:text-gray-700 rounded-lg"
        >
          Back to Review
        </button>
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

  // Job details
  const [files, setFiles] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [jobAddress, setJobAddress] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [leadSource, setLeadSource] = useState<LeadSourceValue | ''>('');

  // Client picker
  const [clients, setClients] = useState<{ id: string; name: string; phone: string | null; email: string | null; address: string | null }[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
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
  const [quoteOptions, setQuoteOptions] = useState<QuoteOption[] | null>(null);

  // Tax & discount collapsible
  const [showTaxDiscount, setShowTaxDiscount] = useState(false);

  // UI state
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewSaving, setPreviewSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [draftSavedVisible, setDraftSavedVisible] = useState(false);

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
          setShowTaxDiscount(true);
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
        // Templates are optional
      } finally {
        setLoadingTemplates(false);
      }
    }
    async function loadClients() {
      try {
        const res = await fetch('/api/clients');
        if (res.ok) {
          const data = await res.json();
          setClients(Array.isArray(data) ? data : (data.clients || []));
        }
      } catch {
        // Clients are optional
      } finally {
        setLoadingClients(false);
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

  // Back button warning for unsaved changes
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      const hasContent = customerName || lineItems.length > 0 || aiDescription || files.length > 0 || photoUrls.length > 0;
      if (hasContent && step !== 'start') {
        e.preventDefault();
        // Save draft on exit attempt
        const data = getDraftData();
        if (data.customerName || data.lineItems.length > 0 || data.aiDescription || data.photos.length > 0) {
          saveDraft(data);
        }
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [customerName, lineItems, aiDescription, files, photoUrls, step]);

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

  function selectClient(client: { id: string; name: string; phone: string | null; email: string | null; address: string | null }) {
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
        }
      }
      setPhotoUrls(prev => [...prev, ...newUrls]);
    } catch {
      // Photo upload failed silently
    } finally {
      setUploadingPhotos(false);
    }
  }

  function handleFilesChange(newFiles: File[]) {
    clearFieldError('photos');

    if (newFiles.length > files.length) {
      const addedFiles = newFiles.slice(files.length);
      setFiles(newFiles);
      uploadPhotosToStorage(addedFiles);
    } else if (newFiles.length < files.length) {
      const removedIndex = files.findIndex(f => !newFiles.includes(f));
      setFiles(newFiles);
      if (removedIndex !== -1) {
        setPhotoUrls(prev => prev.filter((_, i) => i !== removedIndex));
      } else {
        setPhotoUrls(prev => prev.slice(0, newFiles.length));
      }
    } else {
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
    photos: photoUrls,
  }), [customerName, customerPhone, customerEmail, jobAddress, lineItems, notes, scopeOfWork, aiDescription, photoUrls]);

  // Auto-save every 30 seconds with visual indicator
  useEffect(() => {
    const interval = setInterval(() => {
      const data = getDraftData();
      if (data.customerName || data.lineItems.length > 0 || data.aiDescription || data.photos.length > 0) {
        saveDraft(data);
        setDraftSavedVisible(true);
        setTimeout(() => setDraftSavedVisible(false), 2600);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [getDraftData]);

  // Resume draft handler
  function handleResumeDraft(draft: DraftData) {
    setCustomerName(draft.customerName || '');
    setCustomerPhone(draft.customerPhone || '');
    setCustomerEmail(draft.customerEmail || '');
    setJobAddress(draft.jobAddress || '');
    setLineItems(draft.lineItems || []);
    setNotes(draft.notes || DEFAULT_TERMS);
    setScopeOfWork(draft.scopeOfWork || '');
    setAiDescription(draft.aiDescription || '');
    if (draft.photos && draft.photos.length > 0) {
      setPhotoUrls(draft.photos);
    }
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
      let images: string[];
      if (files.length > 0) {
        images = await Promise.all(files.map(compressToBase64));
      } else if (photoUrls.length > 0) {
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
      const supabase = createClient();
      let finalPhotoUrls = [...photoUrls];

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
          lead_source: leadSource || null,
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
          quote_options: quoteOptions,
          status: 'draft',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save quote');
      }

      const savedQuote = await res.json();

      if (status === 'sent') {
        try {
          await fetch(`/api/quotes/${savedQuote.id}/send`, { method: 'POST' });
          // Trigger confetti on successful send
          triggerConfetti();
        } catch {
          // Send failed but quote is saved
        }
      }

      clearDraft();
      router.push(`/quotes/${savedQuote.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  // Save as draft and open customer preview in new tab
  async function handleSaveForPreview() {
    const hasLineItem = lineItems.some(item => item.description?.trim());
    if (!hasLineItem) {
      setFieldErrors({ lineItems: 'Add at least one line item with a description' });
      return;
    }
    setPreviewSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      const supabase = createClient();
      let finalPhotoUrls = [...photoUrls];
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
          lead_source: leadSource || null,
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
          quote_options: quoteOptions,
          status: 'draft',
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save quote');
      }
      const savedQuote = await res.json();
      window.open(`/q/${savedQuote.id}`, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setPreviewSaving(false);
    }
  }

  // Handle back navigation with draft save
  function handleBackClick() {
    const hasContent = customerName || lineItems.length > 0 || aiDescription || files.length > 0 || photoUrls.length > 0;
    if (hasContent && step !== 'start') {
      const data = getDraftData();
      saveDraft(data);
    }
    if (step === 'details') {
      setStep('start');
    } else if (step === 'review') {
      setStep('details');
    } else if (step === 'send') {
      setStep('review');
    } else {
      router.push('/dashboard');
    }
  }

  // Smooth scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  return (
    <PageTransition>
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-950 pb-8">
      {/* Header with progress indicator */}
      <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl px-4">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center gap-3 py-3">
            <button
              onClick={handleBackClick}
              aria-label={step === 'start' ? 'Back to dashboard' : 'Go back'}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">New Quote</h1>
          </div>
          {/* Progress indicator -- only show after start */}
          {step !== 'start' && <StepIndicator currentStep={step} />}
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-6">
        {step === 'start' && (
          <DraftRecovery onResume={handleResumeDraft} />
        )}
        {error && (
          <div role="alert" className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 px-4 py-3 text-[15px] text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* ========== STEP 0: Choose Starting Point ========== */}
        {step === 'start' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">How do you want to start?</h2>
              <p className="mt-1 text-[15px] text-gray-500">Snap photos for an AI quote, or start from a saved template.</p>
            </div>

            {/* Snap a Photo option */}
            <button
              onClick={() => setStep('details')}
              className="w-full rounded-2xl border-2 border-brand-200 dark:border-brand-700 bg-brand-50 dark:bg-brand-950/30 p-5 text-left transition-colors hover:border-brand-400 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100">Snap a Photo</p>
                  <p className="mt-0.5 text-[13px] text-gray-500">AI generates a quote from your job photos</p>
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
                      className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 text-left shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/20 active:bg-brand-100 dark:active:bg-brand-900/30 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] font-semibold text-gray-900 dark:text-gray-100">{template.name}</p>
                          <p className="mt-0.5 text-[13px] text-gray-500">
                            {template.line_items.length} line item{template.line_items.length !== 1 ? 's' : ''}
                            {template.scope_of_work ? ' -- Has scope' : ''}
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
              className="w-full py-2 text-center text-[14px] text-gray-500 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-lg"
            >
              Or build a quote manually
            </button>
          </div>
        )}

        {/* ========== STEP 1: Job Details ========== */}
        {step === 'details' && (
          <div className="step-enter space-y-6">
            <div>
              <h2 className="mb-3 text-[15px] font-semibold text-gray-700">Job Photos</h2>
              <PhotoUpload files={files} onFilesChange={handleFilesChange} photoUrls={photoUrls} uploading={uploadingPhotos} />
              {fieldErrors.photos && (
                <p role="alert" className="mt-1.5 text-xs text-red-500 animate-shake">
                  {fieldErrors.photos}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-[15px] font-semibold text-gray-700">Customer Info</h2>

              {/* Client search / picker — always visible */}
              <>
                {clientId ? (
                  <div className="flex items-center gap-2 rounded-xl bg-brand-50 border border-brand-200 px-3 py-2.5">
                    <svg className="h-4 w-4 text-brand-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <span className="text-[16px] font-medium text-brand-700 flex-1 truncate">{customerName}</span>
                    <button
                      type="button"
                      onClick={deselectClient}
                      className="flex h-11 w-11 items-center justify-center rounded-full text-brand-400 hover:bg-brand-100 hover:text-brand-600"
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
                    {showClientDropdown && loadingClients && (
                      <div className="absolute z-20 mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-3 shadow-lg">
                        <p className="text-[13px] text-gray-400">Loading clients...</p>
                      </div>
                    )}
                    {showClientDropdown && !loadingClients && filteredClients.length > 0 && (
                      <ul className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                        {filteredClients.slice(0, 20).map((c) => (
                          <li key={c.id}>
                            <button
                              type="button"
                              onClick={() => selectClient(c)}
                              className="flex w-full min-h-[48px] flex-col gap-0.5 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600"
                            >
                              <span className="text-[16px] font-medium text-gray-900 dark:text-gray-100">{c.name}</span>
                              <span className="text-[13px] text-gray-500">
                                {[c.phone, c.email].filter(Boolean).join(' -- ')}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    {showClientDropdown && !loadingClients && clientSearch.trim() && filteredClients.length === 0 && (
                      <div className="absolute z-20 mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-3 shadow-lg">
                        <p className="text-[13px] text-gray-500">No clients found</p>
                      </div>
                    )}
                    {showClientDropdown && !loadingClients && !clientSearch.trim() && clients.length === 0 && (
                      <div className="absolute z-20 mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-3 shadow-lg">
                        <p className="text-[13px] text-gray-400">No clients yet — enter details below</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                  <span className="text-xs text-gray-400">or enter manually</span>
                  <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                </div>
              </>

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
              <div>
                <label htmlFor="leadSource" className="label">
                  Lead Source <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <select
                  id="leadSource"
                  value={leadSource}
                  onChange={(e) => setLeadSource(e.target.value as LeadSourceValue | '')}
                  className="input-field"
                >
                  <option value="">Select source...</option>
                  {LEAD_SOURCES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
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
              Quick Quote -- Skip AI
            </button>
          </div>
        )}

        {/* ========== STEP 2: Generating ========== */}
        {step === 'generating' && (
          <AIGeneratingView photoUrls={photoUrls} />
        )}

        {/* ========== STEP 3: Review & Edit ========== */}
        {step === 'review' && (
          <div className="step-enter space-y-6 pb-24">
            {aiDescription && (
              <div className="card !bg-brand-50 !border-brand-200">
                <div className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  <div>
                    <p className="text-[15px] font-medium text-brand-900">{aiDescription}</p>
                    {estimatedDuration && (
                      <p className="mt-1 text-[13px] text-brand-600">Estimated: {estimatedDuration}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Scope of Work */}
            {scopeOfWork && (
              <div className="card">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Scope of Work</p>
                <p className="text-[15px] leading-relaxed text-gray-700">{scopeOfWork}</p>
              </div>
            )}

            {/* Inspection Report */}
            {inspectionFindings.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-0.5">
                  <h2 className="text-[15px] font-semibold text-gray-700 dark:text-gray-300">Inspection Report</h2>
                  <span className="text-xs text-gray-400">{inspectionFindings.length} finding{inspectionFindings.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="space-y-2">
                  {inspectionFindings.map((finding, i) => {
                    const sc = finding.severity === 'critical'
                      ? { bg: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900', dot: 'bg-red-500', label: 'Critical', labelColor: 'text-red-700 dark:text-red-400' }
                      : finding.severity === 'moderate'
                        ? { bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900', dot: 'bg-amber-500', label: 'Moderate', labelColor: 'text-amber-700 dark:text-amber-400' }
                        : { bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900', dot: 'bg-blue-400', label: 'Minor', labelColor: 'text-blue-700 dark:text-blue-400' };
                    return (
                      <div key={i} className={`rounded-xl border px-4 py-3 ${sc.bg}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`h-2 w-2 rounded-full shrink-0 ${sc.dot}`} />
                          <span className={`text-[11px] font-semibold uppercase tracking-wider ${sc.labelColor}`}>{sc.label}</span>
                          {finding.photo_index !== undefined && photoUrls[finding.photo_index] && (
                            <span className="text-[11px] text-gray-400">· Photo {finding.photo_index + 1}</span>
                          )}
                        </div>
                        <p className="text-[14px] font-medium text-gray-900 dark:text-gray-100">{finding.finding}</p>
                        {finding.urgency_message && (
                          <p className="mt-0.5 text-[13px] text-gray-500 dark:text-gray-400 italic">"{finding.urgency_message}"</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Customer</p>
                  <p className="mt-1 text-[15px] font-semibold text-gray-900 dark:text-gray-100">{customerName}</p>
                  {customerPhone && <p className="text-[13px] text-gray-500">{formatPhoneNumber(customerPhone)}</p>}
                  {customerEmail && <p className="text-[13px] text-gray-500">{customerEmail}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => { setStep('details'); setError(null); }}
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Edit customer details"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-[15px] font-semibold text-gray-700">Line Items</h2>
              <LineItemEditor lineItems={lineItems} onChange={(items) => { setLineItems(items); clearFieldError('lineItems'); }} />
              {fieldErrors.lineItems && (
                <p role="alert" className="mt-1.5 text-xs text-red-500 animate-shake">
                  {fieldErrors.lineItems}
                </p>
              )}
            </div>

            {/* Good / Better / Best Tiers */}
            <TierEditor
              baseLineItems={lineItems}
              existingOptions={quoteOptions}
              onChange={setQuoteOptions}
            />

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

            {/* Totals card */}
            <div className="card space-y-3">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-[15px] text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">
                  ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Tax & Discount -- collapsible */}
              {!showTaxDiscount && (discountType === 'none' && !parsedTaxRate) && (
                <button
                  type="button"
                  onClick={() => setShowTaxDiscount(true)}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-brand-600 hover:text-brand-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add tax or discount
                </button>
              )}

              {(showTaxDiscount || discountType !== 'none' || parsedTaxRate > 0) && (
                <>
                  {/* Discount */}
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] text-gray-600 dark:text-gray-400">Discount</span>
                      <div className="flex items-center gap-1.5">
                        {(['none', 'amount', 'percent'] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => { setDiscountType(type); if (type === 'none') setDiscountValue(''); }}
                            className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors min-h-[32px] ${
                              discountType === type
                                ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            {type === 'none' ? 'None' : type === 'amount' ? '$ Amt' : '%'}
                          </button>
                        ))}
                      </div>
                    </div>
                    {discountType !== 'none' && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 px-2">
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
                            className="w-20 border-0 bg-transparent p-1 text-[16px] text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-0"
                          />
                          {discountType === 'percent' && (
                            <span className="text-xs text-gray-400 ml-1">%</span>
                          )}
                        </div>
                        {discountAmount > 0 && (
                          <span className="text-[15px] font-medium text-red-500">
                            -${discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tax */}
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] text-gray-600 dark:text-gray-400">Tax</span>
                        <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 px-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={taxRate}
                            onChange={(e) => setTaxRate(e.target.value)}
                            placeholder="0"
                            aria-label="Tax rate percentage"
                            className="w-12 border-0 bg-transparent p-1 text-center text-[16px] text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-0"
                          />
                          <span className="text-xs text-gray-400">%</span>
                        </div>
                      </div>
                      <span className="text-[15px] font-medium text-gray-700 dark:text-gray-300">
                        ${taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Total */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">Total</span>
                  <span className="text-[20px] font-bold text-gray-900 dark:text-gray-100">
                    ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Deposit */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] text-gray-600 dark:text-gray-400">Deposit</span>
                    <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 px-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={depositPercent}
                        onChange={(e) => setDepositPercent(parseInt(e.target.value) || 0)}
                        aria-label="Deposit percentage"
                        className="w-10 border-0 bg-transparent p-1 text-center text-[16px] text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-0"
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
                onClick={() => {
                  const hasLineItem = lineItems.some(item => item.description?.trim());
                  if (!hasLineItem) {
                    setFieldErrors({ lineItems: 'Add at least one line item with a description' });
                    return;
                  }
                  setFieldErrors({});
                  setStep('send');
                }}
                disabled={saving || previewSaving || lineItems.length === 0}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                Continue to Send
              </button>
              <button
                onClick={handleSaveForPreview}
                disabled={saving || previewSaving || lineItems.length === 0}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                {previewSaving ? (
                  <>
                    <Spinner size="md" className="text-gray-700" />
                    Opening preview...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Preview as Customer
                  </>
                )}
              </button>
              <button
                onClick={() => handleSaveQuote('draft')}
                disabled={saving || previewSaving}
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
                className="w-full py-2 text-center text-[14px] text-gray-500 hover:text-gray-700 rounded-lg focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Re-generate Quote
              </button>
            </div>
          </div>
        )}

        {/* ========== STEP 4: Send ========== */}
        {step === 'send' && (
          <SendView
            customerName={customerName}
            customerPhone={customerPhone}
            customerEmail={customerEmail}
            total={total}
            lineItemCount={lineItems.length}
            sending={saving}
            onSend={(method) => {
              // For now all methods use the same send endpoint (which sends SMS if phone, email if email)
              handleSaveQuote('sent');
            }}
            onSaveDraft={() => handleSaveQuote('draft')}
            onBack={() => setStep('review')}
          />
        )}
      </main>

      {/* Sticky footer with running total -- review step only */}
      {step === 'review' && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl px-4 py-3 safe-area-bottom">
          <div className="mx-auto flex max-w-sm items-center justify-between">
            <div>
              <p className="text-[12px] text-gray-500 dark:text-gray-400">Quote Total</p>
              <p className="text-[20px] font-bold text-gray-900 dark:text-gray-100">
                ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <button
              onClick={() => {
                const hasLineItem = lineItems.some(item => item.description?.trim());
                if (!hasLineItem) {
                  setFieldErrors({ lineItems: 'Add at least one line item with a description' });
                  return;
                }
                setFieldErrors({});
                setStep('send');
              }}
              disabled={saving || lineItems.length === 0}
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-[15px] font-semibold text-white active:bg-brand-700 disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
              Send
            </button>
          </div>
        </div>
      )}

      {/* Draft saved indicator */}
      <DraftSavedIndicator show={draftSavedVisible} />
    </div>
    </PageTransition>
  );
}
