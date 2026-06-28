import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function go() {
      // Wait briefly for the session to hydrate after the OAuth redirect.
      for (let i = 0; i < 20; i++) {
        const { data } = await supabase.auth.getUser();
        if (cancelled) return;
        if (data.user) {
          track("signin_completed");
          navigate({ to: "/", replace: true });
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
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Signing you in…
      </div>
    </div>
  );
}
