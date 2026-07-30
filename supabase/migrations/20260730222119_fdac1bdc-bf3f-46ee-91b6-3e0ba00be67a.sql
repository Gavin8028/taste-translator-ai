CREATE OR REPLACE FUNCTION public.has_active_premium(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = _user_id
      AND price_id IN ('diner_premium_monthly', 'diner_premium_yearly')
      AND (
        (status IN ('active','trialing') AND (current_period_end IS NULL OR current_period_end > now()))
        OR (status = 'canceled' AND current_period_end > now())
      )
  );
$function$;

REVOKE EXECUTE ON FUNCTION public.has_active_premium(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_active_premium(uuid) TO service_role;