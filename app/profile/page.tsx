"use client";
import { useState } from "react";
import { useApp } from "@/lib/context";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Nav from "@/components/Nav";
import Logo from "@/components/Logo";
import B from "@/components/B";
import Inp from "@/components/Inp";

export default function ProfilePage() {
  const { lang, user, setUser, likes, budget, tlItems, showToast } = useApp();
  const router = useRouter();
  const isHe = lang === "he";
  const dir = isHe ? "rtl" : "ltr";
  const [editName, setEditName] = useState(user?.name ?? "");
  const points = likes.length * 10 + (budget.total ? 50 : 0) + (tlItems.length > 0 ? 30 : 0);
  const earnedBadges = [
    likes.length >= 1 && (isHe ? "❤️ ראשון" : "❤️ First Like"),
    likes.length >= 5 && (isHe ? "🔥 חמישה" : "🔥 Five Likes"),
    budget.total ? (isHe ? "💰 תקציב" : "💰 Budget Set") : false,
    tlItems.length > 0 && (isHe ? "📅 לוח זמנים" : "📅 Timeline"),
  ].filter(Boolean) as string[];
  const [saved, setSaved] = useState(false);

  async function logout() {
    const sb = createClient();
    await sb.auth.signOut();
    setUser(null);
    router.push("/");
  }

  function saveProfile() {
    if (!editName.trim()) return;
    setUser((p) => p ? { ...p, name: editName.trim() } : p);
    setSaved(true);
    showToast(isHe ? "✓ הפרופיל עודכן" : "✓ Profile updated");
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#000", fontFamily: "inherit", direction: dir, paddingBottom: 80 }}>
      {/* Header */}
      <div className="glass-dark" style={{ position: "sticky", top: 0, height: 52, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
        <Logo sz={18} />
      </div>

      <div style={{ padding: "24px 18px 0" }}>
        {/* Avatar + name */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(0,206,209,.1)", border: "2px solid rgba(0,206,209,.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 32 }}>
            {user ? "👤" : "🙂"}
          </div>
          {user ? (
            <>
              <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800 }}>{user.name}</h2>
              {user.email && <p style={{ color: "rgba(255,255,255,.4)", fontSize: 12, marginTop: 3 }}>{user.email}</p>}
              <span style={{ display: "inline-block", marginTop: 8, padding: "3px 12px", borderRadius: 20, background: "rgba(0,206,209,.08)", border: "1px solid rgba(0,206,209,.2)", color: "#00CED1", fontSize: 11, fontWeight: 600 }}>
                {user.role === "vendor" ? (isHe ? "ספק" : "Vendor") : (isHe ? "לקוח" : "Client")}
              </span>
            </>
          ) : (
            <>
              <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>{isHe ? "אורח" : "Guest"}</h2>
              <p style={{ color: "rgba(255,255,255,.4)", fontSize: 12, marginTop: 4 }}>{isHe ? "התחבר כדי לשמור את ההתקדמות שלך" : "Sign in to save your progress"}</p>
            </>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: earnedBadges.length > 0 ? 12 : 24 }}>
          {[
            { icon: "❤️", label: isHe ? "לייקים" : "Likes", val: likes.length },
            { icon: "⭐", label: isHe ? "נקודות" : "Points", val: points },
            { icon: "🏅", label: isHe ? "תגים" : "Badges", val: earnedBadges.length },
          ].map((s) => (
            <div key={s.label} className="glass" style={{ borderRadius: 14, padding: "14px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>{s.val}</div>
              <div style={{ color: "rgba(255,255,255,.35)", fontSize: 10, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        {earnedBadges.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center", marginBottom: 20 }}>
            {earnedBadges.map((b) => (
              <span key={b} style={{ padding: "4px 12px", borderRadius: 20, background: "rgba(0,206,209,.08)", border: "1px solid rgba(0,206,209,.2)", color: "#00CED1", fontSize: 11, fontWeight: 600 }}>{b}</span>
            ))}
          </div>
        )}

        {/* Edit profile */}
        {user && (
          <div className="glass" style={{ borderRadius: 16, padding: 18, marginBottom: 16 }}>
            <p style={{ color: "rgba(255,255,255,.5)", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
              {isHe ? "עריכת פרופיל" : "Edit Profile"}
            </p>
            <Inp value={editName} onChange={setEditName} placeholder={isHe ? "שם מלא" : "Full name"} style={{ marginBottom: 10 }} />
            <B onClick={saveProfile} style={{ width: "100%" }} v={saved ? "accent" : "primary"}>
              {saved ? (isHe ? "✓ נשמר" : "✓ Saved") : (isHe ? "שמור שינויים" : "Save Changes")}
            </B>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {!user && (
            <B style={{ width: "100%" }} onClick={() => router.push("/auth/login")}>
              {isHe ? "כניסה / הרשמה ✉️" : "Sign in / Sign up ✉️"}
            </B>
          )}
          <B v="ghost" style={{ width: "100%" }} onClick={() => router.push("/vendor")}>
            {isHe ? "🏢 כניסה כספק" : "🏢 Vendor Login"}
          </B>
          {user && (
            <B v="danger" style={{ width: "100%" }} onClick={logout}>
              {isHe ? "יציאה" : "Sign Out"}
            </B>
          )}
        </div>

        {/* Legal */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 28 }}>
          {[["terms", isHe ? "תנאי שימוש" : "Terms"], ["privacy", isHe ? "פרטיות" : "Privacy"]].map(([k, l]) => (
            <a key={k} href={`/legal/${k}`} style={{ color: "#2a2a2a", fontSize: 10, textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </div>

      <Nav />
    </div>
  );
}
