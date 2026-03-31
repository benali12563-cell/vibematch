"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { T, CATS, AREAS, DV } from "@/lib/constants";
import type { Vendor } from "@/types";
import SwipeCardView from "./SwipeCardView";
import Nav from "./Nav";
import Logo from "./Logo";
import LangToggle from "./LangToggle";
import LoginModal from "./LoginModal";
import HotStrip from "./HotStrip";
import ConfettiEffect from "./ConfettiEffect";
import SwipeTogetherModal from "./SwipeTogetherModal";
import VendorCard from "./VendorCard";
import B from "./B";

// Deterministic "social proof" from vendor name
function sp(name: string, min: number, max: number) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return min + (Math.abs(h) % (max - min + 1));
}

export default function SwipeHome() {
  const { lang, activeCat, setActiveCat, areaFilter, setAreaFilter, likes, setLikes, user, setUser, showLogin, setShowLogin, loginMode, setLoginMode, showToast } = useApp();
  const t = T[lang];
  const router = useRouter();
  const isHe = lang === "he";
  const [ci, setCi] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [matchVendor, setMatchVendor] = useState<Vendor | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [showTogether, setShowTogether] = useState(false);
  const [hotView, setHotView] = useState<Vendor | null>(null);
  const [showHot, setShowHot] = useState(true);
  const [likeCount, setLikeCount] = useState(0);

  const rawVs = DV[activeCat] ?? [];
  const vs = areaFilter === "allAreas" ? rawVs : rawVs.filter((v) => v.area === areaFilter);
  const cur = vs[ci];

  const next = useCallback(() => { setCi((i) => i + 1); setImgIdx(0); }, []);

  function doLike() {
    if (!cur) return;
    setLikes((p) => (p.includes(cur.name) ? p : [...p, cur.name]));
    const newCount = likeCount + 1;
    setLikeCount(newCount);

    // Match at 20% chance, or every 5 likes
    const isMatch = Math.random() < 0.2 || newCount % 5 === 0;
    if (isMatch) {
      setMatchVendor(cur);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 100);
    } else {
      showToast("❤️ " + cur.name);
    }

    // After 3 likes, nudge to swipe together
    if (newCount === 3) {
      setTimeout(() => setShowTogether(true), 600);
    }
    next();
  }

  const looked = cur ? sp(cur.name, 8, 63) : 0;
  const liveNow = cur ? sp(cur.name + "x", 1, 9) : 0;
  const isHot = cur ? (sp(cur.name, 0, 10) > 7) : false;

  return (
    <div style={{ minHeight: "100dvh", background: "#000", fontFamily: isHe ? "'Heebo'" : "'Outfit'", direction: isHe ? "rtl" : "ltr" }}>
      <ConfettiEffect trigger={confetti} />

      {/* Top bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 44, background: "#000", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", zIndex: 100, maxWidth: 480, margin: "0 auto" }}>
        <B s="sm" v="ghost" onClick={() => { setLoginMode("vendor"); setShowLogin(true); }} style={{ padding: "4px 12px", fontSize: 11, fontWeight: 500 }}>{t.vendor}</B>
        <button onClick={() => setShowTogether(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <Logo sz={18} />
        </button>
        {user
          ? <span style={{ color: "#888", fontSize: 11 }}>{user.name}</span>
          : <B s="sm" v="ghost" onClick={() => { setLoginMode("owner"); setShowLogin(true); }} style={{ padding: "4px 12px", fontSize: 11 }}>{t.login}</B>
        }
      </div>

      {/* Category tabs */}
      <div style={{ position: "fixed", top: 44, left: 0, right: 0, height: 38, background: "rgba(0,0,0,.96)", display: "flex", alignItems: "center", gap: 4, padding: "0 8px", overflowX: "auto", zIndex: 99, direction: "ltr", maxWidth: 480, margin: "0 auto" }}>
        {CATS.map((c) => (
          <button key={c.k} onClick={() => { setActiveCat(c.k); setCi(0); setImgIdx(0); setShowHot(false); }} style={{ flexShrink: 0, padding: "4px 14px", borderRadius: 20, border: `1px solid ${activeCat === c.k ? "#00CED1" : "rgba(255,255,255,.06)"}`, background: activeCat === c.k ? "rgba(0,206,209,.08)" : "transparent", cursor: "pointer", color: activeCat === c.k ? "#00CED1" : "#666", fontSize: 11, fontWeight: 600, fontFamily: "'Heebo'" }}>
            {isHe ? c.he : c.en}
          </button>
        ))}
      </div>

      {/* Area + controls */}
      <div style={{ position: "fixed", top: 82, left: 0, right: 0, height: 30, background: "rgba(0,0,0,.9)", display: "flex", alignItems: "center", gap: 4, padding: "0 8px", overflowX: "auto", zIndex: 98, direction: "ltr", maxWidth: 480, margin: "0 auto" }}>
        {AREAS.map((a) => (
          <button key={a} onClick={() => { setAreaFilter(a); setCi(0); }} style={{ flexShrink: 0, padding: "2px 10px", borderRadius: 10, border: "none", background: areaFilter === a ? "rgba(0,206,209,.06)" : "transparent", color: areaFilter === a ? "#00CED1" : "#555", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>
            {t[a]}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          {/* Swipe together trigger */}
          <button onClick={() => setShowTogether(true)} style={{ background: "rgba(0,206,209,.05)", border: "1px solid rgba(0,206,209,.12)", borderRadius: 8, padding: "2px 8px", color: "#00CED1", fontSize: 9, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
            💑 {isHe ? "יחד" : "Together"}
          </button>
          <LangToggle />
        </div>
      </div>

      {/* Scrollable content area */}
      <div style={{ position: "fixed", top: 112, bottom: 56, left: 0, right: 0, maxWidth: 480, margin: "0 auto", overflowY: "auto" }}>

        {/* Hot strip (collapsible) */}
        {showHot && (
          <div style={{ background: "#000", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
            <HotStrip onSelect={(v) => setHotView(v)} />
            <button onClick={() => setShowHot(false)} style={{ display: "block", width: "100%", background: "none", border: "none", color: "#333", fontSize: 10, cursor: "pointer", paddingBottom: 8, fontFamily: "inherit" }}>
              {isHe ? "הסתר ↑" : "hide ↑"}
            </button>
          </div>
        )}
        {!showHot && (
          <button onClick={() => setShowHot(true)} style={{ display: "block", width: "100%", background: "none", border: "none", borderBottom: "1px solid rgba(255,255,255,.04)", color: "#333", fontSize: 10, cursor: "pointer", padding: "6px 0", fontFamily: "inherit" }}>
            🔥 {isHe ? "חם השבוע ↓" : "Trending ↓"}
          </button>
        )}

        {/* Card area */}
        <div style={{ height: showHot ? "calc(100% - 220px)" : "calc(100% - 42px)", position: "relative" }}>
          {cur ? (
            <>
              {/* Social proof bar */}
              <div style={{ display: "flex", gap: 8, padding: "6px 14px", direction: isHe ? "rtl" : "ltr" }}>
                <span style={{ fontSize: 10, color: "#555" }}>👁 {looked} {isHe ? "צפיות" : "views"}</span>
                {liveNow > 4 && (
                  <span style={{ fontSize: 10, color: "#FF4444", fontWeight: 600 }}>🔴 {liveNow} {isHe ? "צופים עכשיו" : "watching now"}</span>
                )}
                {isHot && (
                  <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 6, background: "rgba(255,215,0,.08)", color: "#FFD700", border: "1px solid rgba(255,215,0,.15)", fontWeight: 600 }}>
                    ⭐ {isHe ? "מבוקש" : "Popular"}
                  </span>
                )}
                <span style={{ marginRight: isHe ? "auto" : 0, marginLeft: isHe ? 0 : "auto", color: "#333", fontSize: 10 }}>
                  {ci + 1}/{vs.length}
                </span>
              </div>

              <SwipeCardView
                vendor={cur}
                imgIdx={imgIdx}
                setImgIdx={setImgIdx}
                actions={
                  <div style={{ display: "flex", justifyContent: "center", gap: 20, padding: "4px 0" }}>
                    <button onClick={next} style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,68,68,.07)", border: "1.5px solid rgba(255,68,68,.2)", color: "#FF4444", fontSize: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>✕</button>
                    <button onClick={doLike} style={{ width: 60, height: 60, borderRadius: "50%", background: likes.includes(cur.name) ? "rgba(0,206,209,.2)" : "rgba(0,206,209,.08)", border: `1.5px solid ${likes.includes(cur.name) ? "#00CED1" : "rgba(0,206,209,.2)"}`, color: "#00CED1", fontSize: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
                      {likes.includes(cur.name) ? "♥" : "♡"}
                    </button>
                  </div>
                }
              />
            </>
          ) : (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <div style={{ fontSize: 40 }}>🎉</div>
              <p style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>{t.noMore}</p>
              <p style={{ color: "#555", fontSize: 12 }}>{t.pickCat}</p>
              <B s="sm" v="accent" onClick={() => { setCi(0); }}>{isHe ? "הצג מחדש" : "Show again"}</B>
            </div>
          )}
        </div>
      </div>

      {/* Legal footer */}
      <div style={{ position: "fixed", bottom: 56, left: 0, right: 0, maxWidth: 480, margin: "0 auto", textAlign: "center", padding: "4px 0", display: "flex", justifyContent: "center", gap: 14, background: "rgba(0,0,0,.6)" }}>
        {[
          { href: "/legal/terms", label: isHe ? "תנאי שימוש" : "Terms" },
          { href: "/legal/privacy", label: isHe ? "פרטיות" : "Privacy" },
          { href: "/legal/vendor-terms", label: isHe ? "ספקים" : "Vendors" },
        ].map((l) => (
          <Link key={l.href} href={l.href} style={{ color: "#252525", fontSize: 9, textDecoration: "none" }}>{l.label}</Link>
        ))}
      </div>

      <Nav />

      {/* Match overlay — dopamine explosion */}
      {matchVendor && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.92)", backdropFilter: "blur(16px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setMatchVendor(null)}>
          <div style={{ animation: "scaleIn .4s", textAlign: "center", padding: "0 24px" }}>
            <div style={{ fontSize: 60, marginBottom: 8, animation: "glow 1.2s ease infinite" }}>♥</div>
            <h2 style={{ color: "#00CED1", fontSize: 26, fontWeight: 900, marginBottom: 6 }}>
              {isHe ? "התאמה מושלמת!" : "Perfect Match!"}
            </h2>
            <p style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{matchVendor.name}</p>
            <p style={{ color: "#555", fontSize: 13, marginBottom: 24 }}>{isHe ? "נשמר לרשימת המועדפים שלך ✓" : "Saved to your favorites ✓"}</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <B v="accent" onClick={() => { setMatchVendor(null); router.push("/manage"); }}>
                {isHe ? "ראה ניהול" : "See Manage"}
              </B>
              <B v="ghost" onClick={() => setMatchVendor(null)}>
                {isHe ? "המשך להחליק" : "Keep swiping"}
              </B>
            </div>
          </div>
        </div>
      )}

      {showTogether && <SwipeTogetherModal onClose={() => setShowTogether(false)} />}

      {hotView && (
        <VendorCard vendor={hotView} onClose={() => setHotView(null)} />
      )}

      {showLogin && (
        <LoginModal mode={loginMode} onClose={() => setShowLogin(false)} onDone={(u) => { setUser(u); setShowLogin(false); if (u.role === "vendor") router.push("/vendor"); }} />
      )}
    </div>
  );
}
