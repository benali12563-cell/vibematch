"use client";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { T } from "@/lib/constants";

export default function Nav() {
  const { lang } = useApp();
  const t = T[lang];
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { path: "/", label: t.home },
    { path: "/manage", label: t.manage },
    { path: "/timeline", label: t.timeline },
    { path: "/guests", label: t.hosting },
  ];

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 56, background: "#000", borderTop: "1px solid rgba(255,255,255,.06)", display: "flex", justifyContent: "space-around", alignItems: "center", zIndex: 100, maxWidth: 480, margin: "0 auto" }}>
      {tabs.map((tab) => (
        <button
          key={tab.path}
          onClick={() => router.push(tab.path)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 12px" }}
        >
          <span style={{ fontSize: 12, fontWeight: pathname === tab.path ? 700 : 500, color: pathname === tab.path ? "#00CED1" : "#555", fontFamily: "inherit" }}>
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}
