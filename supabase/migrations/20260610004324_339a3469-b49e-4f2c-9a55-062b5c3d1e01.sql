
CREATE TABLE public.restaurant_menus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  target_language TEXT NOT NULL DEFAULT 'English',
  source_language TEXT,
  edit_token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX restaurant_menus_slug_idx ON public.restaurant_menus(slug);

CREATE TABLE public.menu_dishes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id UUID NOT NULL REFERENCES public.restaurant_menus(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  name_original TEXT NOT NULL,
  name_translated TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  cuisine TEXT NOT NULL DEFAULT '',
  spice_level SMALLINT NOT NULL DEFAULT 0,
  dietary TEXT[] NOT NULL DEFAULT '{}',
  price_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX menu_dishes_menu_id_idx ON public.menu_dishes(menu_id);

GRANT SELECT ON public.restaurant_menus TO anon, authenticated;
GRANT ALL ON public.restaurant_menus TO service_role;

GRANT SELECT ON public.menu_dishes TO anon, authenticated;
GRANT ALL ON public.menu_dishes TO service_role;

ALTER TABLE public.restaurant_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_dishes ENABLE ROW LEVEL SECURITY;

-- Public read; never expose edit_token in public reads. We control column selection in server fns.
CREATE POLICY "Anyone can view restaurant menus"
  ON public.restaurant_menus FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view menu dishes"
  ON public.menu_dishes FOR SELECT
  USING (true);

-- No INSERT/UPDATE/DELETE policies → blocked for anon/authenticated; service_role bypasses RLS.

CREATE OR REPLACE FUNCTION public.update_restaurant_menus_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER restaurant_menus_set_updated_at
BEFORE UPDATE ON public.restaurant_menus
FOR EACH ROW EXECUTE FUNCTION public.update_restaurant_menus_updated_at();
