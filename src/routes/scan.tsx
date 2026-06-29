import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Camera,
  ImageUp,
  Loader2,
  X,
  Clock,
  Trash2,
  Lightbulb,
  RotateCw,
  CheckCircle2,
  WifiOff,
  Sparkles,
  Lock,
} from "lucide-react";
import { analyzeMenu } from "@/lib/menu.functions";
import { getMyScanStatus } from "@/lib/credits.functions";
import {
  newScanId,
  saveScan,
  listRecentScans,
  deleteScan,
  type RecentScan,
} from "@/lib/scan-store";
import { saveScan as saveScanRemote } from "@/lib/scan-sync.functions";
import { useAuth } from "@/hooks/use-auth";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Scan a menu — MenuVision AI" },
      {
        name: "description",
        content:
          "Upload a photo of any menu and instantly see translations, descriptions, and pictures of every dish.",
      },
      { property: "og:title", content: "Scan a menu — MenuVision AI" },
      {
        property: "og:description",
        content:
          "Upload a photo of any menu and instantly see translations, descriptions, and pictures of every dish.",
      },
      { property: "og:url", content: "https://menuvisionai.live/scan" },
    ],
    links: [{ rel: "canonical", href: "https://menuvisionai.live/scan" }],
  }),
  component: ScanPage,
});

const STAGES = [
  { label: "Reading the menu…", hint: "Pulling text from every page." },
  { label: "Detecting language…", hint: "Figuring out what we're looking at." },
  { label: "Translating dishes…", hint: "Carefully word by word." },
  { label: "Writing descriptions…", hint: "So you know what you're ordering." },
  { label: "Almost ready…", hint: "Finishing touches." },
];

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("network") || m.includes("fetch") || m.includes("failed to fetch"))
    return "We couldn't reach our servers. Check your internet and try again.";
  if (m.includes("timeout") || m.includes("timed out"))
    return "That took too long. Try fewer or smaller photos.";
  if (m.includes("rate") || m.includes("429") || m.includes("too many"))
    return "We're a little busy right now. Wait a few seconds and try again.";
  if (m.includes("payment") || m.includes("402"))
    return "AI credits are temporarily unavailable. Please try again shortly.";
  if (m.includes("couldn't find") || m.includes("no dishes"))
    return "We couldn't find any dishes. Try a closer, brighter, less blurry photo.";
  if (m.includes("too large") || m.includes("size"))
    return "One of those photos is too big. Try smaller images (under 20 MB each).";
  return message || "Something went wrong. Please try again.";
}

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Japanese",
  "Chinese",
  "Korean",
  "Arabic",
  "Hindi",
  "Russian",
  "Turkish",
  "Dutch",
];

async function fileToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }
  const maxDim = 1800;
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.85);
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const MAX_PHOTOS = 8;

type PageItem = { file: File; previewUrl: string };

function ScanPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [pages, setPages] = useState<PageItem[]>([]);
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [recent, setRecent] = useState<RecentScan[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [offline, setOffline] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const fetchStatus = useServerFn(getMyScanStatus);
  const { data: status, refetch: refetchStatus } = useQuery({
    queryKey: ["scan-status", user?.id ?? null],
    queryFn: () => fetchStatus(),
    enabled: !!user,
    staleTime: 30_000,
  });

  useEffect(() => {
    setRecent(listRecentScans());
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    return () => {
      pages.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function validate(f: File): string | null {
    if (!f.type.startsWith("image/")) return "Please pick an image file.";
    if (f.size > 20 * 1024 * 1024) return "That photo is over 20 MB. Try a smaller one.";
    return null;
  }

  function addFiles(files: FileList | File[]) {
    setError(null);
    const arr = Array.from(files);
    const room = MAX_PHOTOS - pages.length;
    if (room <= 0) {
      setError(`You can scan up to ${MAX_PHOTOS} photos at a time.`);
      return;
    }
    const next: PageItem[] = [];
    for (const f of arr.slice(0, room)) {
      const err = validate(f);
      if (err) {
        setError(err);
        continue;
      }
      next.push({ file: f, previewUrl: URL.createObjectURL(f) });
    }
    if (arr.length > room) {
      setError(
        `Only the first ${room} ${room === 1 ? "photo was" : "photos were"} added (max ${MAX_PHOTOS} per menu).`,
      );
    }
    if (next.length) setPages((prev) => [...prev, ...next]);
  }

  function removePage(idx: number) {
    setPages((prev) => {
      const removed = prev[idx];
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  }

  function clearAll() {
    pages.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPages([]);
  }

  async function onAnalyze() {
    if (!pages.length) return;
    setLoading(true);
    setStage(0);
    setElapsed(0);
    setError(null);
    const startedAt = Date.now();
    track("scan_started", { photos: pages.length, language });
    const stageTimer = window.setInterval(() => {
      setStage((s) => Math.min(s + 1, STAGES.length - 1));
    }, 2200);
    const elapsedTimer = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);
    try {
      const dataUrls = await Promise.all(pages.map((p) => fileToDataUrl(p.file)));
      const result = await analyzeMenu({
        data: {
          imageDataUrls: dataUrls,
          targetLanguage: language,
        },
      });
      if (!result.dishes?.length) {
        throw new Error(
          "We couldn't find any dishes in those photos. Try clearer, closer shots of the menu.",
        );
      }
      const id = newScanId();
      saveScan(id, result);
      track("scan_completed", {
        dishCount: result.dishes.length,
        durationMs: Date.now() - startedAt,
        language,
      });
      if (user) {
        void saveScanRemote({
          data: {
            clientId: id,
            title: result.restaurantName ?? null,
            sourceLanguage: result.sourceLanguage ?? null,
            targetLanguage: language,
            dishCount: result.dishes.length,
            payload: result,
          },
        }).catch(() => {});
      }
      window.clearInterval(stageTimer);
      window.clearInterval(elapsedTimer);
      navigate({ to: "/scan/$id", params: { id } });
    } catch (e) {
      window.clearInterval(stageTimer);
      window.clearInterval(elapsedTimer);
      console.error(e);
      const raw = e instanceof Error ? e.message : "unknown";
      if (raw.includes("out of free menu scans") || raw.includes("NO_CREDITS")) {
        setShowPaywall(true);
        void refetchStatus();
        setLoading(false);
        return;
      }
      track("scan_failed", { message: raw.slice(0, 200) });
      setError(friendlyError(raw));
      setLoading(false);
    }
  }

  function onDeleteRecent(id: string) {
    deleteScan(id);
    setRecent(listRecentScans());
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:py-16">
        {!loading && (
          <>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Scan a menu
            </h1>
            <p className="mt-3 text-muted-foreground">
              Take a photo, or drop one in. We'll do the rest.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="text-sm text-muted-foreground">Translate to</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {LANGUAGES.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>

            {pages.length === 0 && (
              <>
                {/* Mobile-first primary action: huge camera button */}
                <div className="mt-8 grid gap-3 sm:hidden">
                  <button
                    onClick={() => cameraRef.current?.click()}
                    className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-3xl bg-primary text-primary-foreground shadow-lg active:scale-[0.99]"
                  >
                    <Camera className="h-8 w-8" strokeWidth={1.75} />
                    <span className="text-lg font-semibold">Take a photo</span>
                  </button>
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card text-sm font-medium"
                  >
                    <ImageUp className="h-4 w-4" />
                    Upload from gallery
                  </button>
                </div>

                {/* Desktop: dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
                  }}
                  className={`mt-8 hidden rounded-3xl border-2 border-dashed p-10 text-center transition-colors sm:block ${
                    dragOver
                      ? "border-primary bg-primary/5"
                      : "border-border bg-surface hover:bg-accent/40"
                  }`}
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ImageUp className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-base font-medium">
                    Drop one or more menu photos here
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Up to {MAX_PHOTOS} pages · JPG, PNG, WEBP, HEIC · 20 MB each
                  </p>

                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <Button
                      onClick={() => inputRef.current?.click()}
                      className="rounded-full"
                    >
                      Choose files
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => cameraRef.current?.click()}
                      className="rounded-full"
                    >
                      <Camera className="h-4 w-4" />
                      Use camera
                    </Button>
                  </div>
                </div>

                {/* Camera & photo tips */}
                <div className="mt-6 rounded-2xl border border-border bg-card p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold">Tips for the best results</p>
                  </div>
                  <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      Hold steady and fill the frame with the menu
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      Good light, no big shadows or glare
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      Multi-page menus? Add one photo per page
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      Keep text level — straight on works best
                    </li>
                  </ul>
                </div>
              </>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) addFiles(e.target.files);
                e.target.value = "";
              }}
            />

            {pages.length > 0 && (
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {pages.length} {pages.length === 1 ? "page" : "pages"}
                    <span className="ml-1 text-muted-foreground">
                      · added in order
                    </span>
                  </p>
                  <button
                    onClick={clearAll}
                    className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                  >
                    Clear all
                  </button>
                </div>

                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {pages.map((p, i) => (
                    <li
                      key={p.previewUrl}
                      className="relative overflow-hidden rounded-2xl border border-border bg-card"
                    >
                      <img
                        src={p.previewUrl}
                        alt={`Menu page ${i + 1}`}
                        className="aspect-[3/4] w-full object-cover"
                      />
                      <span className="absolute left-2 top-2 rounded-full bg-background/85 px-2 py-0.5 text-xs font-medium backdrop-blur">
                        Page {i + 1}
                      </span>
                      <button
                        onClick={() => removePage(i)}
                        aria-label={`Remove page ${i + 1}`}
                        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/85 backdrop-blur hover:bg-background"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}

                  {pages.length < MAX_PHOTOS && (
                    <li>
                      <button
                        onClick={() => cameraRef.current?.click()}
                        className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        <Camera className="h-6 w-6" />
                        Add page
                      </button>
                    </li>
                  )}
                </ul>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => inputRef.current?.click()}
                    disabled={pages.length >= MAX_PHOTOS}
                    className="rounded-full"
                  >
                    <ImageUp className="h-4 w-4" />
                    Add from gallery
                  </Button>
                  <Button
                    onClick={onAnalyze}
                    disabled={offline}
                    size="lg"
                    className="h-12 flex-1 rounded-full text-base"
                  >
                    Analyze {pages.length === 1 ? "menu" : `${pages.length} pages`}
                  </Button>
                </div>
              </div>
            )}

            {offline && (
              <div
                role="status"
                className="mt-6 flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300"
              >
                <WifiOff className="h-4 w-4 shrink-0" />
                <p>
                  You're offline. Reconnect to analyze a menu — your photos stay
                  ready.
                </p>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
              >
                <p className="font-medium">{error}</p>
                {pages.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onAnalyze}
                      className="rounded-full border-destructive/30 bg-background text-foreground"
                    >
                      <RotateCw className="h-4 w-4" />
                      Try again
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearAll}
                      className="rounded-full"
                    >
                      Start over
                    </Button>
                  </div>
                )}
              </div>
            )}

            {pages.length === 0 && recent.length > 0 && (
              <section className="mt-12">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Recent scans
                    </h2>
                  </div>
                  <Link
                    to="/history"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <ul className="space-y-2">
                  {recent.map((s) => (
                    <li key={s.id}>
                      <div className="group flex items-center gap-2 rounded-2xl border border-border/70 bg-card p-3 transition-colors hover:bg-accent/40">
                        <Link
                          to="/scan/$id"
                          params={{ id: s.id }}
                          className="flex flex-1 items-center gap-3 min-w-0"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <ImageUp className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {s.restaurantName || "Untitled menu"}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {s.dishCount} dishes · {s.sourceLanguage} ·{" "}
                              {formatRelative(s.createdAt)}
                            </p>
                          </div>
                        </Link>
                        <button
                          onClick={() => onDeleteRecent(s.id)}
                          aria-label="Delete scan"
                          className="rounded-full p-2 text-muted-foreground opacity-0 transition-opacity hover:bg-background hover:text-foreground group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">
                  Scans stay on this device. Open one to view it instantly — images are
                  cached too.
                </p>
              </section>
            )}
          </>
        )}

        {loading && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="relative">
              <Loader2 className="h-14 w-14 animate-spin text-primary" />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold tabular-nums text-primary">
                {elapsed}s
              </span>
            </div>
            <h2 className="mt-8 text-2xl font-semibold tracking-tight">
              {STAGES[stage].label}
            </h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {STAGES[stage].hint}
            </p>
            <div className="mt-6 flex gap-1.5" aria-label="Progress">
              {STAGES.map((s, i) => (
                <span
                  key={s.label}
                  className={`h-1.5 w-8 rounded-full transition-colors ${
                    i < stage
                      ? "bg-primary"
                      : i === stage
                        ? "bg-primary/60 animate-pulse"
                        : "bg-border"
                  }`}
                />
              ))}
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Usually 10–20 seconds · {pages.length}{" "}
              {pages.length === 1 ? "page" : "pages"}
            </p>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
