-- Allow contractors to set a business email separate from their login email
-- This email is displayed on public quotes and customer communications
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS business_email TEXT DEFAULT NULL;
