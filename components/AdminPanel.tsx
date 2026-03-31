"use client";
import { useApp } from "@/lib/context";
import { useRouter } from "next/navigation";
import { T } from "@/lib/constants";
import B from "./B";

export default function AdminPanel() {
  const { lang, user } = useApp();
  const t = T[lang];
  const router = useRouter();
  const dir = lang === "he" ? "rtl" : "ltr";
  const isHe = lang === "he";

  if (!user?.is_admin) {
    return (
      <div style={{ minHeight: "100dvh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", direction: dir }}>
        <p style={{ color: "#FF4444", fontSize: 14 }}>{isHe ? "אין גישה" : "Access denied"}</p>
      </div>
    );
  }

  const sections = [
    { label: isHe ? "משתמשים" : "Users", icon: "👤", count: "—" },
    { label: isHe ? "ספקים" : "Vendors", icon: "🏢", count: "—" },
    { label: isHe ? "אירועים" : "Events", icon: "🎉", count: "—" },
    { label: isHe ? "לייקים" : "Likes", icon: "❤️", count: "—" },
  ];

  return (
    <div style={{ minHeight: "100dvh", background: "#000", fontFamily: "inherit", direction: dir, padding: "52px 14px 32px" }}>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 48, background: "#000", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", zIndex: 100, maxWidth: 480, margin: "0 auto" }}>
        <button onClick={() => router.push("/")} style={{ background: "none", border: "none", color: "#555", fontSize: 16, cursor: "pointer" }}>
          {isHe ? "→" : "←"}
        </button>
        <span style={{ color: "#00CED1", fontWeight: 700, fontSize: 15 }}>{t.adminPanel}</span>
        <span style={{ color: "#333", fontSize: 10 }}>ADMIN</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {sections.map((s) => (
          <div key={s.label} style={{ background: "rgba(255,255,255,.02)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,.04)", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>{s.count}</div>
            <div style={{ color: "#555", fontSize: 11, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <p style={{ color: "#666", fontSize: 12, marginBottom: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
          {isHe ? "פעולות מהירות" : "Quick Actions"}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: isHe ? "נהל משתמשים" : "Manage Users", icon: "👤" },
            { label: isHe ? "נהל ספקים" : "Manage Vendors", icon: "🏢" },
            { label: isHe ? "ייצא נתונים" : "Export Data", icon: "📊" },
            { label: isHe ? "שלח הודעה לכולם" : "Broadcast Message", icon: "📢" },
          ].map((a) => (
            <button key={a.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,.04)", background: "rgba(255,255,255,.02)", cursor: "pointer", color: "#ccc", fontSize: 14, fontFamily: "inherit", textAlign: isHe ? "right" : "left" }}>
              <span style={{ fontSize: 18 }}>{a.icon}</span>
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 14, background: "rgba(0,206,209,.04)", borderRadius: 12, border: "1px solid rgba(0,206,209,.1)" }}>
        <p style={{ color: "#00CED1", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
          {isHe ? "מצב אדמין פעיל" : "Admin Mode Active"}
        </p>
        <p style={{ color: "#555", fontSize: 11 }}>
          {user.email ?? user.name}
        </p>
      </div>
    </div>
  );
}
