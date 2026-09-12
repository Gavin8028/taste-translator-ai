# Add BabyLoveGrowth DNS record without breaking the live site

## Current state

- `menuvisionai.live` is the primary custom domain on Lovable.
- `www.menuvisionai.live` is connected to Lovable and currently redirects to `menuvisionai.live`.
- Public DNS shows `www.menuvisionai.live` as an **A record** pointing to `185.158.133.1` (Lovable).

## The conflict

The value you pasted — `cf1fa72d4a49c931.vercel-dns-016.com.` — is a Vercel/BabyLoveGrowth CNAME target. If you create a CNAME on `www.menuvisionai.live` pointing to that address, `www.menuvisionai.live` will stop pointing at Lovable and will instead serve whatever BabyLoveGrowth/Vercel hosts there. The Lovable site at `www` will break, and the redirect to the root domain will stop working.

## Recommended approach

Use a **subdomain** for the BabyLoveGrowth content instead of `www`. This keeps the main website untouched.

Suggested subdomain: `blog.menuvisionai.live` or `content.menuvisionai.live`.

## Plan

1. **Choose a subdomain** with you (e.g., `blog.menuvisionai.live`).
2. **Add one DNS record at your domain provider:**
   - Type: `CNAME`
   - Name: `blog` (or the chosen subdomain)
   - Value: `cf1fa72d4a49c931.vercel-dns-016.com.`
   - TTL: default / auto
3. **Wait for propagation** (usually minutes, up to 72 hours).
4. **Verify** the subdomain resolves to BabyLoveGrowth using DNS lookup tools.
5. **Update any BabyLoveGrowth publishing settings** to use the chosen subdomain instead of `www.menuvisionai.live`.
6. **Keep `www.menuvisionai.live` and `menuvisionai.live` unchanged** so the Lovable site continues to work.

## If you really need it on `www`

We would first need to disconnect `www.menuvisionai.live` from Lovable in Project Settings → Domains, then add the CNAME. This removes the `www` redirect and the Lovable-hosted version at that address, so it should only be done if BabyLoveGrowth is meant to fully replace the site at `www`.
