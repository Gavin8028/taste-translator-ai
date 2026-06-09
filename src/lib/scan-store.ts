import type { MenuResult } from "./menu.functions";

const PREFIX = "menuvision:scan:";

export function saveScan(id: string, data: MenuResult) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PREFIX + id, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

export function loadScan(id: string): MenuResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PREFIX + id);
    return raw ? (JSON.parse(raw) as MenuResult) : null;
  } catch {
    return null;
  }
}

export function newScanId(): string {
  return Math.random().toString(36).slice(2, 10);
}
