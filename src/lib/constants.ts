/**
 * Shared constants for SnapQuote pipeline stages.
 * Single source of truth — import this everywhere instead of duplicating.
 */
export const VALID_STAGES = [
  'lead',
  'follow_up',
  'quote_created',
  'quote_sent',
  'deposit_collected',
  'job_scheduled',
  'in_progress',
  'completed',
] as const;

export type PipelineStage = (typeof VALID_STAGES)[number];
