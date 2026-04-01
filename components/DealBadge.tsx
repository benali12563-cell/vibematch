"use client";
import { useState, useEffect } from "react";
import type { Deal } from "@/types";

export default function DealBadge({ deal }: { deal: Deal | null }) {
  const [left, setLeft] = useState(deal?.endsIn ? deal.endsIn * 3600 : 0);

  useEffect(() => {
    if (!left) return;
    const i = setInterval(() => setLeft((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(i);
  }, [left]);

  if (!deal || !left) return null;
  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;

  return (
    <div style={{ position: "absolute", top: 14, right: 14, background: "#FF4444", color: "#fff", padding: "5px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, zIndex: 3, animation: "pulse 2s infinite" }}>
      {deal.text} — {h}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </div>
  );
}
