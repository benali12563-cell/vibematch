"use client";
import type { CSSProperties, ReactNode } from "react";

type Variant = "primary" | "ghost" | "accent" | "danger" | "fire" | "dark";
type Size = "sm" | "md";

interface BProps {
  children: ReactNode;
  onClick?: () => void;
  v?: Variant;
  s?: Size;
  style?: CSSProperties;
  disabled?: boolean;
  type?: "button" | "submit";
}

export default function B({ children, onClick, v = "primary", s = "md", style = {}, disabled, type = "button" }: BProps) {
  const base: CSSProperties = {
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "inherit",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "all .15s",
    opacity: disabled ? 0.35 : 1,
    ...(s === "sm" ? { padding: "8px 18px", fontSize: 13, borderRadius: 8 } : { padding: "12px 24px", fontSize: 15, borderRadius: 10 }),
    ...(v === "primary" ? { background: "#00CED1", color: "#000" }
      : v === "ghost" ? { background: "transparent", color: "#aaa", border: "1px solid rgba(255,255,255,.1)" }
      : v === "accent" ? { background: "rgba(0,206,209,.08)", color: "#00CED1", border: "1px solid rgba(0,206,209,.15)" }
      : v === "danger" ? { background: "transparent", color: "#FF4444", border: "1px solid rgba(255,68,68,.2)" }
      : v === "fire" ? { background: "#FF4444", color: "#fff" }
      : { background: "rgba(255,255,255,.04)", color: "#ccc" }),
    ...style,
  };

  return (
    <button type={type} style={base} onClick={disabled ? undefined : onClick}>
      {children}
    </button>
  );
}
