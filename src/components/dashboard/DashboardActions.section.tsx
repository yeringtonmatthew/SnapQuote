import { createClient } from '@/lib/supabase/server';
import DoThisNow from '@/components/DoThisNow';
import { getTopActions } from '@/lib/smart-actions';
import { getLeadScore, temperatureStyles } from '@/lib/lead-temperature';
import type { Quote } from '@/types/database';

export default async function DashboardActionsSection({ userId }: { userId: string }) {
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
  const now = new Date();

  const smartActions = getTopActions(activeQuotes as unknown as Quote[], 5, now);

  if (smartActions.length === 0) return null;

  // Lead Scores for each action
  const leadScoreMap: Record<string, { temperature: 'hot' | 'warm' | 'cold' | 'at_risk'; score: number; icon: string }> = {};
  for (const action of smartActions) {
    const q = activeQuotes.find(q => q.id === action.quoteId);
    if (q) {
      const ls = getLeadScore(q as unknown as Quote, now);
      leadScoreMap[action.quoteId] = {
        temperature: ls.temperature,
        score: ls.score,
        icon: temperatureStyles[ls.temperature].icon,
      };
    }
  }

  return (
    <div className="lg:col-start-1">
      <DoThisNow
        actions={smartActions}
        leadScores={leadScoreMap}
      />
    </div>
  );
}
