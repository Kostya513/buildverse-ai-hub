import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/store/useAppStore";

/**
 * Restores Supabase session on mount and keeps the global Zustand store in sync.
 * Reads any persisted state from localStorage (handled by the store), then
 * verifies with Supabase and reloads the profile from the database.
 */
export function useSessionRestore() {
  const setAuth = useAppStore((s) => s.setAuth);
  const clearAuth = useAppStore((s) => s.clearAuth);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (!mounted) return;
      setAuth({
        isAuthenticated: true,
        userId,
        role: (data?.role as string | undefined) ?? null,
        profile: (data as Record<string, unknown> | null) ?? null,
      });
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        void loadProfile(session.user.id);
      } else {
        clearAuth();
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        void loadProfile(session.user.id);
      } else {
        clearAuth();
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [setAuth, clearAuth]);
}

export default useSessionRestore;
