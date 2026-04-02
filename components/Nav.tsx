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

  return (
    <div className="glass-dark" style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 62, display: "flex", justifyContent: "space-around", alignItems: "center", zIndex: 100, maxWidth: 480, margin: "0 auto", direction: isHe ? "rtl" : "ltr" }}>
      {TABS.map((tab) => {
        const active = pathname === tab.path || (tab.path === "/manage" && ["/manage","/timeline"].includes(pathname));
        return (
          <button key={tab.path} onClick={() => router.push(tab.path)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: active ? "rgba(0,206,209,.08)" : "none", border: "none", cursor: "pointer", padding: "10px 0 8px", borderRadius: 12, margin: "4px 4px", transition: "all .15s" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 23, color: active ? "#00e5e8" : "rgba(255,255,255,.32)", fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0", filter: active ? "drop-shadow(0 0 6px rgba(0,206,209,.6))" : "none", transition: "all .15s" }}>
              {tab.icon}
            </span>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? "#00e5e8" : "rgba(255,255,255,.32)", fontFamily: "inherit", transition: "all .15s" }}>
              {isHe ? tab.labelHe : tab.labelEn}
            </span>
          </button>
        );
      })}
    </div>
  );
}
