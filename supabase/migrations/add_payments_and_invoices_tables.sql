-- Payments table: tracks all individual payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  invoice_id uuid, -- will reference invoices table once created
  contractor_id uuid NOT NULL REFERENCES auth.users(id),
  amount numeric NOT NULL CHECK (amount > 0),
  payment_type text NOT NULL CHECK (payment_type IN ('deposit', 'balance', 'full', 'partial')),
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'check', 'card', 'stripe')),
  payment_note text,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_quote_id ON payments(quote_id);
CREATE INDEX idx_payments_contractor_id ON payments(contractor_id);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (contractor_id = auth.uid());
CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT WITH CHECK (contractor_id = auth.uid());
CREATE POLICY "Users can delete own payments" ON payments
  FOR DELETE USING (contractor_id = auth.uid());

-- Invoices table
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

CREATE INDEX idx_invoices_quote_id ON invoices(quote_id);
CREATE INDEX idx_invoices_contractor_id ON invoices(contractor_id);
CREATE INDEX idx_invoices_status ON invoices(status);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (contractor_id = auth.uid());
CREATE POLICY "Users can insert own invoices" ON invoices
  FOR INSERT WITH CHECK (contractor_id = auth.uid());
CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE USING (contractor_id = auth.uid());
CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE USING (contractor_id = auth.uid());

-- Add foreign key from payments to invoices
ALTER TABLE payments ADD CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL;

-- Add 'paid' to quotes status enum
ALTER TYPE quote_status ADD VALUE IF NOT EXISTS 'paid' BEFORE 'cancelled';

-- Auto-increment invoice number function (per contractor)
CREATE OR REPLACE FUNCTION next_invoice_number(p_contractor_id uuid)
RETURNS integer
LANGUAGE sql
AS $$
  SELECT COALESCE(MAX(invoice_number), 0) + 1
  FROM invoices
  WHERE contractor_id = p_contractor_id;
$$;

-- Backfill: create payment records from existing quotes that have been paid
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
