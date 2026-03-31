"use client";
import type { ReactNode } from "react";
import type { Vendor } from "@/types";
import DealBadge from "./DealBadge";

interface Props {
  vendor: Vendor;
  imgIdx: number;
  setImgIdx: (fn: (i: number) => number) => void;
  actions?: ReactNode;
}

export default function SwipeCardView({ vendor, imgIdx, setImgIdx, actions }: Props) {
  const imgs = (vendor.imgs ?? []).slice(0, 5);
  const ni = vendor.niche ?? {};

  return (
    <div style={{ height: "100%", position: "relative", userSelect: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 100 }}>
        <span>{imgs[imgIdx] ?? "📷"}</span>
      </div>

      {/* Tap zones */}
      <div onClick={() => setImgIdx((i) => Math.max(0, i - 1))} style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "35%", cursor: "pointer", zIndex: 2 }} />
      <div onClick={() => setImgIdx((i) => Math.min(imgs.length - 1, i + 1))} style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "35%", cursor: "pointer", zIndex: 2 }} />

      {/* Dots */}
      <div style={{ position: "absolute", top: 10, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 4, zIndex: 3 }}>
        {imgs.map((_, idx) => (
          <div key={idx} style={{ width: imgIdx === idx ? 20 : 6, height: 3, borderRadius: 2, background: imgIdx === idx ? "#00CED1" : "rgba(255,255,255,.25)", transition: "width .2s" }} />
        ))}
      </div>

      {vendor.coupon && (
        <div style={{ position: "absolute", top: 14, left: 14, background: "#00CED1", color: "#000", padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, zIndex: 3 }}>{vendor.coupon}</div>
      )}
      <DealBadge deal={vendor.deal} />

      {/* Info overlay */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "60px 18px 16px", background: "linear-gradient(to top,rgba(0,0,0,.95) 50%,transparent)", zIndex: 3 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h3 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: 0 }}>{vendor.name}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
              <span style={{ color: "#FFD700", fontSize: 13 }}>{"★".repeat(Math.floor(vendor.rating))}</span>
              <span style={{ color: "#999", fontSize: 12 }}>{vendor.rating}</span>
              <span style={{ color: "#555", fontSize: 11 }}>· {vendor.sub} · {vendor.city}</span>
            </div>
            {Object.keys(ni).length > 0 && (
              <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
                {Object.entries(ni).map(([k, v]) => (
                  <span key={k} style={{ padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,.06)", color: "#999", fontSize: 10 }}>{v}</span>
                ))}
              </div>
            )}
          </div>
          <span style={{ color: "#00CED1", fontWeight: 700, fontSize: 17 }}>{vendor.price}</span>
        </div>
        <p style={{ color: "#bbb", fontSize: 13, lineHeight: 1.4, marginTop: 6, maxHeight: 36, overflow: "hidden" }}>{vendor.desc}</p>
        {actions && <div style={{ marginTop: 12 }}>{actions}</div>}
      </div>
    </div>
  );
}
