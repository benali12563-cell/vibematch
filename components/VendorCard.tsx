"use client";
import { useState } from "react";
import { useApp } from "@/lib/context";
import { T, findVendor, findCat, DV } from "@/lib/constants";
import type { Vendor, VendorReview } from "@/types";
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
  const { lang, likes, vendorAvailability, selectedDate, showToast, publishedVendors } = useApp();
  const t = T[lang];
  const isHe = lang === "he";
  const [imgIdx, setImgIdx] = useState(0);
  const [qv, setQv] = useState(false);
  const [reviews, setReviews] = useState<VendorReview[]>(vendor.vendorReviews ?? []);
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewStars, setReviewStars] = useState(5);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const ck = (vendor as import("@/types").Vendor).catKey || findCat(vendor.name);
  const recs = (vendor.recommends ?? []).map((n) => findVendor(n)).filter(Boolean) as Vendor[];
  // Similar vendors: same category, exclude this vendor
  const similarVendors = ck && ck !== "all"
    ? [...(DV[ck as Exclude<typeof ck, "all">] ?? []), ...publishedVendors.filter((v) => v.catKey === ck)]
        .filter((v) => v.name !== vendor.name)
        .slice(0, 3)
    : [];
  const isBooked = selectedDate ? (vendorAvailability[vendor.name] ?? []).includes(selectedDate) : false;

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
        {/* Booked warning + similar vendors */}
        {isBooked && (
          <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 12, background: "rgba(255,68,68,.06)", border: "1px solid rgba(255,68,68,.2)" }}>
            <p style={{ color: "#FF6666", fontSize: 12, fontWeight: 700, margin: "0 0 8px" }}>
              ❌ {isHe ? `תפוס ב-${selectedDate}` : `Booked on ${selectedDate}`}
            </p>
            {similarVendors.length > 0 && (
              <>
                <p style={{ color: "#555", fontSize: 11, margin: "0 0 8px" }}>{isHe ? "ספקים דומים שפנויים:" : "Similar vendors available:"}</p>
                <div style={{ display: "flex", gap: 7, overflowX: "auto" }}>
                  {similarVendors.map((sv) => (
                    <div key={sv.name} style={{ flexShrink: 0, background: "rgba(255,255,255,.03)", borderRadius: 10, padding: "8px 12px", border: "1px solid rgba(255,255,255,.06)", minWidth: 90 }}>
                      <div style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>{sv.name}</div>
                      <div style={{ color: "#00CED1", fontSize: 10, marginTop: 2 }}>{sv.price}</div>
                      <div style={{ color: "#555", fontSize: 9 }}>⭐ {sv.rating}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        {!isBooked && similarVendors.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <p style={{ color: "#444", fontSize: 11, marginBottom: 8 }}>{isHe ? "ספקים דומים:" : "Similar vendors:"}</p>
            <div style={{ display: "flex", gap: 7, overflowX: "auto" }}>
              {similarVendors.map((sv) => (
                <div key={sv.name} style={{ flexShrink: 0, background: "rgba(255,255,255,.02)", borderRadius: 10, padding: "8px 12px", border: "1px solid rgba(255,255,255,.04)", minWidth: 90 }}>
                  <div style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>{sv.name}</div>
                  <div style={{ color: "#00CED1", fontSize: 10, marginTop: 2 }}>{sv.price}</div>
                  <div style={{ color: "#555", fontSize: 9 }}>⭐ {sv.rating}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Reviews */}
        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <p style={{ color: "rgba(255,255,255,.3)", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", margin: 0 }}>
              {isHe ? `ביקורות (${reviews.length})` : `Reviews (${reviews.length})`}
            </p>
            <button onClick={() => setShowReviewForm((p) => !p)} style={{ background: "rgba(0,206,209,.1)", border: "1px solid rgba(0,206,209,.25)", borderRadius: 14, padding: "4px 12px", color: "#00e5e8", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {showReviewForm ? (isHe ? "ביטול" : "Cancel") : (isHe ? "+ כתוב ביקורת" : "+ Write review")}
            </button>
          </div>

          {showReviewForm && (
            <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, padding: "14px 16px", marginBottom: 12, animation: "fadeIn .2s" }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {[1,2,3,4,5].map((s) => (
                  <button key={s} onClick={() => setReviewStars(s)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, opacity: s <= reviewStars ? 1 : 0.25, transition: "opacity .12s" }}>⭐</button>
                ))}
              </div>
              <input
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                placeholder={isHe ? "השם שלך" : "Your name"}
                maxLength={40}
                style={{ width: "100%", marginBottom: 8, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: "9px 12px", color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none" }}
              />
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder={isHe ? "ספר על החוויה שלך..." : "Tell us about your experience..."}
                maxLength={300}
                rows={3}
                style={{ width: "100%", marginBottom: 10, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: "9px 12px", color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none", resize: "none" }}
              />
              <button
                disabled={!reviewName.trim() || !reviewText.trim()}
                onClick={() => {
                  if (!reviewName.trim() || !reviewText.trim()) return;
                  const r: VendorReview = { user: reviewName.trim(), rating: reviewStars, text: reviewText.trim() };
                  setReviews((p) => [r, ...p]);
                  setReviewName(""); setReviewText(""); setReviewStars(5); setShowReviewForm(false);
                  showToast(isHe ? "✅ ביקורת נוספה!" : "✅ Review added!");
                }}
                style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: reviewName.trim() && reviewText.trim() ? "linear-gradient(135deg,#00CED1,#008b8b)" : "rgba(255,255,255,.06)", color: reviewName.trim() && reviewText.trim() ? "#000" : "#555", fontWeight: 700, fontSize: 13, cursor: reviewName.trim() && reviewText.trim() ? "pointer" : "default", fontFamily: "inherit" }}>
                {isHe ? "פרסם ביקורת" : "Post Review"}
              </button>
            </div>
          )}

          {reviews.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {reviews.slice(0, 5).map((r, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)", borderRadius: 12, padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{r.user}</span>
                    <span style={{ fontSize: 11 }}>{"⭐".repeat(r.rating)}</span>
                  </div>
                  <p style={{ color: "rgba(255,255,255,.6)", fontSize: 12, lineHeight: 1.5, margin: 0 }}>{r.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#333", fontSize: 12, textAlign: "center", padding: "12px 0" }}>
              {isHe ? "עדיין אין ביקורות — היה הראשון!" : "No reviews yet — be the first!"}
            </p>
          )}
        </div>

        <B v="accent" style={{ marginTop: 16, width: "100%" }} onClick={() => setQv(true)}>{t.quote}</B>
        {showRemove && <B v="danger" style={{ marginTop: 8, width: "100%" }} onClick={onRemove}>{t.remove}</B>}
      </div>
      {qv && <QuoteSheet vendor={vendor} catKey={ck} onClose={() => setQv(false)} />}
    </div>
  );
}
