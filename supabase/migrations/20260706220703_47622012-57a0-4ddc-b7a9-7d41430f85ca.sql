
REVOKE EXECUTE ON FUNCTION public.consume_anonymous_scan(inet, int) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refund_anonymous_scan(inet) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_anonymous_scan(inet, int) TO service_role;
GRANT EXECUTE ON FUNCTION public.refund_anonymous_scan(inet) TO service_role;
