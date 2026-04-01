"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { T, allVendors } from "@/lib/constants";
import Nav from "./Nav";
import AuthBanner from "./AuthBanner";
import B from "./B";
import Inp from "./Inp";
import Logo from "./Logo";

export default function GuestsScreen() {
  const { lang, user, likes, eventInfo, setEventInfo } = useApp();
  const t = T[lang];
  const dir = lang === "he" ? "rtl" : "ltr";
  const router = useRouter();

  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [ans, setAns] = useState<"yes" | "no" | null>(null);
  const [gN, setGN] = useState("");
  const [gC, setGC] = useState("2");
  const [editInfo, setEditInfo] = useState(false);
  const team = allVendors().filter((v) => likes.includes(v.name));

  if (showPreview) {
    return (
      <div style={{ minHeight: "100dvh", background: "linear-gradient(180deg,#000 0%,#040812 30%,#0a1020 60%,#000 100%)", fontFamily: "inherit", direction: dir, overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: 420, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ textAlign: "center", paddingTop: 50, paddingBottom: 20 }}>
            <div style={{ width: 60, height: 1, background: "linear-gradient(90deg,transparent,#00CED1,transparent)", margin: "0 auto 20px" }} />
            <p style={{ color: "#555", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", fontFamily: "'Outfit'", marginBottom: 12 }}>{lang === "he" ? "הוזמנתם לחגוג איתנו" : "YOU'RE INVITED"}</p>
            <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 900, lineHeight: 1.2, fontFamily: "'Outfit'" }}>{user?.name ?? "—"}</h1>
            <div style={{ width: 40, height: 1, background: "linear-gradient(90deg,transparent,rgba(0,206,209,.4),transparent)", margin: "16px auto" }} />
            {eventInfo.date && <p style={{ color: "#00CED1", fontSize: 16, fontWeight: 600, letterSpacing: 1 }}>{eventInfo.date}</p>}
            {eventInfo.address && <p style={{ color: "#888", fontSize: 14, marginTop: 8 }}>{eventInfo.address}</p>}
          </div>

          {!ans ? (
            <div style={{ background: "rgba(255,255,255,.02)", borderRadius: 16, padding: 24, border: "1px solid rgba(255,255,255,.06)", marginBottom: 20, animation: "fadeIn .6s" }}>
              <p style={{ color: "#888", fontSize: 13, textAlign: "center", marginBottom: 14 }}>{lang === "he" ? "נשמח לדעת שאתם מגיעים" : "Let us know you're coming"}</p>
              <Inp value={gN} onChange={setGN} placeholder={t.yourName} style={{ marginBottom: 10, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 14 }}>
                <span style={{ color: "#666", fontSize: 13 }}>{t.howMany}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  {["1", "2", "3", "4", "5+"].map((n) => (
                    <button key={n} onClick={() => setGC(n)} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${gC === n ? "#00CED1" : "rgba(255,255,255,.06)"}`, background: gC === n ? "rgba(0,206,209,.08)" : "transparent", color: gC === n ? "#00CED1" : "#555", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>{n}</button>
                  ))}
                </div>
              </div>
              <B style={{ width: "100%", padding: "14px 0", fontSize: 16, borderRadius: 12 }} onClick={() => setAns("yes")}>{t.coming} ({gC})</B>
              <button onClick={() => setAns("no")} style={{ display: "block", width: "100%", marginTop: 10, background: "none", border: "none", color: "#555", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: "10px 0" }}>{t.notComing}</button>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "30px 0", animation: "scaleIn .4s" }}>
              <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>{t.thanks}</h2>
              <p style={{ color: "#666", fontSize: 13, marginTop: 4 }}>{ans === "yes" ? (lang === "he" ? "נתראה באירוע" : "See you there") : (lang === "he" ? "נשמח בפעם הבאה" : "Maybe next time")}</p>
            </div>
          )}

          {ans === "yes" && team.length > 0 && (
            <div style={{ animation: "fadeIn .5s ease .2s both", marginBottom: 20 }}>
              <p style={{ color: "#666", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", textAlign: "center", marginBottom: 12, fontFamily: "'Outfit'" }}>{t.meetTeam}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {team.map((v) => (
                  <div key={v.name} style={{ background: "rgba(255,255,255,.02)", borderRadius: 12, padding: "14px 12px", textAlign: "center", border: "1px solid rgba(255,255,255,.04)" }}>
                    <p style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{v.name}</p>
                    <p style={{ color: "#00CED1", fontSize: 10, marginTop: 2 }}>{v.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ textAlign: "center", padding: "30px 0 40px" }}>
            <p style={{ color: "#333", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6, fontFamily: "'Outfit'" }}>Powered by</p>
            <Logo sz={28} />
          </div>

          <div style={{ position: "fixed", top: 14, right: lang === "he" ? 14 : "auto", left: lang === "en" ? 14 : "auto" }}>
            <button onClick={() => { setShowPreview(false); setAns(null); }} style={{ background: "rgba(0,0,0,.5)", border: "1px solid rgba(255,255,255,.1)", color: "#888", fontSize: 14, cursor: "pointer", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {lang === "he" ? "→" : "←"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#000", fontFamily: "inherit", direction: dir, padding: "52px 14px 64px" }}>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 48, background: "#000", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, maxWidth: 480, margin: "0 auto" }}>
        <button onClick={() => router.push("/")} style={{ position: "absolute", right: lang === "he" ? 14 : "auto", left: lang === "en" ? 14 : "auto", background: "none", border: "none", color: "#666", fontSize: 16, cursor: "pointer" }}>
          {lang === "he" ? "→" : "←"}
        </button>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{t.hosting}</span>
      </div>
      <AuthBanner />

      <div style={{ marginTop: 8, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <p style={{ color: "#888", fontSize: 13, fontWeight: 600 }}>{t.eventDetails}</p>
          <B s="sm" v="ghost" onClick={() => setEditInfo(!editInfo)} style={{ padding: "4px 12px", fontSize: 11 }}>{editInfo ? t.save : "✏️"}</B>
        </div>
        {editInfo ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Inp value={eventInfo.address} onChange={(v) => setEventInfo((p) => ({ ...p, address: v }))} placeholder={t.eventAddress} />
            <Inp value={eventInfo.wazeLink} onChange={(v) => setEventInfo((p) => ({ ...p, wazeLink: v }))} placeholder="Waze link" dir="ltr" />
            <Inp value={eventInfo.date} onChange={(v) => setEventInfo((p) => ({ ...p, date: v }))} placeholder={t.eventDate} />
            <Inp value={eventInfo.notes} onChange={(v) => setEventInfo((p) => ({ ...p, notes: v }))} placeholder={t.eventNotes} />
          </div>
        ) : (
          <div style={{ background: "rgba(255,255,255,.02)", borderRadius: 10, padding: 12, border: "1px solid rgba(255,255,255,.04)" }}>
            {eventInfo.address ? <p style={{ color: "#aaa", fontSize: 12 }}>{eventInfo.address}</p> : <p style={{ color: "#444", fontSize: 12 }}>{lang === "he" ? "לחצו עריכה להוסיף פרטים" : "Click edit to add details"}</p>}
            {eventInfo.date && <p style={{ color: "#666", fontSize: 11, marginTop: 2 }}>{eventInfo.date}</p>}
          </div>
        )}
      </div>

      <p style={{ color: "#555", fontSize: 13, marginBottom: 10 }}>{t.sendGuests}</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <B style={{ flex: 1 }} onClick={() => {
          const link = "https://vibematch.co.il/invite/" + (user?.name ?? "guest").replace(/\s/g, "-");
          navigator.clipboard?.writeText(link);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}>{copied ? t.copied : t.guestLink}</B>
        <B v="ghost" style={{ flex: 1 }} onClick={() => setShowPreview(true)}>{t.previewGuest}</B>
      </div>

      <div style={{ padding: 18, background: "rgba(255,255,255,.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,.04)" }}>
        <div style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>0</div>
        <div style={{ color: "#555", fontSize: 11 }}>{t.confirmed}</div>
      </div>

      <Nav />
    </div>
  );
}
