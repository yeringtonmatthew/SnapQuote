ALTER TABLE quotes ADD COLUMN IF NOT EXISTS job_address text;
NOTIFY pgrst, 'reload schema';
