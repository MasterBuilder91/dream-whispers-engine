CREATE TABLE public.symbol_interpretations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol_slug text NOT NULL,
  symbol_en text,
  symbol_ar text,
  interpretation_en text,
  interpretation_ar text,
  source_url text NOT NULL,
  source_name text NOT NULL,
  scholar text,
  language text NOT NULL DEFAULT 'ar',
  category text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (symbol_slug, source_url)
);

GRANT SELECT ON public.symbol_interpretations TO anon;
GRANT SELECT ON public.symbol_interpretations TO authenticated;
GRANT ALL ON public.symbol_interpretations TO service_role;

ALTER TABLE public.symbol_interpretations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Symbol interpretations are publicly readable"
  ON public.symbol_interpretations
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert symbol interpretations"
  ON public.symbol_interpretations
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update symbol interpretations"
  ON public.symbol_interpretations
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete symbol interpretations"
  ON public.symbol_interpretations
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE INDEX idx_symbol_interp_slug ON public.symbol_interpretations (symbol_slug);
CREATE INDEX idx_symbol_interp_lang ON public.symbol_interpretations (language);
CREATE INDEX idx_symbol_interp_en_fts ON public.symbol_interpretations USING GIN (to_tsvector('english', coalesce(symbol_en,'') || ' ' || coalesce(interpretation_en,'')));
CREATE INDEX idx_symbol_interp_ar_fts ON public.symbol_interpretations USING GIN (to_tsvector('simple', coalesce(symbol_ar,'') || ' ' || coalesce(interpretation_ar,'')));

CREATE TRIGGER update_symbol_interp_updated_at
  BEFORE UPDATE ON public.symbol_interpretations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();