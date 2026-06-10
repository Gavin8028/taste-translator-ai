import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function QrCode({
  value,
  filename = "menu-qr.png",
  size = 256,
}: {
  value: string;
  filename?: string;
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      color: { dark: "#0a0a0a", light: "#ffffff" },
    }).catch(() => undefined);
    QRCode.toDataURL(value, {
      width: 1024,
      margin: 2,
      color: { dark: "#0a0a0a", light: "#ffffff" },
    })
      .then(setDataUrl)
      .catch(() => undefined);
  }, [value, size]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="overflow-hidden rounded-2xl border border-border bg-white p-3">
        <canvas ref={canvasRef} width={size} height={size} aria-label="Menu QR code" />
      </div>
      {dataUrl && (
        <Button asChild variant="outline" className="rounded-full">
          <a href={dataUrl} download={filename}>
            <Download className="h-4 w-4" />
            Download QR
          </a>
        </Button>
      )}
    </div>
  );
}
