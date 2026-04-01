-- ══════════════════════════════════════════════
-- Clients table + link to quotes
-- ══════════════════════════════════════════════

-- 1. Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  company TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add client_id to quotes (nullable for backward compatibility)
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(user_id, name);
CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON quotes(client_id);

-- 4. RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE
  USING (user_id = auth.uid());

-- 5. Auto-create clients from existing quotes (de-duplicate by customer_name + phone)
INSERT INTO clients (user_id, name, phone, email, address)
SELECT DISTINCT ON (contractor_id, customer_name)
  contractor_id,
  customer_name,
  customer_phone,
  customer_email,
  job_address
FROM quotes
WHERE customer_name IS NOT NULL AND customer_name != ''
ORDER BY contractor_id, customer_name, created_at DESC
ON CONFLICT DO NOTHING;

-- 6. Back-link existing quotes to their auto-created clients
UPDATE quotes q
SET client_id = c.id
FROM clients c
WHERE q.contractor_id = c.user_id
  AND q.customer_name = c.name
  AND q.client_id IS NULL;
