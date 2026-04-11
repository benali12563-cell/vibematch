"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { CATS } from "@/lib/constants";
import { loadClientLeads, markLeadReadClient } from "@/lib/supabase/leads";
import LeadChatModal from "./LeadChatModal";
import Nav from "./Nav";
import type { ChatThread, Vendor } from "@/types";

function fmtRelative(ts: number, isHe: boolean): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return isHe ? "עכשיו" : "now";
  if (m < 60) return isHe ? `לפני ${m} דק'` : `${m}m ago`;
  if (h < 24) return isHe ? `לפני ${h} שע'` : `${h}h ago`;
  return isHe ? `לפני ${d} ימים` : `${d}d ago`;
}

function getCatLabel(catKey: string | undefined, isHe: boolean): string {
  if (!catKey) return "";
  const c = CATS.find((c) => c.k === catKey);
  return c ? (isHe ? c.he : c.en) : catKey;
}

function threadToVendor(ct: ChatThread): Vendor {
  return {
    name: ct.vendorName,
    sub: ct.vendorCat ?? "",
    catKey: ct.vendorCat as import("@/types").CatKey | undefined,
    price: "", rating: 5, city: "", reviews: 0,
    desc: "", coupon: "", area: "center",
    imgs: [], niche: {}, deal: null, recommends: [], vendorReviews: [],
  };
}

