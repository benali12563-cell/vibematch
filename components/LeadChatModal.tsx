"use client";
import { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/context";
import { sendLocalNotification } from "./PWASetup";
import { saveLead, saveLeadMessage } from "@/lib/supabase/leads";
import type { Vendor, ChatThread, ChatMessage } from "@/types";

interface Props {
  vendor: Vendor;
  existingThread?: ChatThread;
  onClose: () => void;
}

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function fmtTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

function parseVideoEmbed(url: string): { kind: "iframe" | "video" | "ext"; src: string } {
  if (url.includes("youtube.com/watch")) {
    const v = new URL(url).searchParams.get("v");
    return { kind: "iframe", src: `https://www.youtube.com/embed/${v}?autoplay=1` };
  }
  if (url.includes("youtu.be/")) {
    const v = url.split("youtu.be/")[1].split("?")[0];
    return { kind: "iframe", src: `https://www.youtube.com/embed/${v}?autoplay=1` };
  }
  if (url.includes("vimeo.com/")) {
    const v = url.split("vimeo.com/")[1].split(/[?/]/)[0];
    return { kind: "iframe", src: `https://player.vimeo.com/video/${v}?autoplay=1` };
  }
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return { kind: "video", src: url };
  return { kind: "ext", src: url };
}

export function VideoModal({ url, onClose }: { url: string; onClose: () => void }) {
  const { kind, src } = parseVideoEmbed(url);
  useEffect(() => {
    if (kind === "ext") { window.open(src, "_blank"); onClose(); }
  }, [kind, src, onClose]);
  if (kind === "ext") return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(0,0,0,.92)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(100vw,480px)", aspectRatio: "9/16", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 10, right: 10, zIndex: 1, width: 34, height: 34, borderRadius: "50%", background: "rgba(0,0,0,.7)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", cursor: "pointer", fontSize: 16 }}>✕</button>
        {kind === "iframe"
          ? <iframe src={src} style={{ width: "100%", height: "100%", border: "none", borderRadius: 12 }} allow="autoplay; fullscreen" allowFullScreen />
          : <video src={src} controls autoPlay playsInline style={{ width: "100%", height: "100%", borderRadius: 12, background: "#000" }} />
        }
      </div>
    </div>
  );
}

