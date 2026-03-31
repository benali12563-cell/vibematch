"use client";
import type { CSSProperties } from "react";
import { useApp } from "@/lib/context";

interface InpProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  dir?: "rtl" | "ltr";
  style?: CSSProperties;
}

export default function Inp({ value, onChange, placeholder, type = "text", dir, style = {} }: InpProps) {
  const { lang } = useApp();
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "12px 16px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,.08)",
        background: "rgba(255,255,255,.03)",
        color: "#fff",
        fontSize: 14,
        fontFamily: "inherit",
        direction: dir ?? (lang === "he" ? "rtl" : "ltr"),
        ...style,
      }}
    />
  );
}
