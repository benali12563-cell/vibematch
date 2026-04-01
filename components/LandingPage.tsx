"use client";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/context";
import Logo from "./Logo";
import B from "./B";

/* ── Animated number counter ── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = to / 60;
      const id = setInterval(() => {
        start = Math.min(start + step, to);
        setVal(Math.floor(start));
        if (start >= to) clearInterval(id);
      }, 16);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);

  return <span ref={ref}>{val.toLocaleString("he-IL")}{suffix}</span>;
}

/* ── Scroll-reveal wrapper ── */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(28px)", transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

export default function LandingPage({ onStart }: { onStart: () => void }) {
  const { lang } = useApp();
  const isHe = lang === "he";
  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    { icon: "💍", title: isHe ? "כל סוגי האירועים" : "All Event Types", desc: isHe ? "חתונות, בר/בת מצווה, ימי הולדת, כנסים, מסיבות — הכל במקום אחד." : "Weddings, bar mitzvahs, birthdays, corporate events — all in one place." },
    { icon: "🔥", title: isHe ? "החלקת ספקים כמו Tinder" : "Swipe Vendors Like Tinder", desc: isHe ? "עד 5 תמונות לכל ספק, לייק / דיסלייק, והתאמה מושלמת תוך שניות." : "Up to 5 photos per vendor, like / dislike, perfect match in seconds." },
    { icon: "🧠", title: isHe ? "VibeMatching חכם" : "Smart VibeMatching", desc: isHe ? "שאלון אישי (Story Mode) שמתאים ספקים לפי הסגנון, הקהל והתקציב שלכם." : "Personal questionnaire that matches vendors to your style, crowd & budget." },
    { icon: "📋", title: isHe ? "ניהול אירוע מלא" : "Full Event Management", desc: isHe ? "רשימת ספקים, מעקב תקציב, לוח זמנים, ניהול אורחים — הכל בלוח שליטה אחד." : "Vendor list, budget tracker, timeline, guest management — one dashboard." },
    { icon: "📨", title: isHe ? "RSVP חכם" : "Smart RSVP", desc: isHe ? "קישור ייחודי לאורחים, ספירת מאשרים בזמן אמת, בלי גיליונות Excel." : "Unique guest link, real-time confirmations, no Excel spreadsheets." },
    { icon: "🔒", title: isHe ? "ללא תשלום, ללא סיסמה" : "Free & Passwordless", desc: isHe ? "כניסה בלחיצה אחת דרך מייל (Magic Link) — ללא עלות, ללא סיסמה." : "One-click login via email (Magic Link) — free, no password needed." },
  ];

  const steps = [
    { n: "01", title: isHe ? "ספרו לנו על האירוע" : "Tell us about the event", desc: isHe ? "4 שאלות מהירות — סוג, סגנון, ויב, תקציב." : "4 quick questions — type, style, vibe, budget." },
    { n: "02", title: isHe ? "החליקו ספקים" : "Swipe vendors", desc: isHe ? "כרטיסים עם תמונות, מחירים ודירוגים — לייק מה שאהבתם." : "Cards with photos, prices & ratings — like what you love." },
    { n: "03", title: isHe ? "נהלו הכל ממקום אחד" : "Manage everything in one place", desc: isHe ? "תקציב, לוח זמנים, אורחים — מוכנים לאירוע." : "Budget, timeline, guests — ready for the big day." },
  ];

  const testimonials = [
    { name: "שירה ודן", event: isHe ? "חתונה, מרץ 2026" : "Wedding, March 2026", text: isHe ? "חסכנו שבועות של חיפוש. מצאנו DJ, צלם וקייטרינג תוך יום אחד. VibeMatch שינתה לנו את החיים!" : "We saved weeks of searching. Found DJ, photographer & catering in one day!" },
    { name: "מיכל כהן", event: isHe ? "בת מצווה, ינואר 2026" : "Bat Mitzvah, Jan 2026", text: isHe ? "הממשק פשוט מגניב. זה כמו טינדר לספקים — כיף, מהיר, ומדויק." : "The interface is just genius. It's like Tinder for vendors — fun, fast, precise." },
    { name: "אורן לוי", event: isHe ? "אירוע חברה, פברואר 2026" : "Corporate, Feb 2026", text: isHe ? "ניהלנו אירוע של 300 איש. ה-RSVP החכם חסך לנו עשרות שעות של עבודה." : "Managed a 300-person event. Smart RSVP saved us dozens of hours." },
  ];

  return (
    <div style={{ minHeight: "100dvh", background: "#000", fontFamily: isHe ? "'Heebo'" : "'Manrope','Heebo'", direction: isHe ? "rtl" : "ltr", overflowX: "hidden" }}>

      {/* ── Ambient orbs background ── */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "10%", right: "15%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,206,209,.12) 0%, transparent 70%)", animation: "orb1 12s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "20%", left: "10%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,153,170,.08) 0%, transparent 70%)", animation: "orb2 15s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "55%", right: "5%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,215,0,.04) 0%, transparent 70%)", animation: "orb1 18s ease-in-out infinite reverse" }} />
      </div>

      {/* ── Sticky nav ── */}
      <nav className="glass-dark" style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px" }}>
        <Logo sz={20} />
        <div style={{ display: "flex", gap: 10 }}>
          <B s="sm" v="ghost" onClick={() => window.location.href = "/auth/login"}>
            {isHe ? "כניסה" : "Sign in"}
          </B>
          <B s="sm" shimmer onClick={onStart}>
            {isHe ? "התחל חינם" : "Start Free"}
          </B>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "70px 24px 60px" }}>
        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 20, border: "1px solid rgba(0,206,209,.25)", background: "rgba(0,206,209,.06)", marginBottom: 28, animation: "fadeIn .6s ease" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00CED1", display: "inline-block", animation: "pulse 2s infinite" }} />
          <span style={{ color: "#00CED1", fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>
            {isHe ? "פלטפורמת האירועים החכמה של 2026" : "The Smart Event Platform of 2026"}
          </span>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: "clamp(36px, 9vw, 68px)", fontWeight: 900, lineHeight: 1.08, letterSpacing: -1.5, marginBottom: 20, animation: "fadeInUp .7s ease .1s both" }}>
          <span className="text-gradient" style={{ animation: "glowText 4s ease-in-out infinite" }}>
            {isHe ? "מצאו את הספקים" : "Find the Perfect"}
          </span>
          <br />
          <span style={{ color: "#fff" }}>
            {isHe ? "המושלמים לאירוע שלכם" : "Vendors for Your Event"}
          </span>
        </h1>

        {/* Sub */}
        <p style={{ color: "rgba(255,255,255,.55)", fontSize: "clamp(14px, 3vw, 18px)", lineHeight: 1.7, maxWidth: 480, margin: "0 auto 36px", animation: "fadeInUp .7s ease .2s both" }}>
          {isHe
            ? "החלקת כרטיסים כמו Tinder, VibeMatching חכם, ניהול אירוע מלא — הכל ב-VibeMatch."
            : "Tinder-style vendor swiping, smart VibeMatching, full event management — all in VibeMatch."}
        </p>

        {/* CTA */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", animation: "fadeInUp .7s ease .3s both" }}>
          <B s="lg" shimmer onClick={onStart}>
            🚀 {isHe ? "התחל בחינם עכשיו" : "Start Free Now"}
          </B>
          <B s="lg" v="ghost" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>
            {isHe ? "איך זה עובד?" : "How it works?"}
          </B>
        </div>

        {/* Trust badges */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 28, flexWrap: "wrap", animation: "fadeInUp .7s ease .4s both" }}>
          {["✓ ללא כרטיס אשראי", "✓ ללא סיסמה", "✓ חינמי לתמיד"].map((b) => (
            <span key={b} style={{ fontSize: 11, color: "rgba(255,255,255,.35)", padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.02)" }}>{b}</span>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 20px 64px" }}>
        <Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, maxWidth: 480, margin: "0 auto" }}>
            {[
              { val: 500, suffix: "+", label: isHe ? "ספקים" : "Vendors" },
              { val: 1200, suffix: "+", label: isHe ? "אירועים" : "Events" },
              { val: 11, suffix: "", label: isHe ? "קטגוריות" : "Categories" },
            ].map((s, i) => (
              <div key={i} className="glass card-hover" style={{ borderRadius: 16, padding: "18px 12px", textAlign: "center" }}>
                <div className="text-gradient" style={{ fontSize: 30, fontWeight: 900, lineHeight: 1, fontFamily: "'Manrope',sans-serif" }}>
                  <Counter to={s.val} suffix={s.suffix} />
                </div>
                <div style={{ color: "rgba(255,255,255,.4)", fontSize: 11, marginTop: 5, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Features grid ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 20px 70px" }}>
        <Reveal>
          <p style={{ color: "#00CED1", fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", textAlign: "center", marginBottom: 12 }}>
            {isHe ? "למה VibeMatch?" : "Why VibeMatch?"}
          </p>
          <h2 style={{ color: "#fff", fontSize: "clamp(24px, 6vw, 36px)", fontWeight: 900, textAlign: "center", marginBottom: 32, letterSpacing: -0.5, lineHeight: 1.2 }}>
            {isHe ? "הכל במקום אחד,\nבלי כאב ראש" : "Everything in one place,\nno headaches"}
          </h2>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, maxWidth: 480, margin: "0 auto" }}>
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 70}>
              <div className="glass card-hover" style={{ borderRadius: 16, padding: "18px 14px", height: "100%", cursor: "default", transition: "border-color .3s", border: "1px solid rgba(255,255,255,.06)" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
                <h3 style={{ color: "#fff", fontSize: 13, fontWeight: 800, marginBottom: 6, lineHeight: 1.3 }}>{f.title}</h3>
                <p style={{ color: "rgba(255,255,255,.4)", fontSize: 11, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" style={{ position: "relative", zIndex: 1, padding: "0 20px 70px" }}>
        <Reveal>
          <p style={{ color: "#00CED1", fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", textAlign: "center", marginBottom: 12 }}>
            {isHe ? "איך זה עובד?" : "How it works"}
          </p>
          <h2 style={{ color: "#fff", fontSize: "clamp(22px, 5vw, 32px)", fontWeight: 900, textAlign: "center", marginBottom: 32, letterSpacing: -0.5 }}>
            {isHe ? "3 צעדים לאירוע מושלם" : "3 Steps to a Perfect Event"}
          </h2>
        </Reveal>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 440, margin: "0 auto" }}>
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div className="glass card-hover" style={{ borderRadius: 18, padding: "20px 18px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 14, background: "rgba(0,206,209,.08)", border: "1px solid rgba(0,206,209,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="text-gradient" style={{ fontSize: 16, fontWeight: 900, fontFamily: "'Manrope',sans-serif" }}>{s.n}</span>
                </div>
                <div>
                  <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 800, marginBottom: 5 }}>{s.title}</h3>
                  <p style={{ color: "rgba(255,255,255,.45)", fontSize: 13, lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 20px 70px" }}>
        <Reveal>
          <p style={{ color: "#00CED1", fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", textAlign: "center", marginBottom: 12 }}>
            {isHe ? "מה אומרים עלינו" : "What They Say"}
          </p>
          <h2 style={{ color: "#fff", fontSize: "clamp(22px, 5vw, 32px)", fontWeight: 900, textAlign: "center", marginBottom: 28, letterSpacing: -0.5 }}>
            {isHe ? "אלפי זוגות כבר גילו את הסוד" : "Thousands already know the secret"}
          </h2>
        </Reveal>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 440, margin: "0 auto" }}>
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <div className="glass card-hover" style={{ borderRadius: 18, padding: "20px 18px" }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                  {[...Array(5)].map((_, j) => (
                    <span key={j} style={{ color: "#FFD700", fontSize: 13 }}>★</span>
                  ))}
                </div>
                <p style={{ color: "rgba(255,255,255,.75)", fontSize: 13, lineHeight: 1.7, marginBottom: 14, fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,rgba(0,206,209,.2),rgba(0,206,209,.05))", border: "1px solid rgba(0,206,209,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💍</div>
                  <div>
                    <p style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{t.name}</p>
                    <p style={{ color: "rgba(255,255,255,.35)", fontSize: 11 }}>{t.event}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 20px 80px" }}>
        <Reveal>
          <div className="glass-teal" style={{ borderRadius: 24, padding: "36px 24px", textAlign: "center", maxWidth: 440, margin: "0 auto", position: "relative", overflow: "hidden" }}>
            {/* Background glow */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,206,209,.08) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>🚀</div>
              <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 900, marginBottom: 8, letterSpacing: -0.5 }}>
                {isHe ? "מוכנים לאירוע המושלם?" : "Ready for the perfect event?"}
              </h2>
              <p style={{ color: "rgba(255,255,255,.5)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                {isHe ? "הצטרפו לאלפי מארגני אירועים שכבר עובדים עם VibeMatch. חינמי לתמיד." : "Join thousands of event planners already using VibeMatch. Free forever."}
              </p>
              <B s="lg" shimmer onClick={onStart} style={{ width: "100%", justifyContent: "center" }}>
                ✨ {isHe ? "התחל עכשיו — ללא תשלום" : "Start Now — Free Forever"}
              </B>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ── */}
      <footer style={{ position: "relative", zIndex: 1, padding: "24px 20px 40px", borderTop: "1px solid rgba(255,255,255,.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 440, margin: "0 auto", flexWrap: "wrap", gap: 12 }}>
          <Logo sz={16} />
          <div style={{ display: "flex", gap: 16 }}>
            {[["terms", isHe ? "תנאי שימוש" : "Terms"], ["privacy", isHe ? "פרטיות" : "Privacy"], ["vendor-terms", isHe ? "ספקים" : "Vendors"]].map(([k, l]) => (
              <a key={k} href={`/legal/${k}`} style={{ color: "rgba(255,255,255,.2)", fontSize: 10, textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        </div>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,.1)", fontSize: 10, marginTop: 16 }}>
          © 2026 VibeMatch. {isHe ? "כל הזכויות שמורות." : "All rights reserved."}
        </p>
      </footer>
    </div>
  );
}
