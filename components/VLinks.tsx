"use client";
import { useApp } from "@/lib/context";
import B from "./B";
import type { Vendor } from "@/types";

function ensureHttps(v: string): string {
  if (!v) return v;
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return "https://" + v;
}

export default function VLinks({ vendor }: { vendor: Vendor }) {
  const { lang } = useApp();
  const isHe = lang === "he";

  const LINK_DEFS: { k: keyof Vendor; l: string; fn: (v: string) => string }[] = [
    { k: "whatsapp", l: "WhatsApp", fn: (v) => "https://wa.me/" + v.replace(/[\s\-()]/g, "").replace(/^0/, "972") },
    { k: "phone", l: isHe ? "התקשר" : "Call", fn: (v) => "tel:" + v.replace(/[\s\-()]/g, "") },
    { k: "instagram", l: "Instagram", fn: ensureHttps },
    { k: "tiktok", l: "TikTok", fn: ensureHttps },
    { k: "youtube", l: "YouTube", fn: ensureHttps },
    { k: "website", l: isHe ? "אתר" : "Website", fn: ensureHttps },
    { k: "google", l: isHe ? "ביקורות" : "Reviews", fn: ensureHttps },
    { k: "waze", l: "Waze", fn: ensureHttps },
  ];

  const active = LINK_DEFS.filter((l) => vendor[l.k]);
  if (!active.length) return null;
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
      {active.map((l) => (
        <B key={l.k} s="sm" v="ghost" onClick={() => window.open(l.fn(vendor[l.k] as string))} style={{ padding: "6px 14px", fontSize: 11, fontWeight: 500 }}>
          {l.l}
        </B>
      ))}
    </div>
  );
}
