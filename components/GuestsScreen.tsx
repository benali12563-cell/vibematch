"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { T, allVendors } from "@/lib/constants";
import Nav from "./Nav";
import B from "./B";
import Inp from "./Inp";
import { saveEventPage } from "@/lib/supabase/events";
import { loadRsvps } from "@/lib/supabase/rsvp";

export default function GuestsScreen() {
  const { lang, user, likes, eventInfo, setEventInfo, guests, setGuests } = useApp();
  const t = T[lang];
  const isHe = lang === "he";
  const dir = isHe ? "rtl" : "ltr";
  const router = useRouter();

  const [copied, setCopied] = useState(false);
  const [editInfo, setEditInfo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  const team = allVendors().filter((v) => likes.includes(v.name));

  const slug = encodeURIComponent((user?.name ?? "").replace(/\s+/g, "-"));
  const inviteLink = `${typeof window !== "undefined" ? window.location.origin : "https://vibematch.co.il"}/invite/${slug}`;

  // Load RSVPs from Supabase whenever we have a valid slug
  useEffect(() => {
    if (!slug) return;
    setRsvpLoading(true);
    loadRsvps(slug).then(({ data }) => {
      if (data?.length) {
        setGuests(data.map((r) => ({ name: r.guest_name, count: r.guest_count, ts: Date.now() })));
      }
    }).catch(() => {}).finally(() => setRsvpLoading(false));
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const copyLink = useCallback(() => {
    navigator.clipboard?.writeText(inviteLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [inviteLink]);

  const shareWhatsApp = useCallback(() => {
    const text = isHe
      ? `הוזמנתם לאירוע שלי 🎉\nאשרו הגעה כאן:\n${inviteLink}`
      : `You're invited to my event 🎉\nRSVP here:\n${inviteLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }, [inviteLink, isHe]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    await saveEventPage({
      slug,
      host_name: user?.name ?? "אירוע",
      event_date: eventInfo.date || undefined,
      event_address: eventInfo.address || undefined,
      waze_link: eventInfo.wazeLink || undefined,
      event_notes: eventInfo.notes || undefined,
      vendor_names: team.map((v) => v.name),
    });
    setSaving(false);
    setSaved(true);
    setEditInfo(false);
    setTimeout(() => setSaved(false), 2500);
  }, [slug, user, eventInfo, team]);

  const confirmedCount = guests.reduce((s, g) => s + g.count, 0);

  // Not logged in — can't create a meaningful invite link
  if (!user) {
    return (
      <div style={{ minHeight: "100dvh", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", direction: dir, fontFamily: "inherit" }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>👥</div>
        <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 8, textAlign: "center" }}>
          {isHe ? "נדרשת כניסה" : "Sign in required"}
        </h2>
        <p style={{ color: "#555", fontSize: 13, textAlign: "center", marginBottom: 24, lineHeight: 1.6 }}>
          {isHe ? "התחברו כדי ליצור דף אירוע ולשלוח הזמנות לאורחים" : "Sign in to create an event page and invite guests"}
        </p>
        <button onClick={() => router.push("/auth/login")} style={{ padding: "14px 32px", borderRadius: 14, background: "linear-gradient(160deg,#00e5e8,#00CED1)", border: "none", color: "#000", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
          {isHe ? "כניסה / הרשמה" : "Sign In / Register"}
        </button>
        <Nav />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#000", fontFamily: "inherit", direction: dir, padding: "52px 14px 80px" }}>
      {/* Header */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 48, background: "rgba(0,0,0,.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, maxWidth: 480, margin: "0 auto" }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{isHe ? "ניהול אורחים" : "Guest Management"}</span>
        {rsvpLoading && <div style={{ position: "absolute", right: 14, width: 16, height: 16, border: "2px solid rgba(0,206,209,.3)", borderTopColor: "#00CED1", borderRadius: "50%", animation: "spin 1s linear infinite" }} />}
      </div>

      {/* Invite link hero */}
      <div style={{ background: "linear-gradient(135deg,rgba(0,206,209,.12) 0%,rgba(0,0,0,0) 60%)", borderRadius: 20, border: "1px solid rgba(0,206,209,.2)", padding: "22px 18px", marginBottom: 18 }}>
        <p style={{ color: "#00CED1", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>
          {isHe ? "הלינק שלך לאורחים" : "YOUR GUEST LINK"}
        </p>
        <p style={{ color: "rgba(255,255,255,.55)", fontSize: 12, marginBottom: 16, lineHeight: 1.5 }}>
          {isHe ? "שלחו לאורחים שלכם — הם יקבלו דף אירוע מרשים עם כל הפרטים" : "Send to your guests — they get a stunning event page with all details"}
        </p>

        {/* WhatsApp share — primary CTA */}
        <button onClick={shareWhatsApp} style={{ width: "100%", padding: "15px 0", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#25D366,#128C7E)", color: "#fff", fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: "inherit", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(37,211,102,.3)" }}>
          <span style={{ fontSize: 20 }}>💬</span>
          {isHe ? "שלחו בוואטסאפ לכל האורחים" : "Share via WhatsApp"}
        </button>

        {/* Copy link — secondary */}
        <button onClick={copyLink} style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "1px solid rgba(0,206,209,.25)", background: copied ? "rgba(0,206,209,.1)" : "rgba(255,255,255,.03)", color: copied ? "#00e5e8" : "rgba(255,255,255,.5)", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all .2s" }}>
          {copied ? (isHe ? "✓ הועתק!" : "✓ Copied!") : (isHe ? "📋 העתק לינק" : "📋 Copy Link")}
        </button>
      </div>

      {/* Confirmed count */}
      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <div style={{ flex: 1, background: "rgba(0,206,209,.06)", borderRadius: 14, padding: "16px 18px", border: "1px solid rgba(0,206,209,.15)", textAlign: "center" }}>
          <div style={{ color: "#00CED1", fontSize: 36, fontWeight: 900, lineHeight: 1 }}>{confirmedCount}</div>
          <div style={{ color: "#555", fontSize: 11, marginTop: 4 }}>{isHe ? "אורחים מאושרים" : "Confirmed Guests"}</div>
        </div>
        <div style={{ flex: 1, background: "rgba(255,255,255,.02)", borderRadius: 14, padding: "16px 18px", border: "1px solid rgba(255,255,255,.05)", textAlign: "center" }}>
          <div style={{ color: "#fff", fontSize: 36, fontWeight: 900, lineHeight: 1 }}>{guests.length}</div>
          <div style={{ color: "#555", fontSize: 11, marginTop: 4 }}>{isHe ? "תשובות" : "Responses"}</div>
        </div>
      </div>

      {/* Guest list */}
      {guests.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ color: "rgba(255,255,255,.3)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>{isHe ? "אישורי הגעה" : "RSVPs"}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {guests.slice().reverse().map((g, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,.02)", borderRadius: 10, padding: "10px 14px", border: "1px solid rgba(255,255,255,.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "rgba(255,255,255,.7)", fontSize: 13, fontWeight: 500 }}>{g.name}</span>
                <span style={{ color: "#00CED1", fontSize: 12, fontWeight: 600 }}>{g.count} {isHe ? "אנשים" : "people"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event details */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <p style={{ color: "rgba(255,255,255,.45)", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", fontWeight: 600 }}>{isHe ? "פרטי האירוע" : "Event Details"}</p>
          {!editInfo && (
            <button onClick={() => setEditInfo(true)} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.5)", fontSize: 12, padding: "4px 12px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>
              {isHe ? "✏️ עריכה" : "✏️ Edit"}
            </button>
          )}
        </div>

        {editInfo ? (
          <div style={{ background: "rgba(255,255,255,.02)", borderRadius: 16, padding: 16, border: "1px solid rgba(255,255,255,.06)", display: "flex", flexDirection: "column", gap: 10 }}>
            <Inp value={eventInfo.address} onChange={(v) => setEventInfo((p) => ({ ...p, address: v }))} placeholder={isHe ? "כתובת האירוע" : "Event Address"} />
            <Inp value={eventInfo.wazeLink} onChange={(v) => setEventInfo((p) => ({ ...p, wazeLink: v }))} placeholder="Waze link" dir="ltr" />
            <Inp value={eventInfo.date} onChange={(v) => setEventInfo((p) => ({ ...p, date: v }))} placeholder={isHe ? "תאריך האירוע" : "Event Date"} />
            <Inp value={eventInfo.notes} onChange={(v) => setEventInfo((p) => ({ ...p, notes: v }))} placeholder={isHe ? "הערות לאורחים" : "Notes for guests"} />
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <B style={{ flex: 1 }} onClick={handleSave}>
                {saving ? (isHe ? "שומר..." : "Saving...") : saved ? (isHe ? "✓ נשמר!" : "✓ Saved!") : (isHe ? "שמור ועדכן דף האירוע" : "Save & Update Event Page")}
              </B>
              <B v="ghost" style={{ flex: "0 0 auto", padding: "0 16px" }} onClick={() => setEditInfo(false)}>{isHe ? "ביטול" : "Cancel"}</B>
            </div>
          </div>
        ) : (
          <div style={{ background: "rgba(255,255,255,.02)", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(255,255,255,.04)" }}>
            {eventInfo.address
              ? <p style={{ color: "rgba(255,255,255,.65)", fontSize: 13 }}>{eventInfo.address}</p>
              : <p style={{ color: "#333", fontSize: 12 }}>{isHe ? "לחצו עריכה כדי להוסיף פרטים לדף האירוע" : "Click edit to add details to the event page"}</p>}
            {eventInfo.date && <p style={{ color: "#00CED1", fontSize: 12, marginTop: 4 }}>{eventInfo.date}</p>}
            {eventInfo.notes && <p style={{ color: "#555", fontSize: 11, marginTop: 4 }}>{eventInfo.notes}</p>}
          </div>
        )}
      </div>

      {/* Vendor team */}
      {team.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: "rgba(255,255,255,.3)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>{isHe ? "צוות הספקים שלך" : "Your Vendor Team"}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {team.map((v) => (
              <div key={v.name} style={{ background: "rgba(255,255,255,.02)", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(255,255,255,.04)", display: "flex", alignItems: "center", gap: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#00CED1" }}>verified</span>
                <div>
                  <p style={{ color: "rgba(255,255,255,.8)", fontSize: 12, fontWeight: 600 }}>{v.name}</p>
                  <p style={{ color: "#00CED1", fontSize: 10, marginTop: 1 }}>{v.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Nav />
    </div>
  );
}
