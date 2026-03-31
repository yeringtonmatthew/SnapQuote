import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SettingsForm } from './SettingsForm';
import { TemplatesList } from './TemplatesList';
import { SettingsThemeSection } from './SettingsThemeSection';
import PageTransition from '@/components/PageTransition';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { stripe?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: templates } = await supabase
    .from('quote_templates')
    .select('*')
    .eq('contractor_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <PageTransition>
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-950 pb-24">
      <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
        <div className="mx-auto max-w-lg flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Settings</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Your business profile</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-6 space-y-6">
        <SettingsThemeSection />

        <SettingsForm
          profile={profile}
          userId={user.id}
          email={user.email || ''}
          stripeConnected={!!profile?.stripe_account_id}
          stripeStatus={searchParams.stripe || null}
        />

        <div>
          <TemplatesList initialTemplates={templates || []} />
        </div>
      </main>
    </div>
    </PageTransition>
  );
}
