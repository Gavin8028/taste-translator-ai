
-- Lock down SECURITY DEFINER functions: revoke broad EXECUTE, grant only where needed.

REVOKE EXECUTE ON FUNCTION public.consume_scan_credit(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_paid_credits(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_initial_scan_credits() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_active_premium(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon, authenticated;

-- Service role retains full access (used by server functions / triggers)
GRANT EXECUTE ON FUNCTION public.consume_scan_credit(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.grant_paid_credits(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.grant_initial_scan_credits() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.has_active_premium(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO service_role;
