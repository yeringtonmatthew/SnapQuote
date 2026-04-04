-- ══════════════════════════════════════════════════════════════
-- Performance Index Migration
-- Created: 2026-04-03
-- Purpose: Add missing indexes identified during performance audit
-- ══════════════════════════════════════════════════════════════

-- ── QUOTES TABLE INDEXES ──────────────────────────────────────

-- Dashboard, QuoteList, Pipeline, Jobs all filter by contractor_id + status.
-- The existing idx_quotes_pipeline covers (contractor_id, pipeline_stage) but
-- not status. This composite index covers the most common query pattern.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quotes_contractor_status
  ON public.quotes(contractor_id, status);

-- Dashboard fetches the 100 most recent quotes ordered by created_at.
-- Pipeline, Jobs, and client profile pages also sort by created_at DESC.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quotes_contractor_created
  ON public.quotes(contractor_id, created_at DESC);

-- Archived filter is used on pipeline, jobs, and dashboard to exclude archived quotes.
-- A partial index on non-archived quotes keeps the index small and fast.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quotes_contractor_active
  ON public.quotes(contractor_id, pipeline_stage, status)
  WHERE archived = false;

-- Client profile page: quotes for a specific client, ordered by created_at.
-- Also used by /api/clients/[id] GET and the clients page stats aggregation.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quotes_client_created
  ON public.quotes(client_id, created_at DESC)
  WHERE client_id IS NOT NULL;

-- Cron follow-ups: fetches all quotes with status IN ('sent', 'approved')
-- and sent_at IS NOT NULL across ALL contractors (service role, no contractor filter).
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quotes_followup_eligible
  ON public.quotes(status, sent_at)
  WHERE status IN ('sent', 'approved') AND sent_at IS NOT NULL;

-- Quote lookup by customer phone (ilike on last 10 digits).
-- A btree index won't help ilike with leading %, but a trigram index will.
-- Requires pg_trgm extension (already available on Supabase).
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quotes_customer_phone_trgm
  ON public.quotes USING gin (customer_phone gin_trgm_ops);

-- Quote lookup by customer email (ilike exact match).
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quotes_customer_email_trgm
  ON public.quotes USING gin (customer_email gin_trgm_ops);

-- Scheduled quotes: dashboard merges events with scheduled_date quotes.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quotes_scheduled_date
  ON public.quotes(contractor_id, scheduled_date)
  WHERE scheduled_date IS NOT NULL;

-- ── EVENTS TABLE INDEXES ──────────────────────────────────────

-- Schedule page fetches events in a date range for a contractor.
-- idx_events_contractor_date already covers (contractor_id, event_date).
-- Adding a range-friendly index for gte/lte queries:
-- (already covered by existing idx_events_contractor_date, no additional needed)

-- ── CLIENTS TABLE INDEXES ─────────────────────────────────────

-- Lead inbound route: check for existing client by phone or email.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_user_phone
  ON public.clients(user_id, phone)
  WHERE phone IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_user_email
  ON public.clients(user_id, email)
  WHERE email IS NOT NULL;

-- ── FOLLOW_UPS TABLE INDEXES ──────────────────────────────────

-- Cron job: batch fetch follow_ups by quote_id + follow_up_number.
-- idx_follow_ups_quote already covers (quote_id).
-- Adding a composite for the exact lookup pattern:
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_follow_ups_quote_number
  ON public.follow_ups(quote_id, follow_up_number);

-- ── NOTIFICATIONS TABLE INDEXES ───────────────────────────────

-- View route: check if quote_viewed notification exists for a quote.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_quote_type
  ON public.notifications(quote_id, type);

-- ── REVIEWS TABLE INDEXES ─────────────────────────────────────

-- Customer proposal page: fetch top reviews for a contractor.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_contractor_rating
  ON public.reviews(contractor_id, rating DESC, created_at DESC);

-- ── USERS TABLE INDEXES ───────────────────────────────────────

-- Public profile page: lookup by profile_slug.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_profile_slug
  ON public.users(profile_slug)
  WHERE profile_slug IS NOT NULL AND profile_public = true;

-- Lead source lookup by api_key (inbound leads route).
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lead_sources_api_key
  ON public.lead_sources(api_key);

-- ── QUOTE TEMPLATES TABLE INDEXES ─────────────────────────────

-- Settings page: fetch templates by contractor, ordered by created_at.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_templates_contractor
  ON public.quote_templates(contractor_id, created_at DESC);

NOTIFY pgrst, 'reload schema';
