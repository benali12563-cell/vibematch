"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { T, CATS, NICHE_FIELDS } from "@/lib/constants";
import B from "./B";
import Inp from "./Inp";
import Logo from "./Logo";
import VLinks from "./VLinks";
import AvailabilityCalendar from "./AvailabilityCalendar";
import type { Vendor } from "@/types";

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
  const { lang, user, setUser, vGallery, setVGallery, vPic, setVPic, vAbout, setVAbout, vProfile, setVProfile, showToast } = useApp();
  const t = T[lang];
  const dir = lang === "he" ? "rtl" : "ltr";
  const router = useRouter();

  // All hooks MUST come before any early return
  const [tab, setTab] = useState<"preview" | "edit" | "calendar">("preview");
  const [coupon, setCoupon] = useState("");
  const [pIdx, setPIdx] = useState(0);
  const [invC, setInvC] = useState(false);
  const [published, setPublished] = useState(false);
  const [vendorName, setVendorName] = useState("");
  const [vendorPin, setVendorPin] = useState("");
  const fRef = useRef<HTMLInputElement>(null);
  const pRef = useRef<HTMLInputElement>(null);

  const isHe = lang === "he";
  const nicheFields = vProfile.category ? (NICHE_FIELDS[vProfile.category] ?? []) : [];
  const publicLink = typeof window !== "undefined"
    ? `${window.location.origin}/v/${encodeURIComponent((vProfile.businessName || user?.name || "").replace(/\s+/g, "-"))}`
    : "";

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
            if (vendorPin.length < 4) { showToast(isHe ? "קוד חייב להיות 4 ספרות" : "Code must be 4 digits"); return; }
            setUser({ name: vendorName.trim(), role: "vendor" });
          }}>
            {isHe ? "כניסה לפאנל ספק" : "Enter Vendor Panel"}
          </B>
          <p style={{ color: "#2a2a2a", fontSize: 10, textAlign: "center", marginTop: 4 }}>
            {isHe ? "קוד: 1234 לדמו" : "Code: 1234 for demo"}
          </p>
        </div>
      </div>
    );
  }

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
    niche: {},
    deal: null,
    recommends: [],
    vendorReviews: [],
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#000", fontFamily: "inherit", direction: dir }}>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 48, background: "#000", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", zIndex: 100, maxWidth: 480, margin: "0 auto" }}>
        <button onClick={() => router.push("/")} style={{ background: "none", border: "none", color: "#555", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>home</span>
          {isHe ? "בית" : "Home"}
        </button>
        <Logo sz={18} />
        <button onClick={() => {
          setPublished(true);
          showToast(isHe ? "✅ הפרופיל פורסם! לקוחות רואים אותך" : "✅ Published! Clients can see you");
          if (publicLink) setTimeout(() => { navigator.clipboard?.writeText(publicLink); }, 500);
        }} style={{ background: published ? "rgba(0,206,209,.15)" : "#00CED1", border: published ? "1px solid #00CED1" : "none", color: published ? "#00CED1" : "#000", borderRadius: 10, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
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
          {(["preview", "edit", "calendar"] as const).map((tb) => (
            <button key={tb} onClick={() => setTab(tb)} style={{ flex: 1, padding: "12px 0", background: "none", border: "none", color: tab === tb ? "#00CED1" : "#555", fontSize: 13, fontWeight: 600, cursor: "pointer", borderBottom: tab === tb ? "2px solid #00CED1" : "2px solid transparent" }}>
              {tb === "preview" ? t.preview : tb === "edit" ? t.editProfile : (isHe ? "יומן" : "Calendar")}
            </button>
          ))}
        </div>

        {tab === "preview" && (
          <div style={{ animation: "fadeIn .3s" }}>
            <div style={{ padding: "10px 14px 0", display: "flex", gap: 8, direction: dir }}>
              <B s="sm" v="ghost" style={{ flex: 1 }} onClick={() => router.push("/")}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
                {isHe ? "דפדף כלקוח" : "Browse as client"}
              </B>
              {publicLink && (
                <B s="sm" v="accent" style={{ flex: 1 }} onClick={() => { navigator.clipboard?.writeText(publicLink); showToast(isHe ? "🔗 לינק הועתק!" : "🔗 Link copied!"); }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>link</span>
                  {isHe ? "העתק לינק" : "Copy link"}
                </B>
              )}
            </div>
            <p style={{ color: "#555", fontSize: 12, padding: "8px 16px 0" }}>{isHe ? "ככה הלקוחות רואים אותך:" : "How clients see you:"}</p>
            <div style={{ margin: "8px 14px", height: 400, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,.04)", position: "relative", background: "#0a0a0a" }}>
              {vGallery.length > 0 ? (
                <>
                  <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
                    <img src={vGallery[pIdx % vGallery.length]?.src} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                  </div>
                  {vGallery.length > 1 && (
                    <>
                      <div onClick={() => setPIdx((i) => Math.max(0, i - 1))} style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "40%", cursor: "pointer", zIndex: 2 }} />
                      <div onClick={() => setPIdx((i) => Math.min(vGallery.length - 1, i + 1))} style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "40%", cursor: "pointer", zIndex: 2 }} />
                    </>
                  )}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "50px 16px 14px", background: "linear-gradient(to top,rgba(0,0,0,.95) 50%,transparent)", zIndex: 3 }}>
                    <h3 style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>{previewVendor.name}</h3>
                    {vProfile.businessPrice && <span style={{ color: "#00CED1", fontSize: 15, fontWeight: 600 }}>{vProfile.businessPrice}</span>}
                    {vAbout && <p style={{ color: "#bbb", fontSize: 12, marginTop: 4, maxHeight: 32, overflow: "hidden" }}>{vAbout}</p>}
                    <VLinks vendor={previewVendor} />
                  </div>
                </>
              ) : (
                <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#333", fontSize: 36 }}>+</span>
                  <p style={{ color: "#444", fontSize: 12, marginTop: 8 }}>{lang === "he" ? "העלו תמונות בעריכה" : "Upload in Edit"}</p>
                </div>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, padding: "10px 14px" }}>
              {[{ l: lang === "he" ? "צפיות" : "Views", v: 0 }, { l: lang === "he" ? "לייקים" : "Likes", v: 0 }, { l: lang === "he" ? "התאמות" : "Matches", v: 0 }, { l: lang === "he" ? "הצעות" : "Quotes", v: 0 }].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,.02)", borderRadius: 10, padding: "10px 6px", textAlign: "center", border: "1px solid rgba(255,255,255,.03)" }}>
                  <div style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>{s.v}</div>
                  <div style={{ color: "#555", fontSize: 9 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: "8px 14px" }}>
              <B v="fire" style={{ width: "100%" }} onClick={() => { navigator.clipboard?.writeText("https://vibematch.co.il/join"); setInvC(true); setTimeout(() => setInvC(false), 2000); }}>
                {invC ? t.linkCopied : t.inviteBoost}
              </B>
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

        {tab === "edit" && (
          <div style={{ padding: "10px 14px", overflowY: "auto", maxHeight: "calc(100dvh - 96px)" }}>
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
                  <button onClick={() => setVGallery((p) => p.filter((x) => x.id !== g.id))} style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,.6)", border: "none", color: "#FF4444", fontSize: 10, cursor: "pointer", width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
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
                {nicheFields.map((f) => (
                  <div key={f.k} style={{ marginBottom: 10 }}>
                    <p style={{ color: "#888", fontSize: 11, marginBottom: 4 }}>{f.l}</p>
                    {f.opts ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {f.opts.map((o) => {
                          const sel = vProfile[f.k] === o;
                          return <button key={o} onClick={() => setVProfile((p) => ({ ...p, [f.k]: o }))} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${sel ? "#00CED1" : "rgba(255,255,255,.06)"}`, background: sel ? "rgba(0,206,209,.08)" : "transparent", color: sel ? "#00CED1" : "#888", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>{o}</button>;
                        })}
                      </div>
                    ) : (
                      <Inp value={vProfile[f.k] ?? ""} onChange={(v) => setVProfile((p) => ({ ...p, [f.k]: v }))} placeholder="..." />
                    )}
                  </div>
                ))}
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
            <Inp value={coupon} onChange={setCoupon} style={{ marginBottom: 12 }} />

            <B style={{ width: "100%", marginBottom: 24 }} onClick={() => showToast(t.saved)}>{t.saveAll}</B>
          </div>
        )}
      </div>
    </div>
  );
}
