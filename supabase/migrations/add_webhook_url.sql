ALTER TABLE users ADD COLUMN IF NOT EXISTS webhook_url text;
NOTIFY pgrst, 'reload schema';
