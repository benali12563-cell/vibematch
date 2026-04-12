"use client";
import { useState } from "react";
import { useApp } from "@/lib/context";
import { saveBusyDates, makeSlug } from "@/lib/supabase/vendors";

const HE_MONTHS = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
const HE_DAYS   = ["א","ב","ג","ד","ה","ו","ש"];
const EN_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const EN_DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

interface Props {
  vendorName: string;   // whose calendar
  readOnly?: boolean;   // client view — just highlights busy
}

export default function AvailabilityCalendar({ vendorName, readOnly = false }: Props) {
  const { lang, vendorAvailability, setVendorAvailability } = useApp();
  const isHe = lang === "he";
  const months = isHe ? HE_MONTHS : EN_MONTHS;
  const days   = isHe ? HE_DAYS   : EN_DAYS;

  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const busyDates: string[] = vendorAvailability[vendorName] ?? [];

  function isoDate(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  }

  function toggle(iso: string) {
    if (readOnly) return;
    setVendorAvailability((prev) => {
      const existing = prev[vendorName] ?? [];
      const next = existing.includes(iso)
        ? existing.filter((d) => d !== iso)
        : [...existing, iso];
      // Persist to Supabase (fire-and-forget)
      const slug = makeSlug(vendorName);
      if (slug) void saveBusyDates(slug, next);
      return { ...prev, [vendorName]: next };
    });
  }

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ fontFamily: "inherit", direction: isHe ? "rtl" : "ltr" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button onClick={prevMonth} style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, color: "#aaa", width: 32, height: 32, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isHe ? "›" : "‹"}
        </button>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{months[month]} {year}</span>
        <button onClick={nextMonth} style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, color: "#aaa", width: 32, height: 32, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isHe ? "‹" : "›"}
        </button>
      </div>

      {/* Legend */}
      {!readOnly && (
        <div style={{ display: "flex", gap: 12, marginBottom: 10, fontSize: 10, color: "#666" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(0,206,209,.15)", border: "1px solid rgba(0,206,209,.3)", display: "inline-block" }} />
            {isHe ? "פנוי" : "Available"}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(255,68,68,.15)", border: "1px solid rgba(255,68,68,.3)", display: "inline-block" }} />
            {isHe ? "תפוס" : "Busy"}
          </span>
        </div>
      )}

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 4 }}>
        {days.map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, color: "#444", fontWeight: 700, padding: "2px 0" }}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const iso  = isoDate(year, month, day);
          const busy = busyDates.includes(iso);
          const past = new Date(iso) < new Date(new Date().setHours(0,0,0,0));
          const isToday = iso === isoDate(today.getFullYear(), today.getMonth(), today.getDate());

          return (
            <button key={idx} onClick={() => !past && toggle(iso)}
              style={{
                padding: "7px 2px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                cursor: past || readOnly ? "default" : "pointer",
                border: `1px solid ${
                  isToday ? "rgba(0,206,209,.5)" :
                  busy    ? "rgba(255,68,68,.3)" :
                            "rgba(255,255,255,.05)"
                }`,
                background: busy
                  ? "rgba(255,68,68,.12)"
                  : isToday
                  ? "rgba(0,206,209,.1)"
                  : "rgba(255,255,255,.02)",
                opacity: past ? 0.25 : 1,
                color: past ? "#666" : busy ? "#FF6666" : isToday ? "#00CED1" : "#ccc",
                textDecoration: past ? "line-through" : "none",
                backdropFilter: "blur(8px)",
                textAlign: "center",
                transition: "all .15s",
              }}>
              {day}
            </button>
          );
        })}
      </div>

      {!readOnly && (
        <p style={{ color: "#444", fontSize: 10, marginTop: 10, textAlign: "center" }}>
          {isHe ? "לחץ על תאריך כדי לסמן תפוס/פנוי" : "Tap a date to mark busy / available"}
        </p>
      )}
    </div>
  );
}
