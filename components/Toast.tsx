"use client";
import { useApp } from "@/lib/context";

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div style={{ position: "fixed", top: 16, left: "50%", background: "#00CED1", color: "#000", padding: "10px 24px", borderRadius: 10, fontWeight: 700, fontSize: 14, zIndex: 999, animation: "toast 3s ease both", fontFamily: "'Manrope','Heebo',sans-serif", whiteSpace: "nowrap", pointerEvents: "none" }}>
      {toast}
    </div>
  );
}
