"use client";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/context";

const TABS = [
  { path: "/",        icon: "home",         labelHe: "בית",    labelEn: "Home" },
  { path: "/manage",  icon: "checklist",    labelHe: "ניהול",  labelEn: "Manage" },
  { path: "/guests",  icon: "group",        labelHe: "אורחים", labelEn: "Guests" },
  { path: "/profile", icon: "person",       labelHe: "פרופיל", labelEn: "Profile" },
];

export default function Nav() {
  const { lang } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const isHe = lang === "he";

  const activeIdx = TABS.findIndex((t) =>
    pathname === t.path || (t.path === "/manage" && ["/manage", "/timeline"].includes(pathname))
  );

  return (
    <div
      className="glass-dark"
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, height: 62,
        display: "flex", justifyContent: "space-around", alignItems: "center",
        zIndex: 100, maxWidth: 480, margin: "0 auto",
        direction: isHe ? "rtl" : "ltr",
      }}
    >
      {/* Sliding pill indicator */}
      {activeIdx >= 0 && (
        <div
          key={activeIdx}
          className="nav-pill"
          style={{
            position: "absolute",
            top: 4, bottom: 4,
            width: `calc(${100 / TABS.length}% - 8px)`,
            left: isHe
              ? `calc(${(TABS.length - 1 - activeIdx) * (100 / TABS.length)}% + 4px)`
              : `calc(${activeIdx * (100 / TABS.length)}% + 4px)`,
            background: "rgba(0,206,209,.07)",
            border: "1px solid rgba(0,206,209,.18)",
            borderRadius: 14,
            pointerEvents: "none",
            transition: "left .35s cubic-bezier(.34,1.56,.64,1)",
            boxShadow: "0 0 12px rgba(0,206,209,.12)",
          }}
        />
      )}

      {/* Bottom glow line */}
      {activeIdx >= 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            height: 2,
            width: `calc(${100 / TABS.length}% - 16px)`,
            left: isHe
              ? `calc(${(TABS.length - 1 - activeIdx) * (100 / TABS.length)}% + 8px)`
              : `calc(${activeIdx * (100 / TABS.length)}% + 8px)`,
            background: "#00CED1",
            borderRadius: "2px 2px 0 0",
            boxShadow: "0 0 10px rgba(0,206,209,.9), 0 0 20px rgba(0,206,209,.4)",
            transition: "left .35s cubic-bezier(.34,1.56,.64,1)",
            pointerEvents: "none",
          }}
        />
      )}

      {TABS.map((tab, idx) => {
        const active = idx === activeIdx;
        return (
          <button
            key={tab.path}
            onClick={() => router.push(tab.path)}
            aria-label={isHe ? tab.labelHe : tab.labelEn}
            aria-current={active ? "page" : undefined}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              background: "none", border: "none", cursor: "pointer",
              padding: "10px 0 8px", borderRadius: 12, margin: "4px 4px",
              transition: "all .15s", position: "relative", zIndex: 1,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 22,
                color: active ? "#00e5e8" : "rgba(255,255,255,.3)",
                fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                filter: active ? "drop-shadow(0 0 7px rgba(0,206,209,.75))" : "none",
                transition: "all .2s",
                transform: active ? "scale(1.08)" : "scale(1)",
              }}
            >
              {tab.icon}
            </span>
            <span
              style={{
                fontSize: 9.5,
                fontWeight: active ? 800 : 500,
                color: active ? "#00e5e8" : "rgba(255,255,255,.28)",
                fontFamily: "inherit",
                transition: "all .2s",
                letterSpacing: active ? 0.3 : 0,
              }}
            >
              {isHe ? tab.labelHe : tab.labelEn}
            </span>
          </button>
        );
      })}
    </div>
  );
}
