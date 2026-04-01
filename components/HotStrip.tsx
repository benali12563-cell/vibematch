"use client";
import { useRef, useState } from "react";
import { useApp } from "@/lib/context";
import { DV, CATS } from "@/lib/constants";
import type { Vendor } from "@/types";

// Deterministic fake-but-plausible social proof from vendor name
function socialNum(name: string, min: number, max: number) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return min + (Math.abs(h) % (max - min + 1));
}

export default function HotStrip({ onSelect }: { onSelect: (v: Vendor) => void }) {
  const { lang } = useApp();
  const isHe = lang === "he";
  const scrollRef = useRef<HTMLDivElement>(null);

  // Pick top-rated vendors across categories
  const hotVendors = CATS.flatMap((c) =>
    (DV[c.k] ?? []).slice(0, 2).map((v) => ({ ...v, _cat: isHe ? c.he : c.en }))
  ).sort((a, b) => b.rating - a.rating).slice(0, 12);

  return (
    <div style={{ marginBottom: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "14px 16px 10px" }}>
        <span style={{ fontSize: 14 }}>🔥</span>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{isHe ? "חם השבוע" : "Trending Now"}</span>
        <span style={{ color: "#FF4444", fontSize: 10, fontWeight: 600, background: "rgba(255,68,68,.08)", border: "1px solid rgba(255,68,68,.2)", borderRadius: 6, padding: "1px 6px" }}>LIVE</span>
      </div>

      <div ref={scrollRef} style={{ display: "flex", gap: 10, padding: "0 16px 14px", overflowX: "auto", scrollbarWidth: "none" }}>
        {hotVendors.map((v, i) => {
          const views = socialNum(v.name, 18, 94);
          const lookers = socialNum(v.name + "l", 2, 11);
          const isHot = i < 3;
          return (
            <button key={v.name + i} onClick={() => onSelect(v)} style={{ flexShrink: 0, width: 130, borderRadius: 14, overflow: "hidden", border: `1px solid ${isHot ? "rgba(255,68,68,.2)" : "rgba(255,255,255,.05)"}`, background: "#0a0a0a", cursor: "pointer", textAlign: isHe ? "right" : "left", position: "relative" }}>
              {/* Image */}
              <div style={{ height: 90, background: "linear-gradient(135deg,#0a0a0a,#111)", position: "relative", overflow: "hidden" }}>
                {v.imgs?.[0]
                  ? <img src={v.imgs[0]} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                  : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🎪</div>
                }
                {isHot && (
                  <div style={{ position: "absolute", top: 6, right: 6, background: "#FF4444", borderRadius: 6, padding: "1px 6px", fontSize: 9, fontWeight: 700, color: "#fff" }}>#{i + 1}</div>
                )}
                <div style={{ position: "absolute", bottom: 4, left: 6, right: 6, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#aaa", fontSize: 9 }}>👁 {views}</span>
                  {lookers > 6 && <span style={{ color: "#FF4444", fontSize: 9, fontWeight: 600 }}>🔴 {lookers} {isHe ? "עכשיו" : "now"}</span>}
                </div>
              </div>
              {/* Info */}
              <div style={{ padding: "8px 8px 10px" }}>
                <p style={{ color: "#fff", fontSize: 11, fontWeight: 700, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</p>
                <p style={{ color: "#555", fontSize: 9 }}>{v._cat}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 4 }}>
                  <span style={{ color: "#FFD700", fontSize: 9 }}>{"★".repeat(Math.round(v.rating))}</span>
                  <span style={{ color: "#444", fontSize: 9 }}>{v.rating}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
