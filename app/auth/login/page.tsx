"use client";
import { useState } from "react";
import { useApp } from "@/lib/context";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import B from "@/components/B";
import Inp from "@/components/Inp";

export default function LoginPage() {
  const { lang, showToast } = useApp();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const isHe = lang === "he";

  async function send() {
    if (!email || loading) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) { showToast(error.message); return; }
    setSent(true);
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", direction: isHe ? "rtl" : "ltr" }}>
      <div style={{ marginBottom: 32 }}><Logo sz={32} /></div>
      {sent ? (
        <div style={{ textAlign: "center", animation: "scaleIn .4s" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📨</div>
          <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
            {isHe ? "בדוק את המייל שלך" : "Check your email"}
          </h2>
          <p style={{ color: "#666", fontSize: 14 }}>
            {isHe ? "שלחנו לינק כניסה ל-" : "We sent a magic link to"} <span style={{ color: "#00CED1" }}>{email}</span>
          </p>
          <button onClick={() => setSent(false)} style={{ marginTop: 24, background: "none", border: "none", color: "#555", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            {isHe ? "שינוי מייל" : "Change email"}
          </button>
        </div>
      ) : (
        <div style={{ width: "100%", maxWidth: 360 }}>
          <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 800, marginBottom: 6, textAlign: "center" }}>
            {isHe ? "כניסה ל-VibeMatch" : "Sign in to VibeMatch"}
          </h2>
          <p style={{ color: "#555", fontSize: 13, textAlign: "center", marginBottom: 28 }}>
            {isHe ? "ללא סיסמה — כניסה דרך מייל בלבד" : "No password — email magic link only"}
          </p>
          <Inp value={email} onChange={setEmail} placeholder={isHe ? "אימייל" : "Email"} dir="ltr" style={{ marginBottom: 12 }} />
          <B style={{ width: "100%" }} onClick={send}>
            {loading ? (isHe ? "שולח..." : "Sending...") : (isHe ? "שלח לינק כניסה ✉️" : "Send Magic Link ✉️")}
          </B>
        </div>
      )}
    </div>
  );
}
