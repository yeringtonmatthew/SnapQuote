ALTER TABLE quotes ADD COLUMN IF NOT EXISTS expires_at timestamptz;
-- Set default expiration for existing sent quotes (30 days from sent_at)
UPDATE quotes SET expires_at = sent_at + interval '30 days' WHERE status = 'sent' AND expires_at IS NULL AND sent_at IS NOT NULL;
NOTIFY pgrst, 'reload schema';
