"use client";
import { useState } from "react";
import Logo from "@/components/Logo";
import B from "@/components/B";
import Inp from "@/components/Inp";

import { use } from "react";

export default function InvitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const hostName = slug.replace(/-/g, " ");
  const [ans, setAns] = useState<"yes" | "no" | null>(null);
  const [name, setName] = useState("");
  const [count, setCount] = useState("2");

  return (
    <div style={{ minHeight: "100dvh", background: "linear-gradient(180deg,#000 0%,#040812 30%,#0a1020 60%,#000 100%)", fontFamily: "'Heebo','Outfit',sans-serif", direction: "rtl", overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: 420, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ textAlign: "center", paddingTop: 50, paddingBottom: 20 }}>
          <div style={{ width: 60, height: 1, background: "linear-gradient(90deg,transparent,#00CED1,transparent)", margin: "0 auto 20px" }} />
          <p style={{ color: "#555", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", fontFamily: "'Outfit'", marginBottom: 12 }}>הוזמנתם לחגוג איתנו</p>
          <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 900, lineHeight: 1.2, fontFamily: "'Outfit'" }}>{hostName}</h1>
          <div style={{ width: 40, height: 1, background: "linear-gradient(90deg,transparent,rgba(0,206,209,.4),transparent)", margin: "16px auto" }} />
        </div>

        {!ans ? (
          <div style={{ background: "rgba(255,255,255,.02)", borderRadius: 16, padding: 24, border: "1px solid rgba(255,255,255,.06)", marginBottom: 20, animation: "fadeIn .6s" }}>
            <p style={{ color: "#888", fontSize: 13, textAlign: "center", marginBottom: 14 }}>נשמח לדעת שאתם מגיעים</p>
            <Inp value={name} onChange={setName} placeholder="השם שלך" style={{ marginBottom: 10 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 14 }}>
              <span style={{ color: "#666", fontSize: 13 }}>כמה מגיעים?</span>
              <div style={{ display: "flex", gap: 4 }}>
                {["1", "2", "3", "4", "5+"].map((n) => (
                  <button key={n} onClick={() => setCount(n)} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${count === n ? "#00CED1" : "rgba(255,255,255,.06)"}`, background: count === n ? "rgba(0,206,209,.08)" : "transparent", color: count === n ? "#00CED1" : "#555", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>{n}</button>
                ))}
              </div>
            </div>
            <B style={{ width: "100%", padding: "14px 0", fontSize: 16, borderRadius: 12 }} onClick={() => name && setAns("yes")}>
              אני מגיע ({count})
            </B>
            <button onClick={() => setAns("no")} style={{ display: "block", width: "100%", marginTop: 10, background: "none", border: "none", color: "#555", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: "10px 0" }}>
              לא הפעם
            </button>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 0", animation: "scaleIn .4s" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>{ans === "yes" ? "🎉" : "😢"}</div>
            <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>תודה רבה!</h2>
            <p style={{ color: "#666", fontSize: 13, marginTop: 8 }}>
              {ans === "yes" ? "נתראה באירוע" : "נשמח בפעם הבאה"}
            </p>
          </div>
        )}

        <div style={{ textAlign: "center", padding: "30px 0 40px" }}>
          <p style={{ color: "#333", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6, fontFamily: "'Outfit'" }}>Powered by</p>
          <Logo sz={26} />
        </div>
      </div>
    </div>
  );
}
