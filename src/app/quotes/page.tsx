import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BottomNav from '@/components/BottomNav';
import DesktopSidebar from '@/components/DesktopSidebar';
import PageTransition from '@/components/PageTransition';
import QuoteList from '@/components/QuoteList';
import Link from 'next/link';

export default async function QuotesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: quotes } = await supabase
    .from('quotes')
    .select('id, customer_name, scope_of_work, ai_description, subtotal, status, quote_number, photos, expires_at, archived, created_at, paid_at, sent_at, approved_at, internal_notes')
    .eq('contractor_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <PageTransition>
      <DesktopSidebar active="quotes" />
      <div className="min-h-dvh bg-[#f2f2f7] dark:bg-gray-950 pb-28 lg:pb-8 lg:pl-[220px]">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-black/5 dark:border-white/5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl px-5 pt-14 lg:pt-4 pb-3" data-no-print>
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <h1 className="text-[17px] font-bold text-gray-900 dark:text-gray-100">Quotes</h1>
            <Link
              href="/quotes/new"
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-[13px] font-semibold text-white press-scale"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Quote
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-4 pt-4">
          <QuoteList quotes={quotes || []} />
        </div>
      </div>
      <BottomNav active="more" />
    </PageTransition>
  );
}
