"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { T, CATS, DV, catName, findCat } from "@/lib/constants";
import type { CatKey, Vendor } from "@/types";
import Nav from "./Nav";
import VendorCard from "./VendorCard";
import QuoteSheet from "./QuoteSheet";
import ReadinessScore from "./ReadinessScore";
import CountdownBanner from "./CountdownBanner";
import ShareCard from "./ShareCard";
import B from "./B";
import Inp from "./Inp";

export default function ManageScreen() {
  const { lang, likes, setLikes, setArchived, budget, setBudget, vendorPrices, setVendorPrices, setActiveCat } = useApp();
  const t = T[lang];
  const dir = lang === "he" ? "rtl" : "ltr";
  const router = useRouter();

  const [tab, setTab] = useState<"checklist" | "budget">("checklist");
  const [qCat, setQCat] = useState<CatKey | null>(null);
  const [viewV, setViewV] = useState<Vendor | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [showManual, setShowManual] = useState<CatKey | "">("");
  const [mN, setMN] = useState("");
  const [mA, setMA] = useState("");
  const [priceEdit, setPriceEdit] = useState<string | null>(null);
  const [priceVal, setPriceVal] = useState("");

  return (
    <div style={{ minHeight: "100dvh", background: "#000", fontFamily: "inherit", direction: dir, padding: "52px 0 64px" }}>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 48, background: "#000", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, maxWidth: 480, margin: "0 auto" }}>
        <button onClick={() => router.push("/")} style={{ position: "absolute", right: lang === "he" ? 12 : "auto", left: lang === "en" ? 12 : "auto", width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,.09)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,.16)", color: "rgba(255,255,255,.75)", fontSize: 17, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.12)", transition: "all .12s" }}>
          {lang === "he" ? "→" : "←"}
        </button>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{t.manage}</span>
      </div>

      {/* Marketing widgets */}
      <div style={{ paddingTop: 8 }}>
        <CountdownBanner />
        <ReadinessScore />
        <ShareCard />
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
        {(["checklist", "budget"] as const).map((tb) => (
          <button key={tb} onClick={() => setTab(tb)} style={{ flex: 1, padding: "12px 0", background: tab === tb ? "rgba(0,206,209,.06)" : "none", border: "none", color: tab === tb ? "#00e5e8" : "rgba(255,255,255,.4)", fontSize: 14, fontWeight: tab === tb ? 700 : 500, cursor: "pointer", borderBottom: tab === tb ? "2px solid #00CED1" : "2px solid rgba(255,255,255,.05)", transition: "all .15s", letterSpacing: tab === tb ? 0.1 : 0 }}>
            {tb === "checklist" ? t.checklist : t.budget}
          </button>
        ))}
      </div>

      <div style={{ padding: "10px 16px", overflowY: "auto", maxHeight: "calc(100dvh - 180px)" }}>
        {tab === "checklist" && CATS.map((cat) => {
          const matched = (DV[cat.k] ?? []).filter((v) => likes.includes(v.name));
          return (
            <div key={cat.k} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.03)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "#fff", fontSize: 14, flex: 1, fontWeight: 600 }}>{lang === "en" ? cat.en : cat.he}</span>
                {matched.length > 0
                  ? <span style={{ color: "#00CED1", fontSize: 13, fontWeight: 600 }}>{matched.length}</span>
                  : (
                    <div style={{ display: "flex", gap: 6 }}>
                      <B s="sm" v="ghost" onClick={() => { setActiveCat(cat.k); router.push("/"); }} style={{ padding: "4px 14px", fontSize: 11 }}>{t.find}</B>
                      <B s="sm" v="accent" onClick={() => setQCat(cat.k)} style={{ padding: "4px 14px", fontSize: 11 }}>{t.quote}</B>
                    </div>
                  )}
              </div>
              {matched.map((v) => {
                const mp = vendorPrices[v.name];
                return (
                  <div key={v.name} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 0 4px 16px", flexWrap: "wrap" }}>
                    <button onClick={() => setViewV(v)} style={{ color: "#ccc", fontSize: 13, flex: 1, background: "none", border: "none", textAlign: lang === "he" ? "right" : "left", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>{v.name}</button>
                    <span style={{ color: "#666", fontSize: 11 }}>{mp ? `₪${mp}` : v.price}</span>
                    {v.coupon && <span style={{ color: "#00CED1", fontSize: 10 }}>{v.coupon}</span>}
                    {priceEdit === v.name ? (
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        <input value={priceVal} onChange={(e) => setPriceVal(e.target.value)} type="number" style={{ width: 70, padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(0,206,209,.2)", background: "rgba(255,255,255,.03)", color: "#fff", fontSize: 12, direction: "ltr" }} placeholder="₪" />
                        <B s="sm" onClick={() => {
                          if (priceVal) {
                            setVendorPrices((p) => ({ ...p, [v.name]: Number(priceVal) }));
                            setBudget((p) => ({ ...p, spent: (p.spent ?? 0) + Number(priceVal), items: [...(p.items ?? []).filter((x) => x.name !== v.name), { name: v.name, cat: cat.k, amount: Number(priceVal) }] }));
                          }
                          setPriceEdit(null); setPriceVal("");
                        }} style={{ padding: "4px 8px", fontSize: 10 }}>OK</B>
                      </div>
                    ) : (
                      <B s="sm" v="ghost" onClick={() => { setPriceEdit(v.name); setPriceVal(mp ? String(mp) : ""); }} style={{ padding: "3px 8px", fontSize: 9 }}>{mp ? t.updatePrice : "₪"}</B>
                    )}
                    <B s="sm" v="accent" onClick={() => setQCat(cat.k)} style={{ padding: "3px 8px", fontSize: 10 }}>{t.quote}</B>
                  </div>
                );
              })}
            </div>
          );
        })}

        {tab === "budget" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[
                { l: t.budget, v: budget.total ?? 0, c: "#00CED1" },
                { l: lang === "he" ? "הוצאנו" : "Spent", v: budget.spent ?? 0, c: "#FF6B6B" },
                { l: lang === "he" ? "נותר" : "Left", v: (budget.total ?? 0) - (budget.spent ?? 0), c: "#4CAF50" },
              ].map((x, i) => (
                <div key={i} style={{ flex: 1, background: "rgba(255,255,255,.02)", borderRadius: 10, padding: "14px 8px", textAlign: "center", border: "1px solid rgba(255,255,255,.04)" }}>
                  <div style={{ color: x.c, fontSize: 18, fontWeight: 700 }}>₪{x.v.toLocaleString()}</div>
                  <div style={{ color: "#555", fontSize: 11, marginTop: 2 }}>{x.l}</div>
                </div>
              ))}
            </div>
            <Inp value={String(budget.total ?? "")} onChange={(v) => setBudget((p) => ({ ...p, total: Number(v) }))} type="number" placeholder={t.budget} dir="ltr" style={{ marginBottom: 12 }} />
            {CATS.map((ck) => {
              const hasM = (DV[ck.k] ?? []).some((v) => likes.includes(v.name));
              const exp = (budget.items ?? []).filter((it) => it.cat === ck.k);
              const total = exp.reduce((s, e) => s + e.amount, 0);
              return (
                <div key={ck.k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,.03)" }}>
                  <span style={{ color: "#fff", fontSize: 13, flex: 1, fontWeight: 500 }}>{lang === "en" ? ck.en : ck.he}</span>
                  {total > 0 && <span style={{ color: "#00CED1", fontSize: 12, fontWeight: 600 }}>₪{total.toLocaleString()}</span>}
                  {hasM && total === 0 && <span style={{ color: "#00CED1", fontSize: 11 }}>✓</span>}
                  {!hasM && total === 0 && (
                    <div style={{ display: "flex", gap: 4 }}>
                      <B s="sm" v="ghost" onClick={() => { setActiveCat(ck.k); router.push("/"); }} style={{ padding: "3px 10px", fontSize: 10 }}>{t.find}</B>
                      <B s="sm" v="ghost" onClick={() => setShowManual(ck.k)} style={{ padding: "3px 10px", fontSize: 10 }}>{t.manual}</B>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Nav />

      {showManual && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 200, display: "flex", alignItems: "flex-end" }} onClick={() => setShowManual("")}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", background: "#111", borderRadius: "16px 16px 0 0", padding: "22px 16px 32px", direction: dir }}>
            <Inp value={mN} onChange={setMN} placeholder={lang === "he" ? "שם הספק" : "Vendor"} style={{ marginBottom: 8 }} />
            <Inp value={mA} onChange={setMA} type="number" placeholder="₪" dir="ltr" style={{ marginBottom: 8 }} />
            <B style={{ width: "100%" }} onClick={() => {
              if (mN && mA) {
                setBudget((p) => ({ ...p, spent: (p.spent ?? 0) + Number(mA), items: [...(p.items ?? []), { name: mN, cat: showManual as CatKey, amount: Number(mA) }] }));
                setMN(""); setMA(""); setShowManual("");
              }
            }}>{t.save}</B>
          </div>
        </div>
      )}

      {viewV && <VendorCard vendor={viewV} onClose={() => setViewV(null)} showRemove onRemove={() => setConfirm(viewV.name)} />}

      {confirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#111", borderRadius: 16, padding: 24, width: "85%", maxWidth: 320, textAlign: "center", border: "1px solid rgba(255,255,255,.06)" }}>
            <p style={{ color: "#fff", fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{t.confirmRemove} {confirm}?</p>
            <p style={{ color: "#666", fontSize: 12, marginBottom: 16 }}>{t.archive}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <B v="danger" style={{ flex: 1 }} onClick={() => { setLikes((p) => p.filter((n) => n !== confirm)); setArchived((p) => [...p, confirm!]); setViewV(null); setConfirm(null); }}>{t.remove}</B>
              <B v="ghost" style={{ flex: 1 }} onClick={() => setConfirm(null)}>{t.cancel}</B>
            </div>
          </div>
        </div>
      )}

      {qCat && <QuoteSheet vendor={{ name: catName(qCat, lang) }} catKey={qCat} onClose={() => setQCat(null)} />}
    </div>
  );
}
