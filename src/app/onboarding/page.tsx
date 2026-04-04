'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogoUpload } from '@/components/LogoUpload';
import { ConfettiOnMount } from '@/components/ConfettiOnMount';
import FormField from '@/components/ui/FormField';
import type { TradeType } from '@/types/database';

const TOTAL_STEPS = 4;

const STEP_LABELS: Record<number, string> = {
  1: 'Your Business',
  2: 'Your Brand',
  3: 'Pricing Defaults',
  4: 'Ready to Go!',
};

interface FieldErrors {
  businessName?: string;
  trade?: string;
}

const trades: { value: TradeType; label: string; icon: React.ReactNode }[] = [
  {
    value: 'roofing',
    label: 'Roofer',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
      </svg>
    ),
  },
  {
    value: 'plumber',
    label: 'Plumber',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
      </svg>
    ),
  },
  {
    value: 'electrician',
    label: 'Electrician',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    value: 'hvac',
    label: 'HVAC',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
      </svg>
    ),
  },
  {
    value: 'painter',
    label: 'Painter',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
  {
    value: 'general',
    label: 'General',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
  {
    value: 'landscaper',
    label: 'Landscaper',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
  },
  {
    value: 'other',
    label: 'Other',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [userId, setUserId] = useState<string | null>(null);

  // Step 1
  const [businessName, setBusinessName] = useState('');
  const [tradeType, setTradeType] = useState<TradeType | null>(null);

  // Step 2 (logo — optional)
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Step 3
  const [hourlyRate, setHourlyRate] = useState('125');
  const [rateType, setRateType] = useState('hourly');
  const [depositPercent, setDepositPercent] = useState('50');

  // Fetch userId on mount for logo upload
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  const goNext = useCallback(() => {
    const errors: FieldErrors = {};

    if (step === 1) {
      if (!businessName.trim()) {
        errors.businessName = 'Business name is required';
      }
      if (!tradeType) {
        errors.trade = 'Please select your trade';
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
    }

    setFieldErrors({});
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, [step, businessName, tradeType]);

  const goBack = useCallback(() => {
    setFieldErrors({});
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  async function handleComplete() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        business_name: businessName.trim() || null,
        trade_type: tradeType,
        hourly_rate: parseFloat(hourlyRate) || null,
        rate_type: rateType,
        default_deposit_percent: parseInt(depositPercent) || 0,
        onboarded: true,
      })
      .eq('id', user.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push('/quotes/new');
  }

  return (
    <main className="flex min-h-dvh flex-col bg-white dark:bg-gray-950">
      {/* Progress bar at top */}
      <div className="px-6 pt-14 pb-2">
        <div className="mx-auto max-w-sm">
          {/* Step indicator text */}
          <p className="text-center text-[13px] font-medium text-gray-400 dark:text-gray-500 mb-4">
            Step {step} of {TOTAL_STEPS}
          </p>
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2.5" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={TOTAL_STEPS} aria-label={`Step ${step} of ${TOTAL_STEPS}`}>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => {
              const s = i + 1;
              const isComplete = s < step;
              const isCurrent = s === step;
              return (
                <div
                  key={s}
                  aria-hidden="true"
                  className={`rounded-full transition-all duration-500 ${
                    isComplete
                      ? 'h-2 w-8 bg-brand-600'
                      : isCurrent
                        ? 'h-2.5 w-2.5 bg-brand-600 ring-4 ring-brand-100 dark:ring-brand-900/40'
                        : 'h-2 w-2 bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              );
            })}
          </div>
          {/* Step label */}
          <p className="mt-3 text-center text-[13px] font-medium text-brand-600 dark:text-brand-400 transition-all duration-300">
            {STEP_LABELS[step]}
          </p>
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-1 flex-col justify-center px-6 pb-12">
        <div className="mx-auto w-full max-w-sm" key={step}>
          <div className="step-enter">

            {/* -- Step 1: Business name + Trade -- */}
            {step === 1 && (
              <div>
                {/* Friendly icon */}
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/20">
                  <svg className="h-8 w-8 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                  </svg>
                </div>

                <h1 className="text-center text-[28px] font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  What&apos;s your business?
                </h1>
                <p className="mt-2 text-center text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
                  Let&apos;s get you set up in under a minute.
                </p>

                <div className="mt-10 space-y-6">
                  {error && (
                    <div role="alert" className="rounded-xl bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                      {error}
                    </div>
                  )}

                  <FormField label="Business Name" required error={fieldErrors.businessName} htmlFor="businessName">
                    <input
                      id="businessName"
                      type="text"
                      autoFocus
                      value={businessName}
                      onChange={(e) => { setBusinessName(e.target.value); setFieldErrors(prev => { const n = {...prev}; delete n.businessName; return n; }); }}
                      onKeyDown={(e) => e.key === 'Enter' && goNext()}
                      placeholder="Smith Roofing LLC"
                      className="input-field"
                    />
                  </FormField>

                  <div>
                    <label className="label">What trade?<span className="text-red-500 ml-0.5">*</span></label>
                    {fieldErrors.trade && (
                      <p role="alert" className="text-sm text-red-500 mb-2 animate-shake">
                        {fieldErrors.trade}
                      </p>
                    )}
                    <div className="grid grid-cols-4 gap-2">
                      {trades.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          aria-label={`Select ${t.label}`}
                          aria-pressed={tradeType === t.value}
                          onClick={() => {
                            setTradeType(t.value);
                            setFieldErrors(prev => { const n = {...prev}; delete n.trade; return n; });
                          }}
                          className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 transition-all duration-150 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 min-h-[76px] ${
                            tradeType === t.value
                              ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                              : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                          }`}
                        >
                          <div className={tradeType === t.value ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'}>
                            {t.icon}
                          </div>
                          <span className="text-[12px] font-semibold leading-tight text-center">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -- Step 2: Upload Logo (optional) -- */}
            {step === 2 && (
              <div>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/20">
                  <svg className="h-8 w-8 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21zM16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                </div>

                <h1 className="text-center text-[28px] font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  Add your logo
                </h1>
                <p className="mt-2 text-center text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
                  Your logo appears on quotes and invoices. You can always add this later.
                </p>

                <div className="mt-10 flex flex-col items-center">
                  {userId && (
                    <LogoUpload
                      currentLogoUrl={logoUrl}
                      userId={userId}
                      onUpload={(url) => setLogoUrl(url)}
                    />
                  )}
                  {logoUrl && (
                    <p className="mt-4 text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1.5">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Logo uploaded
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* -- Step 3: Default rate + Deposit -- */}
            {step === 3 && (
              <div>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/20">
                  <svg className="h-8 w-8 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <h1 className="text-center text-[28px] font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  Set your defaults
                </h1>
                <p className="mt-2 text-center text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
                  These apply to new quotes. You can adjust per quote anytime.
                </p>

                <div className="mt-10 space-y-6">
                  {/* Rate Type */}
                  <FormField label="Rate Type" htmlFor="onb-rateType">
                    <select
                      id="onb-rateType"
                      value={rateType}
                      onChange={(e) => setRateType(e.target.value)}
                      className="input-field"
                    >
                      <option value="hourly">Hourly ($/hr)</option>
                      <option value="per_square">Per Square ($/sq -- 100 sq ft)</option>
                      <option value="per_sqft">Per Square Foot ($/sq ft)</option>
                      <option value="per_linear_ft">Per Linear Foot ($/lin ft)</option>
                      <option value="flat_rate">Flat Rate ($/job)</option>
                    </select>
                  </FormField>

                  {/* Rate */}
                  <FormField label={rateType === 'hourly' ? 'Default Rate' : rateType === 'per_square' ? 'Rate per Square' : rateType === 'per_sqft' ? 'Rate per Sq Ft' : rateType === 'per_linear_ft' ? 'Rate per Linear Ft' : 'Flat Rate'} htmlFor="onb-rate">
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                        $
                      </span>
                      <input
                        id="onb-rate"
                        type="number"
                        min="0"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        placeholder="125"
                        className="input-field pl-8"
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm">
                        {rateType === 'hourly' ? '/hr' : rateType === 'per_square' ? '/sq' : rateType === 'per_sqft' ? '/sq ft' : rateType === 'per_linear_ft' ? '/lin ft' : '/job'}
                      </span>
                    </div>
                  </FormField>

                  {/* Deposit */}
                  <FormField label="Default Deposit %" htmlFor="onb-deposit">
                    <div className="relative">
                      <input
                        id="onb-deposit"
                        type="number"
                        min="0"
                        max="100"
                        value={depositPercent}
                        onChange={(e) => setDepositPercent(e.target.value)}
                        placeholder="50"
                        className="input-field pr-8"
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">%</span>
                    </div>
                  </FormField>
                </div>
              </div>
            )}

            {/* -- Step 4: You're all set -- */}
            {step === 4 && (
              <div className="text-center">
                <ConfettiOnMount />
                {/* Celebration icon */}
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
                  <svg className="h-10 w-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </div>

                <h1 className="text-[28px] font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  You&apos;re all set!
                </h1>
                <p className="mt-2 text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
                  Your account is ready. Create your first professional quote in seconds.
                </p>

                {/* Summary card */}
                <div className="mt-8 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5 text-left space-y-3">
                  <div className="flex items-center gap-3">
                    {logoUrl ? (
                      <img src={logoUrl} alt="" className="h-10 w-10 rounded-xl object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm font-bold">
                        {businessName.charAt(0).toUpperCase() || 'B'}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{businessName || 'Your Business'}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{tradeType || 'Contractor'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>${hourlyRate || '125'}{rateType === 'hourly' ? '/hr' : rateType === 'per_square' ? '/sq' : rateType === 'per_sqft' ? '/sq ft' : rateType === 'per_linear_ft' ? '/lin ft' : '/job'}</span>
                    <span>{depositPercent || '0'}% deposit</span>
                  </div>
                </div>

                {error && (
                  <div role="alert" className="mt-4 rounded-xl bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="sticky bottom-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 px-6 pb-10 pt-4">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
          {/* Primary action */}
          <div className="flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={goBack}
                className="flex-1 min-h-[44px] rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-3.5 text-[15px] font-semibold text-gray-700 dark:text-gray-300 transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
              >
                Back
              </button>
            )}
            {step < TOTAL_STEPS ? (
              <>
                <button
                  type="button"
                  onClick={goNext}
                  className={`${step > 1 ? 'flex-[2]' : 'w-full'} min-h-[44px] rounded-2xl bg-brand-600 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950`}
                >
                  {step === 1 ? 'Continue' : 'Next'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                disabled={loading}
                className="flex-[2] min-h-[44px] rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-brand-600/25 transition-all active:scale-[0.98] disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
              >
                {loading ? 'Setting up...' : 'Create Your First Quote'}
              </button>
            )}
          </div>

          {/* Skip button for optional steps */}
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-full min-h-[44px] py-2 text-[15px] font-medium text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Skip for now
            </button>
          )}
          {step === 3 && (
            <button
              type="button"
              onClick={() => setStep(4)}
              className="w-full min-h-[44px] py-2 text-[15px] font-medium text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
