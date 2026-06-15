
-- Drop overly permissive public SELECT policies. Server code uses service_role which bypasses RLS.
DROP POLICY IF EXISTS "Anyone can view restaurant menus" ON public.restaurant_menus;
DROP POLICY IF EXISTS "Anyone can view menu dishes" ON public.menu_dishes;

-- Revoke any direct API access from anon/authenticated; only service_role should touch these tables.
REVOKE ALL ON public.restaurant_menus FROM anon, authenticated;
REVOKE ALL ON public.menu_dishes FROM anon, authenticated;
GRANT ALL ON public.restaurant_menus TO service_role;
GRANT ALL ON public.menu_dishes TO service_role;

-- Storage: make the deny posture explicit for the private menu-images bucket.
-- Only the service_role (used by trusted server code) may access objects; anon/authenticated get nothing.
CREATE POLICY "menu-images service role only - select"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (false);

CREATE POLICY "menu-images service role only - insert"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "menu-images service role only - update"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "menu-images service role only - delete"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (false);