export default function ClientInbox() {
  const { lang, user, chatThreads, setChatThreads } = useApp();
  const isHe = lang === "he";
  const router = useRouter();

  const [dbThreads, setDbThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(false);
  const [openThread, setOpenThread] = useState<ChatThread | null>(null);

  // Load from Supabase when user is known
  useEffect(() => {
    if (!user || user.role === "vendor") return;
    setLoading(true);
    loadClientLeads(user.name)
      .then((threads) => {
        setDbThreads(threads);
        // Merge into global context (DB wins for existing IDs)
        setChatThreads((prev) => {
          const dbIds = new Set(threads.map((t) => t.id));
          const localOnly = prev.filter((t) => !dbIds.has(t.id));
          return [...localOnly, ...threads];
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.name]); // eslint-disable-line react-hooks/exhaustive-deps

  // Displayed threads: DB if loaded, else from context
  const myThreads: ChatThread[] = (
    dbThreads.length > 0
      ? dbThreads
      : chatThreads.filter((t) => !user || t.clientName === user.name)
  ).slice().sort((a, b) => {
    const aLast = a.messages.at(-1)?.ts ?? a.createdAt;
    const bLast = b.messages.at(-1)?.ts ?? b.createdAt;
    return bLast - aLast;
  });

  const totalUnread = myThreads.reduce((s, t) => s + t.unreadClient, 0);

  function openChat(ct: ChatThread) {
    // Mark as read locally + in DB
    if (ct.unreadClient > 0) {
      const updated = { ...ct, unreadClient: 0 };
      setDbThreads((p) => p.map((t) => t.id === ct.id ? updated : t));
      setChatThreads((p) => p.map((t) => t.id === ct.id ? updated : t));
      markLeadReadClient(ct.id).catch(() => {});
    }
    setOpenThread(ct);
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#000", fontFamily: isHe ? "'Heebo'" : "'Manrope','Heebo'", direction: isHe ? "rtl" : "ltr" }}>

      {/* Header */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 52, background: "rgba(0,0,0,.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", zIndex: 100, maxWidth: 480, margin: "0 auto" }}>
        <button onClick={() => router.push("/")} style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", borderRadius: "50%", width: 34, height: 34, color: "rgba(255,255,255,.7)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isHe ? "→" : "←"}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>{isHe ? "הודעות" : "Messages"}</span>
          {totalUnread > 0 && (
            <span style={{ background: "#FF4444", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 900 }}>{totalUnread}</span>
          )}
        </div>
        <div style={{ width: 34 }} />
      </div>

      <div style={{ padding: "64px 0 80px" }}>

        {/* Not logged in */}
        {!user && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: "0 32px", textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>💬</div>
            <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
              {isHe ? "הצ'אטים שלך עם הספקים" : "Your Vendor Chats"}
            </h2>
            <p style={{ color: "#555", fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
              {isHe ? "התחברו כדי לצפות ולנהל את כל השיחות עם הספקים שלכם" : "Sign in to view and manage all your vendor conversations"}
            </p>
            <button onClick={() => router.push("/auth/login")} style={{ padding: "14px 32px", borderRadius: 14, background: "linear-gradient(160deg,#00e5e8,#00CED1)", border: "none", color: "#000", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
              {isHe ? "כניסה / הרשמה" : "Sign In / Register"}
            </button>
          </div>
        )}

        {/* Loading */}
        {user && loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
            <div style={{ width: 28, height: 28, border: "2px solid rgba(0,206,209,.3)", borderTopColor: "#00CED1", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          </div>
        )}

        {/* Empty state */}
        {user && !loading && myThreads.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "55vh", padding: "0 32px", textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
            <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
              {isHe ? "עדיין אין שיחות" : "No conversations yet"}
            </h2>
            <p style={{ color: "#555", fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
              {isHe ? "מצאו ספק מהפיד ושלחו בקשה — הצ'אט יופיע כאן" : "Find a vendor in the feed and send a request — the chat will appear here"}
            </p>
            <button onClick={() => router.push("/")} style={{ padding: "12px 28px", borderRadius: 14, border: "1px solid rgba(0,206,209,.3)", background: "rgba(0,206,209,.08)", color: "#00CED1", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
              {isHe ? "🔍 חפשו ספקים" : "🔍 Browse vendors"}
            </button>
          </div>
        )}

        {/* Thread list */}
        {user && !loading && myThreads.length > 0 && (
          <div style={{ padding: "0 14px" }}>
            <p style={{ color: "#333", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, marginTop: 4 }}>
              {isHe ? `${myThreads.length} שיחות` : `${myThreads.length} conversations`}
            </p>
            {myThreads.map((ct) => {
              const lastMsg = ct.messages.at(-1);
              const lastTs = lastMsg?.ts ?? ct.createdAt;
              const catLabel = getCatLabel(ct.vendorCat, isHe);
              const hasUnread = ct.unreadClient > 0;

              return (
                <button
                  key={ct.id}
                  onClick={() => openChat(ct)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 14px", marginBottom: 8, borderRadius: 16, border: `1px solid ${hasUnread ? "rgba(0,206,209,.25)" : "rgba(255,255,255,.05)"}`, background: hasUnread ? "rgba(0,206,209,.04)" : "rgba(255,255,255,.015)", cursor: "pointer", textAlign: isHe ? "right" : "left", fontFamily: "inherit" }}
                >
                  {/* Avatar */}
                  <div style={{ width: 46, height: 46, borderRadius: "50%", background: `linear-gradient(135deg, #00CED1, #005f61)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>
                    {ct.vendorCat ? (
                      { venues: "🏛️", food: "🍽️", music: "🎵", lighting: "💡", photo: "📸", beauty: "💄", entertainment: "🎪", design: "🎨", logistics: "🚌", ceremony: "💒", digital: "📱" }[ct.vendorCat] ?? "🎪"
                    ) : "🎪"}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ color: "#fff", fontWeight: hasUnread ? 800 : 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ct.vendorName}</span>
                      <span style={{ color: "#444", fontSize: 10, flexShrink: 0, marginInlineStart: 8 }}>{fmtRelative(lastTs, isHe)}</span>
                    </div>
                    {catLabel && (
                      <span style={{ display: "inline-block", padding: "1px 8px", borderRadius: 6, background: "rgba(0,206,209,.08)", border: "1px solid rgba(0,206,209,.18)", color: "#00CED1", fontSize: 9, fontWeight: 600, marginBottom: 4 }}>{catLabel}</span>
                    )}
                    <p style={{ color: hasUnread ? "rgba(255,255,255,.7)" : "#444", fontSize: 12, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: hasUnread ? 600 : 400 }}>
                      {lastMsg
                        ? (lastMsg.from === "vendor"
                          ? `${ct.vendorName}: ${lastMsg.text.split("\n")[0]}`
                          : lastMsg.text.split("\n")[0])
                        : (isHe ? "לא נשלחו הודעות" : "No messages yet")}
                    </p>
                  </div>

                  {/* Unread badge */}
                  {hasUnread && (
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#00CED1", color: "#000", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {ct.unreadClient}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Nav />

      {/* Chat modal */}
      {openThread && (
        <LeadChatModal
          vendor={threadToVendor(openThread)}
          existingThread={openThread}
          onClose={() => {
            // Sync updated thread back from context
            setOpenThread(null);
          }}
        />
      )}
    </div>
  );
}
