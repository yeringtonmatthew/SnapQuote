import type { PipelineStage } from '@/types/database';

export const CONTRACTOR_STAGE_LABELS: Record<PipelineStage, string> = {
  lead: 'New Lead',
  follow_up: 'Check Back',
  quote_created: 'Draft Quote',
  quote_sent: 'Sent',
  deposit_collected: 'Sold',
  job_scheduled: 'Scheduled',
  in_progress: 'Working',
  completed: 'Done',
};

const JOB_FOCUSED_STAGES = new Set<PipelineStage>([
  'deposit_collected',
  'job_scheduled',
  'in_progress',
  'completed',
]);

export function getDefaultJobDetailTab(stage: PipelineStage | string): 'quote' | 'job' {
  return JOB_FOCUSED_STAGES.has(stage as PipelineStage) ? 'job' : 'quote';
}
