I’m sorry. I changed too many moving parts around the scan flow, and the result is that the most important feature became unreliable. I’ll stop layering on extras and focus only on making scanning work again.

Plan:
1. Reproduce the scan failure from the live `/scan` page with a real test image and capture the exact user-facing error.
2. Check the server-function failure path for the scan call, especially auth, credit consumption, admin bypass, and backend RPC errors.
3. Fix the likely failure point so your owner/admin account can scan without credits or subscription restrictions.
4. Make scan failures safer: if the backend credit check fails, show a clear message and do not burn credits.
5. Keep the existing robust JSON menu parser, but add one more fallback so malformed AI text does not crash the scan.
6. Verify the full flow: upload/take menu photo → scan completes → result page opens → dishes render.

Technical details:
- Recent AI gateway logs show zero failed AI calls, which means the error is probably happening before AI analysis starts.
- The scan function currently consumes/validates credits before calling AI; that area will be reviewed first.
- I will only touch the scan/auth/credit path and any directly required error handling. I won’t redesign the site or add new features in this pass.