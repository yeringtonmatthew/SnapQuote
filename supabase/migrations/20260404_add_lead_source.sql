-- Add lead_source column to clients table for tracking where leads come from
-- Common sources: google, facebook, angi, homeadvisor, thumbtack, referral, website, yard_sign, door_knock, jobber, other

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS lead_source TEXT DEFAULT NULL;

-- Index for filtering/reporting by lead source
CREATE INDEX IF NOT EXISTS idx_clients_lead_source ON public.clients(lead_source);
