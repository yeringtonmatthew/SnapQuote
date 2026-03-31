ALTER TABLE quotes ADD COLUMN IF NOT EXISTS quote_number integer;

-- Backfill existing quotes with sequential numbers per contractor
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY contractor_id ORDER BY created_at) as rn
  FROM quotes
)
UPDATE quotes SET quote_number = numbered.rn FROM numbered WHERE quotes.id = numbered.id AND quotes.quote_number IS NULL;

NOTIFY pgrst, 'reload schema';
