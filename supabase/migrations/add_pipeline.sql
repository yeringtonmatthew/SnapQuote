-- Pipeline stage for CRM/kanban view
-- Separate from quote status: status drives payment/proposal logic,
-- pipeline_stage drives contractor workflow view
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS pipeline_stage text
  DEFAULT 'quote_created'
  CHECK (pipeline_stage IN (
    'lead',
    'quote_created',
    'quote_sent',
    'deposit_collected',
    'job_scheduled',
    'in_progress',
    'completed'
  ));

-- Job photos: categorized photo uploads (before/during/after work)
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS job_photos jsonb DEFAULT '[]';

-- Job notes: timestamped internal notes feed
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS job_notes jsonb DEFAULT '[]';

-- Job tasks: simple checklist for the job
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS job_tasks jsonb DEFAULT '[]';

-- Completion timestamp
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Started timestamp (when moved to in_progress)
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS started_at timestamptz;

-- Index for pipeline queries (contractor + stage)
CREATE INDEX IF NOT EXISTS idx_quotes_pipeline
  ON public.quotes(contractor_id, pipeline_stage);

-- Backfill pipeline_stage for existing quotes based on current status
UPDATE quotes SET pipeline_stage = CASE
  WHEN status = 'draft' THEN 'quote_created'
  WHEN status = 'sent' THEN 'quote_sent'
  WHEN status = 'approved' THEN 'quote_sent'
  WHEN status = 'deposit_paid' THEN 'deposit_collected'
  WHEN status = 'cancelled' THEN 'quote_created'
  ELSE 'quote_created'
END
WHERE pipeline_stage IS NULL;

NOTIFY pgrst, 'reload schema';
