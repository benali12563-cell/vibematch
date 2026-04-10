"use client";
import { useState } from "react";
import { useApp } from "@/lib/context";
import { CATS, DV, SITE_URL } from "@/lib/constants";

export default function ShareCard() {
  const { lang, likes, eventInfo, budget, publishedVendors } = useApp();
  const isHe = lang === "he";
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const likedCats = CATS.filter((c) =>
    [...(DV[c.k] ?? []), ...publishedVendors.filter((v) => v.catKey === c.k)].some((v) => likes.includes(v.name))
  );
  const totalLiked = likes.length;
  const eventDate = eventInfo.date ? new Date(eventInfo.date).toLocaleDateString(isHe ? "he-IL" : "en-US") : "";
  const days = eventInfo.date ? Math.ceil((new Date(eventInfo.date).getTime() - Date.now()) / 86400000) : null;

  function share() {
    const text = isHe
      ? `🎉 אני מתכנן אירוע עם VibeMatch!\n❤️ ${totalLiked} ספקים שמורים\n📅 ${eventDate ? eventDate : "תאריך בקרוב"}\n\n👉 ${SITE_URL}\n\nבוא/י תעזרי לי לבחור!`
      : `🎉 Planning my event with VibeMatch!\n❤️ ${totalLiked} vendors saved\n📅 ${eventDate || "Date TBD"}\n\n👉 ${SITE_URL}\n\nHelp me choose!`;
    if (navigator.share) {
      navigator.share({ title: "VibeMatch", text });
    } else {
      navigator.clipboard?.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setOpen(false);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} style={{ display: "flex", alignItems: "center", gap: 8, width: "calc(100% - 32px)", margin: "0 16px 12px", padding: "13px 16px", borderRadius: 14, border: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.015)", cursor: "pointer", fontFamily: "inherit", direction: isHe ? "rtl" : "ltr" }}>
        <span style={{ fontSize: 16 }}>✨</span>
        <div style={{ textAlign: isHe ? "right" : "left" }}>
          <p style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{isHe ? "שתף את לוח האירוע שלך" : "Share Your Event Board"}</p>
          <p style={{ color: "#555", fontSize: 11 }}>{isHe ? "הזמן חברים לעזור לבחור ספקים" : "Invite friends to help choose vendors"}</p>
        </div>
        <span style={{ marginRight: isHe ? "auto" : 0, marginLeft: isHe ? 0 : "auto", color: "#00CED1", fontSize: 16 }}>→</span>
      </button>

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", backdropFilter: "blur(10px)", zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: "#0a0a0a", borderRadius: "20px 20px 0 0", border: "1px solid rgba(255,255,255,.07)", padding: "24px 20px 36px", animation: "slideUp .3s ease" }}>
            <div style={{ width: 40, height: 3, background: "rgba(255,255,255,.1)", borderRadius: 2, margin: "0 auto 20px" }} />

            {/* Card preview */}
            <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(0,206,209,.15)", marginBottom: 20, background: "linear-gradient(135deg,#040812,#080d1a)" }}>
              <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", direction: isHe ? "rtl" : "ltr" }}>
                  <div>
                    <p style={{ color: "#555", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>VibeMatch</p>
                    <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>{isHe ? "לוח האירוע שלי" : "My Event Board"}</h3>
                    {eventDate && <p style={{ color: "#00CED1", fontSize: 12, marginTop: 4 }}>📅 {eventDate}{days && days > 0 ? ` · ${days}${isHe ? " ימים" : " days"}` : ""}</p>}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#00CED1", fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{totalLiked}</div>
                    <div style={{ color: "#555", fontSize: 9 }}>{isHe ? "ספקים" : "vendors"}</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: "14px 20px", display: "flex", flexWrap: "wrap", gap: 6, direction: isHe ? "rtl" : "ltr" }}>
                {likedCats.slice(0, 6).map((c) => (
                  <span key={c.k} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 8, background: "rgba(0,206,209,.06)", color: "#00CED1", border: "1px solid rgba(0,206,209,.12)" }}>
                    {isHe ? c.he : c.en}
                  </span>
                ))}
                {likedCats.length === 0 && <span style={{ color: "#444", fontSize: 11 }}>{isHe ? "עדיין בתהליך..." : "Still planning..."}</span>}
              </div>
              <div style={{ padding: "10px 20px 14px", direction: isHe ? "rtl" : "ltr" }}>
                <p style={{ color: "#333", fontSize: 10 }}>{SITE_URL.replace("https://", "")}</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, direction: isHe ? "rtl" : "ltr" }}>
              <button onClick={share} style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#00CED1,#0099aa)", color: "#000", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {copied ? "✓ " : ""}
                {copied ? (isHe ? "הועתק!" : "Copied!") : (isHe ? "📤 שתף עכשיו" : "📤 Share Now")}
              </button>
              <button onClick={() => setOpen(false)} style={{ padding: "14px 18px", borderRadius: 12, border: "1px solid rgba(255,255,255,.08)", background: "transparent", color: "#666", fontFamily: "inherit", cursor: "pointer" }}>
                {isHe ? "סגור" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
