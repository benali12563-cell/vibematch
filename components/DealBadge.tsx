"use client";
import { useState, useEffect } from "react";
import type { Deal } from "@/types";

export default function DealBadge({ deal }: { deal: Deal | null }) {
  // QA-003: use deal != null check (not falsy endsIn) so endsIn=0 works
  const [left, setLeft] = useState(deal != null ? deal.endsIn * 3600 : 0);

  useEffect(() => {
    if (left <= 0) return;
    const i = setInterval(() => setLeft((p) => (p > 1 ? p - 1 : 0)), 1000);
    return () => clearInterval(i);
  }, [left]);

  if (!deal) return null;
  // If endsIn > 0 and countdown reached 0, deal has expired — don't show
  if (deal.endsIn > 0 && left <= 0) return null;

  const showTimer = deal.endsIn > 0;
  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;

  return (
    <div style={{ position: "absolute", top: 14, right: 14, background: "#FF4444", color: "#fff", padding: "5px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, zIndex: 3, animation: "pulse 2s infinite" }}>
      {deal.text}{showTimer ? ` — ${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : ""}
    </div>
  );
}
