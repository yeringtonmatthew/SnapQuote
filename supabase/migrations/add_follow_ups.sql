-- Follow-up tracking table
CREATE TABLE IF NOT EXISTS follow_ups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  contractor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  follow_up_number integer NOT NULL, -- 1, 2, or 3
  channel text NOT NULL CHECK (channel IN ('sms', 'email')),
  message text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_follow_ups_quote ON follow_ups(quote_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_contractor ON follow_ups(contractor_id, created_at);

ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own follow_ups" ON follow_ups FOR SELECT USING (auth.uid() = contractor_id);
CREATE POLICY "Users can insert own follow_ups" ON follow_ups FOR INSERT WITH CHECK (auth.uid() = contractor_id);

-- Add auto_follow_up setting to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS auto_follow_up boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS follow_up_templates jsonb DEFAULT '[
  "Hey {{name}}, just checking if you saw your quote. Let me know if you have any questions!",
  "Hi {{name}}, we have an opening this week if you''d like to move forward. Would love to get you on the schedule!",
  "Hey {{name}}, just wanted to follow up — happy to adjust anything if needed or get you scheduled."
]';

NOTIFY pgrst, 'reload schema';
