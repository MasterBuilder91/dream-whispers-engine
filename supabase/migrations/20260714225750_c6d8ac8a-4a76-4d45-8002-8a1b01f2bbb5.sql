
CREATE TABLE public.usage_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_hash TEXT,
  month TEXT NOT NULL,
  count INT NOT NULL DEFAULT 0,
  last_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT usage_tracking_scope_chk CHECK (user_id IS NOT NULL OR ip_hash IS NOT NULL)
);

CREATE UNIQUE INDEX usage_tracking_user_month_idx ON public.usage_tracking(user_id, month) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX usage_tracking_ip_month_idx ON public.usage_tracking(ip_hash, month) WHERE user_id IS NULL AND ip_hash IS NOT NULL;

GRANT ALL ON public.usage_tracking TO service_role;

ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- No policies for authenticated/anon: only service_role (edge functions) can access.
