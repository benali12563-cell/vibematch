"use client";
import { useState, useMemo } from "react";
import { useApp } from "@/lib/context";
import { DV, CATS } from "@/lib/constants";
import type { Vendor, CatKey } from "@/types";

const PACK_CATS: CatKey[] = ["venues", "food", "music", "photo", "beauty", "lighting"];

interface Props { onClose: () => void; }

function parsePriceNum(p: string) {
  const m = p.replace(/[₪,]/g, "").match(/\d+/);
  return m ? parseInt(m[0]) : 0;
}

export default function PackageModal({ onClose }: Props) {
  const { lang, vendorAvailability, selectedDate, setSelectedDate, likes, setLikes, showToast, publishedVendors } = useApp();
  const isHe = lang === "he";

  const [date, setDate] = useState(selectedDate || "");
  const [budget, setBudget] = useState("");
  const [generated, setGenerated] = useState(false);

  const budgetNum = useMemo(() => {
    const m = budget.replace(/[₪,\s]/g, "").match(/\d+/);
    return m ? parseInt(m[0]) : 0;
  }, [budget]);

  // Build package: pick best vendor per category within budget + available on date
  const pkg = useMemo(() => {
    if (!generated) return [];
    const allVendors = [
      ...PACK_CATS.flatMap((cat) => DV[cat] ?? []),
      ...publishedVendors,
    ];
    const result: { cat: CatKey; vendor: Vendor }[] = [];
    let remaining = budgetNum > 0 ? budgetNum : 999999;
    const catBudgets: Partial<Record<CatKey, number>> = {
      venues: 0.35, food: 0.25, music: 0.15, photo: 0.12, beauty: 0.08, lighting: 0.05,
    };

    for (const cat of PACK_CATS) {
      const catVendors = allVendors.filter((v) => (v.catKey ?? cat) === cat || DV[cat]?.some((dv) => dv.name === v.name));
      const available = date
        ? catVendors.filter((v) => !(vendorAvailability[v.name] ?? []).includes(date))
        : catVendors;
      if (!available.length) continue;

      const catBudgetRatio = catBudgets[cat] ?? 0.1;
      const catMax = budgetNum > 0 ? budgetNum * catBudgetRatio : 999999;

      // Sort: prefer within budget, then by rating
      const sorted = [...available].sort((a, b) => {
        const ap = parsePriceNum(a.price), bp = parsePriceNum(b.price);
        const aOk = ap <= catMax, bOk = bp <= catMax;
        if (aOk && !bOk) return -1;
        if (!aOk && bOk) return 1;
        return b.rating - a.rating;
      });

      if (sorted[0]) result.push({ cat, vendor: sorted[0] });
    }
    return result;
  }, [generated, date, budgetNum, vendorAvailability, publishedVendors]);

  const totalEstimate = pkg.reduce((s, { vendor }) => s + parsePriceNum(vendor.price), 0);

  function saveAll() {
    const names = pkg.map(({ vendor }) => vendor.name);
    setLikes((p) => [...new Set([...p, ...names])]);
    showToast(isHe ? `❤️ ${names.length} ספקים נשמרו!` : `❤️ ${names.length} vendors saved!`);
    onClose();
  }

  const CAT_ICONS: Record<string, string> = { venues: "🏛️", food: "🍽️", music: "🎵", lighting: "💡", photo: "📸", beauty: "💄" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,.92)", backdropFilter: "blur(20px)", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto", fontFamily: isHe ? "'Heebo'" : "'Manrope','Heebo'", direction: isHe ? "rtl" : "ltr" }}>

      {/* Header */}
      <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div>
            <p style={{ color: "#00CED1", fontWeight: 900, fontSize: 18, margin: 0 }}>✨ {isHe ? "חבילת אירוע אוטומטית" : "Auto Event Package"}</p>
            <p style={{ color: "rgba(255,255,255,.35)", fontSize: 12, margin: "3px 0 0" }}>
              {isHe ? "המערכת בונה את החבילה הכי טובה לך" : "We pick the best combo for your event"}
            </p>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.6)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        {!generated ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "rgba(255,255,255,.5)", fontSize: 11, fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>📅 {isHe ? "תאריך האירוע" : "Event Date"}</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                style={{ width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", color: "rgba(255,255,255,.5)", fontSize: 11, fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>💰 {isHe ? "תקציב כולל (₪)" : "Total Budget (₪)"}</label>
              <input type="text" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder={isHe ? "למשל: 80000" : "e.g. 80000"}
                style={{ width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              {budgetNum > 0 && (
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  {Object.entries({ venues: 0.35, food: 0.25, music: 0.15, photo: 0.12, beauty: 0.08, lighting: 0.05 }).map(([cat, ratio]) => (
                    <span key={cat} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", color: "rgba(255,255,255,.4)" }}>
                      {CAT_ICONS[cat]} ₪{Math.round(budgetNum * ratio).toLocaleString()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Category checklist */}
            <p style={{ color: "rgba(255,255,255,.4)", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>{isHe ? "קטגוריות לחבילה" : "Package Categories"}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 28 }}>
              {PACK_CATS.map((cat) => {
                const c = CATS.find((x) => x.k === cat);
                return (
                  <div key={cat} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 12, background: "rgba(0,206,209,.06)", border: "1px solid rgba(0,206,209,.15)" }}>
                    <span style={{ fontSize: 18 }}>{CAT_ICONS[cat]}</span>
                    <span style={{ color: "#00e5e8", fontSize: 12, fontWeight: 600 }}>{isHe ? c?.he : c?.en}</span>
                    <span style={{ marginInlineStart: "auto", color: "#00CED1", fontSize: 14 }}>✓</span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => { if (date) setSelectedDate(date); setGenerated(true); }}
              style={{ width: "100%", padding: "16px 0", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#00CED1,#008b8b)", color: "#000", fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 24px rgba(0,206,209,.35)" }}
            >
              🚀 {isHe ? "בנה לי חבילה!" : "Build My Package!"}
            </button>
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <p style={{ color: "#fff", fontWeight: 800, fontSize: 16, margin: 0 }}>{isHe ? "החבילה שלך מוכנה 🎉" : "Your Package is Ready 🎉"}</p>
                {date && <p style={{ color: "rgba(255,255,255,.4)", fontSize: 11, margin: "3px 0 0" }}>📅 {date}</p>}
              </div>
              <button onClick={() => setGenerated(false)} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 8, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.5)", cursor: "pointer", fontFamily: "inherit" }}>
                {isHe ? "שנה" : "Change"}
              </button>
            </div>

            {pkg.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>😔</div>
                <p style={{ color: "#666", fontSize: 13 }}>{isHe ? "לא נמצאו ספקים פנויים לתאריך זה" : "No vendors available for this date"}</p>
              </div>
            ) : (
              <>
                {pkg.map(({ cat, vendor }) => (
                  <div key={cat} style={{ background: likes.includes(vendor.name) ? "rgba(0,206,209,.06)" : "rgba(255,255,255,.02)", border: `1px solid ${likes.includes(vendor.name) ? "rgba(0,206,209,.2)" : "rgba(255,255,255,.06)"}`, borderRadius: 14, padding: "13px 15px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{CAT_ICONS[cat]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "#fff", fontWeight: 700, fontSize: 13, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{vendor.name}</p>
                      <p style={{ color: "#666", fontSize: 10, margin: "2px 0 0" }}>⭐ {vendor.rating} · {vendor.city}</p>
                    </div>
                    <div style={{ textAlign: "end", flexShrink: 0 }}>
                      <p style={{ color: "#00CED1", fontWeight: 800, fontSize: 12, margin: 0 }}>{vendor.price}</p>
                      {likes.includes(vendor.name) && <span style={{ color: "#00e5e8", fontSize: 10 }}>❤️ {isHe ? "שמור" : "Saved"}</span>}
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div style={{ background: "rgba(0,206,209,.06)", border: "1px solid rgba(0,206,209,.2)", borderRadius: 14, padding: "13px 15px", marginTop: 4, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "rgba(255,255,255,.6)", fontWeight: 600, fontSize: 13 }}>{isHe ? "סה\"כ משוער" : "Total Estimate"}</span>
                  <span style={{ color: "#00CED1", fontWeight: 900, fontSize: 18 }}>₪{totalEstimate.toLocaleString()}</span>
                </div>

                {budgetNum > 0 && totalEstimate > budgetNum && (
                  <div style={{ background: "rgba(255,68,68,.06)", border: "1px solid rgba(255,68,68,.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#FF6666" }}>
                    ⚠️ {isHe ? `החבילה חורגת ב-₪${(totalEstimate - budgetNum).toLocaleString()} מהתקציב` : `Package exceeds budget by ₪${(totalEstimate - budgetNum).toLocaleString()}`}
                  </div>
                )}

                <button onClick={saveAll} style={{ width: "100%", padding: "16px 0", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#00CED1,#008b8b)", color: "#000", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 24px rgba(0,206,209,.3)", marginBottom: 10 }}>
                  ❤️ {isHe ? `שמור את כל ${pkg.length} הספקים` : `Save All ${pkg.length} Vendors`}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
