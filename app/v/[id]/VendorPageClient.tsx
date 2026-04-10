"use client";
import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/lib/context";
import { DV, CATS, translateNicheVal } from "@/lib/constants";
import { loadVendorBySlug, trackVendorView, makeSlug } from "@/lib/supabase/vendors";
import { createClient } from "@/lib/supabase/client";
import type { Vendor, CatKey } from "@/types";
import Logo from "@/components/Logo";
import VLinks from "@/components/VLinks";
import OTPLoginForm from "@/components/OTPLoginForm";

function findVendorInDV(slug: string): { vendor: Vendor; catHe: string; catEn: string } | null {
  const name = decodeURIComponent(slug).replace(/-/g, " ").toLowerCase();
  for (const cat of CATS) {
    const v = (DV[cat.k] ?? []).find(
      (v) => v.name.toLowerCase() === name || makeSlug(v.name) === slug.toLowerCase()
    );
    if (v) return { vendor: v, catHe: cat.he, catEn: cat.en };
  }
  return null;
}

function getCatLabel(catKey: string | undefined, isHe: boolean) {
  if (!catKey) return "";
  const c = CATS.find((c) => c.k === catKey);
  return c ? (isHe ? c.he : c.en) : catKey;
}

// ── Viral signup modal ────────────────────────────────────────────────────────
function ViralModal({ ref: refSlug, isHe, onClose }: { ref?: string; isHe: boolean; onClose: () => void }) {
  const [done, setDone] = useState(false);
  const sb = createClient();

  async function trackReferral(email: string) {
    if (!refSlug) return;
    void sb.from("referral_visits").insert({
      referrer_slug: refSlug,
      referrer_type: "vendor_view",
      page_visited: window.location.pathname,
      registered: true,
    });
    void email;
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.88)", backdropFilter: "blur(16px)", zIndex: 400, display: "flex", alignItems: "flex-end", fontFamily: isHe ? "'Heebo','Manrope',sans-serif" : "'Manrope','Heebo',sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", background: "rgba(10,10,10,.98)", borderRadius: "24px 24px 0 0", padding: "24px 22px 44px", border: "1px solid rgba(255,255,255,.08)", borderBottom: "none", animation: "slideUp .35s ease", direction: isHe ? "rtl" : "ltr" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, [isHe ? "left" : "right"]: 14, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", borderRadius: "50%", width: 32, height: 32, color: "rgba(255,255,255,.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✕</button>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,.1)", margin: "0 auto 20px" }} />
        {done ? (
          <div style={{ textAlign: "center", padding: "20px 0", animation: "scaleIn .35s" }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
            <p style={{ color: "#fff", fontWeight: 800, fontSize: 18, marginBottom: 6 }}>{isHe ? "ברוכים הבאים ל-VibeMatch!" : "Welcome to VibeMatch!"}</p>
            <p style={{ color: "rgba(255,255,255,.4)", fontSize: 13 }}>{isHe ? "מתחברים..." : "Signing in..."}</p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <Logo sz={22} />
              <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 900, marginTop: 12, marginBottom: 6 }}>
                {isHe ? "גם אתם מארגנים אירוע?" : "Planning an event?"}
              </h2>
              <p style={{ color: "rgba(255,255,255,.5)", fontSize: 13, lineHeight: 1.65 }}>
                {isHe
                  ? <>מצאו את כל הספקים הטובים ביותר — <strong style={{ color: "#00CED1" }}>בחינם לגמרי</strong>.</>
                  : <>Find the best vendors — <strong style={{ color: "#00CED1" }}>completely free</strong>.</>
                }
              </p>
            </div>
            <OTPLoginForm
              isHe={isHe}
              compact
              onTrack={trackReferral}
              onSuccess={() => { setDone(true); setTimeout(onClose, 1800); }}
            />
            <button onClick={onClose} style={{ display: "block", width: "100%", marginTop: 14, background: "none", border: "none", color: "rgba(255,255,255,.25)", fontSize: 12, cursor: "pointer", fontFamily: "inherit", padding: "8px 0" }}>
              {isHe ? "עיון באתר ללא הרשמה →" : "Browse without signing up →"}
            </button>
          </>
        )}
        <p style={{ color: "rgba(255,255,255,.12)", fontSize: 10, textAlign: "center", marginTop: 14 }}>
          {isHe ? "ללא סיסמה · ללא עלות · ביטול בכל עת" : "No password · No cost · Cancel anytime"}
        </p>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function VendorPageClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") ?? undefined;
  const { lang } = useApp();
  const isHe = lang === "he";

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [cat, setCat] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    // 1. Try DV first (instant)
    const dv = findVendorInDV(id);
    if (dv) { setVendor(dv.vendor); setCat(isHe ? dv.catHe : dv.catEn); setLoading(false); }

    // 2. Try Supabase (async — may replace DV result or find a real vendor)
    loadVendorBySlug(id).then((v) => {
      if (v) { setVendor(v); setCat(getCatLabel(v.catKey, isHe) || v.sub || ""); }
      setLoading(false);
    }).catch(() => setLoading(false));

    // 3. Track referral view
    trackVendorView(id, ref);

    // 4. Show viral modal after 4s
    const t = setTimeout(() => setShowModal(true), 4000);
    return () => clearTimeout(t);
  }, [id, ref]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div style={{ minHeight: "100dvh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(0,206,209,.2)", borderTopColor: "#00CED1", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div style={{ minHeight: "100dvh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: isHe ? "'Heebo',sans-serif" : "'Manrope','Heebo',sans-serif", direction: isHe ? "rtl" : "ltr" }}>
        <p style={{ color: "#555", fontSize: 15 }}>{isHe ? "הספק לא נמצא" : "Vendor not found"}</p>
        <a href="/" style={{ color: "#00CED1", fontSize: 13, padding: "10px 24px", borderRadius: 20, border: "1px solid rgba(0,206,209,.3)", textDecoration: "none" }}>
          {isHe ? "→ חזרה לדף הבית" : "← Back to Home"}
        </a>
      </div>
    );
  }

  const imgs = (vendor.imgs ?? []).slice(0, 5);

  return (
    <div style={{ minHeight: "100dvh", background: "#000", fontFamily: isHe ? "'Heebo','Manrope',sans-serif" : "'Manrope','Heebo',sans-serif", direction: isHe ? "rtl" : "ltr", overflowY: "auto", maxWidth: 480, margin: "0 auto" }}>

      {/* Hero */}
      <div style={{ position: "relative", height: "58vh", minHeight: 320, overflow: "hidden" }}>
        {imgs[imgIdx] ? (
          <img src={imgs[imgIdx]} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={vendor.name} />
        ) : (
          <div style={{ height: "100%", background: "linear-gradient(135deg,#0a0a0a,#111)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80, opacity: .15 }}>📷</div>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg,rgba(0,0,0,1) 0%,rgba(0,0,0,.15) 55%,rgba(0,0,0,.6) 100%)" }} />

        {/* Top bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ textDecoration: "none" }}><Logo sz={18} /></a>
          <a href="/" style={{ fontSize: 11, color: "rgba(255,255,255,.6)", textDecoration: "none", padding: "6px 14px", borderRadius: 20, border: "1px solid rgba(255,255,255,.15)", background: "rgba(0,0,0,.5)", backdropFilter: "blur(12px)" }}>
            {isHe ? "→ חזרה" : "← Back"}
          </a>
        </div>

        {/* Image dots */}
        {imgs.length > 1 && (
          <div style={{ position: "absolute", top: 16, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 5 }}>
            {imgs.map((_, i) => (
              <button key={i} onClick={() => setImgIdx(i)} style={{ width: imgIdx === i ? 22 : 6, height: 4, borderRadius: 2, background: imgIdx === i ? "#00CED1" : "rgba(255,255,255,.3)", border: "none", cursor: "pointer", transition: "width .2s, background .2s", padding: 0 }} />
            ))}
          </div>
        )}

        {/* Tap zones */}
        {imgs.length > 1 && <>
          <div onClick={() => setImgIdx((i) => Math.max(0, i - 1))} style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "35%", cursor: "pointer", zIndex: 2 }} />
          <div onClick={() => setImgIdx((i) => Math.min(imgs.length - 1, i + 1))} style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "35%", cursor: "pointer", zIndex: 2 }} />
        </>}

        {/* Name overlay */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "50px 20px 20px", zIndex: 3 }}>
          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 10, background: "rgba(0,206,209,.12)", border: "1px solid rgba(0,206,209,.3)", color: "#00CED1", fontSize: 11, fontWeight: 700, marginBottom: 8, backdropFilter: "blur(8px)" }}>{cat}</span>
          <h1 style={{ color: "#fff", fontSize: 30, fontWeight: 900, lineHeight: 1.1, letterSpacing: -0.5, margin: "0 0 8px" }}>{vendor.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ color: "#FFD700", fontSize: 13 }}>{"★".repeat(Math.floor(vendor.rating))}</span>
            <span style={{ color: "rgba(255,255,255,.6)", fontSize: 13 }}>{vendor.rating}</span>
            {vendor.reviews > 0 && <span style={{ color: "rgba(255,255,255,.35)", fontSize: 12 }}>· {vendor.reviews} {isHe ? "ביקורות" : "reviews"}</span>}
            {vendor.city && <span style={{ color: "rgba(255,255,255,.35)", fontSize: 12 }}>· {vendor.city}</span>}
          </div>
        </div>
      </div>

      {/* Gallery strip */}
      {imgs.length > 1 && (
        <div style={{ display: "flex", gap: 6, padding: "10px 16px", overflowX: "auto" }}>
          {imgs.map((src, i) => (
            <img key={i} src={src} onClick={() => setImgIdx(i)} style={{ width: 76, height: 76, objectFit: "cover", borderRadius: 10, flexShrink: 0, border: `1.5px solid ${imgIdx === i ? "#00CED1" : "rgba(255,255,255,.05)"}`, cursor: "pointer", transition: "border-color .15s" }} alt="" />
          ))}
        </div>
      )}

      {/* Content */}
      <div style={{ padding: "16px 20px 48px" }}>
        {vendor.price && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, padding: "14px 18px", borderRadius: 14, background: "rgba(0,206,209,.05)", border: "1px solid rgba(0,206,209,.12)" }}>
            <span style={{ color: "rgba(255,255,255,.5)", fontSize: 13 }}>{vendor.sub}</span>
            <span style={{ color: "#00CED1", fontWeight: 900, fontSize: 22, fontFamily: "'Manrope',sans-serif" }}>{vendor.price}</span>
          </div>
        )}

        {vendor.coupon && (
          <div style={{ padding: "12px 16px", borderRadius: 14, background: "rgba(255,215,0,.04)", border: "1px solid rgba(255,215,0,.15)", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>🎁</span>
            <div>
              <p style={{ color: "#FFD700", fontSize: 11, fontWeight: 700, marginBottom: 2 }}>{isHe ? "קופון מיוחד" : "Special Coupon"}</p>
              <p style={{ color: "rgba(255,255,255,.75)", fontSize: 13 }}>{vendor.coupon}</p>
            </div>
          </div>
        )}

        {vendor.desc && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ color: "rgba(255,255,255,.3)", fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8 }}>{isHe ? "אודות" : "About"}</p>
            <p style={{ color: "rgba(255,255,255,.82)", fontSize: 14, lineHeight: 1.75 }}>{vendor.desc}</p>
          </div>
        )}

        {Object.keys(vendor.niche ?? {}).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ color: "rgba(255,255,255,.3)", fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8 }}>{isHe ? "פרטים" : "Details"}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {Object.entries(vendor.niche).map(([k, v]) => (
                <span key={k} style={{ padding: "5px 13px", borderRadius: 20, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", color: "rgba(255,255,255,.65)", fontSize: 12 }}>{translateNicheVal(v, lang)}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <p style={{ color: "rgba(255,255,255,.3)", fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>{isHe ? "צור קשר" : "Contact"}</p>
          <VLinks vendor={vendor} />
        </div>

        {/* Primary CTA */}
        <button onClick={() => setShowModal(true)}
          style={{ display: "block", width: "100%", padding: "16px 0", borderRadius: 16, background: "linear-gradient(160deg,#00e5e8,#00CED1)", color: "#000", fontWeight: 900, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "center", boxShadow: "0 8px 28px rgba(0,206,209,.4)" }}>
          {isHe ? "🚀 ניהול האירוע שלך ב-VibeMatch — בחינם" : "🚀 Plan your event on VibeMatch — Free"}
        </button>

        {/* Share button */}
        <button onClick={() => {
          const url = window.location.href;
          if (navigator.share) {
            navigator.share({ title: vendor.name, text: `${vendor.name} — VibeMatch`, url });
          } else {
            navigator.clipboard?.writeText(url);
          }
        }} style={{ display: "block", width: "100%", marginTop: 10, padding: "13px 0", borderRadius: 16, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.65)", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}>
          📤 {isHe ? "שיתוף הפרופיל" : "Share Profile"}
        </button>

        <div style={{ textAlign: "center", marginTop: 28 }}>
          <p style={{ color: "#1a1a1a", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Powered by</p>
          <Logo sz={20} />
        </div>
      </div>

      {showModal && <ViralModal ref={ref} isHe={isHe} onClose={() => setShowModal(false)} />}
    </div>
  );
}
