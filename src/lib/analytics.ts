import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { trackEvent } from "./analytics.functions";

const SESSION_KEY = "mv_session_id";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const today = new Date().toISOString().slice(0, 10);
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { id: string; day: string };
      if (parsed.day === today) return parsed.id;
    }
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id, day: today }));
    return id;
  } catch {
    return "";
  }
}

export function track(name: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    void trackEvent({
      data: {
        name,
        path: window.location.pathname + window.location.search,
        sessionId: getSessionId(),
        referrer: document.referrer || null,
        props: props ?? {},
      },
    }).catch(() => {});
  } catch {
    // swallow
  }
}

export function usePageViewTracking(): void {
  const router = useRouter();
  useEffect(() => {
    // Initial view
    track("page_view");
    const unsub = router.subscribe("onResolved", () => {
      track("page_view");
    });
    return () => unsub();
  }, [router]);
}
