import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next, request }) => {
  if (new URL(request.url).pathname.startsWith("/lovable/")) {
    return next();
  }
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Send every visitor to one address so their sign-in is stored in one place.
const PRIMARY_HOST = "menuvisionai.live";
const canonicalHostMiddleware = createMiddleware().server(async ({ next, request }) => {
  const url = new URL(request.url);
  const host = url.hostname;
  const p = url.pathname;
  const skipPath =
    p.startsWith("/lovable/") || p.startsWith("/api/public/") || p.startsWith("/.well-known/") || p.startsWith("/mcp") || p.startsWith("/.mcp") || p.startsWith("/.lovable/");
  const isAlias =
    host === "www.menuvisionai.live" ||
    (host.endsWith(".lovable.app") && !host.startsWith("id-preview--") && !host.includes("preview"));
  if (isAlias && !skipPath && (request.method === "GET" || request.method === "HEAD")) {
    return new Response(null, {
      status: 301,
      headers: { location: `https://${PRIMARY_HOST}${p}${url.search}` },
    }) as never;
  }
  return next();
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [canonicalHostMiddleware, errorMiddleware],
}));
