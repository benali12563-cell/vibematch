"use client";
import { useState } from "react";
import { useApp } from "@/lib/context";
import { SITE_URL } from "@/lib/constants";
import B from "./B";

export default function SwipeTogetherModal({ onClose }: { onClose: () => void }) {
  const { lang, showToast } = useApp();
  const isHe = lang === "he";
  const [copied, setCopied] = useState(false);

  const link = `${SITE_URL}/?partner=1`;

  function copy() {
    navigator.clipboard?.writeText(link);
    setCopied(true);
    showToast(isHe ? "🔗 הלינק הועתק! שלח לשותף" : "🔗 Link copied! Send to partner");
    setTimeout(() => setCopied(false), 3000);
  }

  function wa() {
    const msg = isHe
      ? `היי! אני מתכנן אירוע ב-VibeMatch ורוצה שנחליק ספקים יחד 😍\nלחץ/י על הלינק ונבחר ביחד:\n${link}`
      : `Hey! I'm planning an event on VibeMatch and want us to swipe vendors together 😍\nClick the link and let's choose together:\n${link}`;
    window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank");
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", backdropFilter: "blur(12px)", zIndex: 400, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: "#080808", borderRadius: "22px 22px 0 0", border: "1px solid rgba(255,255,255,.07)", padding: "24px 20px 44px", animation: "slideUp .3s ease", direction: isHe ? "rtl" : "ltr" }}>
        <div style={{ width: 40, height: 3, background: "rgba(255,255,255,.1)", borderRadius: 2, margin: "0 auto 24px" }} />

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>💑</div>
          <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
            {isHe ? "החליקו יחד!" : "Swipe Together!"}
          </h3>
          <p style={{ color: "#555", fontSize: 13, lineHeight: 1.6, maxWidth: 280, margin: "0 auto" }}>
            {isHe
              ? "שלחו לשותף/ת שלכם לינק וגלו אילו ספקים אתם שניכם אוהבים"
              : "Send your partner a link and discover which vendors you both love"}
          </p>
        </div>

        {/* How it works */}
        <div style={{ background: "rgba(255,255,255,.02)", borderRadius: 14, padding: "16px", marginBottom: 20 }}>
          {[
            { n: "1", t: isHe ? "שלחו לינק לשותף" : "Send link to partner", icon: "📤" },
            { n: "2", t: isHe ? "כל אחד מחליק בנפרד" : "Each person swipes separately", icon: "👆" },
            { n: "3", t: isHe ? "רואים איפה אתם מסכימים" : "See where you agree", icon: "💕" },
          ].map((s) => (
            <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: s.n === "3" ? 0 : 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(0,206,209,.08)", border: "1px solid rgba(0,206,209,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: "#00CED1", fontSize: 12, fontWeight: 700 }}>{s.n}</span>
              </div>
              <span style={{ fontSize: 13, color: "#ccc" }}>{s.icon} {s.t}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={wa} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "15px 0", borderRadius: 14, border: "none", background: "#25D366", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
            <span style={{ fontSize: 18 }}>💬</span>
            {isHe ? "שלח ב-WhatsApp" : "Send via WhatsApp"}
          </button>
          <B v="accent" style={{ width: "100%", justifyContent: "center" }} onClick={copy}>
            {copied ? (isHe ? "✓ הועתק!" : "✓ Copied!") : (isHe ? "🔗 העתק לינק" : "🔗 Copy Link")}
          </B>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#444", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: "6px 0" }}>
            {isHe ? "אחר כך" : "Maybe later"}
          </button>
        </div>
      </div>
    </div>
  );
}
