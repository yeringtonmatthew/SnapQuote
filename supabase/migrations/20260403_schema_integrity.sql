-- ══════════════════════════════════════════════════════════════
-- Schema Integrity Migration
-- Created: 2026-04-03
-- Purpose: Add missing NOT NULL constraints, foreign keys, and
--          RLS policies identified during schema audit
-- ══════════════════════════════════════════════════════════════

-- ── QUOTES: Add NOT NULL where data should always exist ───────
-- contractor_id should never be null (every quote belongs to a contractor)
ALTER TABLE public.quotes
  ALTER COLUMN contractor_id SET NOT NULL;

-- customer_name should never be null (validated in API but not in schema)
ALTER TABLE public.quotes
  ALTER COLUMN customer_name SET NOT NULL;

-- status should never be null and should have a default
ALTER TABLE public.quotes
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'draft';

-- archived should never be null
ALTER TABLE public.quotes
  ALTER COLUMN archived SET NOT NULL,
  ALTER COLUMN archived SET DEFAULT false;

-- ── FOLLOW_UPS: Missing RLS for service-role-created records ──
-- The cron job uses service role to INSERT follow_ups.
-- The existing RLS only allows contractor_id = auth.uid().
-- Add a policy so service role inserts work (they bypass RLS),
-- but ensure SELECT is still scoped properly.
-- (Service role already bypasses RLS, so no change needed for cron.)

-- ── NOTIFICATIONS: Ensure user_id NOT NULL ────────────────────
ALTER TABLE public.notifications
  ALTER COLUMN user_id SET NOT NULL;

-- ── CLIENTS: Ensure name NOT NULL ─────────────────────────────
-- Already set in CREATE TABLE, but making explicit
ALTER TABLE public.clients
  ALTER COLUMN name SET NOT NULL;

-- ── Add missing created_at default to quotes if missing ───────
ALTER TABLE public.quotes
  ALTER COLUMN created_at SET DEFAULT now();

NOTIFY pgrst, 'reload schema';
