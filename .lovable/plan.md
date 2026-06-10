## Restaurant mode

A new flow for restaurant owners: scan their menu once, get a permanent public link (`/m/:slug`) that any guest can open to see every dish with translations and AI images. No sign-up — owners get an edit token saved in their browser so they can re-run or replace the menu later.

### New pages

- **`/restaurants`** — Landing for restaurant owners. Pitch + "Create your menu page" CTA.
- **`/restaurants/new`** — Form: restaurant name, choose a URL slug (auto-suggested), upload menu photo, pick the menu's source language. Runs the existing `analyzeMenu` server fn, generates dish images, saves everything to the database, and shows the share link.
- **`/m/$slug`** — Public guest view. Restaurant name at the top, language switcher (English / Spanish / French / Japanese / Chinese — the languages we pre-translate), then the dish grid using the existing `DishCard` + `DishDetailSheet` components. Open Graph metadata so the link previews nicely when shared.
- **`/restaurants/$slug/edit`** — Only accessible if the browser holds the matching edit token. Re-scan the menu, rename the restaurant, or delete it.

### Home & header

- Add a small "For restaurants" link in the site header pointing to `/restaurants`.
- Add a one-line mention of restaurant mode on the home page near the value props.

### Backend (Lovable Cloud)

Enable Cloud and add:

- `restaurant_menus` table: `id`, `slug` (unique), `name`, `source_language`, `edit_token` (random secret), `created_at`.
- `menu_dishes` table: `id`, `menu_id`, `name_original`, `description`, `ingredients[]`, `cuisine`, `spice_level`, `dietary[]`, `image_url`, `position`, plus a JSONB `translations` column holding the dish name + description in each pre-translated language.
- Public storage bucket `menu-images` for generated dish photos.
- RLS: anyone can `SELECT` menus and dishes; inserts/updates/deletes only go through server functions that check the edit token.

### Server functions

- `createRestaurantMenu` — runs OCR, translates the menu into the 5 supported languages in one call, generates dish images, uploads them to storage, inserts rows, returns `{ slug, editToken }`.
- `getRestaurantMenu(slug)` — public read for the guest page.
- `updateRestaurantMenu(slug, editToken, ...)` — owner edits.
- `deleteRestaurantMenu(slug, editToken)`.

### Out of scope for this pass

Payments / gating restaurant mode behind a paid plan, custom domains, QR-code generator, analytics, menu item editing one-by-one (only full re-scan), multiple owners per menu.