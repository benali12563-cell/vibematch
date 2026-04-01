"use client";
import B from "./B";
import type { Vendor } from "@/types";

const LINK_DEFS = [
  { k: "whatsapp" as keyof Vendor, l: "WhatsApp", fn: (v: string) => "https://wa.me/" + v.replace(/[\s-]/g, "").replace(/^0/, "972") },
  { k: "phone" as keyof Vendor, l: "Call", fn: (v: string) => "tel:" + v },
  { k: "instagram" as keyof Vendor, l: "Instagram", fn: (v: string) => v },
  { k: "tiktok" as keyof Vendor, l: "TikTok", fn: (v: string) => v },
  { k: "youtube" as keyof Vendor, l: "YouTube", fn: (v: string) => v },
  { k: "website" as keyof Vendor, l: "Website", fn: (v: string) => v },
  { k: "google" as keyof Vendor, l: "Reviews", fn: (v: string) => v },
  { k: "waze" as keyof Vendor, l: "Waze", fn: (v: string) => v },
];

export default function VLinks({ vendor }: { vendor: Vendor }) {
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
