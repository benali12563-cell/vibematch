"use client";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/context";

const TABS = [
  { path: "/",        icon: "home",         labelHe: "בית",    labelEn: "Home" },
  { path: "/manage",  icon: "checklist",    labelHe: "ניהול",  labelEn: "Manage" },
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
        const active = pathname === tab.path || (tab.path === "/manage" && ["/manage","/timeline","/guests"].includes(pathname));
        return (
          <button key={tab.path} onClick={() => router.push(tab.path)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "8px 0" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: active ? "#00CED1" : "#444", fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
              {tab.icon}
            </span>
            <span style={{ fontSize: 10, fontWeight: 600, color: active ? "#00CED1" : "#444", fontFamily: "inherit" }}>
              {isHe ? tab.labelHe : tab.labelEn}
            </span>
          </button>
        );
      })}
    </div>
  );
}
