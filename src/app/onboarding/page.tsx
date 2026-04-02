'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import FormField from '@/components/ui/FormField';
import type { TradeType } from '@/types/database';

const TOTAL_STEPS = 2;

interface FieldErrors {
  fullName?: string;
  businessName?: string;
  trade?: string;
}

const trades: { value: TradeType; label: string; icon: React.ReactNode }[] = [
  {
    value: 'plumber',
    label: 'Plumber',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
      </svg>
    ),
  },
  {
    value: 'electrician',
    label: 'Electrician',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    value: 'hvac',
    label: 'HVAC',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
      </svg>
    ),
  },
  {
    value: 'general',
    label: 'General Contractor',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
  {
    value: 'other',
    label: 'Other',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
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

  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [tradeType, setTradeType] = useState<TradeType | null>(null);
  const [hourlyRate, setHourlyRate] = useState('125');

  const goNext = useCallback(() => {
    const errors: FieldErrors = {};

    if (step === 1) {
      if (!fullName.trim()) {
        errors.fullName = 'Your name is required';
      }
      if (!businessName.trim()) {
        errors.businessName = 'Business name is required';
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
    }
    if (step === 2) {
      if (!tradeType) {
        setFieldErrors({ trade: 'Please select your trade' });
        return;
      }
    }

    setFieldErrors({});
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, [step, fullName, businessName, tradeType]);

  const goBack = useCallback(() => {
    setFieldErrors({});
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  async function handleComplete() {
    // Validate step 2 fields before completing
    if (!tradeType) {
      setFieldErrors({ trade: 'Please select your trade' });
      return;
    }

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
        full_name: fullName.trim() || null,
        business_name: businessName.trim() || null,
        trade_type: tradeType,
        hourly_rate: parseFloat(hourlyRate) || null,
        default_deposit_percent: 0,
        onboarded: true,
      })
      .eq('id', user.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  }

  return (
    <main className="flex min-h-dvh flex-col bg-white">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2.5 pt-14 pb-4 px-6" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={TOTAL_STEPS} aria-label={`Step ${step} of ${TOTAL_STEPS}`}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const s = i + 1;
          const isComplete = s < step;
          const isCurrent = s === step;
          return (
            <div
              key={s}
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                isComplete
                  ? 'bg-brand-600'
                  : isCurrent
                    ? 'bg-brand-600 ring-4 ring-brand-100'
                    : 'bg-gray-200'
              }`}
            />
          );
        })}
      </div>

      {/* Content area */}
      <div className="flex flex-1 flex-col justify-center px-6 pb-12">
        <div className="mx-auto w-full max-w-sm" key={step}>
          <div className="step-enter">
            {/* -- Step 1: Name & Business -- */}
            {step === 1 && (
              <div>
                <h1 className="text-[28px] font-bold tracking-tight text-gray-900">
                  What's your name?
                </h1>
                <p className="mt-2 text-[15px] leading-relaxed text-gray-500">
                  Let's get you set up in under a minute.
                </p>

                <div className="mt-10 space-y-5">
                  {error && (
                    <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <FormField label="Your Name" required error={fieldErrors.fullName} htmlFor="fullName">
                    <input
                      id="fullName"
                      type="text"
                      autoFocus
                      value={fullName}
                      onChange={(e) => { setFullName(e.target.value); setFieldErrors(prev => { const n = {...prev}; delete n.fullName; return n; }); }}
                      onKeyDown={(e) => e.key === 'Enter' && goNext()}
                      placeholder="John Smith"
                      className="input-field"
                    />
                  </FormField>

                  <FormField label="Business Name" required error={fieldErrors.businessName} htmlFor="businessName">
                    <input
                      id="businessName"
                      type="text"
                      value={businessName}
                      onChange={(e) => { setBusinessName(e.target.value); setFieldErrors(prev => { const n = {...prev}; delete n.businessName; return n; }); }}
                      onKeyDown={(e) => e.key === 'Enter' && goNext()}
                      placeholder="Smith Plumbing LLC"
                      className="input-field"
                    />
                  </FormField>
                </div>
              </div>
            )}

            {/* -- Step 2: Trade & Hourly Rate -- */}
            {step === 2 && (
              <div>
                <h1 className="text-[28px] font-bold tracking-tight text-gray-900">
                  What's your trade?
                </h1>
                <p className="mt-2 text-[15px] leading-relaxed text-gray-500">
                  Almost done! This helps our AI generate accurate quotes for your trade.
                </p>

                <div className="mt-10 space-y-6">
                  {fieldErrors.trade && (
                    <p role="alert" className="text-sm text-red-500 animate-shake">
                      {fieldErrors.trade}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {trades.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => {
                          setTradeType(t.value);
                          setFieldErrors({});
                        }}
                        className={`flex flex-col items-center gap-2.5 rounded-2xl border-2 p-5 transition-all duration-150 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                          tradeType === t.value
                            ? 'border-brand-600 bg-brand-50 text-brand-700'
                            : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                        }`}
                      >
                        <div className={tradeType === t.value ? 'text-brand-600' : 'text-gray-400'}>
                          {t.icon}
                        </div>
                        <span className="text-[14px] font-semibold">{t.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Hourly Rate */}
                  <div>
                    <label htmlFor="hourlyRate" className="label">
                      Hourly Labor Rate
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                        $
                      </span>
                      <input
                        id="hourlyRate"
                        type="number"
                        min="0"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        className="input-field pl-8"
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm">
                        /hr
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500">
                      You can always adjust this per quote.
                    </p>
                  </div>

                  {error && (
                    <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-6 pb-10 pt-4">
        <div className="mx-auto flex w-full max-w-sm gap-3">
          {step > 1 ? (
            <button
              onClick={goBack}
              className="flex-1 rounded-2xl border border-gray-200 bg-white py-3.5 text-[15px] font-semibold text-gray-700 transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Back
            </button>
          ) : (
            <div className="flex-1" />
          )}
          {step < TOTAL_STEPS ? (
            <button
              onClick={goNext}
              className="flex-[2] rounded-2xl bg-brand-600 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex-[2] rounded-2xl bg-brand-600 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              {loading ? 'Setting up...' : 'Get Started'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
