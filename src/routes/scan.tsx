import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Camera, ImageUp, Loader2, X } from "lucide-react";
import { analyzeMenu } from "@/lib/menu.functions";
import { newScanId, saveScan } from "@/lib/scan-store";

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
  // Resize to keep under ~1.5MB while preserving readable text.
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

function ScanPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  function pickFile(f: File) {
    setError(null);
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  function clearFile() {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  }

  async function onAnalyze() {
    if (!file) return;
    setLoading(true);
    setStage(0);
    setError(null);
    const stageTimer = window.setInterval(() => {
      setStage((s) => Math.min(s + 1, STAGES.length - 1));
    }, 2200);
    try {
      const dataUrl = await fileToDataUrl(file);
      const result = await analyzeMenu({
        data: { imageDataUrl: dataUrl, targetLanguage: language },
      });
      if (!result.dishes?.length) {
        throw new Error(
          "We couldn't find any dishes in that photo. Try a clearer, closer shot of the menu.",
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:py-16">
        {!loading && (
          <>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Scan a menu
            </h1>
            <p className="mt-3 text-muted-foreground">
              Drop in a photo, or take one with your camera. We'll do the rest.
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
                className={`mt-8 rounded-3xl border-2 border-dashed p-10 text-center transition-colors ${
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
                  JPG, PNG, WEBP up to 20 MB
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

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) pickFile(f);
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
                  }}
                />
              </div>
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
                <Button
                  onClick={onAnalyze}
                  size="lg"
                  className="h-12 w-full rounded-full text-base"
                >
                  Analyze menu
                </Button>
              </div>
            )}

            {error && (
              <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            )}
          </>
        )}

        {loading && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
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
