-- Add Good-Better-Best tiered quote options
-- quote_options: JSONB array of { name, description, line_items[], recommended? }
-- selected_option: index into quote_options when customer picks a tier

ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS quote_options JSONB DEFAULT NULL;

ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS selected_option INTEGER DEFAULT NULL;
