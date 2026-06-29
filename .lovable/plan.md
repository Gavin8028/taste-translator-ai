I found the scan error: the AI scan function is still using strict `generateObject` schema validation, so when the model returns slightly imperfect structured output, the whole scan crashes with `AI_NoObjectGeneratedError: No object generated: response did not match schema`.

Plan:
1. Replace the brittle `generateObject` scan call in `src/lib/menu.functions.ts` with a safer text-to-JSON flow:
   - Ask the AI for JSON only.
   - Extract JSON from the response even if it includes markdown or extra text.
   - Validate and normalize it with the existing schema.
2. Add a repair/fallback pass for imperfect output:
   - Coerce missing arrays to `[]`.
   - Coerce missing nullable fields to `null`.
   - Clamp `spiceLevel` to `0–3`.
   - Drop only unusable dish rows instead of failing the whole scan.
3. Return friendly scan errors instead of raw AI SDK schema errors:
   - If no dishes are readable, show the existing “try a clearer photo” message.
   - If the AI service is rate-limited or out of credits, keep the existing specific messages.
4. Update restaurant menu creation/replacement to avoid calling the auth-protected diner scan function internally, because that can break owner menu creation and credit logic.
5. Verify by running the scan path after the fix and confirming the schema error no longer appears.