"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { T, CATS, AREAS, DV, EVENT_TYPES, SITE_URL } from "@/lib/constants";
import type { Vendor, CatKey } from "@/types";
import SwipeCardView from "./SwipeCardView";
import Nav from "./Nav";
import Logo from "./Logo";
import LangToggle from "./LangToggle";
import HotStrip from "./HotStrip";
import SwipeTogetherModal from "./SwipeTogetherModal";
import VendorCard from "./VendorCard";
import AuroraBg from "./AuroraBg";
import B from "./B";
import { loadPublishedVendors, trackVendorLike, makeSlug } from "@/lib/supabase/vendors";
import LeadChatModal, { VideoModal } from "./LeadChatModal";
import PackageModal from "./PackageModal";

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


export default function SwipeHome() {
  const { lang, activeCat, setActiveCat, areaFilter, setAreaFilter, likes, setLikes, user, setUser, showToast, vendorAvailability, selectedDate, setSelectedDate, publishedVendors, chatThreads, eventInfo, onboardingDone } = useApp();
  const t = T[lang];
  const router = useRouter();
  const isHe = lang === "he";

  const [photoIdxMap, setPhotoIdxMap] = useState<Record<string, number>>({});
  const [showTogether, setShowTogether] = useState(false);
  const [hotView, setHotView] = useState<Vendor | null>(null);
  const [likedName, setLikedName] = useState<string | null>(null);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [showHotSheet, setShowHotSheet] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [dbVendors, setDbVendors] = useState<Vendor[]>([]);
  const [sortBy, setSortBy] = useState<"default" | "rating" | "price_asc" | "price_desc">("default");
  const [eventTypeFilter, setEventTypeFilter] = useState<string | null>(null);
  const [ceremonyFilter, setCeremonyFilter] = useState<string | null>(null);
  const [dealsOnly, setDealsOnly] = useState(false);
  const [infoVendor, setInfoVendor] = useState<Vendor | null>(null);
  const [leadVendor, setLeadVendor] = useState<Vendor | null>(null);
  const [videoVendor, setVideoVendor] = useState<Vendor | null>(null);
  const [showPackage, setShowPackage] = useState(false);

  // Load live published vendors from Supabase once on mount
  useEffect(() => {
    loadPublishedVendors().then(setDbVendors).catch(() => {});
  }, []);

  // Apply onboarding event type to filter (only on first mount, only if not already set)
  useEffect(() => {
    if (onboardingDone && eventInfo.type && !eventTypeFilter) {
      setEventTypeFilter(eventInfo.type);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Merge: DV hardcoded + context (just published) + Supabase DB
  // Deduplicate by name so a vendor who just published doesn't appear twice
  const seenNames = new Set<string>();
  const liveVendors: Vendor[] = [];
  for (const v of [
    ...(activeCat === "all" ? publishedVendors : publishedVendors.filter((v) => v.catKey === activeCat)),
    ...(activeCat === "all" ? dbVendors : dbVendors.filter((v) => v.catKey === activeCat)),
  ]) {
    if (!seenNames.has(v.name)) { seenNames.add(v.name); liveVendors.push(v); }
  }
  const dvVendors = activeCat === "all"
    ? Object.values(DV).flat()
    : (DV[activeCat] ?? []);
  const rawVs = [...dvVendors, ...liveVendors];
  const areaFiltered = areaFilter === "allAreas" ? rawVs : rawVs.filter((v) => v.area === areaFilter);
  const dateFiltered = selectedDate
    ? areaFiltered.filter((v) => !(vendorAvailability[v.name] ?? []).includes(selectedDate))
    : areaFiltered;
  // QA-004/QA-009: vendors with no ceremonyType set serve all ceremony types — keep them visible.
  // Only hide vendors that explicitly declare a DIFFERENT ceremonyType.
  const ceremonyFiltered = ceremonyFilter
    ? dateFiltered.filter((v) => !v.niche?.ceremonyType || v.niche.ceremonyType === ceremonyFilter)
    : dateFiltered;
  // Sub-category: partial match so "אולמות" hits "אולמות אירועים", "DJ" hits "DJ", etc.
  const subFiltered = activeSub
    ? ceremonyFiltered.filter((v) => v.sub.toLowerCase().includes(activeSub.toLowerCase()))
    : ceremonyFiltered;
  // Event type: vendors with no eventType declared are shown for all event types.
  const eventFiltered = eventTypeFilter
    ? subFiltered.filter((v) => !v.eventType || v.eventType === eventTypeFilter)
    : subFiltered;
  const vsBase = dealsOnly ? eventFiltered.filter((v) => v.deal !== null) : eventFiltered;
  // Copy before sorting to avoid mutating the reactive array.
  const vs = sortBy !== "default" ? [...vsBase] : vsBase;
  function setPhotoIdx(name: string, fn: (i: number) => number) {
    setPhotoIdxMap((m) => ({ ...m, [name]: fn(m[name] ?? 0) }));
  }

  function doLike(v: Vendor) {
    if (likes.includes(v.name)) return;
    setLikes((p) => [...p, v.name]);
    setLikedName(v.name);
    setTimeout(() => setLikedName(null), 600);
    showToast("❤️ " + v.name + (isHe ? " נשמר" : " saved"));
    // Track like in Supabase (fire-and-forget)
    const slug = makeSlug(v.name);
    if (slug) void trackVendorLike(slug);
  }

  function parsePriceNum(p: string) { const m = p.replace(/,/g, "").match(/\d+/); return m ? parseInt(m[0]) : 0; }
  if (sortBy === "rating") vs.sort((a, b) => b.rating - a.rating);
  else if (sortBy === "price_asc") vs.sort((a, b) => parsePriceNum(a.price) - parsePriceNum(b.price));
  else if (sortBy === "price_desc") vs.sort((a, b) => parsePriceNum(b.price) - parsePriceNum(a.price));
  // (sorting is safe — vs is a fresh copy when sortBy !== "default")

  const subs = activeCat === "all" ? [] : (SUB[activeCat] ?? []);
  const activeFilterCount = (areaFilter !== "allAreas" ? 1 : 0) + (selectedDate ? 1 : 0) + (activeSub ? 1 : 0) + (sortBy !== "default" ? 1 : 0) + (eventTypeFilter ? 1 : 0) + (ceremonyFilter ? 1 : 0) + (dealsOnly ? 1 : 0);
  const activeCatLabel = activeCat === "all" ? { he: "הכל", en: "All" } : CATS.find((c) => c.k === activeCat);

  const CAT_ICONS: Record<string, string> = { all: "✨", venues: "🏛️", food: "🍽️", music: "🎵", lighting: "💡", photo: "📸", beauty: "💄", entertainment: "🎪", design: "🎨", logistics: "🚌", ceremony: "💒", digital: "📱" };

  return (
    <div style={{ height: "100dvh", overflow: "hidden", background: "#000", fontFamily: isHe ? "'Heebo'" : "'Manrope','Heebo'", direction: isHe ? "rtl" : "ltr" }}>
      <AuroraBg />


      {/* ── INSTAGRAM SCROLL FEED ── */}
      <div style={{ position: "fixed", top: 0, bottom: 62, left: 0, right: 0, maxWidth: 480, margin: "0 auto", overflowY: "scroll", scrollSnapType: "y mandatory", scrollbarWidth: "none" }}>
        {vs.length > 0 ? vs.map((v) => {
          const imgIdx = photoIdxMap[v.name] ?? 0;
          const isHot = v.rating >= 4.7;
          const isLiked = likes.includes(v.name);
          const isLikeAnim = likedName === v.name;

          return (
            <div key={v.name} style={{ height: "100%", scrollSnapAlign: "start", position: "relative", flexShrink: 0 }}>
              <SwipeCardView vendor={v} imgIdx={imgIdx} setImgIdx={(fn) => setPhotoIdx(v.name, fn)} actions={null} />

              {/* Availability badge */}
              {selectedDate && (
                <div style={{ position: "absolute", top: 52, [isHe ? "right" : "left"]: 14, zIndex: 7, pointerEvents: "none" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 10, background: "rgba(0,200,100,.18)", border: "1px solid rgba(0,200,100,.4)", color: "#00e87a", fontSize: 10, fontWeight: 700, backdropFilter: "blur(8px)" }}>
                    ✅ {isHe ? `פנוי ${selectedDate}` : `Free ${selectedDate}`}
                  </span>
                </div>
              )}

              {/* Ceremony type badge */}
              {v.niche?.ceremonyType && (activeCat === "ceremony" || ceremonyFilter) && (
                <div style={{ position: "absolute", top: selectedDate ? 78 : 52, [isHe ? "right" : "left"]: 14, zIndex: 7, pointerEvents: "none" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 10, background: "rgba(0,206,209,.15)", border: "1px solid rgba(0,206,209,.35)", color: "#00e5e8", fontSize: 10, fontWeight: 700, backdropFilter: "blur(8px)" }}>
                    {v.niche.ceremonyType === "אורתודוקסי" ? "🕍" : v.niche.ceremonyType === "חילוני" ? "⚖️" : v.niche.ceremonyType === "רפורמי" ? "🌿" : "✡️"} {v.niche.ceremonyType}
                  </span>
                </div>
              )}

              {/* Hot badge — real rating based */}
              {isHot && (
                <div style={{ position: "absolute", bottom: 148, left: 14, right: isHe ? 80 : 80, zIndex: 6, pointerEvents: "none" }}>
                  <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10, background: "rgba(255,215,0,.07)", color: "#FFD700", border: "1px solid rgba(255,215,0,.15)", fontWeight: 700 }}>⭐ {isHe ? "מבוקש" : "Hot"}</span>
                </div>
              )}

              {/* Right-side action column (TikTok/Reels style) */}
              {(() => {
                const existingThread = chatThreads.find((t) => t.vendorName === v.name);
                const hasUnread = (existingThread?.unreadClient ?? 0) > 0;
                return (
                  <div style={{ position: "absolute", [isHe ? "left" : "right"]: 12, bottom: 155, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
                    {/* Like */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <button onClick={() => doLike(v)} style={{ width: 52, height: 52, borderRadius: "50%", background: isLikeAnim ? "linear-gradient(160deg,#00e5e8,#00CED1)" : isLiked ? "rgba(0,206,209,.22)" : "rgba(0,0,0,.6)", border: `2px solid ${isLiked ? "rgba(0,229,232,.7)" : "rgba(255,255,255,.22)"}`, color: isLikeAnim ? "#000" : isLiked ? "#00e5e8" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", transition: "all .15s", boxShadow: isLiked ? "0 4px 20px rgba(0,206,209,.4)" : "0 2px 12px rgba(0,0,0,.55)", transform: isLikeAnim ? "scale(1.2)" : "scale(1)" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 26, fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                      </button>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,.6)", fontWeight: 600 }}>{isHe ? "שמור" : "Save"}</span>
                    </div>
                    {/* Lead / Chat */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, position: "relative" }}>
                      <button onClick={() => setLeadVendor(v)} style={{ width: 52, height: 52, borderRadius: "50%", background: existingThread ? "rgba(0,206,209,.18)" : "rgba(0,0,0,.6)", border: `2px solid ${existingThread ? "rgba(0,229,232,.6)" : "rgba(255,255,255,.22)"}`, color: existingThread ? "#00e5e8" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 2px 12px rgba(0,0,0,.55)" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 24 }}>chat_bubble</span>
                      </button>
                      {hasUnread && <div style={{ position: "absolute", top: 0, right: 0, width: 14, height: 14, borderRadius: "50%", background: "#FF4444", border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#fff", fontWeight: 900 }}>{existingThread!.unreadClient}</div>}
                      <span style={{ fontSize: 10, color: existingThread ? "#00CED1" : "rgba(255,255,255,.6)", fontWeight: 600 }}>{isHe ? "הצעה" : "Quote"}</span>
                    </div>
                    {/* Info */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <button onClick={() => setInfoVendor(v)} style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(0,0,0,.6)", border: "2px solid rgba(255,255,255,.22)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 2px 12px rgba(0,0,0,.55)" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 24 }}>info</span>
                      </button>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,.6)", fontWeight: 600 }}>{isHe ? "פרטים" : "Info"}</span>
                    </div>
                    {/* Video (Pro) */}
                    {v.videoUrl && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <button onClick={() => setVideoVendor(v)} style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(168,85,247,.18)", border: "2px solid rgba(168,85,247,.55)", color: "#a855f7", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 2px 16px rgba(168,85,247,.3)" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>play_circle</span>
                        </button>
                        <span style={{ fontSize: 10, color: "#a855f7", fontWeight: 700 }}>{isHe ? "סרטון" : "Video"}</span>
                      </div>
                    )}
                    {/* Share */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <button onClick={() => {
                        const url = `${SITE_URL}/v/${makeSlug(v.name)}`;
                        if (navigator.share) {
                          navigator.share({ title: v.name, text: `${v.name} — ${v.sub} | VibeMatch`, url });
                        } else {
                          navigator.clipboard?.writeText(url);
                          showToast(isHe ? "🔗 לינק הועתק" : "🔗 Link copied");
                        }
                      }} style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(0,0,0,.6)", border: "2px solid rgba(255,255,255,.22)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 2px 12px rgba(0,0,0,.55)" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 22 }}>share</span>
                      </button>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,.6)", fontWeight: 600 }}>{isHe ? "שתף" : "Share"}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        }) : (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: "0 32px", textAlign: "center" }}>
            {activeFilterCount > 0 ? (
              <>
                <div style={{ fontSize: 48 }}>🔍</div>
                <p style={{ color: "#fff", fontSize: 17, fontWeight: 700 }}>
                  {isHe ? "אין תוצאות לסינון הנוכחי" : "No results for current filters"}
                </p>
                <p style={{ color: "rgba(255,255,255,.35)", fontSize: 13 }}>
                  {isHe ? "נסה לשנות אזור, תאריך או קטגוריה" : "Try changing area, date or category"}
                </p>
                <button onClick={() => { setAreaFilter("allAreas"); setSelectedDate(""); setEventTypeFilter(null); setCeremonyFilter(null); setDealsOnly(false); setSortBy("default"); }} style={{ marginTop: 4, padding: "10px 22px", borderRadius: 12, border: "1px solid rgba(0,206,209,.3)", background: "rgba(0,206,209,.08)", color: "#00CED1", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  {isHe ? "נקה סינונים" : "Clear filters"}
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 48 }}>🎉</div>
                <p style={{ color: "#fff", fontSize: 17, fontWeight: 700 }}>{t.noMore}</p>
                <p style={{ color: "rgba(255,255,255,.35)", fontSize: 13 }}>{t.pickCat}</p>
              </>
            )}
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
            {/* All categories option */}
            {(() => {
              const active = activeCat === "all";
              return (
                <button key="all" onClick={() => { setActiveCat("all"); setActiveSub(null); setPhotoIdxMap({}); }}
                  style={{ padding: "10px 6px", borderRadius: 14, border: active ? "1.5px solid rgba(168,85,247,.65)" : "1px solid rgba(255,255,255,.08)", background: active ? "linear-gradient(160deg,rgba(168,85,247,.22),rgba(139,67,209,.12))" : "rgba(255,255,255,.04)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, transition: "all .15s", boxShadow: active ? "0 4px 16px rgba(168,85,247,.3), inset 0 1px 0 rgba(200,130,255,.15)" : "none", fontFamily: "inherit" }}>
                  <span style={{ fontSize: 22 }}>✨</span>
                  <span style={{ color: active ? "#c084fc" : "rgba(255,255,255,.6)", fontSize: 10, fontWeight: active ? 800 : 500, textAlign: "center", lineHeight: 1.2 }}>{isHe ? "הכל" : "All"}</span>
                </button>
              );
            })()}
            {CATS.map((c) => {
              const active = activeCat === c.k;
              return (
                <button key={c.k} onClick={() => { setActiveCat(c.k); setActiveSub(null); setPhotoIdxMap({}); }}
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
                <button key={a} onClick={() => { setAreaFilter(a); }}
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
            <input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); }}
              style={{ flex: 1, background: selectedDate ? "rgba(0,206,209,.06)" : "rgba(255,255,255,.03)", border: `1px solid ${selectedDate ? "rgba(0,206,209,.35)" : "rgba(255,255,255,.08)"}`, borderRadius: 12, padding: "10px 14px", color: selectedDate ? "#00CED1" : "rgba(255,255,255,.3)", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
            {selectedDate && <button onClick={() => { setSelectedDate(""); }} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,.07)", border: "none", color: "rgba(255,255,255,.5)", cursor: "pointer", fontSize: 13 }}>✕</button>}
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
                  <span style={{ color: active ? "#00e5e8" : "rgba(255,255,255,.6)", fontSize: 12, fontWeight: active ? 700 : 500 }}>{isHe ? e.he : e.en}</span>
                </button>
              );
            })}
          </div>

          {/* ── 6. CEREMONY TYPE (only for ceremony cat or all) ── */}
          {(activeCat === "ceremony" || activeCat === "all") && (
            <>
              <p style={{ color: "rgba(255,255,255,.3)", fontSize: 10, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 10 }}>{isHe ? "סוג טקס" : "Ceremony Type"}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 24 }}>
                {[
                  { k: null, label: isHe ? "🕊️ הכל" : "🕊️ All" },
                  { k: "אורתודוקסי", label: "🕍 " + (isHe ? "אורתודוקסי" : "Orthodox") },
                  { k: "קונסרבטיבי", label: "✡️ " + (isHe ? "קונסרבטיבי" : "Conservative") },
                  { k: "רפורמי", label: "🌿 " + (isHe ? "רפורמי" : "Reform") },
                  { k: "חילוני", label: "⚖️ " + (isHe ? "חילוני" : "Secular") },
                ].map((opt) => {
                  const active = ceremonyFilter === opt.k;
                  return (
                    <button key={String(opt.k)} onClick={() => setCeremonyFilter(opt.k)}
                      style={{ padding: "8px 14px", borderRadius: 20, border: active ? "1.5px solid rgba(0,229,232,.6)" : "1px solid rgba(255,255,255,.1)", background: active ? "rgba(0,206,209,.15)" : "rgba(255,255,255,.04)", cursor: "pointer", color: active ? "#00e5e8" : "rgba(255,255,255,.55)", fontSize: 12, fontWeight: active ? 700 : 500, fontFamily: "inherit", transition: "all .12s" }}>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── 7. DEALS ONLY ── */}
          <p style={{ color: "rgba(255,255,255,.3)", fontSize: 10, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 10 }}>{isHe ? "מבצעים" : "Deals"}</p>
          <div style={{ marginBottom: 24 }}>
            <button onClick={() => setDealsOnly((p) => !p)}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 16px", borderRadius: 14, border: dealsOnly ? "1.5px solid rgba(255,68,68,.5)" : "1px solid rgba(255,255,255,.08)", background: dealsOnly ? "rgba(255,68,68,.1)" : "rgba(255,255,255,.03)", cursor: "pointer", fontFamily: "inherit", transition: "all .12s" }}>
              <span style={{ fontSize: 20 }}>🔥</span>
              <div style={{ flex: 1, textAlign: isHe ? "right" : "left" }}>
                <p style={{ color: dealsOnly ? "#FF6666" : "rgba(255,255,255,.7)", fontSize: 13, fontWeight: 700, margin: 0 }}>{isHe ? "מבצעי רגע אחרון בלבד" : "Last-Minute Deals Only"}</p>
                <p style={{ color: "#555", fontSize: 11, margin: "2px 0 0" }}>{isHe ? "ספקים עם הנחה לתאריכים פתוחים" : "Vendors with discounts on open dates"}</p>
              </div>
              <div style={{ width: 40, height: 22, borderRadius: 11, background: dealsOnly ? "#FF4444" : "rgba(255,255,255,.1)", border: `1px solid ${dealsOnly ? "#FF4444" : "rgba(255,255,255,.1)"}`, position: "relative", transition: "all .2s", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: 2, left: dealsOnly ? 20 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.4)" }} />
              </div>
            </button>
          </div>

          {/* ── 8. SORT ── */}
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
            <button onClick={() => { setShowSidebar(false); }}
              style={{ width: "100%", padding: "15px 0", borderRadius: 16, border: "none", background: "linear-gradient(160deg,#00e5e8,#00b8ba)", color: "#000", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 24px rgba(0,206,209,.35)" }}>
              {isHe ? `הצג תוצאות (${vs.length})` : `Show Results (${vs.length})`}
            </button>
            <button onClick={() => { setAreaFilter("allAreas"); setSelectedDate(""); setActiveSub(null); setSortBy("default"); setEventTypeFilter(null); setCeremonyFilter(null); setDealsOnly(false); }}
              style={{ width: "100%", padding: "12px 0", borderRadius: 14, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)", color: "rgba(255,255,255,.5)", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              {isHe ? "אפס הכל" : "Reset All"}
            </button>
            <button onClick={() => { setShowSidebar(false); setShowTogether(true); }}
              style={{ width: "100%", padding: "12px 0", borderRadius: 14, border: "1px solid rgba(0,206,209,.2)", background: "rgba(0,206,209,.06)", color: "#00CED1", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              💑 {isHe ? "חפשו יחד" : "Search Together"}
            </button>
            <button onClick={() => { setShowSidebar(false); setShowPackage(true); }}
              style={{ width: "100%", padding: "12px 0", borderRadius: 14, border: "1px solid rgba(0,206,209,.35)", background: "linear-gradient(135deg,rgba(0,206,209,.15),rgba(0,139,139,.1))", color: "#00e5e8", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 12px rgba(0,206,209,.15)" }}>
              ✨ {isHe ? "בנה חבילה אוטומטית" : "Auto Event Package"}
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

      {showTogether && <SwipeTogetherModal onClose={() => setShowTogether(false)} />}
      {hotView && <VendorCard vendor={hotView} onClose={() => setHotView(null)} />}
      {infoVendor && <VendorCard vendor={infoVendor} onClose={() => setInfoVendor(null)} />}
      {leadVendor && (
        <LeadChatModal
          vendor={leadVendor}
          existingThread={chatThreads.find((t) => t.vendorName === leadVendor.name)}
          onClose={() => setLeadVendor(null)}
        />
      )}
      {videoVendor?.videoUrl && <VideoModal url={videoVendor.videoUrl} onClose={() => setVideoVendor(null)} />}
      {showPackage && <PackageModal onClose={() => setShowPackage(false)} />}
    </div>
  );
}
