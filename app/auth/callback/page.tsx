"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.push("/dashboard");
        router.refresh();
      }
    });

    // Handle hash tokens (magic link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/dashboard");
        router.refresh();
      }
    });
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="card text-center">
        <div className="text-4xl mb-4 animate-pulse">🎵</div>
        <p className="text-white/60">מתחבר...</p>
      </div>
    </main>
  );
}
