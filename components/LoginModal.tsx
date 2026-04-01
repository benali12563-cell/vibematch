"use client";
import { useState } from "react";
import { useApp } from "@/lib/context";
import { T } from "@/lib/constants";
import type { AppUser } from "@/types";
import { createClient } from "@/lib/supabase/client";
import B from "./B";
import Logo from "./Logo";

interface Props {
  onClose: () => void;
  onDone: (u: AppUser) => void;
  mode: "owner" | "vendor";
}

export default function LoginModal({ onClose, onDone, mode }: Props) {
  const { lang } = useApp();
  const t = T[lang];
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendLink() {
    if (!email.includes("@")) { setError(lang === "he" ? "אימייל לא תקין" : "Invalid email"); return; }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setSent(true);
    setLoading(false);
    // Optimistically set user so they can keep browsing
    onDone({ name: email.split("@")[0], email, role: mode });
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.92)", backdropFilter: "blur(14px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", direction: lang === "he" ? "rtl" : "ltr" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "90%", maxWidth: 340, background: "#111", borderRadius: 16, padding: 28, animation: "scaleIn .3s", textAlign: "center", border: "1px solid rgba(255,255,255,.06)" }}>
        <Logo sz={26} />
        <p style={{ color: "#555", fontSize: 12, marginTop: 8, marginBottom: 20 }}>{mode === "vendor" ? t.vendor : t.enterEmail}</p>

        {!sent ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && sendLink()}
              style={{ width: "100%", padding: 14, borderRadius: 10, border: `1px solid ${error ? "#FF4444" : "rgba(255,255,255,.08)"}`, fontSize: 15, fontFamily: "'Outfit'", background: "rgba(255,255,255,.03)", color: "#fff", direction: "ltr", textAlign: "center" }}
            />
            {error && <p style={{ color: "#FF4444", fontSize: 12 }}>{error}</p>}
            <B onClick={sendLink} disabled={loading}>{loading ? "..." : t.sendMagicLink}</B>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📬</div>
            <p style={{ color: "#fff", fontWeight: 700 }}>{t.magicLinkSent}</p>
            <p style={{ color: "#666", fontSize: 13, marginTop: 6 }}>{t.magicLinkDesc} <span style={{ color: "#00CED1" }}>{email}</span></p>
          </div>
        )}
      </div>
    </div>
  );
}
