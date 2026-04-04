"use client";
import { useRef, type ReactNode } from "react";
import type { Vendor } from "@/types";
import DealBadge from "./DealBadge";

interface Props {
  vendor: Vendor;
  imgIdx: number;
  setImgIdx: (fn: (i: number) => number) => void;
  actions?: ReactNode;
  showInfo?: boolean; // only on first image
}

export default function SwipeCardView({ vendor, imgIdx, setImgIdx, actions, showInfo = true }: Props) {
  const imgs = (vendor.imgs ?? []).slice(0, 5);
  const ni = vendor.niche ?? {};
  const isFirst = imgIdx === 0;

  // Pinch-to-zoom
  const imgRef = useRef<HTMLDivElement>(null);
  const lastDist = useRef(0);
  const scale = useRef(1);

  function dist(t: React.TouchList) {
    const dx = t[0].clientX - t[1].clientX;
    const dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) lastDist.current = dist(e.touches);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2 && imgRef.current) {
      const d = dist(e.touches);
      scale.current = Math.min(3, Math.max(1, scale.current * (d / lastDist.current)));
      lastDist.current = d;
      imgRef.current.style.transform = `scale(${scale.current})`;
    }
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (e.touches.length < 2 && imgRef.current && scale.current > 1) {
      // Reset after pinch ends
      setTimeout(() => {
        if (imgRef.current) { imgRef.current.style.transform = "scale(1)"; scale.current = 1; }
      }, 1200);
    }
  }

  const src = imgs[imgIdx];

  return (
    <div style={{ height: "100%", position: "relative", userSelect: "none", overflow: "hidden", borderRadius: 20 }}>
      {/* Image */}
      <div
        ref={imgRef}
        style={{ position: "absolute", inset: 0, background: "#0a0a0a", transition: "transform .3s ease", transformOrigin: "center" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {src ? (
          <img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} alt={vendor.name} draggable={false} />
        ) : (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80, opacity: .3 }}>📷</div>
        )}
      </div>

      {/* Tap zones — right=next, left=prev (Instagram convention) */}
      <div onClick={() => setImgIdx((i) => Math.min(imgs.length - 1, i + 1))} style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "40%", cursor: "pointer", zIndex: 4 }} />
      <div onClick={() => setImgIdx((i) => Math.max(0, i - 1))} style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "40%", cursor: "pointer", zIndex: 4 }} />

      {/* Dots */}
      {imgs.length > 1 && (
        <div style={{ position: "absolute", top: 12, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 5, zIndex: 5 }}>
          {imgs.map((_, idx) => (
            <div key={idx} style={{
              width: imgIdx === idx ? 24 : 5, height: 3, borderRadius: 3,
              background: imgIdx === idx ? "#00e5e8" : "rgba(255,255,255,.22)",
              boxShadow: imgIdx === idx ? "0 0 8px rgba(0,229,232,.8)" : "none",
              transition: "all .25s cubic-bezier(.34,1.56,.64,1)",
            }} />
          ))}
        </div>
      )}

      {/* Coupon / Deal — always visible */}
      {vendor.coupon && (
        <div style={{ position: "absolute", top: 14, left: 14, background: "#00CED1", color: "#000", padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 800, zIndex: 5, letterSpacing: 0.5 }}>{vendor.coupon}</div>
      )}
      <DealBadge deal={vendor.deal} />

      {/* On non-first images: minimal floating name chip only */}
      {!isFirst && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 5 }}>
          <div style={{ padding: "4px 14px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.6)", fontWeight: 600, background: "rgba(0,0,0,.45)", borderRadius: 6, padding: "2px 8px", backdropFilter: "blur(6px)" }}>{vendor.name}</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,.35)", background: "rgba(0,0,0,.45)", borderRadius: 6, padding: "2px 8px", backdropFilter: "blur(6px)" }}>{imgIdx + 1}/{imgs.length}</span>
          </div>
          {actions && <div style={{ padding: "0 0 10px" }}>{actions}</div>}
        </div>
      )}

      {/* First image: full info overlay with story gradient */}
      {isFirst && (
        <div className="story-gradient" style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "80px 18px 14px", zIndex: 5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 className="tr" style={{ color: "#fff", fontSize: 26, fontWeight: 900, margin: 0, lineHeight: 1.1, fontFamily: "'Manrope','Heebo',sans-serif", letterSpacing: -0.5, textShadow: "0 2px 16px rgba(0,0,0,.6)" }}>{vendor.name}</h3>
              <div className="tr-1" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
                <span style={{ color: "#FFD700", fontSize: 13, letterSpacing: -1 }}>{"★".repeat(Math.floor(vendor.rating))}</span>
                <span style={{ color: "rgba(255,255,255,.8)", fontSize: 12, fontWeight: 700 }}>{vendor.rating}</span>
                <span style={{ color: "rgba(255,255,255,.45)", fontSize: 11 }}>· {vendor.sub}</span>
                {vendor.city && <span style={{ color: "rgba(255,255,255,.35)", fontSize: 11 }}>· {vendor.city}</span>}
              </div>
              {vendor.desc && (
                <p className="tr-2" style={{ color: "rgba(255,255,255,.78)", fontSize: 13, lineHeight: 1.5, marginTop: 7, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{vendor.desc}</p>
              )}
              {Object.keys(ni).length > 0 && (
                <div className="tr-3" style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
                  {Object.entries(ni).slice(0, 3).map(([k, v]) => (
                    <span key={k} style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,.09)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.75)", fontSize: 10, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>{v}</span>
                  ))}
                </div>
              )}
              {/* Trust badges */}
              <div className="tr-3" style={{ display: "flex", gap: 5, marginTop: 7, flexWrap: "wrap" }}>
                {vendor.reviews >= 50 && <span style={{ padding: "2px 8px", borderRadius: 8, background: "rgba(0,206,209,.1)", border: "1px solid rgba(0,206,209,.2)", color: "#00e5e8", fontSize: 9, fontWeight: 700 }}>⚡ עונה מהר</span>}
                {vendor.reviews > 0 && <span style={{ padding: "2px 8px", borderRadius: 8, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.6)", fontSize: 9 }}>✅ {vendor.reviews}+ אירועים</span>}
                {vendor.rating >= 4.8 && <span style={{ padding: "2px 8px", borderRadius: 8, background: "rgba(255,215,0,.07)", border: "1px solid rgba(255,215,0,.15)", color: "#FFD700", fontSize: 9, fontWeight: 700 }}>🔒 מאומת</span>}
                {vendor.isPro && <span style={{ padding: "2px 8px", borderRadius: 8, background: "rgba(168,85,247,.12)", border: "1px solid rgba(168,85,247,.3)", color: "#a855f7", fontSize: 9, fontWeight: 700 }}>👑 Pro</span>}
              </div>
            </div>
            {vendor.price && (
              <span className="tr-1" style={{ color: "#00e5e8", fontWeight: 900, fontSize: 17, marginRight: 10, flexShrink: 0, fontFamily: "'Manrope',sans-serif", textShadow: "0 0 16px rgba(0,206,209,.5)" }}>{vendor.price}</span>
            )}
          </div>
          {actions && <div className="tr-4" style={{ marginTop: 14 }}>{actions}</div>}
        </div>
      )}
    </div>
  );
}
