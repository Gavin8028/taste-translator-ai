# Phase E: SEO & Content Polish

Goal: fix every failing SEO finding and polish the site so it ranks and shares correctly.

## 1. Sitemap + robots + llms.txt

- Create `src/routes/sitemap[.]xml.ts` (server route) with every public, indexable route: `/`, `/scan`, `/pricing`, `/faq`, `/demo`, `/restaurants`, `/restaurants/new`, `/about`, `/privacy`, `/terms`, `/refunds`, `/history`, plus every published restaurant menu from `restaurant_menus` where `paid = true`.
- Create `public/robots.txt`: `Allow: /` for all crawlers, reference `/sitemap.xml`.
- Create `public/llms.txt` with site summary and link list for AI crawlers.

## 2. Fix root metadata

- Update `src/routes/__root.tsx` meta: replace generic "Lovable" / "Menu Vision" branding with MenuVision AI copy.
- Add Organization + WebSite JSON-LD to `__root.tsx`.
- Remove root-level `og:image` so leaf routes control their own share previews.

## 3. Per-route metadata & canonicals

Add `head()` with unique title, description, `og:title`, `og:description`, `og:url`, and self-referencing `canonical` to every public leaf route:

- `/`, `/scan`, `/pricing`, `/faq`, `/demo`, `/restaurants`, `/restaurants/new`, `/about`, `/privacy`, `/terms`, `/refunds`, `/history`
- `/m/$slug` (Restaurant): derive from loader data; add Restaurant JSON-LD using menu name + dishes.
- `/scan/$id` (Scan result): derive from scan payload title + target language.

## 4. Structured data

- `Organization` + `WebSite` schemas on root.
- `FAQPage` schema on `/faq`.
- `Restaurant` / `Menu` schema on `/m/$slug` using available loader data.

## 5. Accessibility / content polish

- Fix heading skip on `/restaurants` (h3 → h2).
- Replace generic "Learn more" link text on the homepage with something descriptive.
- Verify all icon-only buttons have `aria-label`.

## 6. OG image

- Ask before generating any new OG images. For now, fix all text-based meta tags and structured data first.

## Technical notes

- Base URL for canonicals and `og:url`: `https://menuvisionai.live`.
- No changes to routing, auth, payments, or pricing logic.
- All changes are additive (new head tags, new files) — no breaking changes.
