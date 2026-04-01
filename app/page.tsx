"use client";
import { useApp } from "@/lib/context";
import SwipeHome from "@/components/SwipeHome";
import OnboardingFlow from "@/components/OnboardingFlow";
import LandingPage from "@/components/LandingPage";

export default function HomePage() {
  const { onboardingDone, setOnboardingDone } = useApp();

  // Show landing if this is a fresh session (not returning user with done onboarding)
  // We track this via sessionStorage so returning users skip landing
  if (typeof window !== "undefined") {
    const seen = sessionStorage.getItem("vm_seen");
    if (!seen) {
      // First visit this session → show landing
      return <LandingPage onStart={() => { sessionStorage.setItem("vm_seen", "1"); window.location.reload(); }} />;
    }
  }

  if (!onboardingDone) return <OnboardingFlow />;
  return <SwipeHome />;
}
