"use client";
import { useApp } from "@/lib/context";

export default function LangToggle() {
  const { lang, setLang } = useApp();
  return (
    <button
      onClick={() => setLang(lang === "he" ? "en" : "he")}
      style={{ background: "none", border: "1px solid rgba(255,255,255,.08)", color: "#666", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: lang === "he" ? "'Outfit'" : "'Heebo'" }}
    >
      {lang === "he" ? "EN" : "עב"}
    </button>
  );
}
