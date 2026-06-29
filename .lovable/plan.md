Before publishing, I'll run a quick readiness sweep so you're not shipping a broken build:

1. **Build check** — run the production build and surface any TypeScript/Vite errors.
2. **Security scan** — run the security scanner; Lovable blocks publish on unresolved critical findings.
3. **Scan flow smoke test** — Playwright a real menu scan end-to-end on localhost (the flow that's been breaking) and confirm dishes render.
4. **Website info preflight** — verify title, meta description, OG/Twitter tags, and favicon are correct on the home route.
5. **Publish** — if all four pass, call `preview_ui--publish` to deploy to `menuvisionai.live`. If anything fails, stop and report back instead of publishing.

Approve and I'll run the sweep and publish if clean.