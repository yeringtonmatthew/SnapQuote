ALTER TABLE quotes ADD COLUMN IF NOT EXISTS customer_email text;
NOTIFY pgrst, 'reload schema';
