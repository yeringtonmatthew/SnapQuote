-- Add inspection_findings JSONB column to quotes table
-- Stores AI-generated per-photo inspection findings with severity and urgency messaging
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS inspection_findings jsonb;
