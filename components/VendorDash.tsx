"use client";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { T, CATS, NICHE_FIELDS, SITE_URL, translateNicheVal } from "@/lib/constants";
import B from "./B";
import Inp from "./Inp";
import Logo from "./Logo";
import AvailabilityCalendar from "./AvailabilityCalendar";
import VendorGoLiveModal from "./VendorGoLiveModal";
import SwipeCardView from "./SwipeCardView";
import { saveVendorProfile, loadVendorBySlug, makeSlug, loadBusyDates } from "@/lib/supabase/vendors";
import { loadVendorLeads, markLeadReadVendor, saveLeadMessage } from "@/lib/supabase/leads";
import type { Vendor, ChatThread, ChatMessage } from "@/types";

function BusyDatesList({ vendorName, isHe }: { vendorName: string; isHe: boolean }) {
  const { vendorAvailability, setVendorAvailability } = useApp();
  const dates = vendorAvailability[vendorName] ?? [];
  if (!dates.length) return <p style={{ color: "#333", fontSize: 11 }}>{isHe ? "אין תאריכים תפוסים" : "No busy dates"}</p>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
      {dates.sort().map((d) => (
        <span key={d} style={{ background: "rgba(255,68,68,.1)", border: "1px solid rgba(255,68,68,.2)", borderRadius: 6, padding: "3px 9px", fontSize: 11, color: "#FF6666", display: "flex", alignItems: "center", gap: 5 }}>
          {d}
          <button onClick={() => setVendorAvailability((p) => ({ ...p, [vendorName]: (p[vendorName] ?? []).filter((x) => x !== d) }))}
            style={{ background: "none", border: "none", color: "#FF4444", cursor: "pointer", fontSize: 11, padding: 0, lineHeight: 1 }}>✕</button>
        </span>
      ))}
    </div>
  );
}

