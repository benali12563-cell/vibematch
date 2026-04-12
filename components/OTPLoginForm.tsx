"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Logo from "./Logo";

interface Props {
  isHe: boolean;
  onSuccess?: () => void;          // called after successful verification
  onTrack?: (email: string) => void; // optional side-effect (analytics, referral)
  compact?: boolean;               // no logo/heading — for inline modals
}

// Circular SVG countdown ring
function CooldownRing({ seconds, total }: { seconds: number; total: number }) {
  const r = 10;
  const circ = 2 * Math.PI * r;
  const dash = (seconds / total) * circ;
  return (
    <svg width={28} height={28} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={14} cy={14} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={2.5} />
      <circle cx={14} cy={14} r={r} fill="none" stroke="#00CED1" strokeWidth={2.5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray .8s linear" }} />
    </svg>
  );
}

export default function OTPLoginForm({ isHe, onSuccess, onTrack, compact = false }: Props) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function startCooldown(secs = 60) {
    setCooldown(secs);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((p) => {
        if (p <= 1) { clearInterval(timerRef.current!); return 0; }
        return p - 1;
      });
    }, 1000);
  }

  async function sendCode() {
    const trimmed = email.trim();
    if (!trimmed.includes("@") || loading || cooldown > 0) return;
    setLoading(true);
    setError("");
    const sb = createClient();
    // Without emailRedirectTo → Supabase sends 6-digit OTP code (not a magic link)
    const { error: err } = await sb.auth.signInWithOtp({ email: trimmed });
    setLoading(false);
    if (err) {
      // Translate common Supabase errors to Hebrew/English
      const msg = err.message.toLowerCase();
      if (msg.includes("rate limit") || msg.includes("too many")) {
        setError(isHe
          ? "יותר מדי ניסיונות — נסה שוב בעוד מספר דקות"
          : "Too many attempts — please wait a few minutes");
      } else if (msg.includes("invalid email") || msg.includes("unable to validate")) {
        setError(isHe ? "כתובת מייל לא תקינה" : "Invalid email address");
      } else {
        setError(isHe ? `שגיאה: ${err.message}` : err.message);
      }
      return;
    }
    onTrack?.(trimmed);
    setStep("code");
    startCooldown(60);
    setTimeout(() => inputRefs.current[0]?.focus(), 120);
  }

  const verifyCode = useCallback(async (code: string) => {
    if (code.length !== 6 || loading) return;
    setLoading(true);
    setError("");
    const sb = createClient();
    const { error: err } = await sb.auth.verifyOtp({
      email: email.trim(),
      token: code,
      type: "email",
    });
    setLoading(false);
    if (err) {
      setError(isHe ? "קוד שגוי או פג תוקף — נסה שוב" : "Invalid or expired code — try again");
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 80);
      return;
    }
    onSuccess?.();
  }, [email, isHe, loading, onSuccess]);

  function handleDigit(i: number, val: string) {
    const d = val.replace(/\D/g, "").slice(-1);
    const next = digits.map((v, idx) => (idx === i ? d : v));
    setDigits(next);
    if (d && i < 5) inputRefs.current[i + 1]?.focus();
    const full = next.join("");
    if (full.length === 6 && next.every((x) => x)) {
      setTimeout(() => verifyCode(full), 60);
    }
  }

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      e.preventDefault();
      setDigits(pasted.split(""));
      setTimeout(() => verifyCode(pasted), 60);
    }
  }

  const font = isHe ? "'Heebo',sans-serif" : "'Manrope','Heebo',sans-serif";

  return (
    <div style={{ fontFamily: font, direction: isHe ? "rtl" : "ltr" }}>
      {step === "email" ? (
        <div style={{ animation: "fadeIn .3s" }}>
          {!compact && (
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <p style={{ color: "#555", fontSize: 13, lineHeight: 1.6 }}>
                {isHe ? "נשלח קוד אימות של 6 ספרות למייל שלך" : "We'll send a 6-digit code to your email"}
              </p>
            </div>
          )}
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={isHe ? "כתובת אימייל" : "Email address"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendCode()}
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
            onClick={sendCode}
            disabled={loading || !email.includes("@")}
            style={{
              width: "100%", height: 48, borderRadius: 14, fontWeight: 800, fontSize: 15,
              background: (!email.includes("@") || loading)
                ? "rgba(255,255,255,.06)"
                : "linear-gradient(160deg,#00e5e8 0%,#00CED1 55%,#009eb0 100%)",
              border: "none", color: (!email.includes("@") || loading) ? "#444" : "#000",
              cursor: loading ? "wait" : "pointer", fontFamily: font,
              transition: "all .2s", boxShadow: email.includes("@") && !loading
                ? "0 4px 18px rgba(0,206,209,.4)"
                : "none",
            }}
          >
            {loading
              ? (isHe ? "שולח..." : "Sending...")
              : (isHe ? "שלח קוד אימות ✉️" : "Send Verification Code ✉️")}
          </button>
        </div>
      ) : (
        <div style={{ animation: "fadeIn .3s", textAlign: "center" }}>
          {!compact && (
            <>
              <div style={{ fontSize: 44, marginBottom: 10 }}>📱</div>
              <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
                {isHe ? "הכנס קוד אימות" : "Enter your code"}
              </h3>
            </>
          )}
          <p style={{ color: "#666", fontSize: 12, marginBottom: compact ? 14 : 20 }}>
            {isHe ? "שלחנו קוד ל-" : "Code sent to "}
            <span style={{ color: "#00CED1", fontWeight: 700 }}>{email.trim()}</span>
            <br />
            <span style={{ color: "#444", fontSize: 11 }}>
              {isHe ? "הקוד תקף ל-10 דקות · לא מצאת? בדוק ספאם 📁" : "Valid 10 min · Not found? Check spam 📁"}
            </span>
          </p>

          {/* ── 6-digit boxes ── */}
          <div
            style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20, direction: "ltr" }}
            onPaste={handlePaste}
          >
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                value={d}
                onChange={(e) => handleDigit(i, e.target.value)}
                onKeyDown={(e) => handleKey(i, e)}
                inputMode="numeric"
                maxLength={2}
                style={{
                  width: 44, height: 54, borderRadius: 12, textAlign: "center",
                  fontSize: 22, fontWeight: 900, background: d
                    ? "rgba(0,206,209,.14)"
                    : "rgba(255,255,255,.04)",
                  border: `2px solid ${d ? "rgba(0,206,209,.65)" : "rgba(255,255,255,.1)"}`,
                  color: "#fff", outline: "none", fontFamily: "monospace",
                  transition: "border-color .15s, background .15s",
                  caretColor: "transparent",
                }}
              />
            ))}
          </div>

          {error && (
            <p style={{ color: "#FF6666", fontSize: 12, marginBottom: 12, animation: "fadeIn .2s" }}>
              {error}
            </p>
          )}

          <button
            onClick={() => verifyCode(digits.join(""))}
            disabled={digits.join("").length !== 6 || loading}
            style={{
              width: "100%", height: 48, borderRadius: 14, fontWeight: 800, fontSize: 15,
              background: digits.join("").length === 6 && !loading
                ? "linear-gradient(160deg,#00e5e8 0%,#00CED1 55%,#009eb0 100%)"
                : "rgba(255,255,255,.06)",
              border: "none",
              color: digits.join("").length === 6 && !loading ? "#000" : "#444",
              cursor: loading ? "wait" : "pointer", fontFamily: font,
              marginBottom: 18, transition: "all .2s",
              boxShadow: digits.join("").length === 6 && !loading
                ? "0 4px 18px rgba(0,206,209,.4)"
                : "none",
            }}
          >
            {loading
              ? (isHe ? "מאמת..." : "Verifying...")
              : (isHe ? "אמת קוד" : "Verify Code")}
          </button>

          {/* Resend / cooldown */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            {cooldown > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#555", fontSize: 12 }}>
                <CooldownRing seconds={cooldown} total={60} />
                {isHe ? `שלח שוב בעוד ${cooldown} שניות` : `Resend in ${cooldown}s`}
              </div>
            ) : (
              <button
                onClick={() => { setDigits(["", "", "", "", "", ""]); setError(""); sendCode(); }}
                style={{
                  background: "none", border: "none", color: "#00CED1",
                  fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font,
                }}
              >
                {isHe ? "שלח קוד חדש" : "Resend code"}
              </button>
            )}
            <button
              onClick={() => { setStep("email"); setDigits(["", "", "", "", "", ""]); setError(""); }}
              style={{
                background: "none", border: "none", color: "#444",
                fontSize: 12, cursor: "pointer", fontFamily: font,
              }}
            >
              {isHe ? "שינוי מייל" : "Change email"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
