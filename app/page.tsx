"use client";
import { useApp } from "@/lib/context";
import SwipeHome from "@/components/SwipeHome";
import OnboardingFlow from "@/components/OnboardingFlow";

export default function HomePage() {
  const { onboardingDone } = useApp();
  if (!onboardingDone) return <OnboardingFlow />;
  return <SwipeHome />;
}
