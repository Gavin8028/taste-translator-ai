// Small client-side helper for remembering menus the user owns in this browser.
const KEY = "menuvision:owner";

export type OwnerEntry = { editToken: string; name?: string; createdAt?: string };
export type OwnerMap = Record<string, OwnerEntry>;

function read(): OwnerMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Backwards-compatible: previously stored as { [slug]: editToken: string }
    if (parsed && typeof parsed === "object") {
      const out: OwnerMap = {};
      for (const [slug, val] of Object.entries(parsed)) {
        if (typeof val === "string") out[slug] = { editToken: val };
        else if (val && typeof val === "object" && "editToken" in (val as object))
          out[slug] = val as OwnerEntry;
      }
      return out;
    }
  } catch {
    // ignore
  }
  return {};
}

function write(map: OwnerMap) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function rememberOwner(slug: string, entry: OwnerEntry) {
  const map = read();
  map[slug] = { ...map[slug], ...entry };
  write(map);
}

export function forgetOwner(slug: string) {
  const map = read();
  delete map[slug];
  write(map);
}

export function getOwnerToken(slug: string): string | undefined {
  return read()[slug]?.editToken;
}

export function listOwnedMenus(): Array<{ slug: string } & OwnerEntry> {
  const map = read();
  return Object.entries(map).map(([slug, entry]) => ({ slug, ...entry }));
}
