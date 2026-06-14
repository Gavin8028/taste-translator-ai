import type { MenuResult } from "./menu.functions";

const PREFIX = "menuvision:scan:";
const INDEX_KEY = "menuvision:scans:index";
const MAX_RECENT_FREE = 8;
const MAX_RECENT_PREMIUM = 50;

function getMaxRecent(): number {
  if (typeof window === "undefined") return MAX_RECENT_FREE;
  try {
    const raw = localStorage.getItem("menuvision:diner-premium");
    if (raw && JSON.parse(raw)?.active === true) return MAX_RECENT_PREMIUM;
  } catch {
    // ignore
  }
  return MAX_RECENT_FREE;
}

export type RecentScan = {
  id: string;
  restaurantName: string | null;
  dishCount: number;
  sourceLanguage: string;
  createdAt: number;
};

function readIndex(): RecentScan[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    return raw ? (JSON.parse(raw) as RecentScan[]) : [];
  } catch {
    return [];
  }
}

function writeIndex(list: RecentScan[]) {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function saveScan(id: string, data: MenuResult) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFIX + id, JSON.stringify(data));
  } catch {
    // quota — drop oldest and retry once
    const list = readIndex();
    const oldest = list[list.length - 1];
    if (oldest) {
      localStorage.removeItem(PREFIX + oldest.id);
      writeIndex(list.slice(0, -1));
      try {
        localStorage.setItem(PREFIX + id, JSON.stringify(data));
      } catch {
        return;
      }
    }
  }

  const entry: RecentScan = {
    id,
    restaurantName: data.restaurantName ?? null,
    dishCount: data.dishes.length,
    sourceLanguage: data.sourceLanguage,
    createdAt: Date.now(),
  };
  const next = [entry, ...readIndex().filter((s) => s.id !== id)].slice(
    0,
    getMaxRecent(),
  );
  writeIndex(next);
}

export function loadScan(id: string): MenuResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREFIX + id);
    return raw ? (JSON.parse(raw) as MenuResult) : null;
  } catch {
    return null;
  }
}

export function listRecentScans(): RecentScan[] {
  return readIndex();
}

export function deleteScan(id: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PREFIX + id);
  } catch {
    // ignore
  }
  writeIndex(readIndex().filter((s) => s.id !== id));
}

export function newScanId(): string {
  return Math.random().toString(36).slice(2, 10);
}
