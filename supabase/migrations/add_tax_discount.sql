ALTER TABLE quotes ADD COLUMN IF NOT EXISTS tax_rate numeric(5,2);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS discount_percent numeric(5,2);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS total numeric(10,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_tax_rate numeric(5,2);
-- Backfill total = subtotal for existing quotes
UPDATE quotes SET total = subtotal WHERE total IS NULL;
NOTIFY pgrst, 'reload schema';
