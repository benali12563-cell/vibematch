"use client";
import { useState } from "react";
import { useApp } from "@/lib/context";
import { T, findVendor, findCat } from "@/lib/constants";
import type { Vendor } from "@/types";
import SwipeCardView from "./SwipeCardView";
import VLinks from "./VLinks";
import QuoteSheet from "./QuoteSheet";
import B from "./B";

interface Props {
  vendor: Vendor;
  onClose: () => void;
  showRemove?: boolean;
  onRemove?: () => void;
}

export default function VendorCard({ vendor, onClose, showRemove, onRemove }: Props) {
  const { lang } = useApp();
  const t = T[lang];
  const [imgIdx, setImgIdx] = useState(0);
  const [qv, setQv] = useState(false);
  const ck = findCat(vendor.name);
  const recs = (vendor.recommends ?? []).map((n) => findVendor(n)).filter(Boolean) as Vendor[];

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 200, overflowY: "auto", direction: lang === "he" ? "rtl" : "ltr", fontFamily: "inherit" }}>
      <button onClick={onClose} style={{ position: "fixed", top: 14, right: lang === "he" ? 14 : "auto", left: lang === "en" ? 14 : "auto", background: "rgba(20,20,20,.75)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", border: "1px solid rgba(255,255,255,.2)", color: "rgba(255,255,255,.9)", fontSize: 14, cursor: "pointer", zIndex: 210, width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.14)", transition: "all .12s" }}>
        ✕
      </button>
      <div style={{ height: "75dvh" }}>
        <SwipeCardView vendor={vendor} imgIdx={imgIdx} setImgIdx={setImgIdx} />
      </div>
      <div style={{ padding: "12px 18px" }}>
        <VLinks vendor={vendor} />
        {recs.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ color: "#666", fontSize: 12, marginBottom: 8 }}>{t.recommends}:</p>
            <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
              {recs.map((rv) => (
                <div key={rv.name} style={{ flexShrink: 0, background: "rgba(255,255,255,.02)", borderRadius: 10, padding: "10px 14px", textAlign: "center", minWidth: 80, border: "1px solid rgba(255,255,255,.04)" }}>
                  <div style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>{rv.name}</div>
                  <div style={{ color: "#666", fontSize: 9 }}>{rv.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <B v="accent" style={{ marginTop: 16, width: "100%" }} onClick={() => setQv(true)}>{t.quote}</B>
        {showRemove && <B v="danger" style={{ marginTop: 8, width: "100%" }} onClick={onRemove}>{t.remove}</B>}
      </div>
      {qv && <QuoteSheet vendor={vendor} catKey={ck} onClose={() => setQv(false)} />}
    </div>
  );
}
