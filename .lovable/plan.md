
# Full build-out plan (A → E)

Sequenced so each phase ships something useful on its own. I'll work top-to-bottom and pause after each phase so you can review.

---

## Phase A — Finish restaurant mode

Make restaurant mode actually usable by a real restaurant.

- **Owner edit page** `/restaurants/$slug/edit`
  - Gated by the `edit_token` saved in `localStorage` (key: `menuvision.editTokens` → `{ [slug]: token }`)
  - Actions: rename menu, re-scan (replace dishes), delete menu
  - Server fns: `updateRestaurantMenu`, `deleteRestaurantMenu`, `replaceMenuDishes`
- **Owner memory**: on successful create, save `{ slug, editToken, name }` to localStorage. Add a "Your menus" list on `/restaurants` for returning owners.
- **Multi-language switcher on `/m/$slug`**
  - Pre-translate at creation into EN / ES / FR / JA / ZH
  - Add `translations` JSONB column to `menu_dishes` (name + description per language)
  - Language picker in the guest header, persists in URL query (`?lang=es`)
- **QR code download** on the edit page and the share screen (use `qrcode` npm package, render to canvas, download as PNG)
- **OG metadata** on `/m/$slug` — restaurant name in title/description, dish count, first dish image as og:image (loader-fed `head()`)
- **Storage for dish images** — bucket `menu-images`, generate once on create, store URL on `menu_dishes.image_url` so guest views are instant (no live generation)

---

## Phase B — Home page trust pass

Convert curious visitors into scanners.

- **"Try a sample menu"** button on hero → links to a pre-seeded `/m/demo` slug so people can see the output without uploading
- **"How it works"** 3-step section with icons (Snap → Translate → Explore) below the hero
- **FAQ section** (accordion) on home: accuracy, languages supported, privacy, cost, restaurant use case
- **Refined value-prop copy** + a secondary CTA strip near the bottom

---

## Phase C — Scan flow upgrades

Make `/scan` feel polished.

- **Mobile camera capture**: `<input type="file" accept="image/*" capture="environment">` so phones open the camera directly
- **Multi-photo upload** (long menus): accept up to 4 images, send all to `analyzeMenu` in one call, merge dishes
- **Language picker in UI** (you have it server-side already, expose it on the upload screen with a `<Select>`)
- **Better empty/error states**: friendly messages when OCR finds 0 dishes or the photo is blurry
- **"Save as restaurant menu"** button on `/scan_/$id` — promotes a personal scan into a permanent `/m/$slug`

---

## Phase D — Lightweight auth (Google only)

Keeps the anonymous flow but unlocks cross-device menu management for owners.

- Enable Google OAuth via the Lovable broker
- `/auth` route + sign-in button in the header
- `restaurant_menus.owner_id` (nullable) — when signed in at creation, claim the menu
- "My menus" dashboard at `/restaurants/mine` — list claimed menus, edit/delete each
- Anonymous edit-token flow still works for users who don't sign in
- Public guest view `/m/$slug` stays unchanged (no auth required to view)

*(This is the lightest possible auth — Google only, no email/password, no profiles table beyond what's needed.)*

---

## Phase E — SEO & content pages pass

Polish for shareability and search.

- **Per-route `head()` audit** — every route gets a unique title, description, og:title, og:description; canonical only at leaves
- **`/about`** filled out (mission, how MenuVision works, who it's for)
- **`/pricing`** filled out — even if everything is free for now, state it clearly
- **JSON-LD** on home (`Organization`) and on `/m/$slug` (`Restaurant` + `Menu` schema for rich snippets)
- **`public/robots.txt`** + **`public/sitemap.xml`** (skip `/scan_/*`, `/restaurants/*/edit`)
- **`public/llms.txt`** for AI crawlers
- **Favicon + apple-touch-icon set**

---

## Technical notes (for the engineer in the loop)

- **Migrations needed**:
  - `menu_dishes`: add `image_url text`, `translations jsonb default '{}'::jsonb`
  - `restaurant_menus`: add `owner_id uuid references auth.users(id) on delete set null` (Phase D)
  - Storage bucket `menu-images` (public read, service-role write)
- **New server fns** (in `src/lib/restaurant.functions.ts`):
  `updateRestaurantMenu`, `deleteRestaurantMenu`, `replaceMenuDishes`, `claimMenu`
- **New route files**:
  `src/routes/restaurants.$slug.edit.tsx`, `src/routes/restaurants.mine.tsx`, `src/routes/auth.tsx`, `src/routes/m.demo.tsx` (or seeded via migration)
- **New deps**: `qrcode` (QR generation, ~5kb)
- **AI calls**:
  - Pre-translate: extend `analyzeMenu` to return translations for all 5 languages in one structured-output call (Gemini handles this cheaply)
  - Dish images: generate at create-time, upload to `menu-images` bucket, store URL (eliminates live regen on every view)
- **Existing patterns preserved**: `createServerFn` for app logic, `attachSupabaseAuth` middleware (added when Phase D lands), no changes to `src/integrations/supabase/*` generated files

## Estimated review pauses

I'll pause after **A**, **B**, **C**, **D**, **E** so you can test each phase in preview before I move to the next. If anything in a phase doesn't feel right, we adjust before continuing.

## Heads-up

This contradicts the "MVP / no restaurant management" brief you pasted just before this — that brief said to avoid restaurant mode entirely. If you want, I can drop Phase A and Phase D and just do B + C + E (pure consumer scan app). Otherwise I'll proceed with the full A–E plan as written here.
