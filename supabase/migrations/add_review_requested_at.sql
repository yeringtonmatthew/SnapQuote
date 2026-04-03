-- Track when a Google review request was sent for a job/quote
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS review_requested_at timestamptz;
