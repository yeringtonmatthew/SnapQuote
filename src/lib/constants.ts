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

/**
 * Lead source options for tracking where clients come from.
 */
export const LEAD_SOURCES = [
  { value: 'google', label: 'Google', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { value: 'facebook', label: 'Facebook', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
  { value: 'angi', label: 'Angi', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { value: 'homeadvisor', label: 'HomeAdvisor', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  { value: 'thumbtack', label: 'Thumbtack', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
  { value: 'referral', label: 'Referral', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  { value: 'website', label: 'Website', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
  { value: 'yard_sign', label: 'Yard Sign', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  { value: 'door_knock', label: 'Door Knock', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
  { value: 'jobber', label: 'Jobber', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
] as const;

export type LeadSourceValue = (typeof LEAD_SOURCES)[number]['value'];
