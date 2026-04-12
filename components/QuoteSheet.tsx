"use client";
import { useState } from "react";
import { useApp } from "@/lib/context";
import { T, QF, QF_EN } from "@/lib/constants";
import type { Vendor, CatKey } from "@/types";
import B from "./B";
import Inp from "./Inp";

interface Props {
  vendor: Vendor | { name: string };
  catKey: CatKey | "";
  onClose: () => void;
}

export default function QuoteSheet({ vendor, catKey, onClose }: Props) {
  const { user, lang } = useApp();
  const t = T[lang];
  const isHe = lang === "he";
  const qs = (catKey ? (isHe ? QF[catKey] : QF_EN[catKey]) : null) ?? (isHe ? ["אורחים?", "תאריך?"] : ["Guests?", "Date?"]);
  const [ans, setAns] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const msg = () =>
    ["VibeMatch — " + t.quote, "",
      (isHe ? "שם: " : "Name: ") + (user?.name ?? ""),
      (isHe ? "ספק: " : "Vendor: ") + vendor.name, "",
      ...qs.map((q) => q + " " + (ans[q] ?? "—")),
      "\n" + (isHe ? "טלפון: " : "Phone: ") + (user?.phone ?? ""),
    ].join("\n");

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.88)", backdropFilter: "blur(10px)", zIndex: 250, display: "flex", flexDirection: "column" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ marginTop: "auto", background: "#111", borderRadius: "20px 20px 0 0", padding: "24px 18px 36px", maxHeight: "80vh", overflowY: "auto", direction: lang === "he" ? "rtl" : "ltr" }}>
        <div style={{ width: 32, height: 4, borderRadius: 2, background: "#333", margin: "0 auto 16px" }} />
        <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 700, marginBottom: 14 }}>{t.quote} — {vendor.name}</h3>
        {qs.map((q, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <p style={{ color: "#888", fontSize: 12, marginBottom: 4 }}>{q}</p>
            <Inp value={ans[q] ?? ""} onChange={(v) => setAns((p) => ({ ...p, [q]: v }))} placeholder="…" />
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <B style={{ flex: 1 }} onClick={() => { navigator.clipboard?.writeText(msg()); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
            {copied ? t.copied : t.copy}
          </B>
          <B v="ghost" style={{ flex: 1 }} onClick={() => { window.open("https://wa.me/?text=" + encodeURIComponent(msg())); onClose(); }}>
            {t.wa}
          </B>
        </div>
      </div>
    </div>
  );
}
