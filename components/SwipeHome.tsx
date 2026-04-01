"use client";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { T, CATS, AREAS, DV } from "@/lib/constants";
import type { Vendor, CatKey } from "@/types";
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

// Sub-categories per category
const SUB: Partial<Record<CatKey, { he: string; en: string }[]>> = {
  venues: [
    { he: "אולמות", en: "Halls" }, { he: "ווילות", en: "Villas" },
    { he: "לופטים", en: "Lofts" }, { he: "מסעדות", en: "Restaurants" },
    { he: "מתחמי השכרה", en: "Venues for Rent" }, { he: "גינות אירועים", en: "Gardens" },
  ],
  food: [
    { he: "קייטרינג", en: "Catering" }, { he: "שף פרטי", en: "Private Chef" },
    { he: "מתוקים", en: "Sweets" }, { he: "בר שתייה", en: "Bar" },
  ],
  music: [
    { he: "DJ", en: "DJ" }, { he: "להקה חיה", en: "Live Band" },
    { he: "זמר/ת", en: "Singer" }, { he: "מוזיקה קלאסית", en: "Classical" },
  ],
  entertainment: [
    { he: "קוסם", en: "Magician" }, { he: "רקדנים", en: "Dancers" },
    { he: "סטנדאפ", en: "Stand-up" }, { he: "אטרקציות ילדים", en: "Kids" },
  ],
};

function sp(name: string, min: number, max: number) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return min + (Math.abs(h) % (max - min + 1));
}

