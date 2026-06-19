In `src/routes/index.tsx` (lines ~92-110), the three "How it works" cards each use a different `tint` for the icon badge background (`--primary`, `--secondary`, `--accent`).

Change: set all three `tint` values to `var(--primary)` so the Snap, Translate, and See it icon badges share the same color.

No other styling, copy, or layout changes.