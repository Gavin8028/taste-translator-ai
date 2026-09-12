CREATE TABLE public.blg_articles (
  id BIGINT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  previous_slugs TEXT[] NOT NULL DEFAULT '{}',
  title TEXT NOT NULL,
  meta_description TEXT,
  hero_image_url TEXT,
  language_code TEXT,
  content_html TEXT,
  json_ld JSONB,
  faq_json_ld JSONB,
  article_created_at TIMESTAMPTZ,
  article_updated_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blg_articles TO anon;
GRANT SELECT ON public.blg_articles TO authenticated;
GRANT ALL ON public.blg_articles TO service_role;

ALTER TABLE public.blg_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blog articles are publicly readable"
  ON public.blg_articles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX blg_articles_slug_idx ON public.blg_articles (slug);
CREATE INDEX blg_articles_created_idx ON public.blg_articles (article_created_at DESC);

CREATE TABLE public.blg_sync_state (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  list_offset INT NOT NULL DEFAULT 0,
  list_complete BOOLEAN NOT NULL DEFAULT false,
  last_run_at TIMESTAMPTZ,
  lease_until TIMESTAMPTZ,
  next_allowed_at TIMESTAMPTZ
);

GRANT ALL ON public.blg_sync_state TO service_role;

ALTER TABLE public.blg_sync_state ENABLE ROW LEVEL SECURITY;

INSERT INTO public.blg_sync_state (id) VALUES (1);