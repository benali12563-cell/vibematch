"use client";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/context";
import { createClient } from "@/lib/supabase/client";
import SwipeHome from "@/components/SwipeHome";
import OnboardingFlow from "@/components/OnboardingFlow";
import LandingPage from "@/components/LandingPage";

export default function HomePage() {
  const { onboardingDone, setOnboardingDone, setUser } = useApp();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    setSeen(!!localStorage.getItem("vm_seen"));
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Returning authenticated user — skip landing and onboarding
        localStorage.setItem("vm_seen", "1");
        localStorage.setItem("vm_onboarded", "1");
        setHasSession(true);
        setOnboardingDone(true);
        setUser({
          name: (session.user.user_metadata?.full_name as string | undefined)
            ?? session.user.email?.split("@")[0]
            ?? "User",
          role: "owner",
        });
      }
      setChecking(false);
    });
  }, [setOnboardingDone, setUser]);

  // Wait for session check to avoid flash of wrong screen
  if (checking) {
    return (
      <div style={{ minHeight: "100dvh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 28, height: 28, border: "2px solid rgba(0,206,209,.3)", borderTopColor: "#00CED1", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  // Authenticated user — go straight to app
  if (hasSession || onboardingDone) return <SwipeHome />;

  // First visit ever → landing page (use React state, not reload)
  if (!seen) {
    return <LandingPage onStart={() => {
      localStorage.setItem("vm_seen", "1");
      setSeen(true);
    }} />;
  }

  return <OnboardingFlow />;
}
