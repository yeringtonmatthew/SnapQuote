-- Add 'follow_up' to allowed pipeline_stage values
ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_pipeline_stage_check;
ALTER TABLE quotes ADD CONSTRAINT quotes_pipeline_stage_check
  CHECK (pipeline_stage IN (
    'lead',
    'follow_up',
    'quote_created',
    'quote_sent',
    'deposit_collected',
    'job_scheduled',
    'in_progress',
    'completed'
  ));

NOTIFY pgrst, 'reload schema';
