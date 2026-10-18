# Stay signed in on the same device

## What's happening
Sign-in is already saved on the device, but each web address keeps its own separate sign-in. `menuvisionai.live`, `www.menuvisionai.live`, and `taste-translator-ai.lovable.app` count as three different sites, so signing in on one doesn't carry over to the others. Also, the header briefly shows "Sign in" while it checks, which looks like you got signed out.

## Changes
1. **One address for everyone** – automatically send visitors on `www.menuvisionai.live` and the `.lovable.app` address to `menuvisionai.live` (keeping the same page), so the sign-in is always stored in one place.
2. **No "signed out" flash** – the header reads the saved sign-in from the device instantly, and shows a neutral placeholder instead of "Sign in" while checking.
3. **Sign-in page** – if you're already signed in, skip the page right away instead of showing the Google button.

## Technical details
- Add a server request middleware in `src/start.ts` that 301-redirects requests whose host is `www.menuvisionai.live` or `*.lovable.app` (excluding `id-preview--` editor preview hosts and `/lovable/`, `/api/public/`, `/.well-known/`, `/mcp` paths) to `https://menuvisionai.live` + same path/query.
- `use-auth.ts`: initialize from `supabase.auth.getSession()` (local, instant) for UI, then confirm with `getUser()`; only clear the user if `getUser()` returns an auth error, not a network error. Expose `loading` so `site-header` renders a skeleton instead of the Sign in button.
- Session config (`persistSession`, `autoRefreshToken`) is already on; no change needed.
