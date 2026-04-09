'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogoUpload } from '@/components/LogoUpload';
import { StripeConnectButton } from '@/components/StripeConnectButton';
import PhoneInput from '@/components/ui/PhoneInput';
import FormField from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import type { User } from '@/types/database';
import { TeamSection } from './TeamSection';
import { LeadIntegrationsSection } from './LeadIntegrationsSection';
import { DeleteAccountButton } from '@/components/DeleteAccountButton';

interface Props {
  profile: User;
  userId: string;
  email: string;
  stripeConnected: boolean;
  stripeStatus?: string | null;
}

// Grouped navigation — iOS-style section list
const SECTIONS = [
  {
    group: 'Business',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
    tabs: ['Account', 'Profile', 'Branding'] as const,
  },
  {
    group: 'Features',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    tabs: ['Pricing', 'Automation'] as const,
  },
  {
    group: 'Connected Apps',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
    tabs: ['Payments', 'Team', 'Integrations', 'Advanced'] as const,
  },
] as const;

type Tab = typeof SECTIONS[number]['tabs'][number];

export function SettingsForm({ profile, userId, email, stripeConnected, stripeStatus }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('Account');
  const [saving, setSaving] = useState(false);

  // Account tab state
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailUpdating, setEmailUpdating] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);

  // Cooldown timer for email change rate limiting
  useEffect(() => {
    if (emailCooldown <= 0) return;
    const timer = setInterval(() => {
      setEmailCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [emailCooldown]);

  const handleEmailUpdate = useCallback(async () => {
    if (!newEmail.trim() || emailCooldown > 0) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError(null);
    setEmailSuccess(false);
    setEmailUpdating(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) {
        setEmailError(error.message);
      } else {
        setEmailSuccess(true);
        setEmailCooldown(60);
      }
    } catch {
      setEmailError('Something went wrong. Please try again.');
    } finally {
      setEmailUpdating(false);
    }
  }, [newEmail, emailCooldown]);

  const [saved, setSaved] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(profile?.logo_url || null);
  const [businessName, setBusinessName] = useState(profile?.business_name || '');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [tradeType, setTradeType] = useState<import('@/types/database').TradeType>(profile?.trade_type || 'general');
  const [hourlyRate, setHourlyRate] = useState(String(profile?.hourly_rate || '125'));
  const [rateType, setRateType] = useState<import('@/types/database').RateType>(profile?.rate_type || 'hourly');
  const [depositPercent, setDepositPercent] = useState(String(profile?.default_deposit_percent ?? '0'));
  const [defaultTaxRate, setDefaultTaxRate] = useState(String(profile?.default_tax_rate ?? ''));
  const [profileSlug, setProfileSlug] = useState(profile?.profile_slug || '');
  const [profileBio, setProfileBio] = useState(profile?.profile_bio || '');
  const [profilePublic, setProfilePublic] = useState(profile?.profile_public || false);
  const [brandColor, setBrandColor] = useState(profile?.brand_color || '');
  const [customHex, setCustomHex] = useState('');
  const [webhookUrl, setWebhookUrl] = useState(profile?.webhook_url || '');
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [autoFollowUp, setAutoFollowUp] = useState(profile?.auto_follow_up || false);
  const [followUpTemplates, setFollowUpTemplates] = useState<string[]>(
    profile?.follow_up_templates || [
      "Hey {{name}}, just checking if you saw your quote. Let me know if you have any questions!",
      "Hi {{name}}, we have an opening this week if you'd like to move forward. Would love to get you on the schedule!",
      "Hey {{name}}, just wanted to follow up — happy to adjust anything if needed or get you scheduled.",
    ]
  );
  const [businessEmail, setBusinessEmail] = useState(profile?.business_email || '');
  const [googlePlaceId, setGooglePlaceId] = useState(profile?.google_place_id || '');
  const [showReviewsOnQuotes, setShowReviewsOnQuotes] = useState(profile?.show_reviews_on_quotes ?? true);
  const [fetchingReviews, setFetchingReviews] = useState(false);
  const [reviewsFetched, setReviewsFetched] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ businessName?: string; webhookUrl?: string }>({});

  // Track dirty state for unsaved changes indicator
  const initialValues = useRef({
    businessName: profile?.business_name || '',
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
    tradeType: profile?.trade_type || 'general',
    hourlyRate: String(profile?.hourly_rate || '125'),
    rateType: profile?.rate_type || 'hourly',
    depositPercent: String(profile?.default_deposit_percent ?? '0'),
    defaultTaxRate: String(profile?.default_tax_rate ?? ''),
    profileSlug: profile?.profile_slug || '',
    profileBio: profile?.profile_bio || '',
    profilePublic: profile?.profile_public || false,
    brandColor: profile?.brand_color || '',
    webhookUrl: profile?.webhook_url || '',
    autoFollowUp: profile?.auto_follow_up || false,
    businessEmail: profile?.business_email || '',
    googlePlaceId: profile?.google_place_id || '',
    showReviewsOnQuotes: profile?.show_reviews_on_quotes ?? true,
  });

  const isDirty = useMemo(() => {
    const iv = initialValues.current;
    return (
      businessName !== iv.businessName ||
      fullName !== iv.fullName ||
      phone !== iv.phone ||
      tradeType !== iv.tradeType ||
      hourlyRate !== iv.hourlyRate ||
      rateType !== iv.rateType ||
      depositPercent !== iv.depositPercent ||
      defaultTaxRate !== iv.defaultTaxRate ||
      profileSlug !== iv.profileSlug ||
      profileBio !== iv.profileBio ||
      profilePublic !== iv.profilePublic ||
      brandColor !== iv.brandColor ||
      webhookUrl !== iv.webhookUrl ||
      autoFollowUp !== iv.autoFollowUp ||
      businessEmail !== iv.businessEmail ||
      googlePlaceId !== iv.googlePlaceId ||
      showReviewsOnQuotes !== iv.showReviewsOnQuotes
    );
  }, [businessName, fullName, phone, tradeType, hourlyRate, rateType, depositPercent, defaultTaxRate, profileSlug, profileBio, profilePublic, brandColor, webhookUrl, autoFollowUp, businessEmail, googlePlaceId, showReviewsOnQuotes]);

  function isValidUrl(str: string): boolean {
    try {
      const url = new URL(str);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  const BRAND_PRESETS = [
    { name: 'Indigo', hex: '#4f46e5' },
    { name: 'Blue', hex: '#2563eb' },
    { name: 'Green', hex: '#16a34a' },
    { name: 'Red', hex: '#dc2626' },
    { name: 'Orange', hex: '#ea580c' },
    { name: 'Pink', hex: '#db2777' },
    { name: 'Purple', hex: '#7c3aed' },
    { name: 'Teal', hex: '#0d9488' },
  ] as const;

  const activeBrandColor = brandColor || '#4f46e5';

  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSave() {
    const errors: { businessName?: string; webhookUrl?: string } = {};
    if (!businessName.trim()) errors.businessName = 'Business name is required';
    if (webhookUrl.trim() && !isValidUrl(webhookUrl.trim())) errors.webhookUrl = 'Enter a valid URL (https://...)';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      if (errors.businessName) setActiveTab('Profile');
      else if (errors.webhookUrl) setActiveTab('Advanced');
      return;
    }
    setFieldErrors({});
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from('users')
      .update({
        business_name: businessName,
        full_name: fullName,
        phone: phone.trim() || null,
        trade_type: tradeType,
        hourly_rate: parseFloat(hourlyRate) || 0,
        rate_type: rateType,
        default_deposit_percent: parseInt(depositPercent) || 0,
        default_tax_rate: defaultTaxRate.trim() !== '' ? parseFloat(defaultTaxRate) || 0 : null,
        profile_slug: profileSlug.trim() || null,
        profile_bio: profileBio.trim() || null,
        profile_public: profilePublic,
        business_email: businessEmail.trim() || null,
        webhook_url: webhookUrl.trim() || null,
        brand_color: brandColor.trim() || null,
        auto_follow_up: autoFollowUp,
        follow_up_templates: followUpTemplates,
        google_place_id: googlePlaceId.trim() || null,
        show_reviews_on_quotes: showReviewsOnQuotes,
      })
      .eq('id', userId);
    setSaving(false);
    if (error) {
      setSaveError(error.message);
      return;
    }
    // Update initial values so isDirty resets
    initialValues.current = {
      businessName, fullName, phone, tradeType, hourlyRate, rateType,
      depositPercent, defaultTaxRate, profileSlug, profileBio, profilePublic,
      brandColor, webhookUrl, autoFollowUp, businessEmail, googlePlaceId, showReviewsOnQuotes,
    };
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  }

  // Find which group the active tab is in
  const activeGroup = SECTIONS.find((s) => (s.tabs as readonly string[]).includes(activeTab))?.group || 'Business';

  return (
    <div className="space-y-4">
      {/* Section Group Selector — always visible, no overflow */}
      <div className="grid grid-cols-3 gap-2">
        {SECTIONS.map((section) => (
          <button
            key={section.group}
            type="button"
            aria-label={`${section.group} settings`}
            aria-pressed={activeGroup === section.group}
            onClick={() => setActiveTab(section.tabs[0])}
            className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 px-3 py-3 min-h-[44px] transition-all active:scale-[0.97] ${
              activeGroup === section.group
                ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
            }`}
          >
            <span className={activeGroup === section.group ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'}>{section.icon}</span>
            <span className="text-[12px] font-semibold">{section.group}</span>
          </button>
        ))}
      </div>

      {/* Sub-tabs within the active group */}
      {(() => {
        const section = SECTIONS.find((s) => s.group === activeGroup);
        if (!section || section.tabs.length <= 1) return null;
        return (
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {section.tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-3 py-2 min-h-[44px] text-[13px] font-medium rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-gray-100 font-semibold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        );
      })()}

      {/* Account Tab */}
      {activeTab === 'Account' && (
        <div className="card space-y-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Account</p>

          <FormField label="Login Email" htmlFor="account-email">
            {!editingEmail ? (
              <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
                <span className="text-base text-gray-900 dark:text-gray-100">{email}</span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingEmail(true);
                    setNewEmail('');
                    setEmailError(null);
                    setEmailSuccess(false);
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Edit email"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-xs text-gray-400">
                  <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  Current: {email}
                </div>

                <FormField label="New Email Address" htmlFor="newEmail">
                  <input
                    id="newEmail"
                    type="email"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      setEmailError(null);
                    }}
                    placeholder="newemail@example.com"
                    className="input-field"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEmailUpdate();
                      if (e.key === 'Escape') setEditingEmail(false);
                    }}
                  />
                </FormField>

                <p className="text-xs text-gray-400 dark:text-gray-500">
                  A confirmation link will be sent to your new email.
                </p>

                {emailError && (
                  <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-[13px] font-medium text-red-700 dark:text-red-400">
                    {emailError}
                  </div>
                )}

                {emailSuccess && (
                  <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-3 py-2 text-[13px] font-medium text-green-700 dark:text-green-400">
                    Check your new email inbox for a confirmation link
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEmail(false);
                      setNewEmail('');
                      setEmailError(null);
                      setEmailSuccess(false);
                    }}
                    className="flex-1 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-2.5 text-[13px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors press-scale"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleEmailUpdate}
                    disabled={!newEmail.trim() || emailUpdating || emailCooldown > 0}
                    className="flex-1 rounded-2xl bg-brand-600 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors press-scale"
                  >
                    {emailUpdating ? (
                      <span className="flex items-center justify-center gap-2">
                        <Spinner size="sm" />
                        Updating...
                      </span>
                    ) : emailCooldown > 0 ? (
                      `Wait ${emailCooldown}s`
                    ) : (
                      'Update Email'
                    )}
                  </button>
                </div>
              </div>
            )}
          </FormField>
        </div>
      )}

      {/* Team Tab */}
      {activeTab === 'Team' && <TeamSection />}

      {/* Profile Tab */}
      {activeTab === 'Profile' && (
        <>
          {/* Logo */}
          <div className="card flex flex-col items-center py-6">
            <LogoUpload
              currentLogoUrl={logoUrl}
              userId={userId}
              onUpload={(url) => setLogoUrl(url)}
            />
            <p className="mt-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
              {businessName || 'Your Business'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{email}</p>
          </div>

          {/* Business Info */}
          <div className="card space-y-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Business Info</p>

            <FormField label="Business Name" required error={fieldErrors.businessName} htmlFor="businessName">
              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => { setBusinessName(e.target.value); setFieldErrors(prev => { const n = {...prev}; delete n.businessName; return n; }); }}
                placeholder="Smith Plumbing LLC"
                className="input-field"
              />
            </FormField>

            <FormField label="Your Name" htmlFor="fullName">
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
                className="input-field"
              />
            </FormField>

            <FormField label="Phone Number" htmlFor="phone">
              <PhoneInput
                value={phone}
                onChange={setPhone}
              />
            </FormField>

            <div>
              <FormField label="Business Email" htmlFor="businessEmail">
                <input
                  id="businessEmail"
                  type="email"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  placeholder="billing@yourbusiness.com"
                  className="input-field"
                />
              </FormField>
              <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                This email appears on your quotes. Leave blank to use your login email.
              </p>
              {/* Customer-facing preview */}
              <div className="mt-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 px-4 py-3">
                <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1">Customers will see</p>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {businessEmail.trim() || email}
                  </span>
                </div>
              </div>
            </div>

            <FormField label="Trade" htmlFor="tradeType">
              <select
                id="tradeType"
                value={tradeType}
                onChange={(e) => setTradeType(e.target.value as import('@/types/database').TradeType)}
                className="input-field"
              >
                <option value="roofing">Roofing</option>
                <option value="plumber">Plumber</option>
                <option value="hvac">HVAC</option>
                <option value="electrician">Electrician</option>
                <option value="painter">Painter</option>
                <option value="landscaper">Landscaper</option>
                <option value="general">General Contractor</option>
                <option value="other">Other</option>
              </select>
            </FormField>
          </div>

          {/* Reviews Integration */}
          <div className="card space-y-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Reviews</p>

            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Show reviews on quotes</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Display your Google reviews on every proposal you send</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showReviewsOnQuotes}
                aria-label="Show reviews on quotes"
                onClick={() => setShowReviewsOnQuotes(!showReviewsOnQuotes)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  showReviewsOnQuotes ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                  showReviewsOnQuotes ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <FormField label="Google Place ID" htmlFor="googlePlaceId">
              <input
                id="googlePlaceId"
                type="text"
                value={googlePlaceId}
                onChange={(e) => setGooglePlaceId(e.target.value)}
                placeholder="ChIJ..."
                className="input-field"
              />
            </FormField>
            <p className="-mt-3 text-xs text-gray-400 dark:text-gray-500">
              Find your Place ID at{' '}
              <a href="https://developers.google.com/maps/documentation/places/web-service/place-id" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                Google Place ID Finder
              </a>
            </p>

            {googlePlaceId.trim() && (
              <button
                type="button"
                onClick={async () => {
                  setFetchingReviews(true);
                  setReviewsFetched(false);
                  try {
                    const res = await fetch(`/api/reviews/sync-google`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ google_place_id: googlePlaceId.trim() }),
                    });
                    if (res.ok) {
                      setReviewsFetched(true);
                      setTimeout(() => setReviewsFetched(false), 3000);
                    }
                  } catch {
                    // Sync failed silently — user can retry
                  } finally {
                    setFetchingReviews(false);
                  }
                }}
                disabled={fetchingReviews}
                className="flex items-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {fetchingReviews ? (
                  <>
                    <Spinner size="sm" />
                    Fetching reviews...
                  </>
                ) : reviewsFetched ? (
                  <>
                    <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Reviews synced!
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                    </svg>
                    Sync Google Reviews
                  </>
                )}
              </button>
            )}
          </div>
        </>
      )}

      {/* Pricing Tab */}
      {activeTab === 'Pricing' && (
        <div className="card space-y-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Pricing Defaults</p>

          <FormField label="Rate Type" htmlFor="rateType">
            <select
              id="rateType"
              value={rateType}
              onChange={(e) => setRateType(e.target.value as import('@/types/database').RateType)}
              className="input-field"
            >
              <option value="hourly">Hourly ($/hr)</option>
              <option value="per_square">Per Square ($/sq -- 100 sq ft)</option>
              <option value="per_sqft">Per Square Foot ($/sq ft)</option>
              <option value="per_linear_ft">Per Linear Foot ($/lin ft)</option>
              <option value="flat_rate">Flat Rate ($/job)</option>
            </select>
          </FormField>

          <FormField label={rateType === 'hourly' ? 'Hourly Rate' : rateType === 'per_square' ? 'Rate per Square' : rateType === 'per_sqft' ? 'Rate per Sq Ft' : rateType === 'per_linear_ft' ? 'Rate per Linear Ft' : 'Flat Rate'} htmlFor="hourlyRate">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">$</span>
              <input
                id="hourlyRate"
                type="number"
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

          <FormField label="Default Deposit %" htmlFor="depositPercent">
            <div className="relative">
              <input
                id="depositPercent"
                type="number"
                min="0"
                max="100"
                value={depositPercent}
                onChange={(e) => setDepositPercent(e.target.value)}
                placeholder="0"
                className="input-field pr-8"
              />
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">%</span>
            </div>
          </FormField>

          <div>
            <FormField label="Default Tax Rate (%)" htmlFor="defaultTaxRate">
              <div className="relative">
                <input
                  id="defaultTaxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={defaultTaxRate}
                  onChange={(e) => setDefaultTaxRate(e.target.value)}
                  placeholder="0"
                  className="input-field pr-8"
                />
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">%</span>
              </div>
            </FormField>
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">Leave blank for no tax. Applied to new quotes by default.</p>
          </div>
        </div>
      )}

      {/* Branding Tab */}
      {activeTab === 'Branding' && (
        <>
          {/* Brand Color */}
          <div className="card space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Brand Color</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Choose your accent color for customer-facing pages, emails, and PDFs.</p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {BRAND_PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => { setBrandColor(preset.hex); setCustomHex(''); }}
                  className={`relative flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all press-scale mx-auto ${
                    activeBrandColor === preset.hex
                      ? 'border-gray-900 dark:border-white ring-2 ring-offset-2 ring-gray-900/20 dark:ring-white/20 dark:ring-offset-gray-900'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: preset.hex }}
                  title={preset.name}
                >
                  {activeBrandColor === preset.hex && (
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <FormField label="Custom Hex" htmlFor="customHex">
              <div className="flex items-center gap-3">
                <div
                  className="h-11 w-11 shrink-0 rounded-full border border-gray-200 dark:border-gray-700"
                  style={{ backgroundColor: activeBrandColor }}
                />
                <input
                  id="customHex"
                  type="text"
                  value={customHex || (BRAND_PRESETS.some(p => p.hex === brandColor) ? '' : brandColor)}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (val && !val.startsWith('#')) val = '#' + val;
                    setCustomHex(val);
                    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                      setBrandColor(val.toLowerCase());
                    }
                  }}
                  placeholder="#4f46e5"
                  className="input-field"
                  maxLength={7}
                />
              </div>
            </FormField>

            {/* Preview */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Preview</p>
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-3">
                <div className="h-1.5 rounded-full" style={{ backgroundColor: activeBrandColor }} />
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: activeBrandColor, opacity: 0.15 }} />
                  <div className="flex-1">
                    <div className="h-2.5 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="mt-1.5 h-2 w-36 rounded bg-gray-100 dark:bg-gray-800" />
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full rounded-xl py-2.5 text-[13px] font-semibold text-white transition-colors"
                  style={{ backgroundColor: activeBrandColor }}
                >
                  Accept & Sign
                </button>
              </div>
            </div>
          </div>

          {/* Public Profile */}
          <div className="card space-y-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Public Profile</p>

            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-gray-900 dark:text-gray-100">Show profile publicly</p>
                <p className="text-[12px] text-gray-400 dark:text-gray-500">Allow customers to find your profile page</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={profilePublic}
                aria-label="Show profile publicly"
                onClick={() => setProfilePublic(!profilePublic)}
                className={`toggle-switch relative inline-flex h-7 w-12 shrink-0 rounded-full ${
                  profilePublic ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`toggle-dot inline-block h-5 w-5 transform rounded-full bg-white shadow-sm mt-1 ${
                    profilePublic ? 'translate-x-6 ml-0.5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <FormField label="Profile URL" htmlFor="profileSlug">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[12px] text-gray-400">
                    snapquote.dev/p/
                  </span>
                  <input
                    id="profileSlug"
                    type="text"
                    value={profileSlug}
                    onChange={(e) =>
                      setProfileSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, '-')
                          .replace(/-+/g, '-')
                      )
                    }
                    placeholder="your-business"
                    className="input-field pl-[108px]"
                  />
                </div>
                {!profileSlug && businessName && (
                  <button
                    type="button"
                    onClick={() =>
                      setProfileSlug(
                        businessName
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-|-$/g, '')
                      )
                    }
                    className="shrink-0 rounded-xl bg-gray-100 dark:bg-gray-800 px-3 py-2.5 text-[12px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Auto
                  </button>
                )}
              </div>
            </FormField>

            <FormField label="Bio / Description" htmlFor="profileBio">
              <textarea
                id="profileBio"
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                placeholder="Tell customers about your business, experience, and what makes you different..."
                rows={3}
                className="input-field resize-none"
              />
            </FormField>

            {profileSlug && profilePublic && (
              <a
                href={`/p/${profileSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-800 px-4 py-2.5 text-[13px] font-medium text-brand-700 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                View Public Profile
              </a>
            )}
          </div>
        </>
      )}

      {/* Payments Tab */}
      {activeTab === 'Payments' && (
        <div className="card space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Payments</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Connect Stripe to collect deposits online directly from your quotes.</p>
          </div>

          {/* Status indicator */}
          <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
            stripeConnected
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
          }`}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${
              stripeConnected ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}>
              {stripeConnected ? (
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div>
              <p className={`text-sm font-semibold ${stripeConnected ? 'text-green-900 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'}`}>
                {stripeConnected ? 'Stripe Connected' : 'Not Connected'}
              </p>
              <p className={`text-xs ${stripeConnected ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {stripeConnected ? 'Customers can pay deposits online' : 'Set up Stripe to accept online payments'}
              </p>
            </div>
          </div>

          {stripeStatus === 'connected' && (
            <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-3 py-2 text-[13px] font-medium text-green-700 dark:text-green-400">
              Stripe connected successfully!
            </div>
          )}
          {stripeStatus === 'error' && (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-[13px] font-medium text-red-700 dark:text-red-400">
              Connection failed. Please try again.
            </div>
          )}

          {/* Step-by-step if not connected */}
          {!stripeConnected && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">How it works</p>
              {[
                { step: 1, text: 'Click the button below to connect your Stripe account' },
                { step: 2, text: 'Complete setup on Stripe (takes about 5 minutes)' },
                { step: 3, text: 'Customers can pay deposits right from their quote' },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30 text-[11px] font-bold text-brand-700 dark:text-brand-300">
                    {item.step}
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 pt-0.5">{item.text}</p>
                </div>
              ))}
            </div>
          )}

          <StripeConnectButton isConnected={stripeConnected} />
        </div>
      )}

      {/* Automation Tab */}
      {activeTab === 'Automation' && (
        <div className="space-y-4">
          {/* Toggle Card */}
          <div className="card space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Auto Follow-Ups</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Automatically send reminders to customers who haven&apos;t responded to their quote. Increase your win rate without lifting a finger.
              </p>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-gray-900 dark:text-gray-100">Enable auto follow-ups</p>
                <p className="text-[12px] text-gray-400 dark:text-gray-500">Sends up to 3 reminders via SMS or email</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoFollowUp}
                aria-label="Enable auto follow-ups"
                onClick={() => setAutoFollowUp(!autoFollowUp)}
                className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors ${
                  autoFollowUp ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm mt-1 transition-transform ${
                    autoFollowUp ? 'translate-x-6 ml-0.5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Templates */}
          <div className={`space-y-3 transition-opacity ${autoFollowUp ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            {[
              { label: 'Day 1 message', timing: 'Sent 24 hours after quote', index: 0 },
              { label: 'Day 3 message', timing: 'Sent 3 days after quote', index: 1 },
              { label: 'Day 5 message', timing: 'Sent 5 days after quote', index: 2 },
            ].map((item) => (
              <div key={item.index} className="card space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30 text-[12px] font-bold text-brand-700 dark:text-brand-300">
                    {item.index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">{item.label}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">{item.timing}</p>
                  </div>
                </div>
                <textarea
                  value={followUpTemplates[item.index] || ''}
                  onChange={(e) => {
                    const updated = [...followUpTemplates];
                    updated[item.index] = e.target.value;
                    setFollowUpTemplates(updated);
                  }}
                  rows={3}
                  className="input-field resize-none text-[13px]"
                  placeholder={
                    item.index === 0
                      ? "Hey {{name}}, just checking if you saw your quote. Let me know if you have any questions!"
                      : item.index === 1
                      ? "Hi {{name}}, we have an opening this week if you'd like to move forward. Would love to get you on the schedule!"
                      : "Hey {{name}}, just wanted to follow up — happy to adjust anything if needed or get you scheduled."
                  }
                />
                {/* Preview */}
                {followUpTemplates[item.index] && (
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 px-3 py-2">
                    <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1">Preview</p>
                    <p className="text-[12px] text-gray-600 dark:text-gray-300 leading-relaxed">
                      {followUpTemplates[item.index]
                        .replace(/\{\{name\}\}/g, 'John')
                        .replace(/\{\{business\}\}/g, businessName || 'Your Business')}
                    </p>
                  </div>
                )}
              </div>
            ))}

            <p className="text-[11px] text-gray-400 dark:text-gray-500 px-1">
              Use <code className="rounded bg-gray-100 dark:bg-gray-800 px-1 py-0.5 text-[10px] font-mono">{'{{name}}'}</code> for customer name, <code className="rounded bg-gray-100 dark:bg-gray-800 px-1 py-0.5 text-[10px] font-mono">{'{{business}}'}</code> for your business name. A link to the quote is included automatically.
            </p>
          </div>
        </div>
      )}

      {/* Lead Sources Tab */}
      {activeTab === 'Integrations' && <LeadIntegrationsSection />}

      {/* Advanced Tab */}
      {activeTab === 'Advanced' && (
        <div className="card space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Webhooks & Integrations</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Webhooks send automatic notifications to external services when quote events occur. Most users don&apos;t need this.
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Works with Zapier, Make, or any webhook endpoint.
            </p>
          </div>

          <FormField label="Webhook URL" error={fieldErrors.webhookUrl} htmlFor="webhookUrl">
            <input
              id="webhookUrl"
              type="url"
              value={webhookUrl}
              onChange={(e) => {
                setWebhookUrl(e.target.value);
                setWebhookTestResult(null);
                setFieldErrors(prev => { const n = {...prev}; delete n.webhookUrl; return n; });
              }}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              className="input-field"
            />
          </FormField>

          {webhookTestResult && (
            <div
              className={`rounded-xl border px-3 py-2 text-[13px] font-medium ${
                webhookTestResult.ok
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
              }`}
            >
              {webhookTestResult.message}
            </div>
          )}

          <button
            type="button"
            disabled={!webhookUrl.trim() || testingWebhook}
            onClick={async () => {
              setTestingWebhook(true);
              setWebhookTestResult(null);
              const supabase = createClient();
              await supabase
                .from('users')
                .update({ webhook_url: webhookUrl.trim() || null })
                .eq('id', userId);
              try {
                const res = await fetch('/api/webhooks/test', { method: 'POST' });
                const json = await res.json();
                if (res.ok) {
                  setWebhookTestResult({ ok: true, message: 'Test webhook sent successfully!' });
                } else {
                  setWebhookTestResult({ ok: false, message: json.error || 'Test failed' });
                }
              } catch {
                setWebhookTestResult({ ok: false, message: 'Network error — could not reach server.' });
              }
              setTestingWebhook(false);
            }}
            className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-2.5 text-[13px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors press-scale"
          >
            {testingWebhook ? 'Sending...' : 'Test Webhook'}
          </button>
        </div>
      )}

      {/* Save Error */}
      {saveError && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-[13px] font-medium text-red-700 dark:text-red-400" role="alert">
          Save failed: {saveError}
        </div>
      )}

      {/* Sticky Save Bar */}
      <div className="sticky bottom-0 z-20 -mx-4 px-4 pb-4 pt-3 bg-gradient-to-t from-gray-50 via-gray-50 to-gray-50/0 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950/0">
        {/* Unsaved changes indicator */}
        {isDirty && !saved && (
          <p className="text-center text-xs font-medium text-amber-600 dark:text-amber-400 mb-2">
            You have unsaved changes
          </p>
        )}

        {/* Success toast */}
        {saved && (
          <div className="mb-2 flex items-center justify-center gap-2 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-2 text-[13px] font-medium text-green-700 dark:text-green-400 step-enter">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Settings saved
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || (!isDirty && !saving)}
          className={`btn-primary transition-all ${saved ? '!bg-green-600' : ''} ${!isDirty && !saving ? 'opacity-50' : ''}`}
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="md" />
              Saving...
            </span>
          ) : saved ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Saved
            </span>
          ) : 'Save Changes'}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="card space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-red-500 dark:text-red-400">Danger Zone</p>
        <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
          Permanently delete your account and all associated data including quotes, clients, invoices, and calendar events.
        </p>
        <DeleteAccountButton />
      </div>

      {/* Sign Out */}
      <button
        onClick={async () => {
          const supabase = createClient();
          await supabase.auth.signOut();
          router.push('/auth/login');
        }}
        className="w-full rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 py-3 text-[14px] font-semibold text-red-600 dark:text-red-400 press-scale"
      >
        Sign Out
      </button>
    </div>
  );
}
