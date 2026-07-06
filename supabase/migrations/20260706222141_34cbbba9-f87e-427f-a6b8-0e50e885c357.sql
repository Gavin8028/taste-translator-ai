
CREATE TABLE public.trusted_ips (
  ip inet PRIMARY KEY,
  label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.trusted_ips TO service_role;

ALTER TABLE public.trusted_ips ENABLE ROW LEVEL SECURITY;

-- No public policies — only service_role (via supabaseAdmin) touches this table.

CREATE OR REPLACE FUNCTION public.is_trusted_ip(_ip inet)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.trusted_ips WHERE ip = _ip);
$$;

CREATE OR REPLACE FUNCTION public.consume_anonymous_scan(_ip inet)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last TIMESTAMPTZ;
BEGIN
  -- Trusted IPs bypass the 30-day limit entirely.
  IF public.is_trusted_ip(_ip) THEN
    RETURN 'anon';
  END IF;

  SELECT last_scan_at INTO v_last
    FROM public.anonymous_scans
    WHERE ip = _ip;

  IF v_last IS NOT NULL AND v_last > now() - INTERVAL '30 days' THEN
    RETURN 'limit';
  END IF;

  INSERT INTO public.anonymous_scans (ip, last_scan_at)
  VALUES (_ip, now())
  ON CONFLICT (ip) DO UPDATE
    SET last_scan_at = now();

  RETURN 'anon';
END;
$$;
