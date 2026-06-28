import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { track } from "@/lib/analytics";

const callbackSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth/callback")({
  validateSearch: callbackSearchSchema,
  component: AuthCallback,
});

function safeRedirect(target: string | undefined): string {
  if (!target) return "/";
  if (target.startsWith("/") && !target.startsWith("//")) return target;
  return "/";
}

function AuthCallback() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const dest = safeRedirect(redirect);

  useEffect(() => {
    let cancelled = false;
    async function go() {
      for (let i = 0; i < 20; i++) {
        const { data } = await supabase.auth.getUser();
        if (cancelled) return;
        if (data.user) {
          track("signin_completed");
          window.location.replace(dest);
          return;
        }
        await new Promise((r) => setTimeout(r, 150));
      }
      navigate({ to: "/auth", replace: true });
    }
    void go();
    return () => {
      cancelled = true;
    };
  }, [navigate, dest]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Signing you in…
      </div>
    </div>
  );
}
