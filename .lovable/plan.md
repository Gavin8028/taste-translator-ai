# Finish Phase E: SEO & Content Polish

We've shipped sitemap, robots, llms.txt, root metadata, and canonicals on `/`, `/scan`, `/pricing`. Here's what's left to close out Phase E.

## 1. Per-route `head()` metadata + canonicals

Add unique title, description, `og:title`, `og:description`, `og:url`, and self-referencing canonical to:

- `/faq`
- `/demo`
- `/restaurants` (index)
- `/restaurants/new`
- `/about`
- `/privacy`
- `/terms`
- `/refunds`
- `/history`

## 2. Dynamic route metadata

- `/m/$slug` — derive title/description from loader data (menu name + restaurant), add `og:url`, canonical, and `Restaurant` + `Menu` JSON-LD using dish names.
- `/scan/$id` — derive title from scan payload (e.g. "Menu scan — Spanish → English"), no indexable canonical (these are per-user).

## 3. Structured data

- `FAQPage` JSON-LD on `/faq` built from the existing FAQ array.
- `Restaurant` / `Menu` JSON-LD on `/m/$slug` (see above).

## 4. Accessibility / content polish

- Fix heading skip on `/restaurants` (h3 → h2 where appropriate).
- Replace generic "Learn more" link text on the homepage with descriptive copy.
- Sweep icon-only buttons for missing `aria-label`.

## 5. Out of scope (ask before doing)

- Generating new OG share images. Text meta + JSON-LD first; we can add per-route OG images in a follow-up if you want.

No routing, auth, payments, or pricing logic changes. All additive.
