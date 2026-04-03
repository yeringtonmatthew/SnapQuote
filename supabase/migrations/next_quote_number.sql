CREATE OR REPLACE FUNCTION next_quote_number(p_contractor_id uuid)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  next_num integer;
BEGIN
  SELECT COALESCE(MAX(quote_number), 0) + 1
  INTO next_num
  FROM quotes
  WHERE contractor_id = p_contractor_id
  FOR UPDATE;

  RETURN next_num;
END;
$$;
