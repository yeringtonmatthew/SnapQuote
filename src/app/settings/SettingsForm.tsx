'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogoUpload } from '@/components/LogoUpload';
import { StripeConnectButton } from '@/components/StripeConnectButton';
import PhoneInput from '@/components/ui/PhoneInput';
import FormField from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';

interface Props {
  profile: any;
  userId: string;
  email: string;
  stripeConnected: boolean;
  stripeStatus?: string | null;
}

const TABS = ['Profile', 'Pricing', 'Branding', 'Payments', 'Advanced'] as const;
type Tab = typeof TABS[number];

export function SettingsForm({ profile, userId, email, stripeConnected, stripeStatus }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('Profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(profile?.logo_url || null);
  const [businessName, setBusinessName] = useState(profile?.business_name || '');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [tradeType, setTradeType] = useState(profile?.trade_type || 'general');
  const [hourlyRate, setHourlyRate] = useState(String(profile?.hourly_rate || '125'));
  const [depositPercent, setDepositPercent] = useState(String(profile?.default_deposit_percent || '33'));
  const [defaultTaxRate, setDefaultTaxRate] = useState(String(profile?.default_tax_rate ?? ''));
  const [profileSlug, setProfileSlug] = useState(profile?.profile_slug || '');
  const [profileBio, setProfileBio] = useState(profile?.profile_bio || '');
  const [profilePublic, setProfilePublic] = useState(profile?.profile_public || false);
  const [brandColor, setBrandColor] = useState(profile?.brand_color || '');
  const [customHex, setCustomHex] = useState('');
  const [webhookUrl, setWebhookUrl] = useState(profile?.webhook_url || '');
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ businessName?: string; webhookUrl?: string }>({});

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
      // Switch to the tab that has the error
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
        phone,
        trade_type: tradeType,
        hourly_rate: parseFloat(hourlyRate) || 0,
        default_deposit_percent: parseInt(depositPercent) || 33,
        default_tax_rate: defaultTaxRate.trim() !== '' ? parseFloat(defaultTaxRate) || 0 : null,
        profile_slug: profileSlug.trim() || null,
        profile_bio: profileBio.trim() || null,
        profile_public: profilePublic,
        webhook_url: webhookUrl.trim() || null,
        brand_color: brandColor.trim() || null,
      })
      .eq('id', userId);
    setSaving(false);
    if (error) {
      console.error('[settings] Save error:', error);
      setSaveError(error.message);
      return;
    }
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-4 py-2 text-[13px] font-medium rounded-lg transition-all ${
              activeTab === tab
                ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-gray-100 font-semibold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

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
            <p className="text-xs text-gray-400">{email}</p>
          </div>

          {/* Business Info */}
          <div className="card space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Business</p>

            <FormField label="Business Name" required error={fieldErrors.businessName}>
              <input
                type="text"
                value={businessName}
                onChange={(e) => { setBusinessName(e.target.value); setFieldErrors(prev => { const n = {...prev}; delete n.businessName; return n; }); }}
                placeholder="Smith Plumbing LLC"
                className="input-field"
              />
            </FormField>

            <div>
              <label className="label">Your Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Phone Number</label>
              <PhoneInput
                value={phone}
                onChange={setPhone}
              />
            </div>

            <div>
              <label className="label">Trade</label>
              <select
                value={tradeType}
                onChange={(e) => setTradeType(e.target.value)}
                className="input-field"
              >
                <option value="plumber">Plumber</option>
                <option value="hvac">HVAC</option>
                <option value="electrician">Electrician</option>
                <option value="general">General Contractor</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* Pricing Tab */}
      {activeTab === 'Pricing' && (
        <div className="card space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Pricing Defaults</p>

          <div>
            <label className="label">Hourly Labor Rate</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">$</span>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="input-field pl-8"
              />
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">/hr</span>
            </div>
          </div>

          <div>
            <label className="label">Default Deposit %</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={depositPercent}
                onChange={(e) => setDepositPercent(e.target.value)}
                className="input-field pr-8"
              />
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">%</span>
            </div>
          </div>

          <div>
            <label className="label">Default Tax Rate (%)</label>
            <div className="relative">
              <input
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
            <p className="mt-1 text-xs text-gray-400">Leave blank for no tax. Applied to new quotes by default.</p>
          </div>
        </div>
      )}

      {/* Branding Tab */}
      {activeTab === 'Branding' && (
        <>
          {/* Brand Color */}
          <div className="card space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Brand Color</p>
              <p className="mt-1 text-xs text-gray-500">Choose your accent color for customer-facing pages, emails, and PDFs.</p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {BRAND_PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => { setBrandColor(preset.hex); setCustomHex(''); }}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all press-scale"
                  style={{
                    backgroundColor: preset.hex,
                    borderColor: activeBrandColor === preset.hex ? '#111827' : 'transparent',
                  }}
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

            <div>
              <label className="label">Custom Hex</label>
              <div className="flex items-center gap-2">
                <div
                  className="h-10 w-10 shrink-0 rounded-full border border-gray-200 dark:border-gray-700"
                  style={{ backgroundColor: activeBrandColor }}
                />
                <input
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
            </div>

            {/* Preview */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Preview</p>
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
          <div className="card space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Public Profile</p>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-medium text-gray-900 dark:text-gray-100">Show profile publicly</p>
                <p className="text-[12px] text-gray-400">Allow customers to find your profile page</p>
              </div>
              <button
                type="button"
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

            <div>
              <label className="label">Profile URL</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[12px] text-gray-400">
                    snapquote.dev/p/
                  </span>
                  <input
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
            </div>

            <div>
              <label className="label">Bio / Description</label>
              <textarea
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                placeholder="Tell customers about your business, experience, and what makes you different..."
                rows={3}
                className="input-field resize-none"
              />
            </div>

            {profileSlug && profilePublic && (
              <a
                href={`/p/${profileSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-[13px] font-medium text-brand-700 hover:bg-brand-100 transition-colors"
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
        <div className="card space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Payments</p>
            <p className="mt-1 text-xs text-gray-500">Connect Stripe to collect deposits online directly from your quotes.</p>
          </div>
          {stripeStatus === 'connected' && (
            <div className="rounded-xl bg-green-50 border border-green-200 px-3 py-2 text-[13px] font-medium text-green-700">
              Stripe connected successfully!
            </div>
          )}
          {stripeStatus === 'error' && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-[13px] font-medium text-red-700">
              Connection failed. Please try again.
            </div>
          )}
          <StripeConnectButton isConnected={stripeConnected} />
        </div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'Advanced' && (
        <div className="card space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Webhooks & Integrations</p>
            <p className="mt-1 text-xs text-gray-500">
              Webhooks send automatic notifications to external services when quote events occur. Most users don&apos;t need this.
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Works with Zapier, Make, or any webhook endpoint.
            </p>
          </div>

          <FormField label="Webhook URL" error={fieldErrors.webhookUrl}>
            <input
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
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
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
              // Save the URL first so the test endpoint can read it
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
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700" role="alert">
          Save failed: {saveError}
        </div>
      )}

      {/* Save Button - always visible */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`btn-primary transition-all ${saved ? '!bg-green-600' : ''}`}
      >
        {saving ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size="md" />
            Saving...
          </span>
        ) : saved ? '\u2713 Saved' : 'Save Changes'}
      </button>

      {/* Sign Out */}
      <button
        onClick={async () => {
          const supabase = createClient();
          await supabase.auth.signOut();
          router.push('/auth/login');
        }}
        className="w-full rounded-2xl border border-red-200 bg-red-50 py-3 text-[14px] font-semibold text-red-600 press-scale"
      >
        Sign Out
      </button>
    </div>
  );
}
