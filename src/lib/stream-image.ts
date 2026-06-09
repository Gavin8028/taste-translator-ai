import { flushSync } from "react-dom";

type ImageEvent =
  | { type: "image_generation.partial_image"; b64_json: string; partial_image_index: number }
  | { type: "image_generation.completed"; b64_json: string };

/**
 * Minimal SSE parser tailored to the Lovable image gateway.
 * Calls onFrame(dataUrl, isFinal) for every partial and the final frame.
 */
export async function streamDishImage(
  prompt: { dish: string; cuisine?: string },
  onFrame: (dataUrl: string, isFinal: boolean) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch("/api/dish-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prompt),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`Image stream failed: ${res.status}`);

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buf = "";
  let sawCompleted = false;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += value;

      let idx: number;
      while ((idx = buf.indexOf("\n\n")) !== -1) {
        const rawEvent = buf.slice(0, idx);
        buf = buf.slice(idx + 2);

        let eventName = "";
        const dataLines: string[] = [];
        for (const line of rawEvent.split("\n")) {
          if (line.startsWith("event:")) eventName = line.slice(6).trim();
          else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
        }
        if (!dataLines.length) continue;
        const dataStr = dataLines.join("\n");
        if (dataStr === "[DONE]") continue;

        let payload: ImageEvent | null = null;
        try {
          payload = JSON.parse(dataStr) as ImageEvent;
        } catch {
          continue;
        }
        const type = eventName || payload.type;
        if (
          type !== "image_generation.partial_image" &&
          type !== "image_generation.completed"
        )
          continue;
        if (!payload.b64_json) continue;

        const isFinal = type === "image_generation.completed";
        const dataUrl = `data:image/png;base64,${payload.b64_json}`;
        flushSync(() => onFrame(dataUrl, isFinal));
        if (isFinal) sawCompleted = true;
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }

  if (!sawCompleted) throw new Error("Image stream ended without completion");
}