export default function SwipeHome() {
  const { lang, activeCat, setActiveCat, areaFilter, setAreaFilter, likes, setLikes, user, setUser, showLogin, setShowLogin, loginMode, setLoginMode, showToast, vendorAvailability, selectedDate, setSelectedDate } = useApp();
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
  const [likeAnim, setLikeAnim] = useState(false);
  const [nopeAnim, setNopeAnim] = useState(false);
  const [cardAnim, setCardAnim] = useState<"like" | "nope" | null>(null);
  const [activeSub, setActiveSub] = useState<string | null>(null);

  const rawVs = DV[activeCat] ?? [];
  const areaFiltered = areaFilter === "allAreas" ? rawVs : rawVs.filter((v) => v.area === areaFilter);
  const vs = selectedDate
    ? areaFiltered.filter((v) => !(vendorAvailability[v.name] ?? []).includes(selectedDate))
    : areaFiltered;
  const cur = vs[ci];
  const looked = cur ? sp(cur.name, 8, 63) : 0;
  const liveNow = cur ? sp(cur.name + "x", 1, 9) : 0;
  const isHot = cur ? (sp(cur.name, 0, 10) > 7) : false;

  const next = useCallback(() => { setCi((i) => i + 1); setImgIdx(0); }, []);

  function doLike() {
    if (!cur) return;
    setLikeAnim(true); setCardAnim("like");
    setTimeout(() => { setLikeAnim(false); setCardAnim(null); }, 500);
    setLikes((p) => (p.includes(cur.name) ? p : [...p, cur.name]));
    const nc = likeCount + 1;
    setLikeCount(nc);
    const isMatch = Math.random() < 0.2 || nc % 5 === 0;
    if (isMatch) {
      setTimeout(() => { setMatchVendor(cur); setConfetti(true); setTimeout(() => setConfetti(false), 100); }, 450);
    } else {
      showToast("❤️ " + cur.name);
    }
    if (nc === 3) setTimeout(() => setShowTogether(true), 600);
    setTimeout(next, 400);
  }

  function doNope() {
    if (!cur) return;
    setNopeAnim(true); setCardAnim("nope");
    setTimeout(() => { setNopeAnim(false); setCardAnim(null); next(); }, 420);
  }

  const subs = SUB[activeCat] ?? [];

  return (
    <div style={{ minHeight: "100dvh", background: "#000", fontFamily: isHe ? "'Heebo'" : "'Manrope','Heebo'", direction: isHe ? "rtl" : "ltr" }}>
      <ConfettiEffect trigger={confetti} />

      {/* ── Floating glass header ── */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, maxWidth: 480, margin: "0 auto", pointerEvents: "none" }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 8px", pointerEvents: "auto" }}>
          {/* Right: vendor + lang */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => { setLoginMode("vendor"); setShowLogin(true); }}
              className="glass"
              style={{ padding: "5px 12px", borderRadius: 20, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.8)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              {t.vendor}
            </button>
            <LangToggle />
          </div>

          {/* Center: Logo (long-press = admin) */}
          <button onClick={() => setShowTogether(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <Logo sz={20} />
          </button>

          {/* Left: login / name */}
          {user
            ? <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(0,206,209,.15)", border: "1.5px solid rgba(0,206,209,.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 13 }}>👤</span>
                </div>
              </div>
            : <button onClick={() => { setLoginMode("owner"); setShowLogin(true); }}
                className="glass"
                style={{ padding: "5px 12px", borderRadius: 20, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.8)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                {t.login}
              </button>
          }
        </div>

        {/* Category chips */}
        <div style={{ display: "flex", gap: 6, padding: "0 12px 6px", overflowX: "auto", direction: "ltr", pointerEvents: "auto" }}
          className="hide-scrollbar" >
          {CATS.map((c) => {
            const active = activeCat === c.k;
            return (
              <button key={c.k} onClick={() => { setActiveCat(c.k); setCi(0); setImgIdx(0); setActiveSub(null); }}
                style={{ flexShrink: 0, padding: "5px 14px", borderRadius: 20, border: `1.5px solid ${active ? "#00CED1" : "rgba(255,255,255,.08)"}`, background: active ? "rgba(0,206,209,.1)" : "rgba(0,0,0,.5)", backdropFilter: "blur(10px)", cursor: "pointer", color: active ? "#00CED1" : "rgba(255,255,255,.5)", fontSize: 11, fontWeight: 700, fontFamily: "inherit", transition: "all .2s" }}>
                {isHe ? c.he : c.en}
              </button>
            );
          })}
        </div>

        {/* Sub-category chips (if available) */}
        {subs.length > 0 && (
          <div style={{ display: "flex", gap: 5, padding: "0 12px 6px", overflowX: "auto", direction: "ltr", pointerEvents: "auto" }}
            className="hide-scrollbar">
            {subs.map((s) => {
              const active = activeSub === s.he;
              return (
                <button key={s.he} onClick={() => setActiveSub(active ? null : s.he)}
                  style={{ flexShrink: 0, padding: "3px 11px", borderRadius: 20, border: `1px solid ${active ? "rgba(0,206,209,.4)" : "rgba(255,255,255,.05)"}`, background: active ? "rgba(0,206,209,.07)" : "rgba(0,0,0,.4)", backdropFilter: "blur(8px)", cursor: "pointer", color: active ? "#00CED1" : "rgba(255,255,255,.35)", fontSize: 10, fontWeight: 600, fontFamily: "inherit" }}>
                  {isHe ? s.he : s.en}
                </button>
              );
            })}
          </div>
        )}

        {/* Area filter */}
        <div style={{ display: "flex", gap: 5, padding: "0 12px 4px", overflowX: "auto", direction: "ltr", pointerEvents: "auto" }}
          className="hide-scrollbar">
          {AREAS.map((a) => (
            <button key={a} onClick={() => { setAreaFilter(a); setCi(0); }}
              style={{ flexShrink: 0, padding: "2px 10px", borderRadius: 12, border: "none", background: areaFilter === a ? "rgba(0,206,209,.08)" : "transparent", color: areaFilter === a ? "#00CED1" : "rgba(255,255,255,.3)", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              {t[a]}
            </button>
          ))}
          {/* Swipe Together */}
          <button onClick={() => setShowTogether(true)}
            style={{ flexShrink: 0, padding: "2px 10px", borderRadius: 12, border: "1px solid rgba(0,206,209,.15)", background: "rgba(0,206,209,.05)", color: "#00CED1", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginRight: "auto" }}>
            💑 {isHe ? "יחד" : "Together"}
          </button>
        </div>

        {/* Date filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 12px 8px", pointerEvents: "auto" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: selectedDate ? "#00CED1" : "rgba(255,255,255,.25)", flexShrink: 0 }}>calendar_month</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value); setCi(0); }}
            style={{ flex: 1, background: selectedDate ? "rgba(0,206,209,.06)" : "rgba(255,255,255,.03)", border: `1px solid ${selectedDate ? "rgba(0,206,209,.3)" : "rgba(255,255,255,.07)"}`, borderRadius: 10, padding: "4px 10px", color: selectedDate ? "#00CED1" : "rgba(255,255,255,.35)", fontSize: 11, fontFamily: "inherit", outline: "none", backdropFilter: "blur(8px)" }}
          />
          {selectedDate && (
            <button onClick={() => { setSelectedDate(""); setCi(0); }}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,.3)", fontSize: 13, cursor: "pointer", padding: "0 2px" }}>✕</button>
          )}
        </div>
      </header>

      {/* ── Main card area ── */}
      <div style={{ position: "fixed", top: 0, bottom: 62, left: 0, right: 0, maxWidth: 480, margin: "0 auto" }}>

        {/* Hot strip (floats above, collapsible) */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}>
          {showHot ? (
            <div className="glass-dark" style={{ paddingTop: 150 }}>
              <HotStrip onSelect={(v) => setHotView(v)} />
              <button onClick={() => setShowHot(false)} style={{ display: "block", width: "100%", background: "none", border: "none", color: "#333", fontSize: 10, cursor: "pointer", paddingBottom: 6, fontFamily: "inherit" }}>
                {isHe ? "הסתר ↑" : "hide ↑"}
              </button>
            </div>
          ) : (
            <div style={{ paddingTop: 148 }}>
              <button onClick={() => setShowHot(true)} style={{ display: "block", width: "100%", background: "rgba(0,0,0,.3)", backdropFilter: "blur(8px)", border: "none", borderBottom: "1px solid rgba(255,255,255,.04)", color: "#333", fontSize: 10, cursor: "pointer", padding: "5px 0", fontFamily: "inherit" }}>
                🔥 {isHe ? "חם השבוע ↓" : "Trending ↓"}
              </button>
            </div>
          )}
        </div>

        {/* Card */}
        <div style={{ position: "absolute", inset: 0, top: showHot ? 340 : 168 }}>
          {cur ? (
            <>
              {/* Social proof */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 14px", direction: isHe ? "rtl" : "ltr" }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,.25)" }}>👁 {looked}</span>
                {liveNow > 4 && <span style={{ fontSize: 10, color: "#FF4444", fontWeight: 600, animation: "pulse 2s infinite" }}>🔴 {liveNow} {isHe ? "עכשיו" : "now"}</span>}
                {isHot && <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 10, background: "rgba(255,215,0,.07)", color: "#FFD700", border: "1px solid rgba(255,215,0,.15)", fontWeight: 700 }}>⭐ {isHe ? "מבוקש" : "Hot"}</span>}
                <span style={{ marginRight: isHe ? "auto" : 0, marginLeft: isHe ? 0 : "auto", color: "rgba(255,255,255,.2)", fontSize: 10 }}>{ci + 1}/{vs.length}</span>
              </div>

              {/* Card with swipe animation */}
              <div style={{
                position: "absolute", top: 28, left: 0, right: 0, bottom: 0,
                animation: cardAnim === "like" ? "swipeRight .45s ease forwards" : cardAnim === "nope" ? "swipeLeft .45s ease forwards" : undefined,
                borderRadius: "0 0 0 0"
              }}>
                <SwipeCardView vendor={cur} imgIdx={imgIdx} setImgIdx={setImgIdx}
                  actions={
                    <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
                      {/* Nope */}
                      <button onClick={doNope} style={{ width: 64, height: 64, borderRadius: "50%", background: nopeAnim ? "rgba(255,68,68,.25)" : "rgba(0,0,0,.5)", border: "1.5px solid rgba(255,68,68,.3)", color: "#FF4444", fontSize: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)", transition: "all .15s", animation: nopeAnim ? "nopeFlash .4s" : undefined }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 28, fontVariationSettings: "'FILL' 0" }}>close</span>
                      </button>
                      {/* Like */}
                      <button onClick={doLike} style={{ width: 64, height: 64, borderRadius: "50%", background: likeAnim ? "rgba(0,206,209,.35)" : likes.includes(cur.name) ? "rgba(0,206,209,.2)" : "rgba(0,0,0,.5)", border: `1.5px solid ${likes.includes(cur.name) ? "#00CED1" : "rgba(0,206,209,.3)"}`, color: "#00CED1", fontSize: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)", transition: "all .15s", animation: likeAnim ? "likeFlash .45s" : undefined }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 28, fontVariationSettings: likes.includes(cur.name) ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                      </button>
                    </div>
                  }
                />
              </div>
            </>
          ) : (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
              <div style={{ fontSize: 48 }}>🎉</div>
              <p style={{ color: "#fff", fontSize: 17, fontWeight: 700 }}>{t.noMore}</p>
              <p style={{ color: "rgba(255,255,255,.35)", fontSize: 13 }}>{t.pickCat}</p>
              <B s="sm" v="accent" onClick={() => { setCi(0); }}>{isHe ? "הצג מחדש" : "Show again"}</B>
            </div>
          )}
        </div>
      </div>

      {/* Legal footer */}
      <div style={{ position: "fixed", bottom: 62, left: 0, right: 0, maxWidth: 480, margin: "0 auto", display: "flex", justifyContent: "center", gap: 16, padding: "3px 0", background: "rgba(0,0,0,.7)" }}>
        {[["terms", isHe ? "תנאי שימוש" : "Terms"], ["privacy", isHe ? "פרטיות" : "Privacy"], ["vendor-terms", isHe ? "ספקים" : "Vendors"]].map(([k, l]) => (
          <Link key={k} href={`/legal/${k}`} style={{ color: "#222", fontSize: 9, textDecoration: "none" }}>{l}</Link>
        ))}
      </div>

      <Nav />

      {/* ── Match overlay ── */}
      {matchVendor && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.92)", backdropFilter: "blur(20px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setMatchVendor(null)}>
          <div style={{ animation: "scaleIn .4s", textAlign: "center", padding: "0 28px" }}>
            <div style={{ fontSize: 64, marginBottom: 10, animation: "glow 1.2s ease infinite" }}>♥</div>
            <h2 style={{ color: "#00CED1", fontSize: 28, fontWeight: 900, marginBottom: 6, fontFamily: "'Manrope','Heebo',sans-serif", letterSpacing: -0.5 }}>
              {isHe ? "התאמה מושלמת!" : "Perfect Match!"}
            </h2>
            <p style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{matchVendor.name}</p>
            <p style={{ color: "rgba(255,255,255,.4)", fontSize: 13, marginBottom: 24 }}>
              {isHe ? "נשמר לרשימת המועדפים ✓" : "Saved to favorites ✓"}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <B v="accent" onClick={() => { setMatchVendor(null); router.push("/manage"); }}>{isHe ? "ראה ניהול" : "See Manage"}</B>
              <B v="ghost" onClick={() => setMatchVendor(null)}>{isHe ? "המשך" : "Continue"}</B>
            </div>
          </div>
        </div>
      )}

      {showTogether && <SwipeTogetherModal onClose={() => setShowTogether(false)} />}
      {hotView && <VendorCard vendor={hotView} onClose={() => setHotView(null)} />}
      {showLogin && <LoginModal mode={loginMode} onClose={() => setShowLogin(false)} onDone={(u) => { setUser(u); setShowLogin(false); if (u.role === "vendor") router.push("/vendor"); }} />}
    </div>
  );
}
