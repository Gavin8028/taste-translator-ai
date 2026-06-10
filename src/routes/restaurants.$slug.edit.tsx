import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Camera,
  Check,
  ImageUp,
  Loader2,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { QrCode } from "@/components/qr-code";
import {
  deleteRestaurantMenu,
  replaceMenuDishes,
  updateRestaurantMenu,
  verifyEditToken,
} from "@/lib/restaurant.functions";
import { forgetOwner, getOwnerToken, rememberOwner } from "@/lib/owner-store";

export const Route = createFileRoute("/restaurants/$slug/edit")({
  head: () => ({
    meta: [
      { title: "Manage your menu — MenuVision AI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditMenuPage,
});

const LANGUAGES = ["English", "Spanish", "French", "Japanese", "Chinese"];

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

function EditMenuPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"loading" | "need-token" | "ready">("loading");
  const [token, setToken] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  const [language, setLanguage] = useState("English");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [rescanning, setRescanning] = useState(false);
  const [rescanDone, setRescanDone] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  // On mount: try to verify with the token saved in localStorage.
  useEffect(() => {
    const saved = getOwnerToken(slug);
    if (!saved) {
      setPhase("need-token");
      return;
    }
    verifyEditToken({ data: { slug, editToken: saved } })
      .then((res) => {
        if (res.ok) {
          setToken(saved);
          setName(res.menu.name);
          setLanguage(res.menu.targetLanguage);
          setPhase("ready");
        } else {
          setPhase("need-token");
        }
      })
      .catch(() => setPhase("need-token"));
  }, [slug]);

  async function submitToken(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setVerifyError(null);
    try {
      const res = await verifyEditToken({
        data: { slug, editToken: tokenInput.trim() },
      });
      if (!res.ok) {
        setVerifyError(
          res.reason === "not_found" ? "Menu not found." : "Edit code doesn't match.",
        );
        return;
      }
      rememberOwner(slug, { editToken: tokenInput.trim(), name: res.menu.name });
      setToken(tokenInput.trim());
      setName(res.menu.name);
      setLanguage(res.menu.targetLanguage);
      setPhase("ready");
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setVerifying(false);
    }
  }

  async function saveName() {
    if (!name.trim()) return;
    setSavingName(true);
    setError(null);
    try {
      await updateRestaurantMenu({
        data: { slug, editToken: token, name: name.trim() },
      });
      rememberOwner(slug, { editToken: token, name: name.trim() });
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSavingName(false);
    }
  }

  function pickFile(f: File) {
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

  async function doRescan() {
    if (!file) return;
    setRescanning(true);
    setError(null);
    setRescanDone(false);
    try {
      const dataUrl = await fileToDataUrl(file);
      await replaceMenuDishes({
        data: {
          slug,
          editToken: token,
          imageDataUrl: dataUrl,
          targetLanguage: language,
        },
      });
      setRescanDone(true);
      clearFile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not re-scan.");
    } finally {
      setRescanning(false);
    }
  }

  async function doDelete() {
    setDeleting(true);
    setError(null);
    try {
      await deleteRestaurantMenu({ data: { slug, editToken: token } });
      forgetOwner(slug);
      navigate({ to: "/restaurants" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
      setDeleting(false);
    }
  }

  if (phase === "loading") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  if (phase === "need-token") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="mx-auto w-full max-w-md flex-1 px-5 py-16">
          <Link
            to="/restaurants"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            For restaurants
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Enter your edit code
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We don't see this menu in this browser. Paste the edit code you saved
            when you created it.
          </p>
          <form onSubmit={submitToken} className="mt-6 space-y-3">
            <input
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Edit code"
              autoFocus
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {verifyError && (
              <p className="text-sm text-destructive">{verifyError}</p>
            )}
            <Button
              type="submit"
              disabled={!tokenInput.trim() || verifying}
              className="w-full rounded-full"
            >
              {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Unlock
            </Button>
          </form>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const publicUrl =
    typeof window !== "undefined" ? `${window.location.origin}/m/${slug}` : "";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
        <Link
          to="/m/$slug"
          params={{ slug }}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          View public menu
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Manage your menu
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Public link:{" "}
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {publicUrl}
          </a>
        </p>

        {/* QR */}
        <section className="mt-8 grid gap-5 rounded-2xl border border-border bg-card p-5 sm:grid-cols-[auto,1fr] sm:items-center">
          <QrCode value={publicUrl} filename={`${slug}-qr.png`} />
          <div>
            <h2 className="font-medium">Table QR code</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Download and print. Guests scan to see your menu in their language.
            </p>
          </div>
        </section>

        {/* Rename */}
        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 font-medium">
            <Pencil className="h-4 w-4" />
            Restaurant name
          </h2>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button
              onClick={saveName}
              disabled={savingName || !name.trim()}
              className="rounded-full"
            >
              {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : nameSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {nameSaved ? "Saved" : "Save"}
            </Button>
          </div>
        </section>

        {/* Re-scan */}
        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-medium">Replace the menu</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a fresh photo to replace every dish on this page.
          </p>

          <div className="mt-3">
            <label className="text-sm font-medium">Translate dishes into</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:w-auto"
            >
              {LANGUAGES.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            {!preview ? (
              <div className="rounded-2xl border-2 border-dashed border-border p-6 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <ImageUp className="h-5 w-5" />
                </div>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
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
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
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
            ) : (
              <div className="relative overflow-hidden rounded-2xl border border-border">
                <img
                  src={preview}
                  alt="New menu preview"
                  className="max-h-[40vh] w-full object-contain"
                />
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur hover:bg-background"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <Button
            onClick={doRescan}
            disabled={!file || rescanning}
            className="mt-4 rounded-full"
          >
            {rescanning ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Replace menu with this photo
          </Button>
          {rescanDone && (
            <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">
              Menu replaced. Refresh the public page to see the new dishes.
            </p>
          )}
        </section>

        {/* Danger */}
        <section className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <h2 className="flex items-center gap-2 font-medium text-destructive">
            <Trash2 className="h-4 w-4" />
            Delete this menu
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The public link will stop working immediately. This can't be undone.
          </p>
          {!confirmingDelete ? (
            <Button
              variant="outline"
              onClick={() => setConfirmingDelete(true)}
              className="mt-3 rounded-full border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              Delete menu
            </Button>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                onClick={doDelete}
                disabled={deleting}
                className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Yes, delete forever
              </Button>
              <Button
                variant="ghost"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
            </div>
          )}
        </section>

        {error && (
          <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
