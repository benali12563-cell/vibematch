"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { T, CATS, AREAS, DV, EVENT_TYPES } from "@/lib/constants";
import type { Vendor, CatKey } from "@/types";
import SwipeCardView from "./SwipeCardView";
import Nav from "./Nav";
import Logo from "./Logo";
import LangToggle from "./LangToggle";
import HotStrip from "./HotStrip";
import ConfettiEffect from "./ConfettiEffect";
import SwipeTogetherModal from "./SwipeTogetherModal";
import VendorCard from "./VendorCard";
import AuroraBg from "./AuroraBg";
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
  const { lang, activeCat, setActiveCat, areaFilter, setAreaFilter, likes, setLikes, user, setUser, showToast, vendorAvailability, selectedDate, setSelectedDate, publishedVendors } = useApp();
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
  const [showHotSheet, setShowHotSheet] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [dbVendors, setDbVendors] = useState<Vendor[]>([]);
  const [swipeX, setSwipeX] = useState(0);
  const [sortBy, setSortBy] = useState<"default" | "rating" | "price_asc" | "price_desc">("default");
  const [eventTypeFilter, setEventTypeFilter] = useState<string | null>(null);

  // Refs for gesture + shine
  const cardWrapRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startY: 0, x: 0, y: 0 });

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

  function doLike(gestured = false) {
    if (!cur) return;
    if (!gestured) { setLikeAnim(true); setCardAnim("like"); }
    setTimeout(() => { setLikeAnim(false); if (!gestured) setCardAnim(null); }, 500);
    setLikes((p) => (p.includes(cur.name) ? p : [...p, cur.name]));
    const nc = likeCount + 1;
    setLikeCount(nc);
    const isMatch = Math.random() < 0.2 || nc % 5 === 0;
    if (isMatch) {
      setTimeout(() => { setMatchVendor(cur); setConfetti(true); setTimeout(() => setConfetti(false), 100); }, gestured ? 120 : 450);
    } else {
      showToast("❤️ " + cur.name);
    }
    if (nc === 3) setTimeout(() => setShowTogether(true), 600);
    if (gestured) {
      setTimeout(() => {
        if (cardWrapRef.current) { cardWrapRef.current.style.transition = ""; cardWrapRef.current.style.transform = ""; }
        setSwipeX(0); next();
      }, 300);
    } else {
      setTimeout(next, 400);
    }
  }

  function doNope(gestured = false) {
    if (!cur) return;
    if (!gestured) { setNopeAnim(true); setCardAnim("nope"); }
    if (gestured) {
      setTimeout(() => {
        if (cardWrapRef.current) { cardWrapRef.current.style.transition = ""; cardWrapRef.current.style.transform = ""; }
        setSwipeX(0); next();
      }, 300);
    } else {
      setTimeout(() => { setNopeAnim(false); setCardAnim(null); next(); }, 420);
    }
  }

  // ── Gesture handlers ──
  function onCardTouchStart(e: React.TouchEvent) {
    if (e.touches.length !== 1) return;
    drag.current = { active: true, startX: e.touches[0].clientX, startY: e.touches[0].clientY, x: 0, y: 0 };
  }

  function onCardTouchMove(e: React.TouchEvent) {
    if (!drag.current.active || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - drag.current.startX;
    const dy = e.touches[0].clientY - drag.current.startY;
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
    drag.current.x = dx; drag.current.y = dy;

    const card = cardWrapRef.current;
    if (card) {
      const rot = dx * 0.055;
      const tiltY = dx * 0.018;
      card.style.transition = "none";
      card.style.transform = `translateX(${dx}px) translateY(${dy * 0.04}px) rotate(${rot}deg) perspective(900px) rotateY(${tiltY}deg)`;
    }
    // Moving specular shine
    if (shineRef.current && cardWrapRef.current) {
      const rect = cardWrapRef.current.getBoundingClientRect();
      const sx = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
      const sy = ((e.touches[0].clientY - rect.top) / rect.height) * 100;
      shineRef.current.style.opacity = "1";
      shineRef.current.style.background = `radial-gradient(circle at ${sx}% ${sy}%, rgba(255,255,255,.14) 0%, transparent 58%)`;
    }
    setSwipeX(dx);
  }

  function onCardTouchEnd() {
    if (!drag.current.active) return;
    drag.current.active = false;
    const dx = drag.current.x;
    if (shineRef.current) shineRef.current.style.opacity = "0";

    if (Math.abs(dx) > 90) {
      const card = cardWrapRef.current;
      if (card) {
        const tx = dx > 0 ? "135vw" : "-135vw";
        const rot = dx > 0 ? 26 : -26;
        card.style.transition = "transform .28s cubic-bezier(.4,0,1,1)";
        card.style.transform = `translateX(${tx}) rotate(${rot}deg)`;
      }
      setSwipeX(0);
      if (dx > 0) doLike(true); else doNope(true);
    } else {
      if (cardWrapRef.current) {
        cardWrapRef.current.style.transition = "transform .45s cubic-bezier(.23,1,.32,1)";
        cardWrapRef.current.style.transform = "";
      }
      setSwipeX(0);
    }
  }

  function parsePriceNum(p: string) { const m = p.replace(/,/g, "").match(/\d+/); return m ? parseInt(m[0]) : 0; }
  if (sortBy === "rating") vs.sort((a, b) => b.rating - a.rating);
  else if (sortBy === "price_asc") vs.sort((a, b) => parsePriceNum(a.price) - parsePriceNum(b.price));
  else if (sortBy === "price_desc") vs.sort((a, b) => parsePriceNum(b.price) - parsePriceNum(a.price));

  const subs = SUB[activeCat] ?? [];
  const activeFilterCount = (areaFilter !== "allAreas" ? 1 : 0) + (selectedDate ? 1 : 0) + (activeSub ? 1 : 0) + (sortBy !== "default" ? 1 : 0) + (eventTypeFilter ? 1 : 0);
  const activeCatLabel = CATS.find((c) => c.k === activeCat);

  const CAT_ICONS: Record<string, string> = { venues: "🏛️", food: "🍽️", music: "🎵", lighting: "💡", photo: "📸", beauty: "💄", entertainment: "🎪", design: "🎨", logistics: "🚌", ceremony: "💒", digital: "📱" };

  return (
    <div style={{ height: "100dvh", overflow: "hidden", background: "#000", fontFamily: isHe ? "'Heebo'" : "'Manrope','Heebo'", direction: isHe ? "rtl" : "ltr" }}>
      <AuroraBg />
      <ConfettiEffect trigger={confetti} />

      {/* ── FULL-SCREEN CARD ── */}
      <div style={{ position: "fixed", top: 0, bottom: 62, left: 0, right: 0, maxWidth: 480, margin: "0 auto" }}>
        {cur ? (
          <>
            <div
              ref={cardWrapRef}
              onTouchStart={onCardTouchStart}
              onTouchMove={onCardTouchMove}
              onTouchEnd={onCardTouchEnd}
              style={{
                position: "absolute", inset: 0,
                animation: cardAnim === "like" ? "swipeRight .45s ease forwards" : cardAnim === "nope" ? "swipeLeft .45s ease forwards" : undefined,
                willChange: "transform",
              }}
            >
              {/* Holographic ring border */}
              <div className="holo-ring" style={{ opacity: Math.min(.45, Math.abs(swipeX) / 200 + .12) }} />

              {/* Moving specular shine */}
              <div ref={shineRef} style={{ position: "absolute", inset: 0, zIndex: 8, borderRadius: 20, opacity: 0, pointerEvents: "none", transition: "opacity .2s" }} />

              {/* LIKE stamp */}
              {swipeX > 28 && (
                <div style={{ position: "absolute", top: 52, left: 22, zIndex: 10, opacity: Math.min(1, swipeX / 90), pointerEvents: "none" }}>
                  <div className="stamp-like">LIKE ♥</div>
                </div>
              )}
              {/* NOPE stamp */}
              {swipeX < -28 && (
                <div style={{ position: "absolute", top: 52, right: 22, zIndex: 10, opacity: Math.min(1, -swipeX / 90), pointerEvents: "none" }}>
                  <div className="stamp-nope">NOPE ✕</div>
                </div>
              )}

              <SwipeCardView vendor={cur} imgIdx={imgIdx} setImgIdx={setImgIdx}
                actions={
                  <div style={{ display: "flex", justifyContent: "center", gap: 28 }}>
                    {/* Nope */}
                    <button onClick={() => doNope()} style={{ width: 68, height: 68, borderRadius: "50%", background: nopeAnim ? "rgba(255,68,68,.3)" : "rgba(20,0,0,.65)", border: "2px solid rgba(255,68,68,.5)", color: "#FF5555", fontSize: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", transition: "all .12s", animation: nopeAnim ? "nopeFlash .4s" : undefined, boxShadow: "0 4px 20px rgba(255,68,68,.25), inset 0 1px 0 rgba(255,255,255,.1)" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 30, fontVariationSettings: "'FILL' 0" }}>close</span>
                    </button>
                    {/* Like */}
                    <button onClick={() => doLike()} style={{ width: 68, height: 68, borderRadius: "50%", background: likeAnim ? "linear-gradient(160deg,#00e5e8,#00CED1)" : likes.includes(cur.name) ? "linear-gradient(160deg,rgba(0,229,232,.25),rgba(0,206,209,.15))" : "rgba(0,20,20,.65)", border: `2px solid ${likes.includes(cur.name) ? "rgba(0,229,232,.7)" : "rgba(0,206,209,.45)"}`, color: likeAnim ? "#000" : "#00e5e8", fontSize: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", transition: "all .12s", animation: likeAnim ? "likeFlash .45s" : undefined, boxShadow: likes.includes(cur.name) ? "0 4px 20px rgba(0,206,209,.4), inset 0 1px 0 rgba(255,255,255,.15)" : "0 4px 20px rgba(0,206,209,.2), inset 0 1px 0 rgba(255,255,255,.08)" }}>
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
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, maxWidth: 480, margin: "0 auto", pointerEvents: "none", background: "linear-gradient(to bottom, rgba(0,0,0,.85) 0%, rgba(0,0,0,.5) 60%, transparent 100%)" }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", padding: "14px 14px 14px", pointerEvents: "auto" }}>

          {/* Left: sidebar trigger + lang */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setShowSidebar(true)} style={{ position: "relative", width: 38, height: 38, borderRadius: 12, background: activeFilterCount > 0 ? "rgba(0,206,209,.18)" : "rgba(255,255,255,.1)", border: activeFilterCount > 0 ? "1.5px solid rgba(0,229,232,.5)" : "1.5px solid rgba(255,255,255,.18)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, boxShadow: activeFilterCount > 0 ? "0 4px 16px rgba(0,206,209,.3), inset 0 1px 0 rgba(0,255,255,.15)" : "0 2px 10px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.1)", transition: "all .15s" }}>
              {[0,1,2].map((i) => (
                <div key={i} style={{ width: i === 1 ? 14 : 18, height: 1.5, borderRadius: 2, background: activeFilterCount > 0 ? "#00e5e8" : "rgba(255,255,255,.7)", transition: "all .2s" }} />
              ))}
              {activeFilterCount > 0 && <div style={{ position: "absolute", top: 5, right: 5, width: 14, height: 14, borderRadius: "50%", background: "#00CED1", color: "#000", fontSize: 8, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 8px rgba(0,206,209,.8)" }}>{activeFilterCount}</div>}
            </button>
            <LangToggle />
          </div>

          {/* Center: logo + active cat label */}
          <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <button onClick={() => setShowTogether(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <Logo sz={20} />
            </button>
            <span style={{ color: "rgba(0,229,232,.7)", fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>
              {CAT_ICONS[activeCat]} {isHe ? activeCatLabel?.he : activeCatLabel?.en}
            </span>
          </div>

          {/* Right: hot + profile */}
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
            <button onClick={() => setShowHotSheet(true)} style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,68,68,.12)", border: "1px solid rgba(255,68,68,.3)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 2px 10px rgba(255,68,68,.2)" }}>🔥</button>
            <button onClick={() => router.push("/profile")} style={{ width: 34, height: 34, borderRadius: 10, background: user ? "rgba(0,206,209,.15)" : "rgba(255,255,255,.1)", border: user ? "1.5px solid rgba(0,206,209,.4)" : "1.5px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 15, boxShadow: user ? "0 2px 10px rgba(0,206,209,.2)" : "none" }}>
              {user ? "👤" : "🙂"}
            </button>
          </div>
        </div>
      </header>

      {/* ── SIDE PANEL BACKDROP ── */}
      <div onClick={() => setShowSidebar(false)} style={{ position: "fixed", inset: 0, zIndex: 380, background: "rgba(0,0,0,.72)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", opacity: showSidebar ? 1 : 0, pointerEvents: showSidebar ? "auto" : "none", transition: "opacity .3s" }} />

      {/* ── SIDE PANEL ── */}
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 390, width: "min(90%, 380px)", background: "rgba(7,7,10,.97)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", borderLeft: "1px solid rgba(255,255,255,.07)", transform: showSidebar ? "translateX(0)" : "translateX(100%)", transition: "transform .32s cubic-bezier(.32,0,.67,0)", overflowY: "auto", direction: isHe ? "rtl" : "ltr" }}>

        {/* Panel header */}
        <div style={{ position: "sticky", top: 0, background: "rgba(7,7,10,.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,.06)", padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 1 }}>
          <h2 style={{ color: "#fff", fontSize: 15, fontWeight: 800, margin: 0 }}>{isHe ? "חיפוש מתקדם" : "Advanced Search"}</h2>
          <button onClick={() => setShowSidebar(false)} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.6)", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <div style={{ padding: "20px 18px 100px" }}>

          {/* ── 1. CATEGORIES ── */}
          <p style={{ color: "rgba(255,255,255,.3)", fontSize: 10, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 12 }}>{isHe ? "קטגוריה" : "Category"}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 24 }}>
            {CATS.map((c) => {
              const active = activeCat === c.k;
              return (
                <button key={c.k} onClick={() => { setActiveCat(c.k); setCi(0); setImgIdx(0); setActiveSub(null); }}
                  style={{ padding: "10px 6px", borderRadius: 14, border: active ? "1.5px solid rgba(0,229,232,.65)" : "1px solid rgba(255,255,255,.08)", background: active ? "linear-gradient(160deg,rgba(0,229,232,.18),rgba(0,206,209,.1))" : "rgba(255,255,255,.04)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, transition: "all .15s", boxShadow: active ? "0 4px 16px rgba(0,206,209,.25), inset 0 1px 0 rgba(0,255,255,.15)" : "none", fontFamily: "inherit" }}>
                  <span style={{ fontSize: 22 }}>{CAT_ICONS[c.k]}</span>
                  <span style={{ color: active ? "#00e5e8" : "rgba(255,255,255,.6)", fontSize: 10, fontWeight: active ? 800 : 500, textAlign: "center", lineHeight: 1.2 }}>{isHe ? c.he : c.en}</span>
                </button>
              );
            })}
          </div>

          {/* ── 2. SUB-TYPES ── */}
          {subs.length > 0 && (
            <>
              <p style={{ color: "rgba(255,255,255,.3)", fontSize: 10, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 10 }}>{isHe ? "סוג ספציפי" : "Specific Type"}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 24 }}>
                {subs.map((s) => {
                  const a = activeSub === s.he;
                  return (
                    <button key={s.he} onClick={() => setActiveSub(a ? null : s.he)}
                      style={{ padding: "7px 14px", borderRadius: 20, border: a ? "1.5px solid rgba(0,229,232,.6)" : "1px solid rgba(255,255,255,.1)", background: a ? "rgba(0,206,209,.15)" : "rgba(255,255,255,.04)", cursor: "pointer", color: a ? "#00e5e8" : "rgba(255,255,255,.55)", fontSize: 12, fontWeight: a ? 700 : 500, fontFamily: "inherit", transition: "all .12s" }}>
                      {isHe ? s.he : s.en}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── 3. AREA ── */}
          <p style={{ color: "rgba(255,255,255,.3)", fontSize: 10, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 10 }}>{isHe ? "אזור" : "Area"}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 24 }}>
            {AREAS.map((a) => {
              const active = areaFilter === a;
              return (
                <button key={a} onClick={() => { setAreaFilter(a); setCi(0); }}
                  style={{ padding: "8px 16px", borderRadius: 20, border: active ? "1.5px solid rgba(0,229,232,.6)" : "1px solid rgba(255,255,255,.1)", background: active ? "rgba(0,206,209,.15)" : "rgba(255,255,255,.04)", cursor: "pointer", color: active ? "#00e5e8" : "rgba(255,255,255,.55)", fontSize: 12, fontWeight: active ? 700 : 500, fontFamily: "inherit", transition: "all .12s" }}>
                  {t[a]}
                </button>
              );
            })}
          </div>

          {/* ── 4. DATE ── */}
          <p style={{ color: "rgba(255,255,255,.3)", fontSize: 10, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 10 }}>{isHe ? "תאריך האירוע" : "Event Date"}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: selectedDate ? "#00CED1" : "rgba(255,255,255,.2)" }}>calendar_month</span>
            <input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setCi(0); }}
              style={{ flex: 1, background: selectedDate ? "rgba(0,206,209,.06)" : "rgba(255,255,255,.03)", border: `1px solid ${selectedDate ? "rgba(0,206,209,.35)" : "rgba(255,255,255,.08)"}`, borderRadius: 12, padding: "10px 14px", color: selectedDate ? "#00CED1" : "rgba(255,255,255,.3)", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
            {selectedDate && <button onClick={() => { setSelectedDate(""); setCi(0); }} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,.07)", border: "none", color: "rgba(255,255,255,.5)", cursor: "pointer", fontSize: 13 }}>✕</button>}
          </div>

          {/* ── 5. EVENT TYPE ── */}
          <p style={{ color: "rgba(255,255,255,.3)", fontSize: 10, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 10 }}>{isHe ? "סוג האירוע" : "Event Type"}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 24 }}>
            {EVENT_TYPES.map((e) => {
              const active = eventTypeFilter === e.k;
              return (
                <button key={e.k} onClick={() => setEventTypeFilter(active ? null : e.k)}
                  style={{ padding: "10px 12px", borderRadius: 14, border: active ? "1.5px solid rgba(0,229,232,.6)" : "1px solid rgba(255,255,255,.08)", background: active ? "rgba(0,206,209,.12)" : "rgba(255,255,255,.03)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all .12s", fontFamily: "inherit" }}>
                  <span style={{ fontSize: 18 }}>{e.emoji}</span>
                  <span style={{ color: active ? "#00e5e8" : "rgba(255,255,255,.6)", fontSize: 12, fontWeight: active ? 700 : 500 }}>{e.he}</span>
                </button>
              );
            })}
          </div>

          {/* ── 6. SORT ── */}
          <p style={{ color: "rgba(255,255,255,.3)", fontSize: 10, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 10 }}>{isHe ? "מיון" : "Sort By"}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 28 }}>
            {[
              { k: "default" as const, label: isHe ? "🎯 מומלץ" : "🎯 Recommended" },
              { k: "rating" as const, label: isHe ? "⭐ דירוג" : "⭐ Rating" },
              { k: "price_asc" as const, label: isHe ? "💰 מחיר ↑" : "💰 Price ↑" },
              { k: "price_desc" as const, label: isHe ? "💎 מחיר ↓" : "💎 Price ↓" },
            ].map((s) => {
              const active = sortBy === s.k;
              return (
                <button key={s.k} onClick={() => setSortBy(s.k)}
                  style={{ padding: "10px 14px", borderRadius: 14, border: active ? "1.5px solid rgba(0,229,232,.6)" : "1px solid rgba(255,255,255,.08)", background: active ? "rgba(0,206,209,.12)" : "rgba(255,255,255,.03)", cursor: "pointer", color: active ? "#00e5e8" : "rgba(255,255,255,.55)", fontSize: 12, fontWeight: active ? 800 : 500, fontFamily: "inherit", transition: "all .12s", textAlign: "center" }}>
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* ── CTAs ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => { setCi(0); setShowSidebar(false); }}
              style={{ width: "100%", padding: "15px 0", borderRadius: 16, border: "none", background: "linear-gradient(160deg,#00e5e8,#00b8ba)", color: "#000", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 24px rgba(0,206,209,.35)" }}>
              {isHe ? `הצג תוצאות (${vs.length})` : `Show Results (${vs.length})`}
            </button>
            <button onClick={() => { setAreaFilter("allAreas"); setSelectedDate(""); setActiveSub(null); setSortBy("default"); setEventTypeFilter(null); setCi(0); }}
              style={{ width: "100%", padding: "12px 0", borderRadius: 14, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)", color: "rgba(255,255,255,.5)", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              {isHe ? "אפס הכל" : "Reset All"}
            </button>
            <button onClick={() => { setShowSidebar(false); setShowTogether(true); }}
              style={{ width: "100%", padding: "12px 0", borderRadius: 14, border: "1px solid rgba(0,206,209,.2)", background: "rgba(0,206,209,.06)", color: "#00CED1", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              💑 {isHe ? "חפשו יחד" : "Search Together"}
            </button>
          </div>
        </div>
      </div>

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
    </div>
  );
}
