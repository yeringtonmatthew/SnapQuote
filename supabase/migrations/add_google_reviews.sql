-- Add Google Place ID for pulling Google reviews
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_place_id text;
-- Toggle to show reviews on proposals
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_reviews_on_quotes boolean DEFAULT true;

-- Add source tracking to reviews table (google, facebook, internal)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS source text DEFAULT 'internal';
-- Add reviewer profile image (for Google reviews)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_photo_url text;
-- Track when we last fetched reviews from external sources
ALTER TABLE users ADD COLUMN IF NOT EXISTS reviews_last_fetched_at timestamptz;

NOTIFY pgrst, 'reload schema';
