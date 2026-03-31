"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { T, TL_PRESETS, allVendors } from "@/lib/constants";
import Nav from "./Nav";
import AuthBanner from "./AuthBanner";
import B from "./B";
import Inp from "./Inp";

export default function TimelineScreen() {
  const { lang, likes, tlItems, setTlItems } = useApp();
  const t = T[lang];
  const dir = lang === "he" ? "rtl" : "ltr";
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [cL, setCL] = useState("");
  const [cT, setCT] = useState("");

  const team = allVendors().filter((v) => likes.includes(v.name));

  return (
    <div style={{ minHeight: "100dvh", background: "#000", fontFamily: "inherit", direction: dir, padding: "52px 14px 64px" }}>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 48, background: "#000", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, maxWidth: 480, margin: "0 auto" }}>
        <button onClick={() => router.push("/")} style={{ position: "absolute", right: lang === "he" ? 14 : "auto", left: lang === "en" ? 14 : "auto", background: "none", border: "none", color: "#666", fontSize: 16, cursor: "pointer" }}>
          {lang === "he" ? "→" : "←"}
        </button>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{t.timeline}</span>
      </div>
      <AuthBanner />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, marginBottom: 14 }}>
        {TL_PRESETS.filter((p) => !tlItems.some((x) => x.label === p)).map((p) => (
          <button key={p} onClick={() => setTlItems((prev) => [...prev, { label: p, time: "", id: Date.now() + Math.random() }])} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,.06)", background: "transparent", color: "#888", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
            + {p}
          </button>
        ))}
        <button onClick={() => setShowAdd(true)} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(0,206,209,.15)", background: "rgba(0,206,209,.04)", color: "#00CED1", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
          {t.addCustom}
        </button>
      </div>

      {[...tlItems].sort((a, b) => (a.time || "99").localeCompare(b.time || "99")).map((item) => (
        <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <input type="time" value={item.time ?? ""} onChange={(e) => setTlItems((p) => p.map((x) => x.id === item.id ? { ...x, time: e.target.value } : x))} style={{ width: 72, padding: "8px 4px", borderRadius: 8, border: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.02)", color: "#00CED1", fontSize: 13, fontWeight: 600, textAlign: "center", fontFamily: "'Outfit'" }} />
          <div style={{ background: "rgba(255,255,255,.02)", borderRadius: 10, padding: "10px 14px", flex: 1, border: "1px solid rgba(255,255,255,.03)" }}>
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>{item.label}</span>
          </div>
          <button onClick={() => setTlItems((p) => p.filter((x) => x.id !== item.id))} style={{ background: "none", border: "none", color: "#FF4444", fontSize: 14, cursor: "pointer" }}>✕</button>
        </div>
      ))}

      {team.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <p style={{ color: "#666", fontSize: 12, marginBottom: 8 }}>{t.team}</p>
          <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
            {team.map((v) => (
              <div key={v.name} style={{ flexShrink: 0, background: "rgba(255,255,255,.02)", borderRadius: 10, padding: "10px 14px", textAlign: "center", minWidth: 80, border: "1px solid rgba(255,255,255,.03)" }}>
                <div style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>{v.name}</div>
                <div style={{ color: "#666", fontSize: 9 }}>{v.sub}</div>
              </div>
            ))}
          </div>
          <B v="ghost" style={{ width: "100%", marginTop: 12 }} onClick={() => { window.open("https://wa.me/?text=" + encodeURIComponent(["Powered by VibeMatch", "", ...team.map((v) => v.name + " — " + v.sub)].join("\n"))); }}>
            {t.credits}
          </B>
        </div>
      )}

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 200, display: "flex", alignItems: "flex-end" }} onClick={() => setShowAdd(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", background: "#111", borderRadius: "16px 16px 0 0", padding: "22px 16px 32px" }}>
            <Inp value={cL} onChange={setCL} placeholder={lang === "he" ? "שם השלב" : "Step"} style={{ marginBottom: 8 }} />
            <input type="time" value={cT} onChange={(e) => setCT(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.02)", color: "#fff", fontSize: 14, marginBottom: 8 }} />
            <B style={{ width: "100%" }} onClick={() => { if (cL) { setTlItems((p) => [...p, { label: cL, time: cT, id: Date.now() }]); setCL(""); setCT(""); setShowAdd(false); } }}>{t.save}</B>
          </div>
        </div>
      )}

      <Nav />
    </div>
  );
}
