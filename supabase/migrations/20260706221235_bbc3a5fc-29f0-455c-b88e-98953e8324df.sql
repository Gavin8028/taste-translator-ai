
DROP FUNCTION IF EXISTS public.consume_anonymous_scan(inet, int);
DROP FUNCTION IF EXISTS public.refund_anonymous_scan(inet);
DROP TABLE IF EXISTS public.anonymous_scans;

CREATE TABLE public.anonymous_scans (
  ip INET PRIMARY KEY,
  last_scan_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.anonymous_scans TO service_role;

ALTER TABLE public.anonymous_scans ENABLE ROW LEVEL SECURITY;
-- No policies: accessed only via SECURITY DEFINER RPCs / service_role.

CREATE OR REPLACE FUNCTION public.consume_anonymous_scan(_ip inet)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_last TIMESTAMPTZ;
BEGIN
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

CREATE OR REPLACE FUNCTION public.refund_anonymous_scan(_ip inet)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only rewind if we just wrote this row (AI failure within the last hour).
  DELETE FROM public.anonymous_scans
    WHERE ip = _ip
      AND last_scan_at > now() - INTERVAL '1 hour';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_anonymous_scan(inet) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refund_anonymous_scan(inet) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_anonymous_scan(inet) TO service_role;
GRANT EXECUTE ON FUNCTION public.refund_anonymous_scan(inet) TO service_role;
