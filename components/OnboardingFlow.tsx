"use client";
import { useState } from "react";
import { useApp } from "@/lib/context";
import { EVENT_TYPES, EVENT_STYLES, EVENT_VIBES, BUDGET_RANGES } from "@/lib/constants";
import B from "./B";
import Logo from "./Logo";

const STEPS = 4;

export default function OnboardingFlow() {
  const { setOnboardingDone, setEventInfo, lang } = useApp();
  const [step, setStep] = useState(0);
  const [eventType, setEventType] = useState("");
  const [style, setStyle] = useState("");
  const [vibe, setVibe] = useState("");
  const [budget, setBudget] = useState("");
  const isHe = lang === "he";

  function finish() {
    setEventInfo((p) => ({ ...p, type: eventType, style, vibe, budget }));
    setOnboardingDone(true);
  }

  const progress = ((step + 1) / STEPS) * 100;

  return (
    <div style={{ minHeight: "100dvh", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 20px", direction: isHe ? "rtl" : "ltr", fontFamily: isHe ? "'Heebo'" : "'Outfit'" }}>
      {/* Progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,.05)" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#00CED1,#0099aa)", transition: "width .4s ease" }} />
      </div>

      <div style={{ position: "fixed", top: 14, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Logo sz={18} />
      </div>

      <div style={{ width: "100%", maxWidth: 400, animation: "fadeIn .4s" }} key={step}>
        {step === 0 && (
          <>
            <p style={{ color: "#555", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10, textAlign: "center" }}>
              {isHe ? "שלב 1 מתוך 4" : "Step 1 of 4"}
            </p>
            <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 800, marginBottom: 6, textAlign: "center" }}>
              {isHe ? "איזה אירוע?" : "What's the event?"}
            </h2>
            <p style={{ color: "#555", fontSize: 13, textAlign: "center", marginBottom: 28 }}>
              {isHe ? "בחרו את סוג האירוע שלכם" : "Choose your event type"}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {EVENT_TYPES.map((e) => {
                const sel = eventType === e.k;
                return (
                  <button key={e.k} onClick={() => setEventType(e.k)} style={{ padding: "18px 12px", borderRadius: 14, border: `1px solid ${sel ? "#00CED1" : "rgba(255,255,255,.06)"}`, background: sel ? "rgba(0,206,209,.08)" : "rgba(255,255,255,.02)", cursor: "pointer", textAlign: "center", transition: "all .2s" }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{e.emoji}</div>
                    <div style={{ color: sel ? "#00CED1" : "#aaa", fontSize: 13, fontWeight: 600 }}>{isHe ? e.he : e.en}</div>
                  </button>
                );
              })}
            </div>
            <B style={{ width: "100%", marginTop: 20 }} onClick={() => eventType && setStep(1)}>
              {isHe ? "המשך" : "Continue"}
            </B>
          </>
        )}

        {step === 1 && (
          <>
            <p style={{ color: "#555", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10, textAlign: "center" }}>
              {isHe ? "שלב 2 מתוך 4" : "Step 2 of 4"}
            </p>
            <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 800, marginBottom: 6, textAlign: "center" }}>
              {isHe ? "איזה סגנון?" : "What style?"}
            </h2>
            <p style={{ color: "#555", fontSize: 13, textAlign: "center", marginBottom: 28 }}>
              {isHe ? "בחרו את האווירה החזותית" : "Choose the visual vibe"}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {EVENT_STYLES.map((s) => {
                const sel = style === s.k;
                return (
                  <button key={s.k} onClick={() => setStyle(s.k)} style={{ padding: "16px 8px", borderRadius: 12, border: `1px solid ${sel ? "#00CED1" : "rgba(255,255,255,.06)"}`, background: sel ? "rgba(0,206,209,.08)" : "rgba(255,255,255,.02)", cursor: "pointer", textAlign: "center" }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{s.emoji}</div>
                    <div style={{ color: sel ? "#00CED1" : "#aaa", fontSize: 11, fontWeight: 600 }}>{isHe ? s.he : s.en}</div>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <B v="ghost" style={{ flex: 1 }} onClick={() => setStep(0)}>{isHe ? "חזרה" : "Back"}</B>
              <B style={{ flex: 2 }} onClick={() => style && setStep(2)}>{isHe ? "המשך" : "Continue"}</B>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ color: "#555", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10, textAlign: "center" }}>
              {isHe ? "שלב 3 מתוך 4" : "Step 3 of 4"}
            </p>
            <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 800, marginBottom: 6, textAlign: "center" }}>
              {isHe ? "איזה ויב?" : "What's the vibe?"}
            </h2>
            <p style={{ color: "#555", fontSize: 13, textAlign: "center", marginBottom: 28 }}>
              {isHe ? "מה תרגיש האירוע?" : "How should the event feel?"}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {EVENT_VIBES.map((v) => {
                const sel = vibe === v.k;
                return (
                  <button key={v.k} onClick={() => setVibe(v.k)} style={{ padding: "14px 12px", borderRadius: 12, border: `1px solid ${sel ? "#00CED1" : "rgba(255,255,255,.06)"}`, background: sel ? "rgba(0,206,209,.08)" : "rgba(255,255,255,.02)", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{v.emoji}</span>
                    <span style={{ color: sel ? "#00CED1" : "#aaa", fontSize: 13, fontWeight: 600 }}>{isHe ? v.he : v.en}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <B v="ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>{isHe ? "חזרה" : "Back"}</B>
              <B style={{ flex: 2 }} onClick={() => vibe && setStep(3)}>{isHe ? "המשך" : "Continue"}</B>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p style={{ color: "#555", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10, textAlign: "center" }}>
              {isHe ? "שלב 4 מתוך 4" : "Step 4 of 4"}
            </p>
            <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 800, marginBottom: 6, textAlign: "center" }}>
              {isHe ? "מה התקציב?" : "What's the budget?"}
            </h2>
            <p style={{ color: "#555", fontSize: 13, textAlign: "center", marginBottom: 28 }}>
              {isHe ? "זה עוזר לנו להתאים לכם ספקים" : "Helps us match you to the right vendors"}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {BUDGET_RANGES.map((b) => {
                const sel = budget === b.k;
                return (
                  <button key={b.k} onClick={() => setBudget(b.k)} style={{ padding: "16px 20px", borderRadius: 12, border: `1px solid ${sel ? "#00CED1" : "rgba(255,255,255,.06)"}`, background: sel ? "rgba(0,206,209,.08)" : "rgba(255,255,255,.02)", cursor: "pointer", textAlign: isHe ? "right" : "left" }}>
                    <span style={{ color: sel ? "#00CED1" : "#aaa", fontSize: 14, fontWeight: 600 }}>{isHe ? b.he : b.en}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <B v="ghost" style={{ flex: 1 }} onClick={() => setStep(2)}>{isHe ? "חזרה" : "Back"}</B>
              <B v="fire" style={{ flex: 2 }} onClick={() => budget && finish()}>
                {isHe ? "בואו נתחיל 🚀" : "Let's go 🚀"}
              </B>
            </div>
          </>
        )}
      </div>

      <button onClick={finish} style={{ position: "fixed", bottom: 24, background: "none", border: "none", color: "#333", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
        {isHe ? "דלג לעכשיו" : "Skip for now"}
      </button>
    </div>
  );
}
