import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check, Copy } from "lucide-react";

export function ShareButton({ url, title }: { url: string; title?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title, url });
        return;
      } catch {
        // user cancelled — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleShare}
      className="rounded-full"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" /> Link copied
        </>
      ) : (
        <>
          {typeof navigator !== "undefined" && (navigator as any).share ? (
            <Share2 className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          Share
        </>
      )}
    </Button>
  );
}
