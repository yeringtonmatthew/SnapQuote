ALTER TABLE users ADD COLUMN IF NOT EXISTS brand_color text;
NOTIFY pgrst, 'reload schema';