export default function LeadChatModal({ vendor, existingThread, onClose }: Props) {
  const { lang, user, chatThreads, setChatThreads, showToast } = useApp();
  const isHe = lang === "he";

  const [step, setStep] = useState<"form" | "chat">(existingThread ? "chat" : "form");
  const [thread, setThread] = useState<ChatThread | null>(existingThread ?? null);
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("");
  const [budget, setBudget] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step === "chat") setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }, [step, thread?.messages.length]);

  // Mark client messages as read when viewing
  useEffect(() => {
    if (thread) {
      setChatThreads((p) => p.map((t) => t.id === thread.id ? { ...t, unreadClient: 0 } : t));
    }
  }, [thread?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submitLead() {
    if (!note.trim() && !date && !guests && !budget) return;
    setSending(true);
    const systemText = [
      isHe ? "📋 פרטי הליד:" : "📋 Lead details:",
      date ? `📅 ${isHe ? "תאריך" : "Date"}: ${date}` : "",
      guests ? `👥 ${isHe ? "אורחים" : "Guests"}: ${guests}` : "",
      budget ? `💰 ${isHe ? "תקציב" : "Budget"}: ${budget}` : "",
      note ? `💬 ${note}` : "",
    ].filter(Boolean).join("\n");

    const sysMsg: ChatMessage = { id: uid(), from: "system", text: systemText, ts: Date.now() };

    if (thread) {
      // Editing existing thread — update lead details, append system message
      const updated: ChatThread = {
        ...thread,
        lead: { date, guests, budget },
        messages: [...thread.messages, sysMsg],
        unreadVendor: thread.unreadVendor + 1,
      };
      setThread(updated);
      setChatThreads((p) => p.map((t) => t.id === thread.id ? updated : t));
      setStep("chat");
      showToast(isHe ? "✅ הליד עודכן!" : "✅ Lead updated!");
      saveLeadMessage(thread.id, sysMsg).catch(() => {});
      setSending(false);
      return;
    }

    // New thread
    const newThread: ChatThread = {
      id: uid(),
      vendorName: vendor.name,
      vendorCat: vendor.catKey,
      clientName: user?.name,
      messages: [sysMsg],
      lead: { date, guests, budget },
      createdAt: Date.now(),
      unreadClient: 0,
      unreadVendor: 1,
    };
    // Optimistic UI
    setChatThreads((p) => [...p, newThread]);
    setThread(newThread);
    setStep("chat");
    sendLocalNotification(
      vendor.name,
      isHe ? `פנייה חדשה מ-${user?.name ?? "לקוח"}` : `New lead from ${user?.name ?? "a client"}`,
      "/"
    );
    const { error: saveError } = await saveLead(newThread);
    setSending(false);
    if (saveError) {
      showToast(isHe ? "⚠️ שגיאת רשת — הפנייה נשמרה זמנית" : "⚠️ Network error — lead saved locally");
    } else {
      showToast(isHe ? "✅ הליד נשלח!" : "✅ Lead sent!");
    }
  }

  function sendMsg() {
    if (!msg.trim() || !thread) return;
    const newMsg: ChatMessage = { id: uid(), from: "client", text: msg.trim(), ts: Date.now(), senderName: user?.name ?? (isHe ? "אורח" : "Guest") };
    const updated: ChatThread = { ...thread, messages: [...thread.messages, newMsg], unreadVendor: thread.unreadVendor + 1 };
    sendLocalNotification(
      vendor.name,
      `${user?.name ?? (isHe ? "לקוח" : "Client")}: ${msg.trim().slice(0, 60)}`,
      "/"
    );
    setThread(updated);
    setChatThreads((p) => p.map((t) => t.id === thread.id ? updated : t));
    // Persist to Supabase (fire-and-forget)
    saveLeadMessage(thread.id, newMsg).catch(() => {/* offline — context already has it */});
    setMsg("");
  }

  const bubbleStyle = (from: ChatMessage["from"]): React.CSSProperties => {
    if (from === "system") return { alignSelf: "center", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, padding: "10px 14px", maxWidth: "88%", fontSize: 12, color: "rgba(255,255,255,.7)", whiteSpace: "pre-line", textAlign: isHe ? "right" : "left", direction: isHe ? "rtl" : "ltr" };
    const isMe = from === "client";
    return {
      alignSelf: isMe ? (isHe ? "flex-start" : "flex-end") : (isHe ? "flex-end" : "flex-start"),
      background: isMe ? "linear-gradient(135deg,#00CED1,#008b8b)" : "rgba(255,255,255,.09)",
      borderRadius: isMe ? (isHe ? "16px 16px 16px 4px" : "16px 16px 4px 16px") : (isHe ? "16px 16px 4px 16px" : "16px 16px 16px 4px"),
      padding: "10px 14px", maxWidth: "75%", fontSize: 14, color: isMe ? "#000" : "#fff", fontWeight: isMe ? 600 : 400,
    };
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto", fontFamily: isHe ? "'Heebo'" : "'Manrope','Heebo'", direction: isHe ? "rtl" : "ltr" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,.08)", background: "rgba(0,0,0,.6)", backdropFilter: "blur(20px)" }}>
        <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.7)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        <div style={{ flex: 1 }}>
          <p style={{ color: "#fff", fontWeight: 800, fontSize: 15, margin: 0 }}>{vendor.name}</p>
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: 11, margin: 0 }}>{vendor.sub} · {vendor.city}</p>
        </div>
        {step === "chat" && (
          <button onClick={() => {
            // Prepopulate form with existing lead data
            if (thread?.lead) {
              setDate(thread.lead.date ?? "");
              setGuests(thread.lead.guests ?? "");
              setBudget(thread.lead.budget ?? "");
            }
            setStep("form");
          }} style={{ fontSize: 10, padding: "5px 10px", borderRadius: 8, background: "rgba(0,206,209,.12)", border: "1px solid rgba(0,206,209,.3)", color: "#00CED1", cursor: "pointer", fontFamily: "inherit" }}>
            {isHe ? "✏️ ערוך ליד" : "✏️ Edit Lead"}
          </button>
        )}
      </div>

      {step === "form" ? (
        /* ── LEAD FORM ── */
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ color: "#00CED1", fontWeight: 800, fontSize: 18, margin: "0 0 4px" }}>{isHe ? "שלח בקשה לספק" : "Send a Request"}</p>
            <p style={{ color: "rgba(255,255,255,.4)", fontSize: 12, margin: 0 }}>{isHe ? "מלא פרטים ותקבל הצעת מחיר ישירה" : "Fill in details to get a direct quote"}</p>
          </div>

          {[
            { label: isHe ? "📅 תאריך האירוע" : "📅 Event Date", val: date, set: setDate, type: "date" },
            { label: isHe ? "👥 מספר אורחים" : "👥 Guest Count", val: guests, set: setGuests, type: "number", placeholder: isHe ? "למשל: 200" : "e.g. 200" },
            { label: isHe ? "💰 תקציב משוער" : "💰 Approx. Budget", val: budget, set: setBudget, type: "text", placeholder: isHe ? "למשל: ₪20,000" : "e.g. ₪20,000" },
          ].map(({ label, val, set, type, placeholder }) => (
            <div key={label} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "rgba(255,255,255,.55)", fontSize: 11, fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>{label}</label>
              <input
                type={type} value={val} onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                min={type === "date" ? new Date().toISOString().split("T")[0] : undefined}
                style={{ width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          ))}

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", color: "rgba(255,255,255,.55)", fontSize: 11, fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>{isHe ? "💬 הודעה לספק" : "💬 Message to Vendor"}</label>
            <textarea
              rows={4} value={note} onChange={(e) => setNote(e.target.value)}
              placeholder={isHe ? "ספרו לנו על האירוע שלכם..." : "Tell us about your event..."}
              style={{ width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", resize: "none", boxSizing: "border-box" }}
            />
          </div>

          <button
            onClick={submitLead} disabled={sending || (!note.trim() && !date && !guests && !budget)}
            style={{ width: "100%", padding: "16px 0", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#00CED1,#008b8b)", color: "#000", fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: "inherit", opacity: (!note.trim() && !date && !guests && !budget) ? 0.45 : 1, boxShadow: "0 6px 24px rgba(0,206,209,.3)" }}
          >
            {isHe ? "שלח בקשה ✉️" : "Send Request ✉️"}
          </button>
        </div>
      ) : (
        /* ── CHAT VIEW ── */
        <>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
            {thread?.messages.map((m) => (
              <div key={m.id} style={{ display: "flex", flexDirection: "column" }}>
                {m.from !== "system" && (
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,.3)", marginBottom: 3, alignSelf: m.from === "client" ? (isHe ? "flex-start" : "flex-end") : (isHe ? "flex-end" : "flex-start") }}>
                    {m.senderName} · {fmtTime(m.ts)}
                  </span>
                )}
                <div style={bubbleStyle(m.from)}>{m.text}</div>
                {m.from === "system" && <span style={{ fontSize: 9, color: "rgba(255,255,255,.25)", textAlign: "center", marginTop: 2 }}>{fmtTime(m.ts)}</span>}
              </div>
            ))}
            {(!thread?.messages.length) && (
              <p style={{ color: "rgba(255,255,255,.25)", fontSize: 13, textAlign: "center", marginTop: 40 }}>{isHe ? "אין הודעות עדיין" : "No messages yet"}</p>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Message input */}
          <div style={{ padding: "12px 16px 20px", borderTop: "1px solid rgba(255,255,255,.07)", display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea
              rows={1} value={msg} onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
              placeholder={isHe ? "כתוב הודעה..." : "Type a message..."}
              style={{ flex: 1, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 14, padding: "11px 14px", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", resize: "none", lineHeight: 1.4 }}
            />
            <button
              onClick={sendMsg} disabled={!msg.trim()}
              style={{ width: 44, height: 44, borderRadius: "50%", background: msg.trim() ? "linear-gradient(135deg,#00CED1,#008b8b)" : "rgba(255,255,255,.07)", border: "none", color: msg.trim() ? "#000" : "rgba(255,255,255,.25)", cursor: msg.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20, transform: isHe ? "scaleX(-1)" : "none" }}>send</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
