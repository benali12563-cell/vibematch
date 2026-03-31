"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
        router.replace("/");
        router.refresh();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { router.replace("/"); router.refresh(); }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div style={{ minHeight: "100dvh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "2px solid rgba(0,206,209,.3)", borderTopColor: "#00CED1", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );
}
