"use client";
import { useState } from "react";
import { useApp } from "@/lib/context";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Nav from "@/components/Nav";
import B from "@/components/B";
import Inp from "@/components/Inp";
import AuroraBg from "@/components/AuroraBg";
import OTPLoginForm from "@/components/OTPLoginForm";

export default function ProfilePage() {
  const { lang, user, setUser, likes, budget, tlItems, guests, eventInfo, showToast } = useApp();
  const router = useRouter();
  const isHe = lang === "he";
  const dir = isHe ? "rtl" : "ltr";

  const [editName, setEditName] = useState(user?.name ?? "");
  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved] = useState(false);

  // Readiness steps
  const steps = [
    { done: likes.length >= 1,    icon: "❤️", label: isHe ? "שמרת ספק" : "Saved a vendor" },
    { done: budget.total > 0,     icon: "💰", label: isHe ? "הגדרת תקציב" : "Set a budget" },
    { done: tlItems.length > 0,   icon: "📅", label: isHe ? "יצרת לוח זמנים" : "Created timeline" },
    { done: !!eventInfo.address,  icon: "👥", label: isHe ? "שיתפת אורחים" : "Added guest info" },
  ];
  const readiness = Math.round(steps.filter((s) => s.done).length * 25);
  const confirmedGuests = guests.reduce((s, g) => s + g.count, 0);
  const earnedBadges = [
    likes.length >= 1  && (isHe ? "❤️ ספק ראשון" : "❤️ First Vendor"),
    likes.length >= 5  && (isHe ? "🔥 5 ספקים" : "🔥 5 Vendors"),
    budget.total > 0   && (isHe ? "💰 תקציב" : "💰 Budget"),
    tlItems.length > 0 && (isHe ? "📅 ציר זמן" : "📅 Timeline"),
    confirmedGuests >= 1 && (isHe ? "🎉 אורחים" : "🎉 Guests"),
  ].filter(Boolean) as string[];

  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "?";

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
    setEditMode(false);
    showToast(isHe ? "✓ הפרופיל עודכן" : "✓ Profile updated");
    setTimeout(() => setSaved(false), 2000);
  }

  const quickActions = [
    { icon: "❤️", label: isHe ? "הספקים שלי" : "My Vendors",  sub: `${likes.length} ${isHe ? "שמורים" : "saved"}`,   color: "#FF4444", path: "/manage",  glow: "rgba(255,68,68,.25)" },
    { icon: "👥", label: isHe ? "אורחים" : "Guests",           sub: `${confirmedGuests} ${isHe ? "אישרו" : "confirmed"}`, color: "#00CED1", path: "/guests",  glow: "rgba(0,206,209,.25)" },
    { icon: "📅", label: isHe ? "לוח זמנים" : "Timeline",      sub: `${tlItems.length} ${isHe ? "שלבים" : "steps"}`,      color: "#a855f7", path: "/timeline",glow: "rgba(168,85,247,.25)" },
    { icon: "💰", label: isHe ? "תקציב" : "Budget",            sub: budget.total ? `₪${budget.total.toLocaleString()}` : (isHe ? "לא הוגדר" : "Not set"), color: "#FFD700", path: "/manage", glow: "rgba(255,215,0,.2)" },
  ];

  return (
    <div style={{ minHeight: "100dvh", background: "#000", fontFamily: "inherit", direction: dir, paddingBottom: 80 }}>
      <AuroraBg />

      {/* ── HERO ── */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        {/* Gradient overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,206,209,.14) 0%, rgba(80,0,160,.07) 60%, transparent 100%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, padding: "52px 20px 32px", textAlign: "center" }}>

          {/* Avatar */}
          <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
            {/* Readiness ring */}
            <div style={{ width: 96, height: 96, borderRadius: "50%", background: `conic-gradient(#00CED1 ${readiness * 3.6}deg, rgba(255,255,255,.07) 0deg)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 28px rgba(0,206,209,${readiness > 0 ? ".3" : ".1"})` }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: user ? "linear-gradient(135deg,rgba(0,206,209,.25),rgba(80,0,160,.2))" : "rgba(255,255,255,.05)", border: "2px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {user ? (
                  <span style={{ color: "#00e5e8", fontSize: 28, fontWeight: 900, fontFamily: "'Manrope','Heebo'" }}>{initials}</span>
                ) : (
                  <span style={{ fontSize: 30 }}>🙂</span>
                )}
              </div>
            </div>
            {/* Readiness % badge */}
            <div style={{ position: "absolute", bottom: -4, right: -4, background: readiness === 100 ? "#00CED1" : "#111", border: "2px solid #000", borderRadius: 20, padding: "2px 7px", fontSize: 10, fontWeight: 900, color: readiness === 100 ? "#000" : "#00CED1", boxShadow: "0 2px 10px rgba(0,0,0,.5)" }}>{readiness}%</div>
          </div>

          {/* Name + email */}
          {user ? (
            <>
              {editMode ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveProfile()} style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(0,206,209,.4)", borderRadius: 10, padding: "8px 14px", color: "#fff", fontSize: 16, fontFamily: "inherit", outline: "none", textAlign: "center", width: 180 }} />
                  <button onClick={saveProfile} style={{ background: "#00CED1", border: "none", borderRadius: 10, padding: "8px 14px", color: "#000", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>✓</button>
                  <button onClick={() => setEditMode(false)} style={{ background: "rgba(255,255,255,.07)", border: "none", borderRadius: 10, padding: "8px 10px", color: "rgba(255,255,255,.5)", cursor: "pointer", fontSize: 13 }}>✕</button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
                  <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: 0 }}>{user.name}</h2>
                  <button onClick={() => { setEditMode(true); setEditName(user.name); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,.3)", cursor: "pointer", fontSize: 14, padding: 0 }}>✏️</button>
                </div>
              )}
              {user.email && <p style={{ color: "rgba(255,255,255,.35)", fontSize: 12, marginBottom: 10 }}>{user.email}</p>}
              <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                <span style={{ padding: "3px 12px", borderRadius: 20, background: "rgba(0,206,209,.1)", border: "1px solid rgba(0,206,209,.25)", color: "#00CED1", fontSize: 11, fontWeight: 700 }}>
                  {user.role === "vendor" ? (isHe ? "🏢 ספק" : "🏢 Vendor") : (isHe ? "🎉 מארגן אירוע" : "🎉 Event Planner")}
                </span>
                {readiness === 100 && <span style={{ padding: "3px 12px", borderRadius: 20, background: "rgba(255,215,0,.1)", border: "1px solid rgba(255,215,0,.25)", color: "#FFD700", fontSize: 11, fontWeight: 700 }}>👑 {isHe ? "מתכנן מושלם" : "Perfect Planner"}</span>}
              </div>
            </>
          ) : (
            <>
              <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{isHe ? "שלום אורח 👋" : "Hello Guest 👋"}</h2>
              <p style={{ color: "rgba(255,255,255,.4)", fontSize: 13 }}>{isHe ? "הירשמו כדי לשמור ולתכנן" : "Sign up to save & plan"}</p>
            </>
          )}
        </div>
      </div>

      <div style={{ padding: "0 16px", position: "relative", zIndex: 1 }}>

        {/* ── READINESS STEPS (logged in) ── */}
        {user && (
          <div style={{ background: "rgba(255,255,255,.025)", borderRadius: 18, padding: "16px 18px", border: "1px solid rgba(255,255,255,.06)", marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <p style={{ color: "rgba(255,255,255,.5)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", margin: 0 }}>{isHe ? "תכנון האירוע" : "Event Readiness"}</p>
              <span style={{ color: readiness === 100 ? "#FFD700" : "#00CED1", fontSize: 13, fontWeight: 900 }}>{readiness}%</span>
            </div>
            {/* Progress bar */}
            <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,.07)", marginBottom: 14, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${readiness}%`, borderRadius: 4, background: readiness === 100 ? "linear-gradient(90deg,#FFD700,#00CED1)" : "linear-gradient(90deg,#00CED1,#a855f7)", transition: "width .6s ease", boxShadow: "0 0 8px rgba(0,206,209,.5)" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, opacity: s.done ? 1 : 0.4 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: s.done ? "rgba(0,206,209,.2)" : "rgba(255,255,255,.05)", border: `1.5px solid ${s.done ? "rgba(0,206,209,.6)" : "rgba(255,255,255,.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>
                    {s.done ? <span style={{ color: "#00CED1", fontSize: 10, fontWeight: 900 }}>✓</span> : <span style={{ fontSize: 10 }}>{s.icon}</span>}
                  </div>
                  <span style={{ color: s.done ? "rgba(255,255,255,.75)" : "rgba(255,255,255,.35)", fontSize: 11 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── QUICK ACTIONS GRID ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
          {quickActions.map((q) => (
            <button key={q.label} onClick={() => router.push(q.path)} style={{ background: "rgba(255,255,255,.025)", borderRadius: 18, padding: "18px 16px", border: "1px solid rgba(255,255,255,.06)", cursor: "pointer", textAlign: isHe ? "right" : "left", transition: "all .15s", boxShadow: "none", fontFamily: "inherit" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{q.icon}</div>
              <div style={{ color: "#fff", fontSize: 14, fontWeight: 800, marginBottom: 3 }}>{q.label}</div>
              <div style={{ color: q.color, fontSize: 12, fontWeight: 600 }}>{q.sub}</div>
            </button>
          ))}
        </div>

        {/* ── BADGES ── */}
        {earnedBadges.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <p style={{ color: "rgba(255,255,255,.3)", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>{isHe ? "הישגים" : "Achievements"}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {earnedBadges.map((b) => (
                <span key={b} style={{ padding: "5px 14px", borderRadius: 20, background: "rgba(0,206,209,.07)", border: "1px solid rgba(0,206,209,.2)", color: "#00CED1", fontSize: 11, fontWeight: 700 }}>{b}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── LOGIN SECTION (guest) ── */}
        {!user && (
          <div style={{ background: "linear-gradient(135deg,rgba(0,206,209,.1),rgba(80,0,160,.08))", borderRadius: 20, padding: "22px 20px", border: "1px solid rgba(0,206,209,.2)", marginBottom: 18 }}>
            <p style={{ color: "#fff", fontSize: 16, fontWeight: 800, marginBottom: 4 }}>
              {isHe ? "תכנון אירועים חכם 🎉" : "Smart Event Planning 🎉"}
            </p>
            <p style={{ color: "rgba(255,255,255,.45)", fontSize: 13, lineHeight: 1.6, marginBottom: 18 }}>
              {isHe ? "הירשמו בחינם — שמרו ספקים, נהלו תקציב, שלחו הזמנות לאורחים" : "Register free — save vendors, manage budget, invite guests"}
            </p>
            <OTPLoginForm
              isHe={isHe}
              compact
              onSuccess={() => { showToast(isHe ? "✅ התחברת בהצלחה!" : "✅ Signed in!"); router.refresh(); }}
            />
            <p style={{ color: "rgba(255,255,255,.15)", fontSize: 10, textAlign: "center", marginTop: 12 }}>{isHe ? "ללא סיסמה · ללא תשלום" : "No password · No payment"}</p>
          </div>
        )}

        {/* ── VENDOR ENTRY ── */}
        <div style={{ background: "rgba(255,255,255,.025)", borderRadius: 18, padding: "18px 20px", border: "1px solid rgba(255,255,255,.06)", marginBottom: 18, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,215,0,.08)", border: "1px solid rgba(255,215,0,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🏢</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: "#fff", fontSize: 14, fontWeight: 800, marginBottom: 3 }}>{isHe ? "אתם ספקי אירועים?" : "Are you a vendor?"}</p>
            <p style={{ color: "rgba(255,255,255,.4)", fontSize: 11, lineHeight: 1.5 }}>{isHe ? "פרסמו את העסק שלכם — עמוד נחיתה חינמי, לידים ישירים" : "Publish your business — free landing page, direct leads"}</p>
          </div>
          <button onClick={() => router.push("/vendor")} style={{ flexShrink: 0, padding: "9px 16px", borderRadius: 12, background: "linear-gradient(135deg,rgba(255,215,0,.15),rgba(255,215,0,.08))", border: "1px solid rgba(255,215,0,.3)", color: "#FFD700", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
            {isHe ? "כניסה ←" : "Enter →"}
          </button>
        </div>

        {/* ── SIGN OUT + LEGAL ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {user && (
            <button onClick={logout} style={{ width: "100%", padding: "12px 0", borderRadius: 14, border: "1px solid rgba(255,68,68,.2)", background: "rgba(255,68,68,.05)", color: "rgba(255,68,68,.7)", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              {isHe ? "יציאה מהחשבון" : "Sign Out"}
            </button>
          )}
          <div style={{ display: "flex", justifyContent: "center", gap: 20, padding: "16px 0 8px" }}>
            {[["terms", isHe ? "תנאי שימוש" : "Terms"], ["privacy", isHe ? "פרטיות" : "Privacy"]].map(([k, l]) => (
              <a key={k} href={`/legal/${k}`} style={{ color: "#222", fontSize: 10, textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        </div>
      </div>

      <Nav />
    </div>
  );
}
