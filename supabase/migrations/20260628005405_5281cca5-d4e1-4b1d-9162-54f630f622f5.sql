
CREATE TABLE public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name text NOT NULL,
  path text,
  session_id text,
  country text,
  device text,
  referrer text,
  props jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX analytics_events_event_name_idx ON public.analytics_events (event_name);
CREATE INDEX analytics_events_created_at_idx ON public.analytics_events (created_at DESC);
CREATE INDEX analytics_events_event_created_idx ON public.analytics_events (event_name, created_at DESC);

GRANT ALL ON public.analytics_events TO service_role;

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- No client policies: all reads and writes go through server functions using the service role.

CREATE TABLE public.admin_emails (
  email text NOT NULL PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.admin_emails TO service_role;
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;
-- No client policies: only server functions read this list.
