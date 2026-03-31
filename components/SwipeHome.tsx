"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { T, CATS, AREAS, DV } from "@/lib/constants";
import type { Vendor } from "@/types";
import SwipeCardView from "./SwipeCardView";
import Nav from "./Nav";
import Logo from "./Logo";
import LangToggle from "./LangToggle";
import LoginModal from "./LoginModal";
import B from "./B";

export default function SwipeHome() {
  const { lang, activeCat, setActiveCat, areaFilter, setAreaFilter, likes, setLikes, user, setUser, showLogin, setShowLogin, loginMode, setLoginMode, showToast } = useApp();
  const t = T[lang];
  const router = useRouter();
  const [ci, setCi] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [matchVendor, setMatchVendor] = useState<Vendor | null>(null);

  const rawVs = DV[activeCat] ?? [];
  const vs = areaFilter === "allAreas" ? rawVs : rawVs.filter((v) => v.area === areaFilter);
  const cur = vs[ci];

  function next() { setCi((i) => i + 1); setImgIdx(0); }

  function doLike() {
    if (!cur) return;
    setLikes((p) => (p.includes(cur.name) ? p : [...p, cur.name]));
    showToast("❤️ " + cur.name);
    if (Math.random() < 0.2) setMatchVendor(cur);
    next();
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#000", fontFamily: lang === "he" ? "'Heebo'" : "'Outfit'", direction: lang === "he" ? "rtl" : "ltr" }}>
      {/* Top bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 44, background: "#000", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", zIndex: 100, maxWidth: 480, margin: "0 auto" }}>
        <B s="sm" v="ghost" onClick={() => { setLoginMode("vendor"); setShowLogin(true); }} style={{ padding: "4px 12px", fontSize: 11, fontWeight: 500 }}>{t.vendor}</B>
        <Logo sz={18} />
        {user
          ? <span style={{ color: "#888", fontSize: 11 }}>{user.name}</span>
          : <B s="sm" v="ghost" onClick={() => { setLoginMode("owner"); setShowLogin(true); }} style={{ padding: "4px 12px", fontSize: 11 }}>{t.login}</B>
        }
      </div>

      {/* Category tabs */}
      <div style={{ position: "fixed", top: 44, left: 0, right: 0, height: 38, background: "rgba(0,0,0,.95)", display: "flex", alignItems: "center", gap: 4, padding: "0 8px", overflowX: "auto", zIndex: 99, direction: "ltr", maxWidth: 480, margin: "0 auto" }}>
        {CATS.map((c) => (
          <button key={c.k} onClick={() => { setActiveCat(c.k); setCi(0); setImgIdx(0); }} style={{ flexShrink: 0, padding: "4px 14px", borderRadius: 20, border: `1px solid ${activeCat === c.k ? "#00CED1" : "rgba(255,255,255,.06)"}`, background: activeCat === c.k ? "rgba(0,206,209,.08)" : "transparent", cursor: "pointer", color: activeCat === c.k ? "#00CED1" : "#666", fontSize: 11, fontWeight: 600, fontFamily: "'Heebo'" }}>
            {lang === "en" ? c.en : c.he}
          </button>
        ))}
      </div>

      {/* Area filter */}
      <div style={{ position: "fixed", top: 82, left: 0, right: 0, height: 30, background: "rgba(0,0,0,.9)", display: "flex", alignItems: "center", gap: 4, padding: "0 8px", overflowX: "auto", zIndex: 98, direction: "ltr", maxWidth: 480, margin: "0 auto" }}>
        {AREAS.map((a) => (
          <button key={a} onClick={() => { setAreaFilter(a); setCi(0); }} style={{ flexShrink: 0, padding: "2px 10px", borderRadius: 10, border: "none", background: areaFilter === a ? "rgba(0,206,209,.06)" : "transparent", color: areaFilter === a ? "#00CED1" : "#555", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>
            {t[a]}
          </button>
        ))}
        <div style={{ marginLeft: "auto" }}><LangToggle /></div>
      </div>

      {/* Card */}
      <div style={{ position: "fixed", top: 112, bottom: 56, left: 0, right: 0, maxWidth: 480, margin: "0 auto" }}>
        {cur ? (
          <SwipeCardView
            vendor={cur}
            imgIdx={imgIdx}
            setImgIdx={setImgIdx}
            actions={
              <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
                <button onClick={next} style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,68,68,.1)", border: "1.5px solid rgba(255,68,68,.25)", color: "#FF4444", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                <button onClick={doLike} style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(0,206,209,.1)", border: "1.5px solid rgba(0,206,209,.25)", color: "#00CED1", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>♥</button>
              </div>
            }
          />
        ) : (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>{t.noMore}</p>
            <p style={{ color: "#555", fontSize: 12, marginTop: 6 }}>{t.pickCat}</p>
          </div>
        )}
      </div>

      <Nav />

      {/* Match overlay */}
      {matchVendor && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.92)", backdropFilter: "blur(14px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setMatchVendor(null)}>
          <div style={{ animation: "scaleIn .4s", textAlign: "center" }}>
            <div style={{ fontSize: 48, animation: "glow 1.5s ease infinite", width: 80, height: 80, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", background: "rgba(0,206,209,.06)" }}>♥</div>
            <h2 style={{ color: "#00CED1", fontSize: 22, fontWeight: 800 }}>{t.match}</h2>
            <p style={{ color: "#fff", fontSize: 18, fontWeight: 600, marginTop: 8 }}>{matchVendor.name}</p>
            <B style={{ marginTop: 20 }} onClick={() => setMatchVendor(null)}>OK</B>
          </div>
        </div>
      )}

      {showLogin && (
        <LoginModal mode={loginMode} onClose={() => setShowLogin(false)} onDone={(u) => { setUser(u); setShowLogin(false); if (u.role === "vendor") router.push("/vendor"); }} />
      )}
    </div>
  );
}
