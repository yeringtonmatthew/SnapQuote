ALTER TABLE quotes ADD COLUMN IF NOT EXISTS reminder_sent_at timestamptz;
NOTIFY pgrst, 'reload schema';
