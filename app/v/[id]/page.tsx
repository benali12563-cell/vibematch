"use client";
import { use } from "react";
import { DV, CATS } from "@/lib/constants";
import type { Vendor, CatKey } from "@/types";
import Logo from "@/components/Logo";
import VLinks from "@/components/VLinks";

function findVendorBySlug(slug: string): { vendor: Vendor; cat: string } | null {
  const name = decodeURIComponent(slug).replace(/-/g, " ").toLowerCase();
  for (const cat of CATS) {
    const v = (DV[cat.k] ?? []).find((v) => v.name.toLowerCase() === name || v.name.toLowerCase().replace(/\s/g, "-") === slug.toLowerCase());
    if (v) return { vendor: v, cat: cat.he };
  }
  return null;
}

export default function VendorPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const result = findVendorBySlug(id);

  if (!result) {
    return (
      <div style={{ minHeight: "100dvh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <p style={{ color: "#555" }}>הספק לא נמצא</p>
        <a href="/" style={{ color: "#00CED1", fontSize: 13 }}>חזרה לדף הבית</a>
      </div>
    );
  }

  const { vendor, cat } = result;
  const imgs = (vendor.imgs ?? []).slice(0, 5);

  return (
    <div style={{ minHeight: "100dvh", background: "#000", fontFamily: "'Heebo','Manrope',sans-serif", direction: "rtl", overflowY: "auto", maxWidth: 480, margin: "0 auto" }}>

      {/* Hero image gallery */}
      <div style={{ position: "relative", height: "55vh", minHeight: 300, overflow: "hidden" }}>
        {imgs[0] ? (
          <img src={imgs[0]} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={vendor.name} />
        ) : (
          <div style={{ height: "100%", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80, opacity: .2 }}>📷</div>
        )}
        {/* Gradient overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,.2) 60%, rgba(0,0,0,.5) 100%)" }} />

        {/* Top bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ textDecoration: "none" }}><Logo sz={18} /></a>
          <a href="/" style={{ fontSize: 11, color: "rgba(255,255,255,.5)", textDecoration: "none", padding: "5px 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,.1)", background: "rgba(0,0,0,.4)", backdropFilter: "blur(8px)" }}>
            ← חזרה
          </a>
        </div>

        {/* Name overlay */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "40px 20px 20px" }}>
          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 10, background: "rgba(0,206,209,.1)", border: "1px solid rgba(0,206,209,.25)", color: "#00CED1", fontSize: 11, fontWeight: 600, marginBottom: 8 }}>{cat}</span>
          <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 900, lineHeight: 1.1, letterSpacing: -0.5, margin: 0 }}>{vendor.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <span style={{ color: "#FFD700", fontSize: 13 }}>{"★".repeat(Math.floor(vendor.rating))}</span>
            <span style={{ color: "rgba(255,255,255,.6)", fontSize: 13 }}>{vendor.rating}</span>
            <span style={{ color: "rgba(255,255,255,.35)", fontSize: 12 }}>· {vendor.reviews} ביקורות</span>
            {vendor.city && <span style={{ color: "rgba(255,255,255,.35)", fontSize: 12 }}>· {vendor.city}</span>}
          </div>
        </div>
      </div>

      {/* Gallery strip */}
      {imgs.length > 1 && (
        <div style={{ display: "flex", gap: 6, padding: "10px 16px", overflowX: "auto" }}>
          {imgs.map((src, i) => (
            <img key={i} src={src} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 10, flexShrink: 0, border: "1px solid rgba(255,255,255,.05)" }} alt="" />
          ))}
        </div>
      )}

      {/* Content */}
      <div style={{ padding: "16px 20px 40px" }}>

        {/* Price */}
        {vendor.price && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <span style={{ color: "rgba(255,255,255,.5)", fontSize: 13 }}>{vendor.sub}</span>
            <span style={{ color: "#00CED1", fontWeight: 800, fontSize: 20 }}>{vendor.price}</span>
          </div>
        )}

        {/* Description */}
        {vendor.desc && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ color: "rgba(255,255,255,.5)", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>אודות</p>
            <p style={{ color: "rgba(255,255,255,.8)", fontSize: 14, lineHeight: 1.7 }}>{vendor.desc}</p>
          </div>
        )}

        {/* Niche tags */}
        {Object.keys(vendor.niche ?? {}).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ color: "rgba(255,255,255,.5)", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>פרטים</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Object.entries(vendor.niche).map(([k, v]) => (
                <span key={k} style={{ padding: "5px 12px", borderRadius: 20, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", color: "rgba(255,255,255,.65)", fontSize: 12 }}>{v}</span>
              ))}
            </div>
          </div>
        )}

        {/* Coupon */}
        {vendor.coupon && (
          <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(0,206,209,.05)", border: "1px solid rgba(0,206,209,.15)", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>🎁</span>
            <div>
              <p style={{ color: "#00CED1", fontSize: 12, fontWeight: 700 }}>קופון מיוחד</p>
              <p style={{ color: "rgba(255,255,255,.7)", fontSize: 13 }}>{vendor.coupon}</p>
            </div>
          </div>
        )}

        {/* Links */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ color: "rgba(255,255,255,.5)", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>צור קשר</p>
          <VLinks vendor={vendor} />
        </div>

        {/* CTA */}
        <a href="/" style={{ display: "block", padding: "15px 0", borderRadius: 14, background: "linear-gradient(135deg,#00CED1,#0099aa)", color: "#000", fontWeight: 900, fontSize: 15, textDecoration: "none", textAlign: "center" }}>
          🚀 ניהול האירוע שלך ב-VibeMatch
        </a>

        {/* Powered by */}
        <div style={{ textAlign: "center", marginTop: 28, paddingBottom: 10 }}>
          <p style={{ color: "#1a1a1a", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Powered by</p>
          <Logo sz={20} />
        </div>
      </div>
    </div>
  );
}
