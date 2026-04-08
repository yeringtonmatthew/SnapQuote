-- SnapQuote: Add payments and invoices tables
-- Run this in Supabase SQL Editor

-- 1. Payments table: tracks all individual payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  invoice_id uuid,
  contractor_id uuid NOT NULL REFERENCES auth.users(id),
  amount numeric NOT NULL CHECK (amount > 0),
  payment_type text NOT NULL CHECK (payment_type IN ('deposit', 'balance', 'full', 'partial')),
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'check', 'card', 'stripe')),
  payment_note text,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_quote_id ON payments(quote_id);
CREATE INDEX IF NOT EXISTS idx_payments_contractor_id ON payments(contractor_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (contractor_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Users can insert own payments" ON payments FOR INSERT WITH CHECK (contractor_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Users can delete own payments" ON payments FOR DELETE USING (contractor_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  contractor_id uuid NOT NULL REFERENCES auth.users(id),
  invoice_number integer NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'void')),
  amount_due numeric NOT NULL,
  amount_paid numeric NOT NULL DEFAULT 0,
  due_date date,
  sent_at timestamptz,
  paid_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_quote_id ON invoices(quote_id);
CREATE INDEX IF NOT EXISTS idx_invoices_contractor_id ON invoices(contractor_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own invoices" ON invoices FOR SELECT USING (contractor_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Users can insert own invoices" ON invoices FOR INSERT WITH CHECK (contractor_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Users can update own invoices" ON invoices FOR UPDATE USING (contractor_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Users can delete own invoices" ON invoices FOR DELETE USING (contractor_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Add foreign key from payments to invoices
ALTER TABLE payments ADD CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL;

-- 4. Add 'paid' to quotes status constraint
ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_status_check;
ALTER TABLE quotes ADD CONSTRAINT quotes_status_check CHECK (status IN ('draft', 'sent', 'approved', 'deposit_paid', 'paid', 'cancelled'));

-- 5. Auto-increment invoice number function
CREATE OR REPLACE FUNCTION next_invoice_number(p_contractor_id uuid)
RETURNS integer
LANGUAGE sql
AS $$
  SELECT COALESCE(MAX(invoice_number), 0) + 1
  FROM invoices
  WHERE contractor_id = p_contractor_id;
$$;

-- 6. Backfill existing paid quotes into payments table
INSERT INTO payments (quote_id, contractor_id, amount, payment_type, payment_method, payment_note, recorded_at)
SELECT
  id,
  contractor_id,
  COALESCE(deposit_amount, 0),
  'deposit',
  COALESCE(payment_method, 'cash'),
  payment_note,
  COALESCE(paid_at, now())
FROM quotes
WHERE paid_at IS NOT NULL AND COALESCE(deposit_amount, 0) > 0
ON CONFLICT DO NOTHING;
