-- Create dream interpretations table for classical texts
CREATE TABLE public.dream_interpretations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_arabic TEXT,
  content TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('ibn_sirin', 'al_nabulsi')),
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public read access for dream interpretations)
ALTER TABLE public.dream_interpretations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read dream interpretations (this is reference data)
CREATE POLICY "Dream interpretations are publicly readable"
ON public.dream_interpretations
FOR SELECT
USING (true);

-- Create GIN index for full-text search on Arabic and English content
CREATE INDEX idx_dream_interpretations_content_fts 
ON public.dream_interpretations 
USING GIN (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(title_arabic, '') || ' ' || coalesce(content, '')));

-- Create index for source filtering
CREATE INDEX idx_dream_interpretations_source ON public.dream_interpretations(source);

-- Create index for title lookups
CREATE INDEX idx_dream_interpretations_title ON public.dream_interpretations(title);
CREATE INDEX idx_dream_interpretations_title_arabic ON public.dream_interpretations(title_arabic);