"use client";
import { useState, type CSSProperties, type ReactNode } from "react";

type Variant = "primary" | "ghost" | "accent" | "danger" | "fire" | "dark" | "gold";
type Size    = "sm" | "md" | "lg";

interface BProps {
  children: ReactNode;
  onClick?: () => void;
  v?: Variant;
  s?: Size;
  style?: CSSProperties;
  disabled?: boolean;
  type?: "button" | "submit";
  shimmer?: boolean;
}

export default function B({ children, onClick, v = "primary", s = "md", style = {}, disabled, type = "button", shimmer }: BProps) {
  const [pressed, setPressed] = useState(false);

  const sizes: Record<Size, CSSProperties> = {
    sm: { padding: "9px 18px",  fontSize: 12, borderRadius: 12, fontWeight: 700, gap: 5 },
    md: { padding: "13px 26px", fontSize: 14, borderRadius: 14, fontWeight: 700, gap: 7 },
    lg: { padding: "16px 36px", fontSize: 16, borderRadius: 16, fontWeight: 800, gap: 8, letterSpacing: -0.2 },
  };

  const variants: Record<Variant, CSSProperties> = {
    primary: {
      background: shimmer
        ? "linear-gradient(90deg,#00CED1 0%,#00ffff 30%,#00CED1 60%,#0099bb 100%)"
        : "linear-gradient(160deg,#00e5e8 0%,#00CED1 45%,#009eb0 100%)",
      backgroundSize: shimmer ? "200% auto" : undefined,
      animation: shimmer ? "shimmer 3s linear infinite" : undefined,
      color: "#000",
      fontWeight: 800,
      border: "1px solid rgba(0,255,255,.35)",
      boxShadow: pressed
        ? "0 2px 8px rgba(0,206,209,.3), inset 0 1px 0 rgba(255,255,255,.25)"
        : "0 6px 24px rgba(0,206,209,.4), 0 2px 8px rgba(0,206,209,.25), inset 0 1px 0 rgba(255,255,255,.3)",
    },
    ghost: {
      background: pressed ? "rgba(255,255,255,.1)" : "rgba(255,255,255,.08)",
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
      color: "rgba(255,255,255,.92)",
      border: "1px solid rgba(255,255,255,.18)",
      boxShadow: pressed
        ? "inset 0 1px 4px rgba(0,0,0,.2)"
        : "0 2px 12px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.12)",
    },
    accent: {
      background: pressed ? "rgba(0,206,209,.18)" : "rgba(0,206,209,.1)",
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
      color: "#00e5e8",
      border: "1px solid rgba(0,206,209,.4)",
      boxShadow: pressed
        ? "inset 0 1px 4px rgba(0,0,0,.2)"
        : "0 4px 16px rgba(0,206,209,.2), inset 0 1px 0 rgba(0,255,255,.15)",
    },
    danger: {
      background: pressed ? "rgba(255,68,68,.18)" : "rgba(255,68,68,.1)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      color: "#FF6666",
      border: "1px solid rgba(255,68,68,.35)",
      boxShadow: pressed
        ? "inset 0 1px 4px rgba(0,0,0,.2)"
        : "0 4px 16px rgba(255,68,68,.15), inset 0 1px 0 rgba(255,255,255,.08)",
    },
    fire: {
      background: "linear-gradient(160deg,#FF6B4A 0%,#FF4444 50%,#dd2222 100%)",
      color: "#fff",
      fontWeight: 800,
      border: "1px solid rgba(255,107,53,.4)",
      boxShadow: pressed
        ? "0 2px 8px rgba(255,68,68,.3), inset 0 1px 0 rgba(255,255,255,.15)"
        : "0 6px 24px rgba(255,68,68,.4), 0 2px 8px rgba(255,68,68,.25), inset 0 1px 0 rgba(255,255,255,.2)",
    },
    dark: {
      background: pressed ? "rgba(255,255,255,.07)" : "rgba(255,255,255,.04)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      color: "rgba(255,255,255,.55)",
      border: "1px solid rgba(255,255,255,.09)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.06)",
    },
    gold: {
      background: "linear-gradient(160deg,#FFE566 0%,#FFD700 50%,#cc9900 100%)",
      color: "#000",
      fontWeight: 800,
      border: "1px solid rgba(255,215,0,.4)",
      boxShadow: pressed
        ? "0 2px 8px rgba(255,215,0,.3)"
        : "0 6px 24px rgba(255,215,0,.35), inset 0 1px 0 rgba(255,255,255,.3)",
    },
  };

  const base: CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontFamily: "inherit",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.35 : 1,
    transition: "transform .1s cubic-bezier(.34,1.56,.64,1), box-shadow .15s, background .12s",
    transform: pressed ? "scale(.96)" : "scale(1)",
    userSelect: "none", WebkitUserSelect: "none",
    WebkitTapHighlightColor: "transparent",
    ...sizes[s], ...variants[v], ...style,
  };

  return (
    <button type={type} style={base} onClick={disabled ? undefined : onClick}
      onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)} onTouchEnd={() => setPressed(false)}>
      {children}
    </button>
  );
}
