CREATE TABLE IF NOT EXISTS quote_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  line_items jsonb NOT NULL DEFAULT '[]',
  notes text,
  scope_of_work text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quote_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own templates" ON quote_templates
  FOR ALL USING (auth.uid() = contractor_id);

NOTIFY pgrst, 'reload schema';
