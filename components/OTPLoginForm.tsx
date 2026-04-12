"use client";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  isHe: boolean;
  onSuccess?: () => void;
  onTrack?: (email: string) => void;
  compact?: boolean;
}

export default function OTPLoginForm({ isHe, onTrack, compact = false }: Props) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "sent">("email");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function startCooldown(secs = 60) {
    setCooldown(secs);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((p) => { if (p <= 1) { clearInterval(timerRef.current!); return 0; } return p - 1; });
    }, 1000);
  }

  async function sendLink() {
    const trimmed = email.trim();
    if (!trimmed.includes("@") || loading || cooldown > 0) return;
    setLoading(true);
    setError("");
    const sb = createClient();
    const redirectTo = (typeof window !== "undefined" ? window.location.origin : "") + "/auth/callback";
    const { error: err } = await sb.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: redirectTo },
    });
    setLoading(false);
    if (err) {
      const msg = err.message.toLowerCase();
      if (msg.includes("rate limit") || msg.includes("too many")) {
        setError(isHe ? "יותר מדי ניסיונות — נסה שוב בעוד מספר דקות" : "Too many attempts — please wait a few minutes");
      } else if (msg.includes("invalid email") || msg.includes("unable to validate")) {
        setError(isHe ? "כתובת מייל לא תקינה" : "Invalid email address");
      } else {
        setError(isHe ? `שגיאה: ${err.message}` : err.message);
      }
      return;
    }
    onTrack?.(trimmed);
    setStep("sent");
    startCooldown(60);
  }

  const font = isHe ? "'Heebo',sans-serif" : "'Manrope','Heebo',sans-serif";

  return (
    <div style={{ fontFamily: font, direction: isHe ? "rtl" : "ltr" }}>
      {step === "email" ? (
        <div style={{ animation: "fadeIn .3s" }}>
          {!compact && (
            <p style={{ color: "#555", fontSize: 13, lineHeight: 1.6, textAlign: "center", marginBottom: 24 }}>
              {isHe ? "נשלח לינק כניסה למייל שלך — ללא סיסמה" : "We'll send a sign-in link to your email — no password"}
            </p>
          )}
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={isHe ? "כתובת אימייל" : "Email address"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendLink()}
            dir="ltr"
            style={{
              width: "100%", height: 48, borderRadius: 12, padding: "0 14px",
              background: "rgba(255,255,255,.05)", border: "1.5px solid rgba(255,255,255,.12)",
              color: "#fff", fontSize: 15, fontFamily: "monospace", outline: "none",
              marginBottom: 12, boxSizing: "border-box",
            }}
          />
          {error && <p style={{ color: "#FF6666", fontSize: 12, marginBottom: 10 }}>{error}</p>}
          <button
            onClick={sendLink}
            disabled={loading || !email.includes("@")}
            style={{
              width: "100%", height: 48, borderRadius: 14, fontWeight: 800, fontSize: 15,
              background: (!email.includes("@") || loading) ? "rgba(255,255,255,.06)" : "linear-gradient(160deg,#00e5e8 0%,#00CED1 55%,#009eb0 100%)",
              border: "none", color: (!email.includes("@") || loading) ? "#444" : "#000",
              cursor: loading ? "wait" : "pointer", fontFamily: font, transition: "all .2s",
              boxShadow: email.includes("@") && !loading ? "0 4px 18px rgba(0,206,209,.4)" : "none",
            }}
          >
            {loading ? (isHe ? "שולח..." : "Sending...") : (isHe ? "שלח לינק כניסה ✉️" : "Send Sign-in Link ✉️")}
          </button>
        </div>
      ) : (
        <div style={{ animation: "fadeIn .3s", textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📬</div>
          <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
            {isHe ? "בדוק את המייל שלך" : "Check your email"}
          </h3>
          <p style={{ color: "#666", fontSize: 13, lineHeight: 1.6, marginBottom: 6 }}>
            {isHe ? "שלחנו לינק כניסה ל-" : "We sent a sign-in link to"}<br />
            <span style={{ color: "#00CED1", fontWeight: 700 }}>{email.trim()}</span>
          </p>
          <p style={{ color: "#444", fontSize: 12, marginBottom: 28 }}>
            {isHe ? "לחץ על הלינק במייל כדי להיכנס · לא מצאת? בדוק ספאם 📁" : "Click the link in the email to sign in · Not found? Check spam 📁"}
          </p>

          {/* Resend */}
          {cooldown > 0 ? (
            <p style={{ color: "#555", fontSize: 12 }}>
              {isHe ? `שלח שוב בעוד ${cooldown} שניות` : `Resend in ${cooldown}s`}
            </p>
          ) : (
            <button
              onClick={() => { setStep("email"); setError(""); }}
              style={{ background: "none", border: "none", color: "#00CED1", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}
            >
              {isHe ? "שלח שוב" : "Resend link"}
            </button>
          )}

          <br />
          <button
            onClick={() => { setStep("email"); setEmail(""); setError(""); }}
            style={{ background: "none", border: "none", color: "#444", fontSize: 12, cursor: "pointer", fontFamily: font, marginTop: 10 }}
          >
            {isHe ? "שינוי מייל" : "Change email"}
          </button>
        </div>
      )}
    </div>
  );
}
