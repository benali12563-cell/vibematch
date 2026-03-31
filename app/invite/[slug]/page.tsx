"use client";
import { use, useState } from "react";
import Logo from "@/components/Logo";

export default function InvitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const hostName = slug.replace(/-/g, " ");
  const [ans, setAns] = useState<"yes" | "no" | null>(null);
  const [name, setName] = useState("");
  const [count, setCount] = useState("2");
  const [showMarketing, setShowMarketing] = useState(false);

  function confirm(choice: "yes" | "no") {
    if (!name.trim() && choice === "yes") return;
    setAns(choice);
    setTimeout(() => setShowMarketing(true), 1200);
  }

  return (
    <div style={{ minHeight: "100dvh", background: "linear-gradient(180deg,#000 0%,#040812 40%,#000 100%)", fontFamily: "'Heebo','Manrope',sans-serif", direction: "rtl", overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: 420, margin: "0 auto", padding: "0 18px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", paddingTop: 56, paddingBottom: 24 }}>
          <div style={{ width: 50, height: 1, background: "linear-gradient(90deg,transparent,#00CED1,transparent)", margin: "0 auto 18px" }} />
          <p style={{ color: "#444", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", marginBottom: 10 }}>הוזמנתם לחגוג</p>
          <h1 style={{ color: "#fff", fontSize: 34, fontWeight: 900, lineHeight: 1.15, fontFamily: "'Manrope','Heebo',sans-serif", letterSpacing: -1 }}>{hostName}</h1>
          <div style={{ width: 36, height: 1, background: "linear-gradient(90deg,transparent,rgba(0,206,209,.4),transparent)", margin: "16px auto 0" }} />
        </div>

        {/* RSVP form / result */}
        {!ans ? (
          <div className="glass" style={{ borderRadius: 20, padding: 24, marginBottom: 20, animation: "fadeIn .5s" }}>
            <p style={{ color: "rgba(255,255,255,.5)", fontSize: 13, textAlign: "center", marginBottom: 16 }}>נשמח לדעת שאתם מגיעים</p>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="השם שלך" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.04)", color: "#fff", fontSize: 14, fontFamily: "inherit", marginBottom: 12, outline: "none" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 18 }}>
              <span style={{ color: "rgba(255,255,255,.5)", fontSize: 13 }}>כמה מגיעים?</span>
              <div style={{ display: "flex", gap: 5 }}>
                {["1","2","3","4","5+"].map((n) => (
                  <button key={n} onClick={() => setCount(n)} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${count===n ? "#00CED1" : "rgba(255,255,255,.06)"}`, background: count===n ? "rgba(0,206,209,.1)" : "transparent", color: count===n ? "#00CED1" : "rgba(255,255,255,.4)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{n}</button>
                ))}
              </div>
            </div>
            <button onClick={() => confirm("yes")} style={{ width: "100%", padding: "15px 0", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#00CED1,#0099aa)", color: "#000", fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: "inherit", marginBottom: 10 }}>
              ✓ אני מגיע ({count})
            </button>
            <button onClick={() => confirm("no")} style={{ display: "block", width: "100%", background: "none", border: "none", color: "rgba(255,255,255,.3)", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: "8px 0" }}>
              לא הפעם
            </button>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "32px 0 20px", animation: "scaleIn .4s" }}>
            <div style={{ fontSize: 56, marginBottom: 14 }}>{ans === "yes" ? "🎉" : "😢"}</div>
            <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900 }}>{ans === "yes" ? "מחכים לראות אתכם!" : "תודה על העדכון"}</h2>
            <p style={{ color: "rgba(255,255,255,.4)", fontSize: 13, marginTop: 6 }}>
              {ans === "yes" ? `${name} — נרשמת בהצלחה` : "נשמח בפעם הבאה"}
            </p>
          </div>
        )}

        {/* VibeMatch marketing popup */}
        {showMarketing && (
          <div style={{ marginTop: 8, borderRadius: 20, overflow: "hidden", border: "1px solid rgba(0,206,209,.15)", animation: "fadeIn .6s" }}>
            <div style={{ background: "linear-gradient(135deg,rgba(0,206,209,.07),rgba(0,0,0,.6))", padding: "24px 20px 20px", textAlign: "center" }}>
              <div style={{ marginBottom: 12 }}><Logo sz={22} /></div>
              <p style={{ color: "rgba(255,255,255,.5)", fontSize: 11, marginBottom: 10, lineHeight: 1.7 }}>
                {ans === "yes"
                  ? "האישור התקבל בהצלחה. מחכים לראותכם! ✨"
                  : "קיבלנו. מקווים שנתראה בפעם הבאה 🙏"}
              </p>
              <p style={{ color: "rgba(255,255,255,.75)", fontSize: 13, lineHeight: 1.75, fontWeight: 500, marginBottom: 18 }}>
                האירוע מאורגן בסטנדרט הגבוה ביותר באמצעות <strong style={{ color: "#00CED1" }}>VibeMatch</strong>.<br />
                מעוניינים בגישה חופשית למאגר הספקים המובילים וניהול אירוע בראש שקט?
              </p>
              <p style={{ color: "rgba(255,255,255,.45)", fontSize: 12, marginBottom: 20, lineHeight: 1.6 }}>
                הצטרפו למהפכה הדיגיטלית של עולם האירועים — פשטות, דיוק וחיסכון, ללא עלות.
              </p>
              <a href="/" style={{ display: "block", padding: "14px 0", borderRadius: 14, background: "#00CED1", color: "#000", fontWeight: 900, fontSize: 15, textDecoration: "none", textAlign: "center" }}>
                🚀 הצצה לאתר VibeMatch
              </a>
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", padding: "30px 0 50px" }}>
          <p style={{ color: "#222", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Powered by</p>
          <Logo sz={24} />
        </div>
      </div>
    </div>
  );
}
