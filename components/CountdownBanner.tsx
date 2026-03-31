"use client";
import { useState } from "react";
import { useApp } from "@/lib/context";
import Inp from "./Inp";
import B from "./B";

export default function CountdownBanner() {
  const { eventInfo, setEventInfo, lang } = useApp();
  const isHe = lang === "he";
  const [editing, setEditing] = useState(false);
  const [tmpDate, setTmpDate] = useState(eventInfo.date || "");

  const days = eventInfo.date
    ? Math.ceil((new Date(eventInfo.date).getTime() - Date.now()) / 86400000)
    : null;

  const urgency = days !== null && days <= 30;

  if (!eventInfo.date && !editing) {
    return (
      <button onClick={() => setEditing(true)} style={{ display: "block", width: "calc(100% - 32px)", margin: "0 16px 12px", padding: "12px 16px", borderRadius: 14, border: "1px dashed rgba(255,255,255,.1)", background: "transparent", cursor: "pointer", color: "#444", fontSize: 12, fontFamily: "inherit", direction: isHe ? "rtl" : "ltr" }}>
        📅 {isHe ? "הוסף תאריך אירוע לספירה לאחור" : "Add event date for countdown"}
      </button>
    );
  }

  if (editing) {
    return (
      <div style={{ margin: "0 16px 12px", display: "flex", gap: 8, direction: isHe ? "rtl" : "ltr" }}>
        <Inp value={tmpDate} onChange={setTmpDate} placeholder="YYYY-MM-DD" dir="ltr" style={{ flex: 1 }} />
        <B s="sm" onClick={() => { setEventInfo((p) => ({ ...p, date: tmpDate })); setEditing(false); }}>
          {isHe ? "שמור" : "Save"}
        </B>
      </div>
    );
  }

  const label = days === null ? "" : days < 0 ? (isHe ? "האירוע כבר עבר 🎉" : "Event passed 🎉") : days === 0 ? (isHe ? "זה הלילה! 🎉🎉🎉" : "Tonight! 🎉🎉🎉") : days === 1 ? (isHe ? "מחר!" : "Tomorrow!") : isHe ? `${days} ימים לאירוע` : `${days} days to go`;

  return (
    <div onClick={() => setEditing(true)} style={{ margin: "0 16px 12px", padding: "14px 18px", borderRadius: 14, background: urgency ? "rgba(255,68,68,.04)" : "rgba(0,206,209,.04)", border: `1px solid ${urgency ? "rgba(255,68,68,.15)" : "rgba(0,206,209,.12)"}`, cursor: "pointer", direction: isHe ? "rtl" : "ltr", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <p style={{ color: urgency ? "#FF4444" : "#00CED1", fontSize: 11, fontWeight: 600, marginBottom: 2 }}>
          {urgency ? "⚡ " : "📅 "}{isHe ? "ספירה לאחור" : "Countdown"}
        </p>
        <p style={{ color: "#fff", fontSize: 20, fontWeight: 900, letterSpacing: -0.5 }}>{label}</p>
      </div>
      {days !== null && days > 0 && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: urgency ? "#FF4444" : "#00CED1", lineHeight: 1 }}>{days}</div>
          <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>{isHe ? "ימים" : "days"}</div>
        </div>
      )}
    </div>
  );
}
