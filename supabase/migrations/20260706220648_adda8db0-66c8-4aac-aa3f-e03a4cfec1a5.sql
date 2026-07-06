
CREATE TABLE public.anonymous_scans (
  ip INET NOT NULL,
  day DATE NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  count INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (ip, day)
);

GRANT ALL ON public.anonymous_scans TO service_role;

ALTER TABLE public.anonymous_scans ENABLE ROW LEVEL SECURITY;
-- No policies: accessed only via SECURITY DEFINER RPCs / service_role.

CREATE OR REPLACE FUNCTION public.consume_anonymous_scan(_ip inet, _daily_limit int DEFAULT 3)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_today DATE := (now() AT TIME ZONE 'utc')::date;
  v_count INT;
BEGIN
  INSERT INTO public.anonymous_scans (ip, day, count)
  VALUES (_ip, v_today, 1)
  ON CONFLICT (ip, day) DO UPDATE
    SET count = public.anonymous_scans.count + 1,
        updated_at = now()
  RETURNING count INTO v_count;

  IF v_count > _daily_limit THEN
    -- roll back the increment we just made
    UPDATE public.anonymous_scans
      SET count = count - 1,
          updated_at = now()
      WHERE ip = _ip AND day = v_today;
    RETURN 'limit';
  END IF;

  RETURN 'anon';
END;
$$;

CREATE OR REPLACE FUNCTION public.refund_anonymous_scan(_ip inet)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_today DATE := (now() AT TIME ZONE 'utc')::date;
BEGIN
  UPDATE public.anonymous_scans
    SET count = GREATEST(count - 1, 0),
        updated_at = now()
    WHERE ip = _ip AND day = v_today;
END;
$$;
