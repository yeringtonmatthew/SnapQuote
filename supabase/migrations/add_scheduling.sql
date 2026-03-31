ALTER TABLE quotes ADD COLUMN IF NOT EXISTS scheduled_date date;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS scheduled_time text;
NOTIFY pgrst, 'reload schema';
