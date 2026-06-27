# Phase D: Google Sign-In + Accounts

Goal: add optional Google sign-in so diners can sync scan history across devices and restaurant owners can manage their menus without pasting an edit token — without breaking the "no sign-up required" promise.

## Guiding principles

- **Sign-in stays optional.** Diners can still scan and view menus as a guest forever.
- **Google only** (per Lovable Cloud defaults for fastest sign-in).
- **Email/password is disabled** so the auth page stays a one-button experience.
- **Local data auto-migrates** the first time a user signs in on a device.

## 1. Auth scaffolding

- Enable Google via `configure_social_auth(["google"], disable_providers: ["email"])`.
- New public route `/auth` with a single "Continue with Google" button using `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth/callback" })`.
- New public route `/auth/callback` that waits for the Supabase session, then navigates to the stored intended path (defaulting to `/`).
- Add a `useAuth()` hook (`src/hooks/use-auth.ts`) that subscribes once to `supabase.auth.onAuthStateChange` and exposes `{ user, loading, signOut }`.
- Add the single root `onAuthStateChange` invalidator in `__root.tsx` per the integration rules.

## 2. Header & UX

- In `SiteHeader`, replace nothing visible — add a small avatar/initial button next to the hamburger when signed in, and "Sign in" link in the sheet menu when signed out.
- Inside the hamburger sheet: show email + "Sign out" at the top when signed in; show "Sign in with Google" at the top when signed out.
- Sign-in is never required to reach any existing page.

## 3. Database

New migration:

- `profiles` table linked to `auth.users(id)` with `display_name`, `avatar_url`, `created_at`. RLS: users read/update only their own row. Trigger on `auth.users` insert to auto-create a profile.
- `scans` table: `id`, `user_id` (FK auth.users, on delete cascade), `title`, `source_language`, `target_language`, `payload` (JSONB — full scan result), `created_at`. RLS: users only see/insert/delete their own rows. Standard GRANTs.
- Add a nullable `owner_id uuid` column to `restaurant_menus`. When set, the owning user can edit without the edit token. Add policy: owners can `SELECT/UPDATE/DELETE` their own menus via `requireSupabaseAuth`. Keep the existing `edit_token` flow intact for backward compatibility and for owners who never sign in.

## 4. Synced scan history

- New server fns in `src/lib/scan-sync.functions.ts`:
  - `listMyScans()` — returns the signed-in user's scans (newest first).
  - `saveScan({ payload, title, source_language, target_language })` — inserts a scan.
  - `deleteScan({ id })`.
- `src/lib/scan-store.ts` becomes a thin wrapper: if signed in, read/write through the server fns; if signed out, keep using `localStorage` as today.
- On first sign-in, run a one-time migration that uploads any `localStorage` scans to the server, then clears them. Store a `migrated:<user_id>` flag in `localStorage` so it only runs once per device per user.
- `/history` page works for both signed-in and signed-out users (signed-out users still see their local history — no upgrade gate, since history is free).

## 5. Restaurant owner accounts

- `/restaurants/new`: if signed in, set `owner_id = auth.uid()` on insert via a new authenticated server fn `createRestaurantMenuAsOwner` (parallel to the existing one). Edit token is still generated and shown, but the user no longer needs to save it.
- New `/restaurants/mine` page (under `_authenticated/`) — lists the signed-in user's menus with edit/delete buttons. Linked from the hamburger menu only when signed in.
- `/restaurants/$slug/edit`: if the signed-in user owns the menu, skip the edit-token prompt entirely. Otherwise, the existing token flow is unchanged.
- Owner email is captured for the $39 Paddle checkout automatically when signed in (prefills `customer_email`).

## 6. Auth-required vs public

- Move `/restaurants/mine` under `src/routes/_authenticated/`. Everything else stays public.
- The integration-managed `_authenticated/route.tsx` already exists (or will be created in the same edit). No custom auth gates.
- `src/start.ts` must include the bearer middleware (`attachSupabaseAuth` or existing project-specific equivalent) so authenticated server fns get the token.

## 7. Sign-out hygiene

When the user signs out: cancel queries, clear the Query cache, call `supabase.auth.signOut()`, then `navigate({ to: "/", replace: true })`. Avoids 401 storms and back-button restoring protected views.

## Technical notes

- New files: `src/routes/auth.tsx`, `src/routes/auth.callback.tsx`, `src/routes/_authenticated/route.tsx` (only if missing — integration-managed), `src/routes/_authenticated/restaurants.mine.tsx`, `src/hooks/use-auth.ts`, `src/lib/scan-sync.functions.ts`, `src/lib/restaurant-owner.functions.ts`.
- New migration: `profiles`, `scans`, `restaurant_menus.owner_id`, plus all GRANTs, RLS, and the profile trigger.
- No changes to pricing, payments, or any existing public route's URL.
- All existing localStorage-based flows keep working unchanged for signed-out users.

After approval I'll build this end-to-end and verify Google sign-in, history sync, and owner edit-without-token via Playwright.
