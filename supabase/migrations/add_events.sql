-- Calendar events table for contractor scheduling
CREATE TABLE IF NOT EXISTS events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quote_id uuid REFERENCES quotes(id) ON DELETE SET NULL,
  title text NOT NULL,
  event_type text NOT NULL DEFAULT 'job_scheduled'
    CHECK (event_type IN (
      'estimate',
      'follow_up',
      'job_scheduled',
      'material_dropoff',
      'production',
      'walkthrough',
      'payment_collection',
      'blocked_time'
    )),
  event_date date NOT NULL,
  start_time time,
  end_time time,
  all_day boolean DEFAULT false,
  notes text,
  color text,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for fast calendar queries
CREATE INDEX IF NOT EXISTS idx_events_contractor_date ON events(contractor_id, event_date);
CREATE INDEX IF NOT EXISTS idx_events_quote ON events(quote_id);

-- RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events" ON events
  FOR SELECT USING (auth.uid() = contractor_id);

CREATE POLICY "Users can insert own events" ON events
  FOR INSERT WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Users can update own events" ON events
  FOR UPDATE USING (auth.uid() = contractor_id);

CREATE POLICY "Users can delete own events" ON events
  FOR DELETE USING (auth.uid() = contractor_id);

-- Backfill: create events from existing scheduled quotes
INSERT INTO events (contractor_id, quote_id, title, event_type, event_date, start_time, notes)
SELECT
  q.contractor_id,
  q.id,
  q.customer_name || ' - Job',
  'job_scheduled',
  q.scheduled_date::date,
  q.scheduled_time::time,
  q.scope_of_work
FROM quotes q
WHERE q.scheduled_date IS NOT NULL
  AND q.status != 'cancelled'
ON CONFLICT DO NOTHING;

NOTIFY pgrst, 'reload schema';
