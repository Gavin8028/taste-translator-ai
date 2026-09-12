# Add the BabyLoveGrowth DNS record

No changes to your website are needed for this. The only step is adding one record at your domain provider.

## The record to add

- Type: CNAME
- Name / Host: `content`
- Value / Target: `cf1fa72d4a49c931.vercel-dns-016.com.`
- TTL: Default / Auto
- Proxy (if your provider asks): off / DNS only

This creates `content.menuvisionai.live` and points it at BabyLoveGrowth.

## Do not touch these

- `menuvisionai.live` -> A record `185.158.133.1`
- `www.menuvisionai.live` -> A record `185.158.133.1`

Changing either would take your live site down.

## After adding it

1. Wait 10-30 minutes (can take up to 1-2 hours).
2. Press "Recheck" on the BabyLoveGrowth screen; it should flip from "Not found" to found, then continue the setup.
3. Tell me once it's added and I will confirm the record is visible publicly.

Note: your site already has its own blog at `menuvisionai.live/blog` pulling the same articles, so `content.menuvisionai.live` is an additional BabyLoveGrowth-hosted address, not a replacement.
