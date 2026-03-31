"use client";
import { useApp } from "@/lib/context";
import { T } from "@/lib/constants";
import B from "./B";

export default function AuthBanner() {
  const { user, setShowLogin, setLoginMode, lang } = useApp();
  const t = T[lang];
  if (user) return null;
  return (
    <div style={{ background: "rgba(255,255,255,.02)", padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
      <span style={{ color: "#666", fontSize: 12 }}>{t.authBanner}</span>
      <B s="sm" v="ghost" onClick={() => { setLoginMode("owner"); setShowLogin(true); }} style={{ padding: "4px 14px", fontSize: 11 }}>{t.login}</B>
    </div>
  );
}
