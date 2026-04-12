"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";

export default function Logo({ sz = 22 }: { sz?: number }) {
  const { user } = useApp();
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  function handlePressStart() {
    timerRef.current = setTimeout(() => {
      if (user?.is_admin) setShowAdmin(true);
    }, 1500);
  }
  function handlePressEnd() {
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        style={{ fontWeight: 800, fontSize: sz, letterSpacing: -0.5, fontFamily: "'Manrope',sans-serif", cursor: "pointer", userSelect: "none" }}
      >
        <span style={{ color: "#00CED1" }}>Vibe</span>
        <span style={{ color: "#fff" }}>Match</span>
      </span>
      {showAdmin && (
        <button
          onClick={() => { setShowAdmin(false); router.push("/admin"); }}
          style={{ padding: "3px 10px", borderRadius: 6, background: "rgba(0,206,209,.1)", border: "1px solid rgba(0,206,209,.2)", color: "#00CED1", fontSize: 10, fontWeight: 700, cursor: "pointer", animation: "fadeIn .2s" }}
        >
          Admin
        </button>
      )}
    </div>
  );
}
