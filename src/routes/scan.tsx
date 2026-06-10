import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Camera, ImageUp, Loader2, X, Clock, Trash2 } from "lucide-react";
import { analyzeMenu } from "@/lib/menu.functions";
import {
  newScanId,
  saveScan,
  listRecentScans,
  deleteScan,
  type RecentScan,
} from "@/lib/scan-store";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Scan a menu — MenuVision AI" },
      {
        name: "description",
        content:
          "Upload a photo of any menu and instantly see translations, descriptions, and pictures of every dish.",
      },
    ],
  }),
  component: ScanPage,
});

const STAGES = [
  "Reading the menu…",
  "Detecting language…",
  "Translating dishes…",
  "Writing descriptions…",
  "Almost ready…",
];

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
  const [pages, setPages] = useState<PageItem[]>([]);
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [recent, setRecent] = useState<RecentScan[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecent(listRecentScans());
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
    setError(null);
    const stageTimer = window.setInterval(() => {
      setStage((s) => Math.min(s + 1, STAGES.length - 1));
    }, 2200);
    try {
      const dataUrls = await Promise.all(pages.map((p) => fileToDataUrl(p.file)));
      const result = await analyzeMenu({
        data: { imageDataUrls: dataUrls, targetLanguage: language },
      });
      if (!result.dishes?.length) {
        throw new Error(
          "We couldn't find any dishes in those photos. Try clearer, closer shots of the menu.",
        );
      }
      const id = newScanId();
      saveScan(id, result);
      window.clearInterval(stageTimer);
      navigate({ to: "/scan/$id", params: { id } });
    } catch (e) {
      window.clearInterval(stageTimer);
      console.error(e);
      setError(
        e instanceof Error ? e.message : "Something went wrong analyzing your menu.",
      );
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

            {!preview && (
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
                    const f = e.dataTransfer.files?.[0];
                    if (f) pickFile(f);
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
                  <p className="mt-4 text-base font-medium">Drop a menu photo here</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    JPG, PNG, WEBP, HEIC — up to 20 MB
                  </p>

                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <Button
                      onClick={() => inputRef.current?.click()}
                      className="rounded-full"
                    >
                      Choose a file
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

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) pickFile(f);
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
                    const f = e.target.files?.[0];
                    if (f) pickFile(f);
                    e.target.value = "";
                  }}
                />
              </>
            )}

            {preview && (
              <div className="mt-8 space-y-4">
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
                  <img
                    src={preview}
                    alt="Menu preview"
                    className="max-h-[60vh] w-full object-contain"
                  />
                  <button
                    onClick={clearFile}
                    aria-label="Remove photo"
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur hover:bg-background"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => cameraRef.current?.click()}
                    className="rounded-full"
                  >
                    <Camera className="h-4 w-4" />
                    Retake
                  </Button>
                  <Button
                    onClick={onAnalyze}
                    size="lg"
                    className="h-12 flex-1 rounded-full text-base"
                  >
                    Analyze menu
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            )}

            {!preview && recent.length > 0 && (
              <section className="mt-12">
                <div className="mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Recent scans
                  </h2>
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
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="mt-8 text-2xl font-semibold tracking-tight">
              {STAGES[stage]}
            </h2>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Hang tight — we're reading every line, translating, and writing fresh
              descriptions. This usually takes 10–20 seconds.
            </p>
            <div className="mt-8 flex gap-1.5">
              {STAGES.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-8 rounded-full transition-colors ${
                    i <= stage ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
