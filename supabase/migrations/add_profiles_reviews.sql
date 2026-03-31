ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_slug text UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_bio text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_public boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quote_id uuid REFERENCES quotes(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Contractors can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = contractor_id);
NOTIFY pgrst, 'reload schema';
