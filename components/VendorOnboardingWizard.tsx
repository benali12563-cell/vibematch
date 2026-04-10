"use client";
import { useRef, useState } from "react";
import { useApp } from "@/lib/context";
import { CATS } from "@/lib/constants";
import Logo from "./Logo";
import type { CatKey, GalleryItem } from "@/types";

const CAT_ICONS: Record<string, string> = {
  venues: "🏛️", food: "🍽️", music: "🎵", lighting: "💡",
  photo: "📸", beauty: "💄", entertainment: "🎪", design: "🎨",
  logistics: "🚌", ceremony: "💒", digital: "📱",
};

interface Props {
  isHe: boolean;
  onComplete: () => void;
}

export default function VendorOnboardingWizard({ isHe, onComplete }: Props) {
  const { vProfile, setVProfile, vGallery, setVGallery } = useApp();
  const [step, setStep] = useState(1);
  const [localName, setLocalName] = useState(vProfile.businessName || "");
  const [localPrice, setLocalPrice] = useState(vProfile.businessPrice || "");
  const [localCity, setLocalCity] = useState(vProfile.city || "");
  const [localCat, setLocalCat] = useState<CatKey | "">(vProfile.category || "");
  const fileRef = useRef<HTMLInputElement>(null);

  const total = 3;
  const pct = ((step - 1) / total) * 100;

  function pickCat(k: CatKey) {
    setLocalCat(k);
    setVProfile((p) => ({ ...p, category: k }));
    setTimeout(() => setStep(2), 220);
  }

  function goStep2() {
    if (!localName.trim()) return;
    setVProfile((p) => ({ ...p, businessName: localName.trim(), businessPrice: localPrice.trim(), city: localCity.trim() }));
    setStep(3);
  }

  function addPhoto(files: FileList | null) {
    if (!files) return;
    Array.from(files).slice(0, 3).forEach((f) => {
      const r = new FileReader();
      r.onload = (ev) => {
        setVGallery((p: GalleryItem[]) => p.length < 5 ? [...p, { id: Date.now() + Math.random(), src: ev.target?.result as string }] : p);
      };
      r.readAsDataURL(f);
    });
  }

  function finish() {
    setVProfile((p) => ({ ...p, businessName: localName.trim(), businessPrice: localPrice.trim(), category: localCat }));
    onComplete();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 500, display: "flex", flexDirection: "column", fontFamily: isHe ? "'Heebo'" : "'Manrope','Heebo'", direction: isHe ? "rtl" : "ltr", overflowY: "auto" }}>

      {/* Top bar */}
      <div style={{ padding: "18px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo sz={20} />
        <span style={{ color: "#555", fontSize: 12 }}>{step}/{total}</span>
      </div>

      {/* Progress bar */}
      <div style={{ margin: "14px 20px 0", height: 3, background: "rgba(255,255,255,.06)", borderRadius: 4 }}>
        <div style={{ height: "100%", width: `${pct + 33}%`, background: "linear-gradient(90deg,#00CED1,#00e5e8)", borderRadius: 4, transition: "width .4s ease" }} />
      </div>

      <div style={{ flex: 1, padding: "28px 20px 40px" }}>

        {/* ── Step 1: Category ── */}
        {step === 1 && (
          <div style={{ animation: "fadeIn .3s" }}>
            <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, marginBottom: 6, lineHeight: 1.2 }}>
              {isHe ? "מה סוג השירות שלך?" : "What do you offer?"}
            </h1>
            <p style={{ color: "#555", fontSize: 14, marginBottom: 28 }}>
              {isHe ? "בחרו קטגוריה אחת — תוכלו לשנות אח\"כ" : "Pick one — you can change later"}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {CATS.map((c) => {
                const active = localCat === c.k;
                return (
                  <button key={c.k} onClick={() => pickCat(c.k)}
                    style={{ padding: "18px 8px", borderRadius: 18, border: active ? "2px solid #00CED1" : "1px solid rgba(255,255,255,.08)", background: active ? "rgba(0,206,209,.12)" : "rgba(255,255,255,.03)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "all .15s", fontFamily: "inherit", boxShadow: active ? "0 0 20px rgba(0,206,209,.25)" : "none" }}>
                    <span style={{ fontSize: 32 }}>{CAT_ICONS[c.k]}</span>
                    <span style={{ color: active ? "#00e5e8" : "rgba(255,255,255,.65)", fontSize: 11, fontWeight: active ? 800 : 500, textAlign: "center", lineHeight: 1.3 }}>{isHe ? c.he : c.en}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 2: Business Info ── */}
        {step === 2 && (
          <div style={{ animation: "fadeIn .3s" }}>
            <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, marginBottom: 6 }}>
              {isHe ? "ספרו עליכם" : "Tell us about you"}
            </h1>
            <p style={{ color: "#555", fontSize: 14, marginBottom: 28 }}>
              {isHe ? "3 שדות בלבד — 30 שניות" : "3 fields only — 30 seconds"}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ color: "rgba(255,255,255,.4)", fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  {isHe ? "שם העסק" : "Business Name"} *
                </label>
                <input
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && goStep2()}
                  placeholder={isHe ? "לדוגמה: DJ אייל" : "e.g. DJ Eyal"}
                  autoFocus
                  style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: `1.5px solid ${localName.trim() ? "rgba(0,206,209,.4)" : "rgba(255,255,255,.1)"}`, background: "rgba(255,255,255,.04)", color: "#fff", fontSize: 16, fontFamily: "inherit", outline: "none", transition: "border-color .15s" }}
                />
              </div>

              <div>
                <label style={{ color: "rgba(255,255,255,.4)", fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  {isHe ? "מחיר (מה הלקוח יראה)" : "Price (what clients see)"}
                </label>
                <input
                  value={localPrice}
                  onChange={(e) => setLocalPrice(e.target.value)}
                  placeholder={isHe ? "לדוגמה: ₪3,000–₪8,000 לאירוע" : "e.g. ₪3,000–₪8,000/event"}
                  dir="rtl"
                  style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)", color: "#fff", fontSize: 15, fontFamily: "inherit", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ color: "rgba(255,255,255,.4)", fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  {isHe ? "עיר" : "City"}
                </label>
                <input
                  value={localCity}
                  onChange={(e) => setLocalCity(e.target.value)}
                  placeholder={isHe ? "תל אביב" : "Tel Aviv"}
                  style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)", color: "#fff", fontSize: 15, fontFamily: "inherit", outline: "none" }}
                />
              </div>
            </div>

            <button
              onClick={goStep2}
              disabled={!localName.trim()}
              style={{ marginTop: 28, width: "100%", padding: "16px 0", borderRadius: 16, border: "none", background: localName.trim() ? "linear-gradient(160deg,#00e5e8,#00CED1)" : "rgba(255,255,255,.06)", color: localName.trim() ? "#000" : "#555", fontWeight: 900, fontSize: 16, cursor: localName.trim() ? "pointer" : "default", fontFamily: "inherit", boxShadow: localName.trim() ? "0 8px 28px rgba(0,206,209,.4)" : "none", transition: "all .15s" }}>
              {isHe ? "המשך ←" : "Continue →"}
            </button>
            <button onClick={() => setStep(1)} style={{ display: "block", width: "100%", marginTop: 10, background: "none", border: "none", color: "#444", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: "8px 0" }}>
              {isHe ? "→ חזרה" : "← Back"}
            </button>
          </div>
        )}

        {/* ── Step 3: Photo ── */}
        {step === 3 && (
          <div style={{ animation: "fadeIn .3s" }}>
            <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, marginBottom: 6 }}>
              {isHe ? "הוסיפו תמונה" : "Add a photo"}
            </h1>
            <p style={{ color: "#555", fontSize: 14, marginBottom: 24 }}>
              {isHe ? "תמונה אחת מספיקה להתחלה. תוכלו להוסיף עוד אח\"כ." : "One photo is enough to start. Add more later."}
            </p>

            <input ref={fileRef} type="file" accept="image/*" multiple onChange={(e) => addPhoto(e.target.files)} style={{ display: "none" }} />

            {vGallery.length === 0 ? (
              <div onClick={() => fileRef.current?.click()}
                style={{ height: 220, borderRadius: 20, border: "2px dashed rgba(0,206,209,.3)", background: "rgba(0,206,209,.03)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, cursor: "pointer", marginBottom: 24, transition: "all .2s" }}>
                <span style={{ fontSize: 52 }}>📸</span>
                <p style={{ color: "rgba(255,255,255,.5)", fontSize: 14, textAlign: "center", lineHeight: 1.5 }}>
                  {isHe ? "לחצו להעלאת תמונה" : "Tap to upload photo"}
                </p>
                <span style={{ padding: "6px 20px", borderRadius: 20, border: "1px solid rgba(0,206,209,.4)", color: "#00CED1", fontSize: 13, fontWeight: 700 }}>
                  {isHe ? "בחרו תמונה" : "Choose photo"}
                </span>
              </div>
            ) : (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  {vGallery.map((g) => (
                    <div key={g.id} style={{ width: 100, height: 100, borderRadius: 12, overflow: "hidden", border: "2px solid rgba(0,206,209,.4)", position: "relative" }}>
                      <img src={g.src} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                      <button onClick={() => setVGallery((p: GalleryItem[]) => p.filter((x) => x.id !== g.id))}
                        style={{ position: "absolute", top: 3, right: 3, background: "rgba(0,0,0,.7)", border: "none", color: "#FF4444", fontSize: 10, cursor: "pointer", width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                    </div>
                  ))}
                  {vGallery.length < 5 && (
                    <div onClick={() => fileRef.current?.click()} style={{ width: 100, height: 100, borderRadius: 12, border: "1.5px dashed rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <span style={{ color: "#555", fontSize: 28 }}>+</span>
                    </div>
                  )}
                </div>
                <p style={{ color: "#00CED1", fontSize: 12, fontWeight: 700 }}>✓ {isHe ? `${vGallery.length} תמונות נבחרו` : `${vGallery.length} photo(s) selected`}</p>
              </div>
            )}

            <button onClick={finish}
              style={{ width: "100%", padding: "16px 0", borderRadius: 16, border: "none", background: "linear-gradient(160deg,#00e5e8,#00CED1)", color: "#000", fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 28px rgba(0,206,209,.4)" }}>
              {vGallery.length > 0 ? (isHe ? "🚀 בנו את הפרופיל שלי!" : "🚀 Build my profile!") : (isHe ? "דלגו — אוסיף אח\"כ ←" : "Skip — add later →")}
            </button>
            <button onClick={() => setStep(2)} style={{ display: "block", width: "100%", marginTop: 10, background: "none", border: "none", color: "#444", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: "8px 0" }}>
              {isHe ? "→ חזרה" : "← Back"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
