GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurant_menus TO authenticated;
GRANT ALL ON public.restaurant_menus TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_dishes TO authenticated;
GRANT ALL ON public.menu_dishes TO service_role;