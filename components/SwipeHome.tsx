"use client";
import { useState, useCallback, useEffect } from "react";
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
import { loadPublishedVendors } from "@/lib/supabase/vendors";

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
  const { lang, activeCat, setActiveCat, areaFilter, setAreaFilter, likes, setLikes, user, setUser, showLogin, setShowLogin, loginMode, setLoginMode, showToast, vendorAvailability, selectedDate, setSelectedDate, publishedVendors } = useApp();
  const t = T[lang];
  const router = useRouter();
  const isHe = lang === "he";

  const [ci, setCi] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [matchVendor, setMatchVendor] = useState<Vendor | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [showTogether, setShowTogether] = useState(false);
  const [hotView, setHotView] = useState<Vendor | null>(null);
  const [likeCount, setLikeCount] = useState(0);
  const [likeAnim, setLikeAnim] = useState(false);
  const [nopeAnim, setNopeAnim] = useState(false);
  const [cardAnim, setCardAnim] = useState<"like" | "nope" | null>(null);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showHotSheet, setShowHotSheet] = useState(false);
  const [dbVendors, setDbVendors] = useState<Vendor[]>([]);

  // Load live published vendors from Supabase once on mount
  useEffect(() => {
    loadPublishedVendors().then(setDbVendors).catch(() => {});
  }, []);

  // Merge: DV hardcoded + context (just published) + Supabase DB
  // Deduplicate by name so a vendor who just published doesn't appear twice
  const seenNames = new Set<string>();
  const liveVendors: Vendor[] = [];
  for (const v of [
    ...publishedVendors.filter((v) => v.catKey === activeCat),
    ...dbVendors.filter((v) => v.catKey === activeCat),
  ]) {
    if (!seenNames.has(v.name)) { seenNames.add(v.name); liveVendors.push(v); }
  }
  const rawVs = [...(DV[activeCat] ?? []), ...liveVendors];
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
  const hasActiveFilters = areaFilter !== "allAreas" || !!selectedDate || !!activeSub;

  return (
    <div style={{ height: "100dvh", overflow: "hidden", background: "#000", fontFamily: isHe ? "'Heebo'" : "'Manrope','Heebo'", direction: isHe ? "rtl" : "ltr" }}>
      <ConfettiEffect trigger={confetti} />

      {/* ── FULL-SCREEN CARD ── */}
      <div style={{ position: "fixed", top: 0, bottom: 62, left: 0, right: 0, maxWidth: 480, margin: "0 auto" }}>
        {cur ? (
          <>
            <div style={{
              position: "absolute", inset: 0,
              animation: cardAnim === "like" ? "swipeRight .45s ease forwards" : cardAnim === "nope" ? "swipeLeft .45s ease forwards" : undefined,
            }}>
              <SwipeCardView vendor={cur} imgIdx={imgIdx} setImgIdx={setImgIdx}
                actions={
                  <div style={{ display: "flex", justifyContent: "center", gap: 28 }}>
                    {/* Nope */}
                    <button onClick={doNope} style={{ width: 68, height: 68, borderRadius: "50%", background: nopeAnim ? "rgba(255,68,68,.3)" : "rgba(20,0,0,.65)", border: "2px solid rgba(255,68,68,.5)", color: "#FF5555", fontSize: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", transition: "all .12s", animation: nopeAnim ? "nopeFlash .4s" : undefined, boxShadow: "0 4px 20px rgba(255,68,68,.25), inset 0 1px 0 rgba(255,255,255,.1)" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 30, fontVariationSettings: "'FILL' 0" }}>close</span>
                    </button>
                    {/* Like */}
                    <button onClick={doLike} style={{ width: 68, height: 68, borderRadius: "50%", background: likeAnim ? "linear-gradient(160deg,#00e5e8,#00CED1)" : likes.includes(cur.name) ? "linear-gradient(160deg,rgba(0,229,232,.25),rgba(0,206,209,.15))" : "rgba(0,20,20,.65)", border: `2px solid ${likes.includes(cur.name) ? "rgba(0,229,232,.7)" : "rgba(0,206,209,.45)"}`, color: likeAnim ? "#000" : "#00e5e8", fontSize: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", transition: "all .12s", animation: likeAnim ? "likeFlash .45s" : undefined, boxShadow: likes.includes(cur.name) ? "0 4px 20px rgba(0,206,209,.4), inset 0 1px 0 rgba(255,255,255,.15)" : "0 4px 20px rgba(0,206,209,.2), inset 0 1px 0 rgba(255,255,255,.08)" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 30, fontVariationSettings: likes.includes(cur.name) ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                    </button>
                  </div>
                }
              />
            </div>

            {/* Social proof badges — float above action area */}
            <div style={{ position: "absolute", bottom: 148, left: 14, right: 14, zIndex: 6, display: "flex", alignItems: "center", gap: 7, direction: isHe ? "rtl" : "ltr", pointerEvents: "none" }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,.55)", background: "rgba(0,0,0,.45)", borderRadius: 8, padding: "2px 8px", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>👁 {looked}</span>
              {liveNow > 4 && <span style={{ fontSize: 10, color: "#FF4444", fontWeight: 600, background: "rgba(0,0,0,.45)", borderRadius: 8, padding: "2px 8px", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", animation: "pulse 2s infinite" }}>🔴 {liveNow} {isHe ? "עכשיו" : "now"}</span>}
              {isHot && <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10, background: "rgba(255,215,0,.07)", color: "#FFD700", border: "1px solid rgba(255,215,0,.15)", fontWeight: 700 }}>⭐ {isHe ? "מבוקש" : "Hot"}</span>}
              <span style={{ marginInlineStart: "auto", color: "rgba(255,255,255,.35)", fontSize: 10, background: "rgba(0,0,0,.4)", borderRadius: 8, padding: "2px 8px", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>{ci + 1}/{vs.length}</span>
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

      {/* ── GLASS HEADER OVERLAY ── */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, maxWidth: 480, margin: "0 auto", pointerEvents: "none", background: "linear-gradient(to bottom, rgba(0,0,0,.82) 0%, rgba(0,0,0,.55) 55%, transparent 100%)" }}>
        {/* Row 1: vendor btn + logo + login/profile */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 8px", pointerEvents: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => { setLoginMode("vendor"); setShowLogin(true); }}
              style={{ padding: "8px 16px", borderRadius: 22, background: "rgba(255,255,255,.12)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", border: "1px solid rgba(255,255,255,.22)", color: "#fff", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.18)", letterSpacing: 0.2, transition: "all .12s" }}>
              {t.vendor}
            </button>
            <LangToggle />
          </div>

          <button onClick={() => setShowTogether(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <Logo sz={20} />
          </button>

          {user
            ? <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,206,209,.15)", border: "1.5px solid rgba(0,206,209,.35)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(0,206,209,.2)" }}>
                <span style={{ fontSize: 14 }}>👤</span>
              </div>
            : <button onClick={() => { setLoginMode("owner"); setShowLogin(true); }}
                style={{ padding: "8px 16px", borderRadius: 22, background: "linear-gradient(160deg,#00e5e8 0%,#00CED1 55%,#009eb0 100%)", border: "1px solid rgba(0,255,255,.35)", color: "#000", fontSize: 11, fontWeight: 900, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(0,206,209,.5), inset 0 1px 0 rgba(255,255,255,.3)", letterSpacing: 0.2, transition: "all .12s" }}>
                {t.login}
              </button>
          }
        </div>

        {/* Row 2: Category chips + filter + hot buttons */}
        <div style={{ display: "flex", gap: 7, padding: "0 12px 14px", overflowX: "auto", direction: "ltr", pointerEvents: "auto" }} className="hide-scrollbar">
          {CATS.map((c) => {
            const active = activeCat === c.k;
            return (
              <button key={c.k} onClick={() => { setActiveCat(c.k); setCi(0); setImgIdx(0); setActiveSub(null); }}
                style={{ flexShrink: 0, padding: "8px 18px", borderRadius: 24, border: active ? "1.5px solid rgba(0,229,232,.65)" : "1.5px solid rgba(255,255,255,.15)", background: active ? "linear-gradient(160deg,rgba(0,229,232,.22) 0%,rgba(0,206,209,.13) 100%)" : "rgba(255,255,255,.09)", backdropFilter: "blur(20px) saturate(160%)", WebkitBackdropFilter: "blur(20px) saturate(160%)", cursor: "pointer", color: active ? "#00e5e8" : "rgba(255,255,255,.78)", fontSize: 12, fontWeight: active ? 800 : 700, fontFamily: "inherit", transition: "all .15s", boxShadow: active ? "0 4px 16px rgba(0,206,209,.3), inset 0 1px 0 rgba(0,255,255,.2)" : "0 2px 10px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.1)", letterSpacing: active ? 0.1 : 0 }}>
                {isHe ? c.he : c.en}
              </button>
            );
          })}

          {/* Divider */}
          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,.1)", alignSelf: "center", flexShrink: 0 }} />

          {/* Filter button */}
          <button onClick={() => setShowFilters(true)}
            style={{ flexShrink: 0, width: 38, height: 38, borderRadius: "50%", background: hasActiveFilters ? "rgba(0,206,209,.18)" : "rgba(255,255,255,.09)", border: hasActiveFilters ? "1.5px solid rgba(0,229,232,.6)" : "1.5px solid rgba(255,255,255,.15)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", cursor: "pointer", color: hasActiveFilters ? "#00e5e8" : "rgba(255,255,255,.7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: hasActiveFilters ? "0 3px 14px rgba(0,206,209,.3), inset 0 1px 0 rgba(0,255,255,.15)" : "0 2px 10px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.1)", transition: "all .12s", position: "relative" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>tune</span>
            {hasActiveFilters && <div style={{ position: "absolute", top: 5, right: 5, width: 7, height: 7, borderRadius: "50%", background: "#00e5e8", boxShadow: "0 0 6px rgba(0,229,232,.8)" }} />}
          </button>

          {/* Hot button */}
          <button onClick={() => setShowHotSheet(true)}
            style={{ flexShrink: 0, width: 38, height: 38, borderRadius: "50%", background: "rgba(255,68,68,.12)", border: "1.5px solid rgba(255,68,68,.3)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 12px rgba(255,68,68,.2), inset 0 1px 0 rgba(255,255,255,.08)", transition: "all .12s", fontSize: 17 }}>
            🔥
          </button>
        </div>
      </header>

      {/* ── FILTER DRAWER ── */}
      {showFilters && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,.65)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }} onClick={() => setShowFilters(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", bottom: 62, left: 0, right: 0, maxWidth: 480, margin: "0 auto", background: "rgba(14,14,14,.98)", borderRadius: "22px 22px 0 0", padding: "18px 18px 32px", border: "1px solid rgba(255,255,255,.08)", borderBottom: "none", boxShadow: "0 -12px 50px rgba(0,0,0,.7)", animation: "slideUp .3s ease" }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,.1)", margin: "0 auto 20px" }} />

            {subs.length > 0 && (
              <>
                <p style={{ color: "rgba(255,255,255,.35)", fontSize: 10, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1.2 }}>{isHe ? "סוג" : "Type"}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                  {subs.map((s) => {
                    const active = activeSub === s.he;
                    return (
                      <button key={s.he} onClick={() => setActiveSub(active ? null : s.he)}
                        style={{ padding: "7px 16px", borderRadius: 20, border: active ? "1.5px solid rgba(0,229,232,.6)" : "1.5px solid rgba(255,255,255,.1)", background: active ? "rgba(0,206,209,.16)" : "rgba(255,255,255,.05)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", cursor: "pointer", color: active ? "#00e5e8" : "rgba(255,255,255,.6)", fontSize: 12, fontWeight: active ? 700 : 500, fontFamily: "inherit", transition: "all .12s", boxShadow: active ? "0 3px 12px rgba(0,206,209,.25), inset 0 1px 0 rgba(0,255,255,.15)" : "0 1px 6px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.06)" }}>
                        {isHe ? s.he : s.en}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <p style={{ color: "rgba(255,255,255,.35)", fontSize: 10, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1.2 }}>{isHe ? "אזור" : "Area"}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {AREAS.map((a) => (
                <button key={a} onClick={() => { setAreaFilter(a); setCi(0); }}
                  style={{ padding: "7px 16px", borderRadius: 20, border: areaFilter === a ? "1.5px solid rgba(0,229,232,.6)" : "1.5px solid rgba(255,255,255,.1)", background: areaFilter === a ? "rgba(0,206,209,.16)" : "rgba(255,255,255,.05)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", color: areaFilter === a ? "#00e5e8" : "rgba(255,255,255,.6)", fontSize: 12, fontWeight: areaFilter === a ? 700 : 500, cursor: "pointer", fontFamily: "inherit", transition: "all .12s", boxShadow: areaFilter === a ? "0 3px 12px rgba(0,206,209,.25), inset 0 1px 0 rgba(0,255,255,.15)" : "0 1px 6px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.06)" }}>
                  {t[a]}
                </button>
              ))}
            </div>

            <p style={{ color: "rgba(255,255,255,.35)", fontSize: 10, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1.2 }}>{isHe ? "תאריך" : "Date"}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: selectedDate ? "#00CED1" : "rgba(255,255,255,.2)" }}>calendar_month</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); setCi(0); }}
                style={{ flex: 1, background: selectedDate ? "rgba(0,206,209,.06)" : "rgba(255,255,255,.03)", border: `1px solid ${selectedDate ? "rgba(0,206,209,.35)" : "rgba(255,255,255,.08)"}`, borderRadius: 12, padding: "9px 14px", color: selectedDate ? "#00CED1" : "rgba(255,255,255,.3)", fontSize: 13, fontFamily: "inherit", outline: "none", backdropFilter: "blur(8px)" }}
              />
              {selectedDate && (
                <button onClick={() => { setSelectedDate(""); setCi(0); }}
                  style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", borderRadius: "50%", color: "rgba(255,255,255,.5)", fontSize: 12, cursor: "pointer", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <B v="accent" style={{ flex: 1 }} onClick={() => { setShowFilters(false); setShowTogether(true); }}>
                💑 {isHe ? "יחד" : "Together"}
              </B>
              <B v="ghost" style={{ flex: 1 }} onClick={() => setShowFilters(false)}>
                {isHe ? "סגור" : "Close"}
              </B>
            </div>
          </div>
        </div>
      )}

      {/* ── HOT TRENDING SHEET ── */}
      {showHotSheet && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,.75)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }} onClick={() => setShowHotSheet(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", bottom: 62, left: 0, right: 0, maxWidth: 480, margin: "0 auto", background: "rgba(10,10,10,.98)", borderRadius: "22px 22px 0 0", paddingTop: 18, border: "1px solid rgba(255,255,255,.07)", borderBottom: "none", boxShadow: "0 -12px 50px rgba(0,0,0,.7)", animation: "slideUp .3s ease", maxHeight: "72dvh", overflowY: "auto" }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,.1)", margin: "0 auto 4px" }} />
            <HotStrip onSelect={(v) => { setHotView(v); setShowHotSheet(false); }} />
          </div>
        </div>
      )}

      {/* Legal footer */}
      <div style={{ position: "fixed", bottom: 62, left: 0, right: 0, maxWidth: 480, margin: "0 auto", display: "flex", justifyContent: "center", gap: 16, padding: "3px 0", zIndex: 50 }}>
        {[["terms", isHe ? "תנאי שימוש" : "Terms"], ["privacy", isHe ? "פרטיות" : "Privacy"], ["vendor-terms", isHe ? "ספקים" : "Vendors"]].map(([k, l]) => (
          <Link key={k} href={`/legal/${k}`} style={{ color: "#1a1a1a", fontSize: 9, textDecoration: "none" }}>{l}</Link>
        ))}
      </div>

      <Nav />

      {/* ── Match overlay ── */}
      {matchVendor && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.92)", backdropFilter: "blur(20px)", zIndex: 350, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setMatchVendor(null)}>
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
