import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Camera, ImageUp, Loader2, X, Check, Copy, Pencil } from "lucide-react";
import { createRestaurantMenu } from "@/lib/restaurant.functions";
import { setMenuOwnerOnCreate } from "@/lib/restaurant-owner.functions";
import { rememberOwner } from "@/lib/owner-store";
import { QrCode } from "@/components/qr-code";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { useAuth } from "@/hooks/use-auth";



export const Route = createFileRoute("/restaurants/new")({
  head: () => ({
    meta: [
      { title: "Create your menu page — MenuVision AI" },
      {
        name: "description",
        content:
          "Snap a photo of your menu and get a permanent shareable link in under a minute.",
      },
      { property: "og:title", content: "Create your menu page — MenuVision AI" },
      {
        property: "og:description",
        content:
          "Snap a photo of your menu and get a permanent shareable link in under a minute.",
      },
      { property: "og:url", content: "https://menuvisionai.live/restaurants/new" },
    ],
    links: [{ rel: "canonical", href: "https://menuvisionai.live/restaurants/new" }],
  }),
  component: NewRestaurantMenu,
});

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

const STAGES = [
  "Reading your menu…",
  "Translating dishes…",
  "Writing descriptions…",
  "Almost ready…",
];

function NewRestaurantMenu() {
  const [name, setName] = useState("");

  const [slug, setSlug] = useState("");
  const [language, setLanguage] = useState("English");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ slug: string; editToken: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const { openCheckout, loading: checkoutLoading } = usePaddleCheckout();
  

  function pickFile(f: File) {
    if (!f.type.startsWith("image/")) {
      setError("Please pick an image file (JPG, PNG, WEBP, or HEIC).");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError("That photo is over 20 MB. Try a smaller one.");
      return;
    }
    setError(null);
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  }

  function clearFile() {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !name.trim()) return;
    setLoading(true);
    setStage(0);
    setError(null);
    const stageTimer = window.setInterval(() => {
      setStage((s) => Math.min(s + 1, STAGES.length - 1));
    }, 2500);
    try {
      const dataUrl = await fileToDataUrl(file);
      const res = await createRestaurantMenu({
        data: {
          name: name.trim(),
          slug: slug.trim() || undefined,
          imageDataUrl: dataUrl,
          targetLanguage: language,
        },
      });
      window.clearInterval(stageTimer);
      rememberOwner(res.slug, {
        editToken: res.editToken,
        name: name.trim(),
        createdAt: new Date().toISOString(),
      });
      if (user) {
        try {
          await setMenuOwnerOnCreate({ data: { slug: res.slug } });
        } catch {
          // non-fatal — the edit token still works
        }
      }
      setResult({ slug: res.slug, editToken: res.editToken });

    } catch (e) {
      window.clearInterval(stageTimer);
      console.error(e);
      setError(
        e instanceof Error ? e.message : "Something went wrong creating your menu.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    const url =
      typeof window !== "undefined" ? `${window.location.origin}/m/${result.slug}` : "";
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Check className="h-7 w-7" />
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            Menu ready — one last step.
          </h1>
          <p className="mt-3 text-muted-foreground">
            We've translated your dishes and reserved your link. Pay a one-time
            $39 to publish your menu page and unlock it for guests.
          </p>

          <div className="mt-6 rounded-2xl border-2 border-primary/40 bg-primary/5 p-5">
            <p className="text-sm font-medium">Publish your menu page</p>
            <p className="mt-1 text-sm text-muted-foreground">
              One-time payment. No subscriptions. Yours forever.
            </p>
            <Button
              onClick={() =>
                openCheckout({
                  priceId: "publish_menu_one_time",
                  customData: { slug: result.slug },
                  successUrl: `${window.location.origin}/restaurants/${result.slug}/edit?published=1`,
                })
              }
              disabled={checkoutLoading}
              className="mt-4 h-12 rounded-full px-6 text-base"
            >
              {checkoutLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Publish for $39
            </Button>
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card p-5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Public link
            </label>
            <div className="mt-2 flex items-center gap-2">
              <input
                readOnly
                value={url}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="rounded-lg"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5 text-sm">
            <p className="font-medium">Save your edit code</p>
            <p className="mt-1 text-muted-foreground">
              Keep this safe — you'll need it to update or replace your menu later.
              We've also saved it in this browser.
            </p>
            <code className="mt-3 block break-all rounded-lg bg-background p-3 text-xs">
              {result.editToken}
            </code>
          </div>

          <div className="mt-6 grid gap-5 rounded-2xl border border-border bg-card p-5 sm:grid-cols-[auto,1fr] sm:items-center">
            <QrCode value={url} filename={`${result.slug}-qr.png`} />
            <div>
              <p className="font-medium">Print this on your tables</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Guests scan to open your translated menu with photos. No app
                download, no sign-in.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="outline" className="rounded-full">
              <Link
                to="/restaurants/$slug/edit"
                params={{ slug: result.slug }}
              >
                <Pencil className="h-4 w-4" />
                Manage menu
              </Link>
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setResult(null);
                setName("");
                setSlug("");
                clearFile();
              }}
              className="rounded-full"
            >
              Create another
            </Button>
          </div>

        </main>
        <SiteFooter />
      </div>
    );
  }

  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="mx-auto w-full max-w-xl flex-1 px-5 py-16">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Sign in to publish your menu
          </h1>
          <p className="mt-3 text-muted-foreground">
            A free Google account keeps your $39 menu safe — you'll be able to edit, re-scan,
            or remove it from any device.
          </p>
          <Button asChild size="lg" className="mt-8 h-12 rounded-full px-6 text-base">
            <Link
              to="/auth"
              search={{ redirect: "/restaurants/new" }}
            >
              Continue with Google
            </Link>
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            Diners don't need an account — only restaurant owners do.
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12 sm:py-16">
        {!loading && (
          <>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Create your menu page
            </h1>
            <p className="mt-3 text-muted-foreground">
              Takes about a minute. Signed in as {user.email}.
            </p>


            <form onSubmit={onSubmit} className="mt-8 space-y-6">
              <div>
                <label className="text-sm font-medium">Restaurant name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={120}
                  placeholder="Trattoria Luna"
                  className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-sm font-medium">URL slug (optional)</label>
                <div className="mt-1.5 flex items-center rounded-xl border border-border bg-card focus-within:ring-2 focus-within:ring-ring">
                  <span className="pl-4 pr-1 text-sm text-muted-foreground">
                    /m/
                  </span>
                  <input
                    value={slug}
                    onChange={(e) =>
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                    }
                    maxLength={60}
                    placeholder="trattoria-luna"
                    className="flex-1 bg-transparent py-2.5 pr-4 text-sm focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Leave blank to use your restaurant name.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Guests will read in</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Menu photo</label>
                {!preview ? (
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
                    className={`mt-1.5 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
                      dragOver
                        ? "border-primary bg-primary/5"
                        : "border-border bg-surface hover:bg-accent/40"
                    }`}
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <ImageUp className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-medium">Drop a photo or pick one</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      JPG, PNG, WEBP, HEIC — up to 20 MB
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      <Button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="rounded-full"
                      >
                        Choose a file
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => cameraRef.current?.click()}
                        className="rounded-full"
                      >
                        <Camera className="h-4 w-4" />
                        Use camera
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative mt-1.5 overflow-hidden rounded-2xl border border-border bg-card">
                    <img
                      src={preview}
                      alt="Menu preview"
                      className="max-h-[50vh] w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={clearFile}
                      aria-label="Remove photo"
                      className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur hover:bg-background"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* File inputs are always mounted so onChange fires reliably,
                    and value is reset so picking the same file twice works. */}
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
              </div>

              {error && (
                <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={!file || !name.trim()}
                className="h-12 w-full rounded-full text-base"
              >
                Publish menu page
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By publishing you agree to keep menu content accurate and lawful.
              </p>
            </form>

            <p className="mt-8 text-sm text-muted-foreground">
              Just visiting?{" "}
              <Link
                to="/scan"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Scan a menu instead
              </Link>
              .
            </p>
          </>
        )}

        {loading && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="mt-8 text-2xl font-semibold tracking-tight">
              {STAGES[stage]}
            </h2>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Reading every line and translating into {language}. Usually takes
              10–20 seconds.
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