export default function VendorDash() {
  const { lang, user, setUser, vGallery, setVGallery, vPic, setVPic, vAbout, setVAbout, vProfile, setVProfile, showToast, setPublishedVendors, chatThreads, setChatThreads, vendorAvailability, setVendorAvailability } = useApp();
  const t = T[lang];
  const dir = lang === "he" ? "rtl" : "ltr";
  const router = useRouter();

  // All hooks MUST come before any early return
  const [tab, setTab] = useState<"preview" | "edit" | "calendar" | "leads">("preview");
  const [videoUrl, setVideoUrl] = useState("");
  const [coupon, setCoupon] = useState("");
  const [dealText, setDealText] = useState("");
  const [dealHours, setDealHours] = useState(48);
  const [pIdx, setPIdx] = useState(0);
  const [published, setPublished] = useState(false);
  const [vendorName, setVendorName] = useState("");
  const [vendorPin, setVendorPin] = useState("");
  const [dbLeads, setDbLeads] = useState<ChatThread[]>([]);
  const [dbLeadsLoading, setDbLeadsLoading] = useState(false);
  const [dbLeadsError, setDbLeadsError] = useState(false);
  const [replyMsgs, setReplyMsgs] = useState<Record<string, string>>({});
  const [wizardLoaded, setWizardLoaded] = useState(false);
  const [showGoLive, setShowGoLive] = useState(false);
  const fRef = useRef<HTMLInputElement>(null);
  const pRef = useRef<HTMLInputElement>(null);

  const isHe = lang === "he";
  const nicheFields = vProfile.category ? (NICHE_FIELDS[vProfile.category] ?? []) : [];
  const vendorSlug = makeSlug(vProfile.businessName || user?.name || "");
  const publicLink = vendorSlug ? `${SITE_URL}/v/${vendorSlug}` : "";

  // Load existing profile from Supabase on mount — decide wizard vs dashboard
  useEffect(() => {
    if (!user || user.role !== "vendor") { setWizardLoaded(true); return; }
    const slug = makeSlug(user.name);
    if (!slug) { setWizardLoaded(true); return; }
    loadVendorBySlug(slug).then((v) => {
      if (!v) {
        // New vendor — edit tab has completeness bar to guide them
      } else {
        // Returning vendor — hydrate state from Supabase
        if (v.desc && !vAbout) setVAbout(v.desc);
        if (v.isPublished) setPublished(true);
        if (v.imgs?.length && !vGallery.length) setVGallery(v.imgs.map((src, i) => ({ id: i, src })));
        if (v.coupon) setCoupon(v.coupon);
        if (v.deal?.text) { setDealText(v.deal.text); setDealHours(v.deal.endsIn ?? 48); }
        if (v.videoUrl) setVideoUrl(v.videoUrl);
        // Load busy dates from DB into vendorAvailability
        const vendorSlugForDates = makeSlug(v.name);
        if (vendorSlugForDates) {
          loadBusyDates(vendorSlugForDates).then((dates) => {
            if (dates.length) setVendorAvailability((prev) => ({ ...prev, [v.name]: dates }));
          }).catch(() => {});
        }
        // Restore all vProfile fields at once
        setVProfile((p) => ({
          ...p,
          ...(v.catKey && !p.category ? { category: v.catKey } : {}),
          ...(v.name && !p.businessName ? { businessName: v.name } : {}),
          ...(v.price && !p.businessPrice ? { businessPrice: v.price } : {}),
          // Contact fields
          ...(v.whatsapp ? { whatsapp: v.whatsapp } : {}),
          ...(v.phone ? { phone: v.phone } : {}),
          ...(v.instagram ? { instagram: v.instagram } : {}),
          ...(v.tiktok ? { tiktok: v.tiktok } : {}),
          ...(v.website ? { website: v.website } : {}),
          ...(v.google ? { google: v.google } : {}),
          ...(v.waze ? { waze: v.waze } : {}),
          ...(v.observance ? { observance: v.observance } : {}),
          // Niche fields (only restore if not already set in session)
          ...Object.fromEntries(
            Object.entries(v.niche ?? {}).filter(([k]) => !p[k])
          ),
        }));
      }
    }).catch(() => {
      // Network error — don't show wizard for potentially returning vendors
      // Wizard only shows when Supabase confirms the vendor truly doesn't exist
    }).finally(() => setWizardLoaded(true));
  }, [user?.name]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load leads from Supabase when Leads tab is opened
  const vname = vProfile.businessName || user?.name || "";
  useEffect(() => {
    if (tab !== "leads" || !vname) return;
    setDbLeadsLoading(true);
    setDbLeadsError(false);
    loadVendorLeads(vname).then((leads) => {
      setDbLeads(leads);
      // Merge into global chatThreads so client-side chat also stays in sync
      // Replace matching threads with fresh DB data, keep local-only threads
      setChatThreads((prev) => {
        const dbIds = new Set(leads.map((l) => l.id));
        const localOnly = prev.filter((t) => !dbIds.has(t.id));
        return [...localOnly, ...leads];
      });
    }).catch(() => { setDbLeadsError(true); }).finally(() => setDbLeadsLoading(false));
  }, [tab, vname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Vendor quick-login (no email needed — bypasses Magic Link rate limit)
  if (!user || user.role !== "vendor") {
    return (
      <div style={{ minHeight: "100dvh", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", direction: dir, fontFamily: "inherit" }}>
        <div style={{ marginBottom: 28 }}><Logo sz={28} /></div>
        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 4, textAlign: "center" }}>
          {isHe ? "כניסת ספק" : "Vendor Login"}
        </h2>
        <p style={{ color: "#555", fontSize: 12, textAlign: "center", marginBottom: 20, maxWidth: 280 }}>
          {isHe ? "כניסה ישירה — ללא מגבלת מיילים" : "Direct login — no email rate limit"}
        </p>
        <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 10 }}>
          <Inp value={vendorName} onChange={setVendorName} placeholder={isHe ? "שם העסק שלך" : "Your business name"} />
          <Inp value={vendorPin} onChange={setVendorPin} placeholder={isHe ? "קוד כניסה (4 ספרות)" : "Access code (4 digits)"} dir="ltr" />
          <B style={{ width: "100%" }} onClick={() => {
            if (!vendorName.trim()) { showToast(isHe ? "הכנס שם עסק" : "Enter business name"); return; }
            if (!/^\d{4}$/.test(vendorPin)) { showToast(isHe ? "קוד חייב להיות 4 ספרות" : "Code must be 4 digits"); return; }
            if (vendorPin !== "1234") { showToast(isHe ? "קוד שגוי" : "Incorrect code"); return; }
            setUser({ name: vendorName.trim(), role: "vendor" });
          }}>
            {isHe ? "כניסה לפאנל ספק" : "Enter Vendor Panel"}
          </B>
          <p style={{ color: "#2a2a2a", fontSize: 10, textAlign: "center", marginTop: 4 }}>
            {isHe ? "קוד: 1234" : "Code: 1234"}
          </p>
        </div>
      </div>
    );
  }

  // Loading state while checking Supabase
  if (!wizardLoaded) {
    return (
      <div style={{ minHeight: "100dvh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(0,206,209,.2)", borderTopColor: "#00CED1", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  const builtNiche: Record<string, string> = {};
  nicheFields.forEach((f) => { if (vProfile[f.k]) builtNiche[f.k] = vProfile[f.k]; });

  const previewVendor: Vendor = {
    name: vProfile.businessName || (user?.name ?? ""),
    sub: vProfile.category || "",
    price: vProfile.businessPrice || "",
    rating: 5,
    city: "",
    reviews: 0,
    desc: vAbout,
    coupon,
    area: "center",
    imgs: vGallery.map((g) => g.src),
    niche: builtNiche,
    deal: dealText.trim() ? { text: dealText.trim(), endsIn: dealHours } : null,
    recommends: [],
    vendorReviews: [],
    videoUrl: videoUrl.trim() || undefined,
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#000", fontFamily: "inherit", direction: dir }}>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 48, background: "#000", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", zIndex: 100, maxWidth: 480, margin: "0 auto" }}>
        <button onClick={() => router.push("/")} style={{ background: "rgba(255,255,255,.09)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,.16)", color: "rgba(255,255,255,.72)", borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, boxShadow: "0 2px 10px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.12)", transition: "all .12s" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>home</span>
          {isHe ? "בית" : "Home"}
        </button>
        <Logo sz={18} />
        <button onClick={async () => {
          const catLabel = CATS.find((c) => c.k === vProfile.category)?.[isHe ? "he" : "en"] ?? vProfile.category;
          const bizName = vProfile.businessName || user?.name || "";
          if (!vGallery.length) {
            showToast(isHe ? "📸 הוסף לפחות תמונה אחת לפני פרסום" : "📸 Add at least one photo before publishing");
            setTab("edit");
            return;
          }
          if (!bizName || !vProfile.category) {
            showToast(isHe ? "📝 מלא שם עסק וקטגוריה" : "📝 Fill business name and category");
            setTab("edit");
            return;
          }
          const newVendor: Vendor = {
            name: bizName,
            sub: catLabel,
            price: vProfile.businessPrice || "",
            rating: 5, city: "", reviews: 0,
            desc: vAbout,
            coupon: coupon,
            area: "center" as import("@/types").Area,
            imgs: vGallery.map((g) => g.src),
            niche: builtNiche,
            deal: dealText.trim() ? { text: dealText.trim(), endsIn: dealHours } : null,
            recommends: [], vendorReviews: [],
            whatsapp: vProfile.whatsapp, phone: vProfile.phone,
            instagram: vProfile.instagram, tiktok: vProfile.tiktok,
            website: vProfile.website, google: vProfile.google, waze: vProfile.waze,
            catKey: vProfile.category as import("@/types").CatKey,
            isPublished: true,
            videoUrl: videoUrl.trim() || undefined,
            observance: vProfile.observance || undefined,
          };
          // Optimistically update context feed
          setPublishedVendors((p) => [...p.filter((v) => v.name !== bizName), newVendor]);
          // Persist to Supabase — only mark as published on success
          const { error } = await saveVendorProfile(newVendor);
          if (error) {
            showToast(isHe ? "⚠️ שגיאה בפרסום — בדוק חיבור" : "⚠️ Publish failed — check connection");
            return;
          }
          setPublished(true);
          setShowGoLive(true);
        }} style={{ background: published ? "rgba(0,206,209,.14)" : "linear-gradient(160deg,#00e5e8 0%,#00CED1 55%,#009eb0 100%)", border: published ? "1.5px solid rgba(0,229,232,.55)" : "1px solid rgba(0,255,255,.3)", color: published ? "#00e5e8" : "#000", borderRadius: 20, padding: "6px 14px", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: published ? "0 2px 10px rgba(0,206,209,.2)" : "0 4px 16px rgba(0,206,209,.45), inset 0 1px 0 rgba(255,255,255,.3)", transition: "all .12s", letterSpacing: 0.2 }}>
          {published ? (isHe ? "✓ פורסם" : "✓ Live") : (isHe ? "פרסם" : "Publish")}
        </button>
      </div>

      <input ref={fRef} type="file" accept="image/*,video/*" multiple onChange={(e) => {
        if (vGallery.length >= 5) return;
        Array.from(e.target.files ?? []).slice(0, 5 - vGallery.length).forEach((f) => {
          const r = new FileReader();
          r.onload = (ev) => setVGallery((p) => p.length < 5 ? [...p, { id: Date.now() + Math.random(), src: ev.target?.result as string }] : p);
          r.readAsDataURL(f);
        });
        e.target.value = "";
      }} style={{ display: "none" }} />
      <input ref={pRef} type="file" accept="image/*" onChange={(e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = (ev) => setVPic(ev.target?.result as string);
        r.readAsDataURL(f);
        e.target.value = "";
      }} style={{ display: "none" }} />

      <div style={{ padding: "48px 0 0" }}>
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
          {(["preview", "edit", "calendar", "leads"] as const).map((tb) => {
            const allLeads = dbLeads.length > 0 ? dbLeads : chatThreads.filter((ct) => ct.vendorName === vname);
            const unread = allLeads.reduce((s, ct) => s + ct.unreadVendor, 0);
            return (
              <button key={tb} onClick={() => setTab(tb)} style={{ flex: 1, padding: "12px 0", background: tab === tb ? "rgba(0,206,209,.06)" : "none", border: "none", color: tab === tb ? "#00e5e8" : "rgba(255,255,255,.4)", fontSize: 12, fontWeight: tab === tb ? 700 : 500, cursor: "pointer", borderBottom: tab === tb ? "2px solid #00CED1" : "2px solid rgba(255,255,255,.05)", transition: "all .15s", position: "relative", fontFamily: "inherit" }}>
                {tb === "preview" ? t.preview : tb === "edit" ? t.editProfile : tb === "calendar" ? (isHe ? "יומן" : "Cal") : (isHe ? "לידים" : "Leads")}
                {tb === "leads" && unread > 0 && <span style={{ position: "absolute", top: 6, right: 6, width: 14, height: 14, borderRadius: "50%", background: "#FF4444", color: "#fff", fontSize: 8, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{unread}</span>}
              </button>
            );
          })}
        </div>

        {tab === "preview" && (
          /* Full-screen card — exact client feed experience */
          <div style={{ position: "relative", height: "calc(100dvh - 92px)", overflow: "hidden", animation: "fadeIn .3s" }}>
            <SwipeCardView
              vendor={previewVendor}
              imgIdx={pIdx}
              setImgIdx={(fn) => setPIdx((i) => fn(i))}
            />

            {/* Live/Draft badge */}
            <div style={{
              position: "absolute", top: 12,
              ...(isHe ? { right: 14 } : { left: 14 }),
              zIndex: 10, display: "flex", alignItems: "center", gap: 5,
              background: "rgba(0,0,0,.6)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,.12)", borderRadius: 20, padding: "5px 11px",
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: published ? "#00e87a" : "#FF4444", animation: published ? "pulse 2s infinite" : "none" }} />
              <span style={{ color: published ? "#00e87a" : "#FF4444", fontSize: 10, fontWeight: 700 }}>
                {published ? (isHe ? "חי" : "Live") : (isHe ? "טיוטה" : "Draft")}
              </span>
            </div>

            {/* Copy link button */}
            {publicLink && (
              <button
                onClick={() => { navigator.clipboard?.writeText(publicLink); showToast(isHe ? "🔗 לינק הועתק!" : "🔗 Link copied!"); }}
                style={{
                  position: "absolute", top: 12,
                  ...(isHe ? { left: 14 } : { right: 14 }),
                  zIndex: 10, background: "rgba(0,0,0,.6)",
                  backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,.12)", color: "#fff",
                  borderRadius: 20, padding: "5px 12px",
                  fontSize: 10, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>link</span>
                {isHe ? "העתק לינק" : "Copy link"}
              </button>
            )}

            {/* Grey category chips row — visual only, floating at bottom */}
            <div
              style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                display: "flex", gap: 6, padding: "10px 14px 14px",
                overflowX: "auto", zIndex: 20,
                background: "linear-gradient(0deg,rgba(0,0,0,.7) 0%,transparent 100%)",
              }}
              className="hide-scrollbar"
            >
              {CATS.map((c) => (
                <span key={c.k} style={{
                  padding: "5px 14px", borderRadius: 20,
                  border: "1px solid rgba(255,255,255,.1)",
                  background: "rgba(0,0,0,.4)",
                  backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                  color: "rgba(255,255,255,.3)",
                  fontSize: 11, flexShrink: 0,
                  pointerEvents: "none", userSelect: "none", fontFamily: "inherit",
                }}>
                  {isHe ? c.he : c.en}
                </span>
              ))}
            </div>
          </div>
        )}

        {tab === "calendar" && (
          <div style={{ padding: "16px 14px", animation: "fadeIn .3s" }}>
            <div style={{ background: "rgba(255,255,255,.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,.05)", padding: 16, marginBottom: 14 }}>
              <p style={{ color: "#00CED1", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15, verticalAlign: "middle", marginRight: isHe ? 0 : 6, marginLeft: isHe ? 6 : 0 }}>calendar_month</span>
                {isHe ? "זמינות — סמן תאריכים תפוסים" : "Availability — mark busy dates"}
              </p>
              <p style={{ color: "#444", fontSize: 11, marginBottom: 14 }}>
                {isHe ? "לחץ על תאריך כדי לסמן שאינך פנוי. לקוחות יראו זאת בעת חיפוש." : "Tap a date to mark yourself unavailable. Clients will see this when searching."}
              </p>
              <AvailabilityCalendar vendorName={vProfile.businessName || user?.name || ""} />
            </div>
            <div style={{ background: "rgba(255,255,255,.02)", borderRadius: 14, border: "1px solid rgba(255,255,255,.04)", padding: "12px 14px" }}>
              <p style={{ color: "#555", fontSize: 11, fontWeight: 600, marginBottom: 8 }}>
                {isHe ? "תאריכים תפוסים שסימנת:" : "Busy dates you marked:"}
              </p>
              <BusyDatesList vendorName={vProfile.businessName || user?.name || ""} isHe={isHe} />
            </div>
          </div>
        )}

        {tab === "leads" && (() => {
          // Prefer DB leads; fallback to in-memory chatThreads for offline/demo
          const myLeads: ChatThread[] = dbLeads.length > 0
            ? dbLeads
            : chatThreads.filter((ct) => ct.vendorName === vname);

          function sendVendorReply(ct: ChatThread) {
            const text = replyMsgs[ct.id]?.trim();
            if (!text) return;
            const newMsg: ChatMessage = {
              id: (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36),
              from: "vendor",
              text,
              ts: Date.now(),
              senderName: vname,
            };
            const updated = { ...ct, messages: [...ct.messages, newMsg], unreadClient: ct.unreadClient + 1, unreadVendor: 0 };
            setDbLeads((p) => p.map((l) => l.id === ct.id ? updated : l));
            setChatThreads((p) => p.map((t) => t.id === ct.id ? updated : t));
            setReplyMsgs((p) => ({ ...p, [ct.id]: "" }));
            // Persist (fire-and-forget)
            saveLeadMessage(ct.id, newMsg).catch(() => {});
            markLeadReadVendor(ct.id).catch(() => {});
            showToast(isHe ? "✅ תגובה נשלחה" : "✅ Reply sent");
          }

          return (
            <div style={{ padding: "16px 14px", animation: "fadeIn .3s" }}>
              <p style={{ color: "#fff", fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{isHe ? "לידים נכנסים" : "Incoming Leads"}</p>
              <p style={{ color: "#555", fontSize: 11, marginBottom: 16 }}>{isHe ? "פניות לקוחות שנשלחו דרך האפליקציה" : "Client requests sent through the app"}</p>
              {dbLeadsLoading ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ width: 24, height: 24, border: "2px solid rgba(0,206,209,.3)", borderTopColor: "#00CED1", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
                </div>
              ) : dbLeadsError ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>⚠️</div>
                  <p style={{ color: "#FF6666", fontSize: 13 }}>{isHe ? "שגיאה בטעינת הלידים" : "Failed to load leads"}</p>
                  <button onClick={() => { setDbLeadsError(false); setTab("preview"); setTimeout(() => setTab("leads"), 50); }}
                    style={{ marginTop: 12, background: "rgba(0,206,209,.12)", border: "1px solid rgba(0,206,209,.3)", color: "#00CED1", borderRadius: 10, padding: "8px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    {isHe ? "נסה שוב" : "Retry"}
                  </button>
                </div>
              ) : myLeads.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
                  <p style={{ color: "#555", fontSize: 13 }}>{isHe ? "עדיין אין לידים" : "No leads yet"}</p>
                  <p style={{ color: "#333", fontSize: 11, marginTop: 4, marginBottom: 16 }}>{isHe ? "לקוחות שיפנו אליך יופיעו כאן" : "Clients who contact you will appear here"}</p>
                  {publicLink && (
                    <button onClick={() => { navigator.clipboard?.writeText(publicLink); showToast(isHe ? "✓ קישור הועתק!" : "✓ Link copied!"); }}
                      style={{ padding: "10px 20px", borderRadius: 12, border: "1px solid rgba(0,206,209,.3)", background: "rgba(0,206,209,.08)", color: "#00CED1", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                      🔗 {isHe ? "העתק קישור לפרופיל" : "Copy profile link"}
                    </button>
                  )}
                </div>
              ) : myLeads.map((ct) => (
                <div key={ct.id} style={{ background: ct.unreadVendor > 0 ? "rgba(0,206,209,.06)" : "rgba(255,255,255,.02)", border: `1px solid ${ct.unreadVendor > 0 ? "rgba(0,206,209,.25)" : "rgba(255,255,255,.06)"}`, borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0 }}>{ct.clientName || (isHe ? "לקוח" : "Client")}</p>
                      <p style={{ color: "#555", fontSize: 11, margin: "2px 0 0" }}>{new Date(ct.createdAt).toLocaleDateString(isHe ? "he-IL" : "en-US")}</p>
                    </div>
                    {ct.unreadVendor > 0 && <span style={{ background: "#FF4444", color: "#fff", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, flexShrink: 0 }}>{ct.unreadVendor}</span>}
                  </div>
                  {(ct.lead.date || ct.lead.guests || ct.lead.budget) && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                      {ct.lead.date && <span style={{ padding: "3px 10px", borderRadius: 8, background: "rgba(255,255,255,.05)", color: "#aaa", fontSize: 11 }}>📅 {ct.lead.date}</span>}
                      {ct.lead.guests && <span style={{ padding: "3px 10px", borderRadius: 8, background: "rgba(255,255,255,.05)", color: "#aaa", fontSize: 11 }}>👥 {ct.lead.guests}</span>}
                      {ct.lead.budget && <span style={{ padding: "3px 10px", borderRadius: 8, background: "rgba(255,255,255,.05)", color: "#aaa", fontSize: 11 }}>💰 {ct.lead.budget}</span>}
                    </div>
                  )}
                  {/* Last message preview */}
                  {ct.messages.length > 0 && (
                    <p style={{ color: "#666", fontSize: 12, margin: "0 0 10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ct.messages[ct.messages.length - 1].text.split("\n")[0]}
                    </p>
                  )}
                  {/* Vendor reply input */}
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      value={replyMsgs[ct.id] ?? ""}
                      onChange={(e) => setReplyMsgs((p) => ({ ...p, [ct.id]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") sendVendorReply(ct); }}
                      placeholder={isHe ? "תגובה ללקוח..." : "Reply to client..."}
                      style={{ flex: 1, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "9px 12px", color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none" }}
                    />
                    <button
                      onClick={() => sendVendorReply(ct)}
                      disabled={!replyMsgs[ct.id]?.trim()}
                      style={{ padding: "9px 14px", borderRadius: 10, border: "none", background: replyMsgs[ct.id]?.trim() ? "linear-gradient(135deg,#00CED1,#008b8b)" : "rgba(255,255,255,.07)", color: replyMsgs[ct.id]?.trim() ? "#000" : "#555", fontWeight: 700, fontSize: 12, cursor: replyMsgs[ct.id]?.trim() ? "pointer" : "default", fontFamily: "inherit", transition: "all .12s" }}
                    >
                      {isHe ? "שלח" : "Send"}
                    </button>
                  </div>
                  {ct.unreadVendor > 0 && (
                    <button
                      onClick={() => {
                        setDbLeads((p) => p.map((l) => l.id === ct.id ? { ...l, unreadVendor: 0 } : l));
                        setChatThreads((p) => p.map((t) => t.id === ct.id ? { ...t, unreadVendor: 0 } : t));
                        markLeadReadVendor(ct.id).catch(() => {});
                      }}
                      style={{ marginTop: 8, width: "100%", padding: "7px 0", borderRadius: 8, border: "1px solid rgba(255,255,255,.08)", background: "transparent", color: "#555", fontWeight: 600, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      {isHe ? "✓ סמן כנקרא" : "✓ Mark as read"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          );
        })()}

        {tab === "edit" && (
          <div style={{ padding: "10px 14px", overflowY: "auto", maxHeight: "calc(100dvh - 96px)" }}>
            {/* ── PROFILE COMPLETENESS ── */}
            {(() => {
              const steps = [
                { done: !!vProfile.businessName, label: isHe ? "שם עסק" : "Business name" },
                { done: !!vProfile.category, label: isHe ? "קטגוריה" : "Category" },
                { done: vGallery.length >= 1, label: isHe ? "תמונה" : "Photo" },
                { done: vGallery.length >= 3, label: isHe ? "3 תמונות" : "3 photos" },
                { done: !!vAbout, label: isHe ? "תיאור" : "Description" },
                { done: !!vProfile.businessPrice, label: isHe ? "מחיר" : "Price" },
                { done: !!(vProfile.whatsapp || vProfile.phone), label: isHe ? "יצירת קשר" : "Contact" },
              ];
              const done = steps.filter((s) => s.done).length;
              const pct = Math.round((done / steps.length) * 100);
              const color = pct === 100 ? "#00CED1" : pct >= 60 ? "#FFD700" : "#FF4444";
              return (
                <div style={{ background: "rgba(255,255,255,.02)", border: `1px solid ${color}22`, borderRadius: 14, padding: "12px 14px", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <p style={{ color, fontSize: 12, fontWeight: 800, margin: 0 }}>
                      {pct === 100 ? (isHe ? "✅ פרופיל מלא!" : "✅ Profile complete!") : (isHe ? `השלמת פרופיל — ${pct}%` : `Profile completeness — ${pct}%`)}
                    </p>
                    <span style={{ color, fontSize: 14, fontWeight: 900 }}>{pct}%</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,.06)", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width .4s ease" }} />
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {steps.map((s) => (
                      <span key={s.label} style={{ padding: "2px 8px", borderRadius: 8, background: s.done ? `${color}18` : "rgba(255,255,255,.03)", border: `1px solid ${s.done ? color + "44" : "rgba(255,255,255,.06)"}`, color: s.done ? color : "#444", fontSize: 10, fontWeight: s.done ? 700 : 400 }}>
                        {s.done ? "✓ " : ""}{s.label}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <div onClick={() => pRef.current?.click()} style={{ width: 68, height: 68, borderRadius: "50%", background: vPic ? "transparent" : "rgba(255,255,255,.03)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 6px", border: "1px solid rgba(255,255,255,.08)", cursor: "pointer", overflow: "hidden" }}>
                {vPic ? <img src={vPic} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <span style={{ color: "#555" }}>+</span>}
              </div>
              <p style={{ color: "#666", fontSize: 11, cursor: "pointer" }} onClick={() => pRef.current?.click()}>{t.profilePic}</p>
            </div>

            <p style={{ color: "#666", fontSize: 12, marginBottom: 6 }}>{t.gallery} ({vGallery.length}/5)</p>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 14 }}>
              {vGallery.map((g) => (
                <div key={g.id} style={{ width: 66, height: 66, borderRadius: 8, overflow: "hidden", flexShrink: 0, position: "relative" }}>
                  <img src={g.src} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                  <button onClick={() => setVGallery((p) => p.filter((x) => x.id !== g.id))} style={{ position: "absolute", top: 2, ...(isHe ? { left: 2 } : { right: 2 }), background: "rgba(0,0,0,.6)", border: "none", color: "#FF4444", fontSize: 10, cursor: "pointer", width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>
              ))}
              {vGallery.length < 5 && (
                <div onClick={() => fRef.current?.click()} style={{ width: 66, height: 66, borderRadius: 8, border: "1px dashed rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                  <span style={{ color: "#555", fontSize: 18 }}>+</span>
                </div>
              )}
            </div>

            <p style={{ color: "#666", fontSize: 12, marginBottom: 4 }}>{t.bizName}</p>
            <Inp value={vProfile.businessName} onChange={(v) => setVProfile((p) => ({ ...p, businessName: v }))} placeholder={t.bizName} style={{ marginBottom: 10 }} />

            <p style={{ color: "#666", fontSize: 12, marginBottom: 4 }}>{lang === "he" ? "קטגוריה" : "Category"}</p>
            <select value={vProfile.category} onChange={(e) => setVProfile((p) => ({ ...p, category: e.target.value as import("@/types").CatKey | "" }))} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.03)", color: "#fff", fontSize: 14, fontFamily: "inherit", marginBottom: 10 }}>
              <option value="">—</option>
              {CATS.map((c) => <option key={c.k} value={c.k}>{lang === "en" ? c.en : c.he}</option>)}
            </select>

            {nicheFields.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <p style={{ color: "#00CED1", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{lang === "he" ? "פרטי נישה" : "Niche Details"}</p>
                {nicheFields.map((f) => {
                  const displayOpts = isHe ? f.opts : (f.optsEn ?? f.opts);
                  return (
                    <div key={f.k} style={{ marginBottom: 10 }}>
                      <p style={{ color: "#888", fontSize: 11, marginBottom: 4 }}>{isHe ? f.l : f.en}</p>
                      {displayOpts ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {displayOpts.map((o, idx) => {
                            const heVal = f.opts![idx]; // always store Hebrew value as the data key
                            const sel = vProfile[f.k] === heVal;
                            return <button key={heVal} onClick={() => setVProfile((p) => ({ ...p, [f.k]: heVal }))} style={{ padding: "6px 14px", borderRadius: 16, border: `1.5px solid ${sel ? "rgba(0,229,232,.55)" : "rgba(255,255,255,.12)"}`, background: sel ? "rgba(0,206,209,.15)" : "rgba(255,255,255,.07)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", color: sel ? "#00e5e8" : "rgba(255,255,255,.55)", fontSize: 11, fontWeight: sel ? 700 : 500, cursor: "pointer", boxShadow: sel ? "0 3px 10px rgba(0,206,209,.22), inset 0 1px 0 rgba(0,255,255,.15)" : "0 1px 6px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.07)", transition: "all .12s" }}>{o}</button>;
                          })}
                        </div>
                      ) : (
                        <Inp value={vProfile[f.k] ?? ""} onChange={(v) => setVProfile((p) => ({ ...p, [f.k]: v }))} placeholder="..." />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <p style={{ color: "#666", fontSize: 12, marginBottom: 4 }}>{t.desc}</p>
            <textarea value={vAbout} onChange={(e) => setVAbout(e.target.value)} style={{ width: "100%", minHeight: 80, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 10, padding: 12, color: "#fff", fontSize: 13, resize: "vertical", fontFamily: "inherit", marginBottom: 10 }} />

            <p style={{ color: "#666", fontSize: 12, marginBottom: 4 }}>{t.price}</p>
            <Inp value={vProfile.businessPrice} onChange={(v) => setVProfile((p) => ({ ...p, businessPrice: v }))} dir="ltr" style={{ marginBottom: 12 }} />

            <p style={{ color: "#666", fontSize: 12, marginBottom: 4 }}>{t.links}</p>
            {[{ k: "whatsapp", l: "WhatsApp" }, { k: "phone", l: "Phone" }, { k: "instagram", l: "Instagram" }, { k: "tiktok", l: "TikTok" }, { k: "website", l: "Website" }, { k: "google", l: "Google Reviews" }, { k: "waze", l: "Waze" }].map((lk) => (
              <div key={lk.k} style={{ marginBottom: 8 }}>
                <p style={{ color: "#555", fontSize: 10, marginBottom: 2 }}>{lk.l}</p>
                <Inp value={vProfile[lk.k] ?? ""} onChange={(v) => setVProfile((p) => ({ ...p, [lk.k]: v }))} dir="ltr" />
              </div>
            ))}

            <p style={{ color: "#666", fontSize: 12, marginBottom: 4 }}>{t.coupon}</p>
            <Inp value={coupon} onChange={setCoupon} style={{ marginBottom: 20 }} />

            {/* ── OBSERVANCE ── */}
            <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, padding: "14px 16px", marginBottom: 20 }}>
              <p style={{ color: "#00CED1", fontWeight: 800, fontSize: 13, margin: "0 0 4px" }}>{isHe ? "🌍 לאיזה קהל אתם מתאימים?" : "🌍 Which audience do you serve?"}</p>
              <p style={{ color: "#555", fontSize: 11, marginBottom: 12 }}>{isHe ? "לקוחות יוכלו לסנן לפי אורח חיים — עוזר לכם להגיע לקהל הנכון" : "Clients filter by lifestyle — helps you reach the right audience"}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { v: "הכל",   labelHe: "🌍 כולם",   labelEn: "🌍 All" },
                  { v: "חילוני", labelHe: "☀️ חילוני", labelEn: "☀️ Secular" },
                  { v: "דתי",   labelHe: "✡️ דתי",    labelEn: "✡️ Religious" },
                  { v: "חרדי",  labelHe: "🕍 חרדי",   labelEn: "🕍 Haredi" },
                ].map((opt) => {
                  const sel = vProfile.observance === opt.v;
                  return (
                    <button key={opt.v} onClick={() => setVProfile((p) => ({ ...p, observance: opt.v }))}
                      style={{ padding: "8px 16px", borderRadius: 20, border: `1.5px solid ${sel ? "rgba(0,229,232,.55)" : "rgba(255,255,255,.12)"}`, background: sel ? "rgba(0,206,209,.15)" : "rgba(255,255,255,.04)", color: sel ? "#00e5e8" : "rgba(255,255,255,.55)", fontSize: 12, fontWeight: sel ? 700 : 500, cursor: "pointer", fontFamily: "inherit", transition: "all .12s" }}>
                      {isHe ? opt.labelHe : opt.labelEn}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── LAST-MINUTE DEAL ── */}
            <div style={{ background: "rgba(255,68,68,.04)", border: "1px solid rgba(255,68,68,.12)", borderRadius: 14, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>🔥</span>
                <p style={{ color: "#FF6666", fontWeight: 800, fontSize: 13, margin: 0 }}>{isHe ? "מבצע רגע אחרון" : "Last-Minute Deal"}</p>
              </div>
              <p style={{ color: "#555", fontSize: 11, marginBottom: 10 }}>
                {isHe ? "הוסף מבצע לתאריך פתוח — לקוחות יראו אותך ראשון" : "Add a deal for an open date — clients see you first"}
              </p>
              <div style={{ marginBottom: 8 }}>
                <p style={{ color: "#888", fontSize: 11, marginBottom: 4 }}>{isHe ? "תיאור המבצע (לדוג׳ ׳20% הנחה לשישי הקרוב׳)" : "Deal description (e.g. '20% off next Friday')"}</p>
                <input
                  value={dealText}
                  onChange={(e) => setDealText(e.target.value)}
                  placeholder={isHe ? "20% הנחה — שישי 14.6" : "20% off — Friday Jun 14"}
                  maxLength={60}
                  style={{ width: "100%", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none" }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <p style={{ color: "#888", fontSize: 11, marginBottom: 4 }}>{isHe ? "תוקף המבצע" : "Deal expires in"}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {[{ v: 24, l: isHe ? "24 שעות" : "24h" }, { v: 48, l: isHe ? "48 שעות" : "48h" }, { v: 72, l: isHe ? "3 ימים" : "3 days" }, { v: 168, l: isHe ? "שבוע" : "1 week" }].map((opt) => (
                    <button key={opt.v} onClick={() => setDealHours(opt.v)}
                      style={{ padding: "6px 14px", borderRadius: 16, border: dealHours === opt.v ? "1.5px solid rgba(255,68,68,.5)" : "1px solid rgba(255,255,255,.1)", background: dealHours === opt.v ? "rgba(255,68,68,.15)" : "rgba(255,255,255,.04)", color: dealHours === opt.v ? "#FF6666" : "rgba(255,255,255,.55)", fontSize: 11, fontWeight: dealHours === opt.v ? 700 : 500, cursor: "pointer", fontFamily: "inherit" }}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>
              <button
                disabled={!dealText.trim()}
                onClick={async () => {
                  if (!dealText.trim()) return;
                  const deal = { text: dealText.trim(), endsIn: dealHours };
                  const bizName = vProfile.businessName || user?.name || "";
                  setPublishedVendors((p) => p.map((v) => v.name === bizName ? { ...v, deal } : v));
                  showToast(isHe ? "🔥 המבצע פורסם!" : "🔥 Deal published!");
                  // Persist deal to Supabase alongside the full profile
                  const dealVendor: Vendor = { ...previewVendor, deal, catKey: vProfile.category as import("@/types").CatKey, isPublished: published, videoUrl: videoUrl.trim() || undefined, observance: vProfile.observance || undefined };
                  saveVendorProfile(dealVendor).catch(() => {});
                }}
                style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: dealText.trim() ? "linear-gradient(135deg,#FF4444,#cc2200)" : "rgba(255,255,255,.05)", color: dealText.trim() ? "#fff" : "#555", fontWeight: 700, fontSize: 13, cursor: dealText.trim() ? "pointer" : "default", fontFamily: "inherit", transition: "all .12s" }}>
                🔥 {isHe ? "פרסם מבצע" : "Publish Deal"}
              </button>
            </div>

            {/* ── VIDEO ── */}
            <div style={{ background: "rgba(168,85,247,.04)", border: "1px solid rgba(168,85,247,.12)", borderRadius: 14, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>🎥</span>
                <p style={{ color: "#a855f7", fontWeight: 800, fontSize: 13, margin: 0 }}>{isHe ? "סרטון ספק" : "Vendor Reel"}</p>
              </div>
              <p style={{ color: "#555", fontSize: 11, marginBottom: 10 }}>
                {isHe ? "הוסף URL של YouTube / Vimeo / MP4 (15–30 שניות)" : "Add YouTube / Vimeo / MP4 URL (15–30 sec)"}
              </p>
              <input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                dir="ltr"
                style={{ width: "100%", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none" }}
              />
            </div>

            <B style={{ width: "100%", marginBottom: 24 }} onClick={async () => {
              const saveVendor: import("@/types").Vendor = {
                ...previewVendor,
                catKey: vProfile.category as import("@/types").CatKey,
                isPublished: published,
                whatsapp: vProfile.whatsapp,
                phone: vProfile.phone,
                instagram: vProfile.instagram,
                tiktok: vProfile.tiktok,
                website: vProfile.website,
                google: vProfile.google,
                waze: vProfile.waze,
                videoUrl: videoUrl.trim() || undefined,
                deal: dealText.trim() ? { text: dealText.trim(), endsIn: dealHours } : null,
                observance: vProfile.observance || undefined,
              };
              const { error } = await saveVendorProfile(saveVendor);
              showToast(error ? (isHe ? "✅ נשמר (לא מחובר)" : "✅ Saved (offline)") : (isHe ? "✅ הפרופיל נשמר!" : "✅ Profile saved!"));
            }}>{t.saveAll}</B>
          </div>
        )}
      </div>

      {/* Go Live celebration modal */}
      {showGoLive && (
        <VendorGoLiveModal
          vendorName={vProfile.businessName || user?.name || ""}
          publicLink={publicLink}
          isHe={isHe}
          onClose={() => { setShowGoLive(false); setTab("preview"); }}
        />
      )}
    </div>
  );
}
