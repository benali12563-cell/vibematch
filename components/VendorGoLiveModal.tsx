"use client";
import { useEffect, useState } from "react";
import Logo from "./Logo";

interface Props {
  vendorName: string;
  publicLink: string;
  isHe: boolean;
  onClose: () => void;
}

// CSS-only confetti dots
function Confetti() {
  const dots = Array.from({ length: 28 }, (_, i) => i);
  const colors = ["#00CED1", "#FFD700", "#FF4444", "#a855f7", "#00e5e8", "#fff"];
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {dots.map((i) => {
        const color = colors[i % colors.length];
        const left = `${(i * 37 + 7) % 100}%`;
        const delay = `${(i * 0.13) % 1.4}s`;
        const size = 5 + (i % 5);
        return (
          <div key={i} style={{
            position: "absolute", top: "-10px", left,
            width: size, height: size,
            borderRadius: i % 3 === 0 ? "50%" : "2px",
            background: color,
            animation: `confettiFall ${1.2 + (i % 6) * 0.2}s ${delay} ease-in forwards`,
          }} />
        );
      })}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function VendorGoLiveModal({ vendorName, publicLink, isHe, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  // Auto-dismiss confetti after 4s
  const [showConfetti, setShowConfetti] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(t);
  }, []);

  function copyLink() {
    navigator.clipboard?.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWA() {
    const text = encodeURIComponent(`${isHe ? "הפרופיל שלי ב-VibeMatch 🎉" : "My VibeMatch profile 🎉"}\n${publicLink}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  function shareNative() {
    if (navigator.share) {
      navigator.share({ title: vendorName, text: `${vendorName} | VibeMatch`, url: publicLink });
    } else {
      copyLink();
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.96)", zIndex: 600, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", fontFamily: isHe ? "'Heebo'" : "'Manrope','Heebo'", direction: isHe ? "rtl" : "ltr", textAlign: "center", overflowY: "auto" }}>

      {showConfetti && <Confetti />}

      <div style={{ animation: "scaleIn .5s cubic-bezier(.34,1.56,.64,1)", position: "relative", zIndex: 1, width: "100%", maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ marginBottom: 20 }}><Logo sz={24} /></div>

        {/* Main celebration */}
        <div style={{ fontSize: 72, marginBottom: 8, animation: "scaleIn .6s .1s both" }}>🎉</div>
        <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 900, margin: "0 0 8px", lineHeight: 1.2 }}>
          {isHe ? "הפרופיל שלך חי!" : "You're live!"}
        </h1>
        <p style={{ color: "rgba(255,255,255,.5)", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
          {isHe ? `לקוחות יכולים למצוא אותך עכשיו ב-VibeMatch` : `Clients can now find you on VibeMatch`}
        </p>

        {/* Link display */}
        <div style={{ background: "rgba(0,206,209,.07)", border: "1px solid rgba(0,206,209,.25)", borderRadius: 16, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <span style={{ color: "#00CED1", fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", direction: "ltr", flex: 1, textAlign: "left" }}>
            {publicLink.replace("https://", "")}
          </span>
          <button onClick={copyLink} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 10, border: "1px solid rgba(0,206,209,.35)", background: copied ? "rgba(0,206,209,.2)" : "transparent", color: "#00CED1", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all .15s", whiteSpace: "nowrap" }}>
            {copied ? (isHe ? "✓ הועתק" : "✓ Copied") : (isHe ? "העתק" : "Copy")}
          </button>
        </div>

        {/* Share buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          <button onClick={shareWA}
            style={{ width: "100%", padding: "15px 0", borderRadius: 14, border: "none", background: "#25D366", color: "#fff", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(37,211,102,.3)" }}>
            <span style={{ fontSize: 20 }}>💬</span>
            {isHe ? "שתפו בוואטסאפ" : "Share on WhatsApp"}
          </button>

          <button onClick={shareNative}
            style={{ width: "100%", padding: "15px 0", borderRadius: 14, border: "1px solid rgba(0,206,209,.3)", background: "rgba(0,206,209,.08)", color: "#00e5e8", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>share</span>
            {isHe ? "שיתוף נוסף..." : "More sharing..."}
          </button>
        </div>

        {/* Tips */}
        <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, padding: "14px 16px", marginBottom: 20, textAlign: isHe ? "right" : "left" }}>
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8 }}>
            {isHe ? "טיפים לקבלת לידים מהר" : "Tips for getting leads fast"}
          </p>
          {[
            isHe ? "📲 הוסיפו את הלינק לביו שלכם באינסטגרם" : "📲 Add your link to your Instagram bio",
            isHe ? "💬 שלחו לקבוצות WhatsApp של עמיתים" : "💬 Share in WhatsApp groups",
            isHe ? "📸 הוסיפו 3+ תמונות לפרופיל" : "📸 Add 3+ photos to your profile",
          ].map((tip, i) => (
            <p key={i} style={{ color: "rgba(255,255,255,.55)", fontSize: 12, lineHeight: 1.6, margin: "4px 0" }}>{tip}</p>
          ))}
        </div>

        <button onClick={onClose}
          style={{ width: "100%", padding: "14px 0", borderRadius: 14, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)", color: "rgba(255,255,255,.7)", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
          {isHe ? "עבור לדשבורד שלי ←" : "Go to my dashboard →"}
        </button>
      </div>
    </div>
  );
}
