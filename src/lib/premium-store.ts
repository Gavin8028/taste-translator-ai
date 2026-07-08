// Client-side flag for the Diner Premium subscription.
// The app has no diner auth (scans live in the browser), so premium is
// tracked per-device in localStorage and set by the Paddle checkout
// success page. Not a security boundary — purely a UX gate.
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getMyScanStatus } from "@/lib/credits.functions";


const KEY = "menuvision:diner-premium";
const EVENT = "menuvision:diner-premium-changed";

type PremiumRecord = {
  active: true;
  since: string;
  transactionId?: string;
};

function read(): PremiumRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.active === true) return parsed as PremiumRecord;
  } catch {
    // ignore
  }
  return null;
}

export function isDinerPremium(): boolean {
  return read() !== null;
}

export function setDinerPremium(transactionId?: string) {
  if (typeof window === "undefined") return;
  const record: PremiumRecord = {
    active: true,
    since: new Date().toISOString(),
    transactionId,
  };
  localStorage.setItem(KEY, JSON.stringify(record));
  window.dispatchEvent(new Event(EVENT));
}

export function clearDinerPremium() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function useDinerPremium(): boolean {
  const [localActive, setLocalActive] = useState<boolean>(false);
  useEffect(() => {
    setLocalActive(isDinerPremium());
    const update = () => setLocalActive(isDinerPremium());
    window.addEventListener(EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["scan-status", user?.id ?? "anon"],
    queryFn: () => getMyScanStatus(),
    enabled: !!user,
    staleTime: 60_000,
  });
  const serverPremium = !!data?.isPremium || !!data?.isAdmin;
  useEffect(() => {
    if (serverPremium && !isDinerPremium()) {
      setDinerPremium();
    }
  }, [serverPremium]);
  return localActive || serverPremium;
}

