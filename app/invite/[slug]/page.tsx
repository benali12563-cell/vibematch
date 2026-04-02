"use client";
import { use, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveRsvp, trackReferral, loadRsvps } from "@/lib/supabase/rsvp";
import { loadEventPage, type EventPage } from "@/lib/supabase/events";
import Logo from "@/components/Logo";

function useCountdown(dateStr?: string) {
  const [diff, setDiff] = useState<{ d: number; h: number; m: number } | null>(null);
  useEffect(() => {
    if (!dateStr) return;
    const target = new Date(dateStr).getTime();
    if (isNaN(target)) return;
    const tick = () => {
      const ms = target - Date.now();
      if (ms <= 0) { setDiff({ d: 0, h: 0, m: 0 }); return; }
      setDiff({ d: Math.floor(ms / 86400000), h: Math.floor((ms % 86400000) / 3600000), m: Math.floor((ms % 3600000) / 60000) });
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [dateStr]);
  return diff;
}

export default function InvitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") ?? undefined;

  const fallbackName = decodeURIComponent(slug).replace(/-/g, " ");

  const [eventPage, setEventPage] = useState<EventPage | null>(null);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const [step, setStep] = useState<"rsvp" | "done" | "join">("rsvp");
  const [ans, setAns] = useState<"yes" | "no" | null>(null);
  const [name, setName] = useState("");
  const [count, setCount] = useState("2");
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const countdown = useCountdown(eventPage?.event_date);
  const hostName = eventPage?.host_name ?? fallbackName;

  useEffect(() => {
    Promise.all([
      loadEventPage(slug),
      loadRsvps(slug),
    ]).then(([page, { data: rsvps }]) => {
      setEventPage(page);
      setConfirmedCount((rsvps ?? []).reduce((s: number, r: { guest_count: number }) => s + (r.guest_count ?? 1), 0));
      setLoaded(true);
    }).catch(() => setLoaded(true));

    void trackReferral({
      referrer_slug: slug,
      referrer_type: "invite",
      page_visited: `/invite/${slug}`,
    });
  }, [slug]);

  async function confirm(choice: "yes" | "no") {
    if (choice === "yes" && !name.trim()) return;
    setAns(choice);
    setStep("done");

    await saveRsvp({
      invite_slug: slug,
      guest_name: name || "אורח",
      guest_count: count === "5+" ? 5 : parseInt(count),
      status: choice === "yes" ? "coming" : "not_coming",
    }).catch(() => {});

    if (choice === "yes") {
      setConfirmedCount((c) => c + (count === "5+" ? 5 : parseInt(count)));
    }

    setTimeout(() => setStep("join"), 2000);
  }

  async function joinVibeMatch() {
    if (!email.includes("@")) return;
    setEmailLoading(true);
    try {
      const sb = createClient();
      await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
      void sb.from("referral_visits").insert({ referrer_slug: slug, referrer_type: "invite", page_visited: `/invite/${slug}`, registered: true });
      setEmailSent(true);
    } finally {
      setEmailLoading(false);
    }
  }

  const shareWhatsApp = () => {
    const url = `${window.location.origin}/invite/${slug}`;
    const text = `הוזמנתם לאירוע של ${hostName} 🎉\nאשרו הגעה כאן:\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const hasDate = !!(eventPage?.event_date);
  const hasAddress = !!(eventPage?.event_address);
  const hasWaze = !!(eventPage?.waze_link);
  const hasVendors = (eventPage?.vendor_names ?? []).length > 0;
  const hasNotes = !!(eventPage?.event_notes);

  return (
    <div style={{ minHeight: "100dvh", background: "linear-gradient(180deg,#000 0%,#03080f 30%,#060d1a 60%,#000 100%)", fontFamily: "'Heebo','Manrope',sans-serif", direction: "rtl", overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: 440, margin: "0 auto", padding: "0 18px 60px" }}>

        {/* Decorative top line */}
        <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg,transparent,rgba(0,206,209,.5),transparent)", marginTop: 0 }} />

        {/* Hero */}
        <div style={{ textAlign: "center", paddingTop: 56, paddingBottom: 32 }}>
          <p style={{ color: "rgba(0,229,232,.6)", fontSize: 10, letterSpacing: 5, textTransform: "uppercase", marginBottom: 18, fontWeight: 600 }}>
            הוזמנתם לחגוג איתנו
          </p>

          <h1 style={{ color: "#fff", fontSize: 40, fontWeight: 900, lineHeight: 1.1, letterSpacing: -1, margin: "0 0 8px", textShadow: "0 0 40px rgba(0,206,209,.15)" }}>
            {hostName}
          </h1>

          <div style={{ width: 60, height: 2, background: "linear-gradient(90deg,transparent,#00CED1,transparent)", margin: "18px auto" }} />

          {/* Date */}
          {hasDate && (
            <p style={{ color: "rgba(255,255,255,.7)", fontSize: 17, fontWeight: 600, marginBottom: 4, letterSpacing: .5 }}>
              {eventPage!.event_date}
            </p>
          )}

          {/* Address + Waze */}
          {hasAddress && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 6 }}>
              <p style={{ color: "rgba(255,255,255,.4)", fontSize: 13 }}>{eventPage!.event_address}</p>
              {hasWaze && (
                <a href={eventPage!.waze_link} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(0,206,209,.1)", border: "1px solid rgba(0,206,209,.25)", borderRadius: 20, padding: "4px 12px", color: "#00CED1", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>
                  <span style={{ fontSize: 14 }}>🗺️</span> Waze
                </a>
              )}
            </div>
          )}

          {/* Countdown */}
          {countdown && (countdown.d > 0 || countdown.h > 0) && (
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 20, animation: "fadeIn .8s" }}>
              {[{ v: countdown.d, l: "ימים" }, { v: countdown.h, l: "שעות" }, { v: countdown.m, l: "דקות" }].map(({ v, l }) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div style={{ background: "rgba(0,206,209,.08)", border: "1px solid rgba(0,206,209,.2)", borderRadius: 10, width: 54, height: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#00e5e8", fontSize: 22, fontWeight: 900 }}>{String(v).padStart(2, "0")}</span>
                  </div>
                  <span style={{ color: "rgba(255,255,255,.3)", fontSize: 10, marginTop: 4, display: "block" }}>{l}</span>
                </div>
              ))}
            </div>
          )}

          {/* Confirmed count badge */}
          {confirmedCount > 0 && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 18, background: "rgba(0,206,209,.07)", border: "1px solid rgba(0,206,209,.18)", borderRadius: 20, padding: "6px 16px" }}>
              <span style={{ color: "#00CED1", fontWeight: 900, fontSize: 16 }}>{confirmedCount}</span>
              <span style={{ color: "rgba(255,255,255,.4)", fontSize: 12 }}>כבר אישרו הגעה</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {hasNotes && (
          <div style={{ background: "rgba(255,255,255,.02)", borderRadius: 16, padding: "14px 18px", border: "1px solid rgba(255,255,255,.05)", marginBottom: 20, animation: "fadeIn .6s" }}>
            <p style={{ color: "rgba(255,255,255,.55)", fontSize: 13, lineHeight: 1.7, textAlign: "center" }}>
              💌 {eventPage!.event_notes}
            </p>
          </div>
        )}

        {/* RSVP form */}
        {step === "rsvp" && (
          <div style={{ background: "rgba(255,255,255,.025)", borderRadius: 22, padding: 24, marginBottom: 20, border: "1px solid rgba(255,255,255,.07)", animation: "fadeIn .5s" }}>
            <p style={{ color: "rgba(255,255,255,.6)", fontSize: 14, textAlign: "center", marginBottom: 20, lineHeight: 1.6 }}>
              {loaded ? "נשמח לדעת שאתם מגיעים ✨" : "טוען..."}
            </p>

            <input
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder="השם שלך"
              style={{ width: "100%", padding: "13px 16px", borderRadius: 14, border: `1.5px solid ${name ? "rgba(0,206,209,.35)" : "rgba(255,255,255,.08)"}`, background: "rgba(255,255,255,.04)", color: "#fff", fontSize: 14, fontFamily: "inherit", marginBottom: 16, outline: "none", transition: "border-color .15s", boxSizing: "border-box" }}
            />

            <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 20 }}>
              <span style={{ color: "rgba(255,255,255,.4)", fontSize: 13 }}>כמה מגיעים?</span>
              <div style={{ display: "flex", gap: 6 }}>
                {["1","2","3","4","5+"].map((n) => (
                  <button key={n} onClick={() => setCount(n)}
                    style={{ width: 40, height: 40, borderRadius: 10, border: `1.5px solid ${count === n ? "rgba(0,229,232,.6)" : "rgba(255,255,255,.08)"}`, background: count === n ? "rgba(0,206,209,.14)" : "rgba(255,255,255,.03)", color: count === n ? "#00e5e8" : "rgba(255,255,255,.4)", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all .12s", fontFamily: "inherit" }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => confirm("yes")} disabled={!name.trim()}
              style={{ width: "100%", padding: "16px 0", borderRadius: 16, border: "none", background: name.trim() ? "linear-gradient(160deg,#00e5e8,#00b8ba)" : "rgba(255,255,255,.06)", color: name.trim() ? "#000" : "rgba(255,255,255,.2)", fontWeight: 900, fontSize: 16, cursor: name.trim() ? "pointer" : "default", fontFamily: "inherit", marginBottom: 10, boxShadow: name.trim() ? "0 6px 28px rgba(0,206,209,.35)" : "none", transition: "all .2s" }}>
              ✓ אני מגיע ({count})
            </button>
            <button onClick={() => confirm("no")}
              style={{ display: "block", width: "100%", background: "none", border: "none", color: "rgba(255,255,255,.2)", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: "10px 0" }}>
              לא הפעם
            </button>
          </div>
        )}

        {/* Confirmation */}
        {step === "done" && (
          <div style={{ textAlign: "center", padding: "32px 0 20px", animation: "scaleIn .4s" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>{ans === "yes" ? "🎉" : "😢"}</div>
            <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
              {ans === "yes" ? "מחכים לראות אתכם!" : "תודה על העדכון"}
            </h2>
            <p style={{ color: "rgba(255,255,255,.35)", fontSize: 13 }}>
              {ans === "yes" ? `${name} — נרשמת בהצלחה ✓` : "נשמח בפעם הבאה"}
            </p>
            {ans === "yes" && (
              <button onClick={shareWhatsApp}
                style={{ marginTop: 20, padding: "12px 28px", borderRadius: 24, background: "rgba(37,211,102,.12)", border: "1px solid rgba(37,211,102,.35)", color: "#25D366", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                💬 שתפו גם לחברים
              </button>
            )}
          </div>
        )}

        {/* Vendor team */}
        {hasVendors && step !== "rsvp" && (
          <div style={{ marginTop: 28, marginBottom: 20, animation: "fadeIn .6s ease .3s both" }}>
            <p style={{ color: "rgba(255,255,255,.25)", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", textAlign: "center", marginBottom: 14 }}>
              הצוות שלנו לאירוע
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {(eventPage!.vendor_names ?? []).map((name) => (
                <div key={name} style={{ background: "rgba(255,255,255,.02)", borderRadius: 12, padding: "14px 12px", textAlign: "center", border: "1px solid rgba(255,255,255,.04)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "rgba(0,206,209,.5)", display: "block", marginBottom: 6 }}>verified</span>
                  <p style={{ color: "rgba(255,255,255,.75)", fontSize: 12, fontWeight: 600 }}>{name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Viral join panel */}
        {step === "join" && (
          <div style={{ borderRadius: 22, overflow: "hidden", border: "1px solid rgba(0,206,209,.18)", animation: "fadeIn .6s", marginTop: 12 }}>
            <div style={{ background: "linear-gradient(160deg,rgba(0,206,209,.09) 0%,rgba(0,0,0,.6) 100%)", padding: "28px 22px 26px", textAlign: "center" }}>
              <div style={{ marginBottom: 14 }}><Logo sz={22} /></div>
              <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 900, marginBottom: 8, lineHeight: 1.3 }}>
                גם אתם מארגנים אירוע?
              </h3>
              <p style={{ color: "rgba(255,255,255,.45)", fontSize: 13, lineHeight: 1.75, marginBottom: 20 }}>
                {ans === "yes"
                  ? "תכננו את האירוע שלכם בדיוק ככה — "
                  : "מאות זוגות מצאו כאן ספקים מדהימים — "}
                <strong style={{ color: "#00CED1" }}>בחינם לגמרי</strong>.
              </p>

              {!emailSent ? (
                <>
                  <input
                    type="email" placeholder="הכניסו אימייל לגישה חופשית"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && joinVibeMatch()}
                    style={{ width: "100%", padding: "13px 16px", borderRadius: 14, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.05)", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 10, direction: "ltr", textAlign: "center", boxSizing: "border-box" }}
                  />
                  <button onClick={joinVibeMatch} disabled={emailLoading}
                    style={{ width: "100%", padding: "15px 0", borderRadius: 14, border: "none", background: "#00CED1", color: "#000", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 20px rgba(0,206,209,.4)", opacity: emailLoading ? .7 : 1 }}>
                    {emailLoading ? "..." : "🚀 הצטרפו בחינם"}
                  </button>
                  <a href="/" style={{ display: "block", marginTop: 10, color: "rgba(255,255,255,.2)", fontSize: 12, textDecoration: "none", padding: "6px 0" }}>
                    עיון ללא הרשמה →
                  </a>
                </>
              ) : (
                <div style={{ padding: "10px 0" }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>📬</div>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>בדקו את המייל!</p>
                  <p style={{ color: "rgba(255,255,255,.4)", fontSize: 12, marginTop: 6 }}>שלחנו לינק כניסה ישיר</p>
                </div>
              )}
              <p style={{ color: "rgba(255,255,255,.12)", fontSize: 10, marginTop: 14 }}>ללא סיסמה · ללא תשלום · ביטול בכל עת</p>
            </div>
          </div>
        )}

        {/* Bottom branding */}
        <div style={{ textAlign: "center", padding: "36px 0 24px" }}>
          <p style={{ color: "#1a1a1a", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Powered by</p>
          <Logo sz={26} />
        </div>

      </div>
    </div>
  );
}
