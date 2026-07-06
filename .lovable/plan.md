## Always-free IP allowlist

Add a small allowlist of IPs that bypass the 30-day anonymous scan limit. When any request comes from an allowlisted IP, treat it as free (like the owner-email bypass, but for anonymous requests from your phone).

### How your phone's IP gets added

Mobile IPs change (cell carriers rotate, Wi-Fi networks differ). Two ways to keep it accurate:

1. **One-tap "trust this network" button** — visible only when you're signed in as owner. It captures the current request IP and inserts it into the allowlist. Tap it once from your phone on cell data, once on home Wi-Fi, once at your usual restaurant Wi-Fi, etc.
2. **Auto-refresh** — every time you scan while signed in as owner, we silently upsert your current IP into the allowlist. So just using the app from your phone keeps its IPs trusted.

Option 2 alone covers 90% of the case with zero UI. I'd do both: auto-refresh on owner scans, plus a manual "trust this IP" button on the scan page for edge cases (someone else's phone, testing).

### What changes

**Database**
- New table `trusted_ips` (ip inet PK, label text, created_at). RLS: only service_role.
- New RPC `is_trusted_ip(_ip inet) → boolean`.
- Update `consume_anonymous_scan(_ip)`: if `is_trusted_ip(_ip)` is true, return `'anon'` without touching `anonymous_scans` (no 30-day limit, no row written).

**Server (`src/lib/menu.functions.ts`)**
- After owner-email is detected on a successful scan, upsert the request IP into `trusted_ips` with label = owner email.

**Scan page**
- Small "Trust this network" button, visible only when `isAdmin` is true, that calls a new `trustCurrentIp` server fn. Shows a toast with the IP that was added.

**Owner dashboard (optional, small)**
- Add a "Trusted IPs" section to `/admin` (if it exists) listing rows with a remove button. Skip if you don't want the UI — you can always remove rows via a migration.

### Notes

- This only affects anonymous requests. Signed-in owner already has unlimited via admin bypass — unchanged.
- IPv6: mobile carriers often hand out IPv6 addresses that rotate per session. The `inet` type handles both v4 and v6, but a rotating v6 will need occasional re-trusting — auto-refresh handles that.
- Not a security boundary: anyone on an allowlisted network gets free scans. That's the intent (your home, your phone). Don't allowlist coffee shop Wi-Fi.

### Technical details

- Migration creates `trusted_ips`, RPC `is_trusted_ip`, and updates `consume_anonymous_scan` to check it first.
- New server fn `trustCurrentIp` (auth-gated, admin-only via `is_admin` check) that reads the request IP with the existing `getClientIp` helper and upserts into `trusted_ips`.
- Owner auto-refresh: inside the `analyzeMenu` handler, after `isOwnerEmail`, fire a non-blocking upsert into `trusted_ips`.
- Scan page: import `trustCurrentIp`, render button gated on `getMyScanStatus().isAdmin`.

Want me to include the manual button, or is auto-refresh alone enough?