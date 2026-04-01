"use client";
import { use, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveRsvp, trackReferral } from "@/lib/supabase/rsvp";
import Logo from "@/components/Logo";

export default function InvitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") ?? undefined;

  const hostName = decodeURIComponent(slug).replace(/-/g, " ");
  const [ans, setAns] = useState<"yes" | "no" | null>(null);
  const [name, setName] = useState("");
  const [count, setCount] = useState("2");
  const [step, setStep] = useState<"rsvp" | "done" | "join">("rsvp");
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  // Track that someone opened the invite link
  useEffect(() => {
    trackReferral({
      referrer_slug: slug,
      referrer_type: "invite",
      page_visited: `/invite/${slug}`,
    }).catch(() => {});
  }, [slug]);

  async function confirm(choice: "yes" | "no") {
    if (choice === "yes" && !name.trim()) return;
    setAns(choice);

    // Save RSVP to Supabase
    await saveRsvp({
      invite_slug: slug,
      guest_name: name || "אורח",
      guest_count: count === "5+" ? 5 : parseInt(count),
      status: choice === "yes" ? "coming" : "not_coming",
    }).catch(() => {});

    setStep("done");
    // Show viral join panel after 1.5s
    setTimeout(() => setStep("join"), 1500);
  }

  async function joinVibeMatch() {
    if (!email.includes("@")) return;
    setEmailLoading(true);
    try {
      const sb = createClient();
      await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      // Track conversion
      void sb.from("referral_visits").insert({
        referrer_slug: slug,
        referrer_type: "invite",
        page_visited: `/invite/${slug}`,
        registered: true,
      });
      setEmailSent(true);
    } finally {
      setEmailLoading(false);
    }
  }

  const whatsappShare = () => {
    const url = `${window.location.origin}/invite/${slug}`;
    const text = `הוזמנתם לאירוע של ${hostName} 🎉\nאשרו הגעה כאן: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  return (
    <div style={{ minHeight: "100dvh", background: "linear-gradient(180deg,#000 0%,#040812 40%,#000 100%)", fontFamily: "'Heebo','Manrope',sans-serif", direction: "rtl", overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: 420, margin: "0 auto", padding: "0 18px 50px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", paddingTop: 60, paddingBottom: 28 }}>
          <div style={{ width: 50, height: 1, background: "linear-gradient(90deg,transparent,#00CED1,transparent)", margin: "0 auto 20px" }} />
          <p style={{ color: "rgba(255,255,255,.3)", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", marginBottom: 12 }}>הוזמנתם לחגוג</p>
          <h1 style={{ color: "#fff", fontSize: 36, fontWeight: 900, lineHeight: 1.1, fontFamily: "'Manrope','Heebo',sans-serif", letterSpacing: -1, margin: "0 0 14px" }}>{hostName}</h1>
          <div style={{ width: 36, height: 1, background: "linear-gradient(90deg,transparent,rgba(0,206,209,.4),transparent)", margin: "0 auto" }} />
        </div>

        {/* RSVP form */}
        {step === "rsvp" && (
          <div style={{ background: "rgba(255,255,255,.03)", borderRadius: 22, padding: 24, marginBottom: 20, border: "1px solid rgba(255,255,255,.07)", animation: "fadeIn .5s" }}>
            <p style={{ color: "rgba(255,255,255,.45)", fontSize: 13, textAlign: "center", marginBottom: 18, lineHeight: 1.65 }}>
              נשמח לדעת שאתם מגיעים ✨
            </p>
            <input
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder="השם שלך"
              style={{ width: "100%", padding: "13px 16px", borderRadius: 14, border: "1px solid rgba(255,255,255,.09)", background: "rgba(255,255,255,.05)", color: "#fff", fontSize: 14, fontFamily: "inherit", marginBottom: 14, outline: "none" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 18 }}>
              <span style={{ color: "rgba(255,255,255,.45)", fontSize: 13 }}>כמה מגיעים?</span>
              <div style={{ display: "flex", gap: 6 }}>
                {["1","2","3","4","5+"].map((n) => (
                  <button key={n} onClick={() => setCount(n)}
                    style={{ width: 38, height: 38, borderRadius: 10, border: `1.5px solid ${count === n ? "rgba(0,229,232,.6)" : "rgba(255,255,255,.08)"}`, background: count === n ? "rgba(0,206,209,.14)" : "rgba(255,255,255,.03)", color: count === n ? "#00e5e8" : "rgba(255,255,255,.45)", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all .12s" }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => confirm("yes")}
              style={{ width: "100%", padding: "15px 0", borderRadius: 16, border: "none", background: "linear-gradient(160deg,#00e5e8,#00CED1)", color: "#000", fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: "inherit", marginBottom: 10, boxShadow: "0 6px 24px rgba(0,206,209,.35)" }}>
              ✓ אני מגיע ({count})
            </button>
            <button onClick={() => confirm("no")}
              style={{ display: "block", width: "100%", background: "none", border: "none", color: "rgba(255,255,255,.25)", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: "10px 0" }}>
              לא הפעם
            </button>
          </div>
        )}

        {/* Confirmation */}
        {step === "done" && (
          <div style={{ textAlign: "center", padding: "32px 0 20px", animation: "scaleIn .4s" }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>{ans === "yes" ? "🎉" : "😢"}</div>
            <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900, marginBottom: 8 }}>
              {ans === "yes" ? "מחכים לראות אתכם!" : "תודה על העדכון"}
            </h2>
            <p style={{ color: "rgba(255,255,255,.35)", fontSize: 13 }}>
              {ans === "yes" ? `${name} — נרשמת בהצלחה ✓` : "נשמח בפעם הבאה"}
            </p>
            {ans === "yes" && (
              <button onClick={whatsappShare}
                style={{ marginTop: 16, padding: "10px 24px", borderRadius: 20, background: "rgba(37,211,102,.12)", border: "1px solid rgba(37,211,102,.3)", color: "#25D366", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                📤 שתפו גם לחברים
              </button>
            )}
          </div>
        )}

        {/* Viral join panel */}
        {step === "join" && (
          <div style={{ borderRadius: 22, overflow: "hidden", border: "1px solid rgba(0,206,209,.18)", animation: "fadeIn .6s", marginTop: 8 }}>
            <div style={{ background: "linear-gradient(160deg,rgba(0,206,209,.08) 0%,rgba(0,0,0,.5) 100%)", padding: "26px 22px 24px", textAlign: "center" }}>
              <div style={{ marginBottom: 14 }}><Logo sz={22} /></div>
              <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 900, marginBottom: 8, lineHeight: 1.3 }}>
                גם אתם מארגנים אירוע?
              </h3>
              <p style={{ color: "rgba(255,255,255,.5)", fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
                {ans === "yes"
                  ? "תכננו את האירוע שלכם בדיוק כמו שתכננו כאן — "
                  : "מאות זוגות מצאו כאן את ספקי האירועים הטובים ביותר — "}
                <strong style={{ color: "#00CED1" }}>בחינם לגמרי</strong>.
              </p>

              {!emailSent ? (
                <>
                  <input
                    type="email" placeholder="הכניסו אימייל לגישה חופשית"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && joinVibeMatch()}
                    style={{ width: "100%", padding: "13px 16px", borderRadius: 14, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.05)", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 10, direction: "ltr", textAlign: "center" }}
                  />
                  <button onClick={joinVibeMatch} disabled={emailLoading}
                    style={{ width: "100%", padding: "14px 0", borderRadius: 14, border: "none", background: "#00CED1", color: "#000", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 20px rgba(0,206,209,.4)", opacity: emailLoading ? 0.7 : 1 }}>
                    {emailLoading ? "..." : "🚀 הצטרפו בחינם"}
                  </button>
                  <a href="/" style={{ display: "block", marginTop: 10, color: "rgba(255,255,255,.25)", fontSize: 12, textDecoration: "none", padding: "6px 0" }}>
                    עיון ללא הרשמה →
                  </a>
                </>
              ) : (
                <div style={{ padding: "10px 0" }}>
                  <div style={{ fontSize: 42, marginBottom: 10 }}>📬</div>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>בדקו את המייל!</p>
                  <p style={{ color: "rgba(255,255,255,.4)", fontSize: 12, marginTop: 6 }}>שלחנו לינק כניסה ישיר</p>
                </div>
              )}
              <p style={{ color: "rgba(255,255,255,.12)", fontSize: 10, marginTop: 14 }}>ללא סיסמה · ללא תשלום · ביטול בכל עת</p>
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", padding: "32px 0 20px" }}>
          <p style={{ color: "#222", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Powered by</p>
          <Logo sz={24} />
        </div>
      </div>
    </div>
  );
}
