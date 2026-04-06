import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import RecentActivity from '@/components/RecentActivity';
import QuickActions from '@/components/QuickActions';

export default async function DashboardActivitySection({ userId }: { userId: string }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: quotes } = await supabase
    .from('quotes')
    .select('id, customer_name, customer_phone, customer_email, status, subtotal, total, deposit_amount, deposit_percent, quote_number, created_at, sent_at, approved_at, paid_at, archived, pipeline_stage, scheduled_date, scheduled_time, reminder_sent_at, job_address, expires_at, client_id, started_at, completed_at, payment_method, quote_options, selected_option, photos, scope_of_work, ai_description, job_tasks')
    .eq('contractor_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);

  const allQuotes = quotes || [];
  const activeQuotes = allQuotes.filter(q => !q.archived);

  // Stage badge helpers
  const stageBadge = (stage: string) => {
    const map: Record<string, { label: string; classes: string }> = {
      job_scheduled: { label: 'Scheduled', classes: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
      in_progress: { label: 'In Progress', classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
      deposit_collected: { label: 'Deposit Paid', classes: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
      completed: { label: 'Completed', classes: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    };
    const info = map[stage] || { label: stage, classes: 'bg-gray-100 text-gray-600' };
    return info;
  };

  // Active Jobs
  const activeJobs = activeQuotes
    .filter(q => q.pipeline_stage === 'in_progress' || q.pipeline_stage === 'job_scheduled')
    .slice(0, 3);

  // Recent Activity
  const recentQuotes = activeQuotes.slice(0, 8).map(q => ({
    id: q.id,
    customer_name: q.customer_name,
    total: Number(q.total ?? q.subtotal ?? 0),
    status: q.status,
    created_at: q.created_at,
    sent_at: q.sent_at,
    approved_at: q.approved_at,
    paid_at: q.paid_at,
  }));

  return (
    <>
      {/* Quick Actions */}
      <div className="lg:col-start-1">
        <h2 className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          Quick Actions
        </h2>
        <QuickActions />
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <section className="lg:col-start-1">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-5.1m0 0L12 4.37m-5.68 5.7h15.08" />
              </svg>
              <h2 className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">
                Active Jobs
              </h2>
            </div>
            <Link href="/jobs" className="text-[12px] font-medium text-brand-600 dark:text-brand-400 active:opacity-70 transition-opacity">
              View All
            </Link>
          </div>
          <div className="space-y-2">
            {activeJobs.map(job => {
              const badge = stageBadge(job.pipeline_stage);
              const tasks = (job.job_tasks as { id: string; text: string; done: boolean; created_at: string }[]) || [];
              const doneTasks = tasks.filter(t => t.done).length;
              const totalTasks = tasks.length;
              const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
              const scheduledDate = job.scheduled_date
                ? new Date(job.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : null;

              return (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] px-4 py-3.5 active:bg-gray-50 dark:active:bg-gray-800 transition-all min-h-[56px]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {job.customer_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.classes}`}>
                          {badge.label}
                        </span>
                        {scheduledDate && (
                          <span className="text-[11px] text-gray-400 dark:text-gray-500">{scheduledDate}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {totalTasks > 0 && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-brand-500 transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 tabular-nums">
                            {doneTasks}/{totalTasks}
                          </span>
                        </div>
                      )}
                      <svg className="h-4 w-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Activity */}
      {recentQuotes.length > 0 && (
        <section className="lg:col-start-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">
                Recent Activity
              </h2>
            </div>
            <Link href="/pipeline" className="text-[12px] font-medium text-brand-600 dark:text-brand-400 active:opacity-70 transition-opacity">
              All Quotes
            </Link>
          </div>
          <RecentActivity quotes={recentQuotes} />
        </section>
      )}

      {/* Recent Quotes */}
      <div className="lg:col-start-1 min-w-0">
        {!quotes || quotes.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/20">
              <svg className="h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
            </div>
            <h2 className="text-[20px] font-bold text-gray-900 dark:text-gray-100">Create Your First Quote</h2>
            <p className="text-[14px] text-gray-500 max-w-xs mx-auto">
              Take photos of a job site and let AI generate a professional quote with inspection findings in under 60 seconds.
            </p>
            <Link
              href="/quotes/new"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-[15px] font-semibold text-white hover:bg-brand-700 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create Your First Quote
            </Link>
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Quick Setup</p>
              <Link href="/settings" className="flex items-center gap-3 rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                  <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[14px] font-medium text-gray-900 dark:text-gray-100">Set up your profile</p>
                  <p className="text-[12px] text-gray-500">Add your logo, business name, and rates</p>
                </div>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Recent Quotes
              </h2>
              <Link href="/pipeline" className="text-[12px] font-medium text-brand-600 dark:text-brand-400 active:opacity-70 transition-opacity">
                View All
              </Link>
            </div>
            <div className="space-y-2">
              {activeQuotes.filter(q => !q.archived && q.status !== 'draft').slice(0, 5).map((quote) => {
                const thumb = quote.photos?.[0];
                const statusColor: Record<string, string> = {
                  sent: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
                  approved: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
                  deposit_paid: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',
                  cancelled: 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-300',
                  draft: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
                };
                const statusLabel: Record<string, string> = {
                  draft: 'Draft', sent: 'Sent', approved: 'Approved', deposit_paid: 'Paid', cancelled: 'Cancelled',
                };
                return (
                  <Link
                    key={quote.id}
                    href={`/quotes/${quote.id}`}
                    className="flex items-center gap-3 rounded-2xl bg-white dark:bg-gray-900 px-4 py-3 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] active:bg-gray-50 dark:active:bg-gray-800 transition-all min-h-[64px]"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                      {thumb ? (
                        <img src={thumb} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <svg className="h-5 w-5 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-gray-900 dark:text-gray-100">
                        {quote.customer_name}
                      </p>
                      <p className="text-[12px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                        {quote.scope_of_work || quote.ai_description || 'No description'}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                        ${Number(quote.total ?? quote.subtotal).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </p>
                      <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColor[quote.status] || 'bg-gray-100 text-gray-500'}`}>
                        {statusLabel[quote.status] || quote.status}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
            {activeQuotes.filter(q => !q.archived && q.status !== 'draft').length > 5 && (
              <div className="flex justify-center pt-4">
                <Link
                  href="/pipeline"
                  className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-gray-900 px-5 py-3 text-[13px] font-semibold text-gray-700 dark:text-gray-300 ring-1 ring-black/[0.04] dark:ring-white/[0.06] shadow-sm active:scale-[0.97] transition-all min-h-[44px]"
                >
                  View All Quotes
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
