import { useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    // Read the saved sign-in from this device instantly, then confirm it.
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session?.user) setUser(data.session.user);
      setLoading(false);
      supabase.auth.getUser().then(({ data: u, error }) => {
        if (!mounted) return;
        if (u.user) setUser(u.user);
        // Only drop the user on a real auth rejection, not a network hiccup.
        else if (error && (error as { status?: number }).status && (error as { status?: number }).status! < 500) setUser(null);
        else if (!data.session) setUser(null);
      });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }, [queryClient, navigate]);

  return { user, loading, signOut };
}
