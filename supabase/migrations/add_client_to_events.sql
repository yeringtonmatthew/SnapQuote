-- Add client_id to events for direct client linking (not just through quotes)
ALTER TABLE events ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_events_client ON events(client_id);

NOTIFY pgrst, 'reload schema';
