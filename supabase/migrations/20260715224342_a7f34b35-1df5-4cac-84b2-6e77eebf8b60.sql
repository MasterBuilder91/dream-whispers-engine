
CREATE TABLE public.symbol_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol_slug text NOT NULL,
  language text NOT NULL,
  name text NOT NULL,
  summary text NOT NULL,
  interpretation text NOT NULL,
  scholars jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (symbol_slug, language)
);

GRANT SELECT ON public.symbol_translations TO anon, authenticated;
GRANT ALL ON public.symbol_translations TO service_role;

ALTER TABLE public.symbol_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read translations"
  ON public.symbol_translations FOR SELECT
  USING (true);

CREATE INDEX idx_symbol_translations_lookup
  ON public.symbol_translations (symbol_slug, language);
