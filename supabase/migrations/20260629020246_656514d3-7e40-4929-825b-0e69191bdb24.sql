
REVOKE EXECUTE ON FUNCTION public.consume_scan_credit(UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_paid_credits(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_active_premium(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.grant_initial_scan_credits() FROM PUBLIC, anon, authenticated;
