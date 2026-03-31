ALTER TABLE quotes ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false;
NOTIFY pgrst, 'reload schema';
