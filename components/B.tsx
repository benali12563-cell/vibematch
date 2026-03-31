"use client";
import { useState, type CSSProperties, type ReactNode } from "react";

type Variant = "primary" | "ghost" | "accent" | "danger" | "fire" | "dark";
type Size = "sm" | "md" | "lg";

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
    sm: { padding: "7px 16px",  fontSize: 12, borderRadius: 10, fontWeight: 600 },
    md: { padding: "11px 22px", fontSize: 14, borderRadius: 12, fontWeight: 700 },
    lg: { padding: "15px 32px", fontSize: 16, borderRadius: 14, fontWeight: 800, letterSpacing: -0.2 },
  };

  const variants: Record<Variant, CSSProperties> = {
    primary: {
      background: shimmer
        ? "linear-gradient(90deg,#00CED1 0%,#00ffff 30%,#00CED1 60%,#0099aa 100%)"
        : "linear-gradient(135deg,#00CED1,#0099cc)",
      backgroundSize: shimmer ? "200% auto" : undefined,
      animation: shimmer ? "shimmer 3s linear infinite" : undefined,
      color: "#000",
      border: "none",
      boxShadow: "0 4px 20px rgba(0,206,209,.25)",
    },
    ghost: {
      background: "rgba(255,255,255,.04)",
      color: "rgba(255,255,255,.7)",
      border: "1px solid rgba(255,255,255,.1)",
      backdropFilter: "blur(8px)",
    },
    accent: {
      background: "rgba(0,206,209,.07)",
      color: "#00CED1",
      border: "1px solid rgba(0,206,209,.2)",
      backdropFilter: "blur(8px)",
    },
    danger: {
      background: "rgba(255,68,68,.06)",
      color: "#FF4444",
      border: "1px solid rgba(255,68,68,.2)",
    },
    fire: {
      background: "linear-gradient(135deg,#FF4444,#FF6B35)",
      color: "#fff",
      border: "none",
      boxShadow: "0 4px 20px rgba(255,68,68,.25)",
    },
    dark: {
      background: "rgba(255,255,255,.04)",
      color: "rgba(255,255,255,.55)",
      border: "1px solid rgba(255,255,255,.06)",
    },
  };

  const base: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    fontFamily: "inherit",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.35 : 1,
    transition: "transform .12s, box-shadow .12s, opacity .12s, background-color .15s",
    transform: pressed ? "scale(.96)" : "scale(1)",
    userSelect: "none",
    WebkitUserSelect: "none",
    ...sizes[s],
    ...variants[v],
    ...style,
  };

  return (
    <button
      type={type}
      style={base}
      onClick={disabled ? undefined : onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
    >
      {children}
    </button>
  );
}
