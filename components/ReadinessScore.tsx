"use client";
import { useApp } from "@/lib/context";
import { CATS, DV } from "@/lib/constants";

export default function ReadinessScore() {
  const { likes, lang, tlItems, budget, publishedVendors } = useApp();
  const isHe = lang === "he";

  // Calculate score out of 100
  const catsWithLike = CATS.filter((c) =>
    [...(DV[c.k] ?? []), ...publishedVendors.filter((v) => v.catKey === c.k)].some((v) => likes.includes(v.name))
  ).length;
  const catScore = Math.round((catsWithLike / CATS.length) * 50);
  const budgetScore = budget.total > 0 ? 20 : 0;
  const tlScore = tlItems.length > 0 ? 15 : 0;
  const likeScore = Math.min(15, likes.length * 3);
  const score = catScore + budgetScore + tlScore + likeScore;

  const r = 28;
  const circ = 2 * Math.PI * r;
  const progress = (score / 100) * circ;
  const color = score >= 70 ? "#00CED1" : score >= 40 ? "#FFD700" : "#FF4444";
  const emoji = score >= 70 ? "🚀" : score >= 40 ? "⚡" : "🌱";

  const label = isHe
    ? score >= 70 ? "מוכנים כמעט!" : score >= 40 ? "בדרך הנכונה" : "בואו נתחיל"
    : score >= 70 ? "Almost ready!" : score >= 40 ? "On the right track" : "Let's go";

  return (
    <div style={{ background: "rgba(255,255,255,.015)", border: "1px solid rgba(255,255,255,.05)", borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 16, direction: isHe ? "rtl" : "ltr", margin: "0 16px 12px" }}>
      {/* Ring */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <svg width={72} height={72}>
          <circle cx={36} cy={36} r={r} fill="none" stroke="rgba(255,255,255,.04)" strokeWidth={6} />
          <circle cx={36} cy={36} r={r} fill="none" stroke={color} strokeWidth={6}
            strokeDasharray={`${progress} ${circ}`}
            strokeLinecap="round"
            style={{ transformOrigin: "50% 50%", transform: "rotate(-90deg)", transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color, fontSize: 16, fontWeight: 800, lineHeight: 1 }}>{score}</span>
          <span style={{ color: "#555", fontSize: 8 }}>/ 100</span>
        </div>
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 14 }}>{emoji}</span>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>
            {isHe ? "ציון מוכנות לאירוע" : "Event Readiness"}
          </span>
        </div>
        <p style={{ color: color, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{label}</p>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {[
            { label: isHe ? "ספקים" : "Vendors", done: likes.length > 0 },
            { label: isHe ? "תקציב" : "Budget", done: budget.total > 0 },
            { label: isHe ? "לוח זמנים" : "Timeline", done: tlItems.length > 0 },
          ].map((item) => (
            <span key={item.label} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 6, background: item.done ? "rgba(0,206,209,.08)" : "rgba(255,255,255,.03)", color: item.done ? "#00CED1" : "#444", border: `1px solid ${item.done ? "rgba(0,206,209,.2)" : "rgba(255,255,255,.04)"}` }}>
              {item.done ? "✓ " : ""}{item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
