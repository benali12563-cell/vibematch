"use client";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/context";

// Global helper so LeadChatModal can trigger notifications
export function sendLocalNotification(title: string, body: string, url = "/") {
  if (typeof window === "undefined") return;
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "NOTIFY", title, body, url });
  } else if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/icons/icon-192.png" });
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWASetup() {
  const { lang, showToast } = useApp();
  const isHe = lang === "he";

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);
  const [swReady, setSwReady] = useState(false);

  // ── Register Service Worker ──────────────────────────────────────────────
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        setSwReady(true);
        // Check for updates
        reg.addEventListener("updatefound", () => {
          const nw = reg.installing;
          nw?.addEventListener("statechange", () => {
            if (nw.state === "installed" && navigator.serviceWorker.controller) {
              showToast(isHe ? "🔄 עדכון זמין — רענן!" : "🔄 Update available — refresh!");
            }
          });
        });
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Check existing notification permission ───────────────────────────────
  useEffect(() => {
    if ("Notification" in window) {
      setNotifGranted(Notification.permission === "granted");
    }
  }, []);

  // ── Capture install prompt ───────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Show banner after 3 seconds delay (non-intrusive)
      setTimeout(() => setShowInstallBanner(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // ── Request notification permission ─────────────────────────────────────
  async function requestNotifications() {
    if (!("Notification" in window)) {
      showToast(isHe ? "הדפדפן לא תומך בהתראות" : "Browser doesn't support notifications");
      return;
    }
    // Already denied — browser won't show prompt again, guide user manually
    if (Notification.permission === "denied") {
      showToast(isHe
        ? "🔒 חסום — הגדרות → Safari/Chrome → VibeMatch → התראות → הרשה"
        : "🔒 Blocked — Settings → Safari/Chrome → VibeMatch → Notifications → Allow");
      return;
    }
    const perm = await Notification.requestPermission();
    setNotifGranted(perm === "granted");
    if (perm === "granted") {
      showToast(isHe ? "🔔 התראות הופעלו!" : "🔔 Notifications enabled!");
      sendLocalNotification(
        "VibeMatch 🎉",
        isHe ? "תקבל התראות על הודעות ועדכונים" : "You'll get notified about messages & updates"
      );
    } else {
      showToast(isHe
        ? "🔒 נחסם — הגדרות → אתר זה → התראות → הרשה"
        : "🔒 Blocked — Settings → this site → Notifications → Allow");
    }
  }

  // ── Trigger install ──────────────────────────────────────────────────────
  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    setInstallPrompt(null);
    setShowInstallBanner(false);
    if (result.outcome === "accepted") {
      showToast(isHe ? "📲 האפליקציה הותקנה!" : "📲 App installed!");
    }
  }

  // ── Install Banner ───────────────────────────────────────────────────────
  if (showInstallBanner && installPrompt) {
    return (
      <div
        style={{
          position: "fixed", bottom: 78, left: 12, right: 12, zIndex: 990,
          background: "rgba(7,7,10,.97)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(0,206,209,.3)", borderRadius: 18,
          padding: "14px 16px", maxWidth: 456, margin: "0 auto",
          boxShadow: "0 -4px 30px rgba(0,206,209,.15), 0 8px 30px rgba(0,0,0,.6)",
          animation: "slideUp .35s cubic-bezier(.34,1.56,.64,1)",
          direction: isHe ? "rtl" : "ltr", fontFamily: isHe ? "'Heebo'" : "'Manrope','Heebo'",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#00CED1,#008b8b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
            📲
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: "#fff", fontWeight: 800, fontSize: 14, margin: 0 }}>
              {isHe ? "הוסף לשורת הבית" : "Add to Home Screen"}
            </p>
            <p style={{ color: "rgba(255,255,255,.4)", fontSize: 11, margin: "2px 0 0", lineHeight: 1.3 }}>
              {isHe ? "התקן כאפליקציה — מהיר יותר, ללא דפדפן" : "Install as app — faster, no browser chrome"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button
            onClick={install}
            style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#00CED1,#008b8b)", color: "#000", fontWeight: 900, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
          >
            {isHe ? "📲 התקן עכשיו" : "📲 Install Now"}
          </button>
          <button
            onClick={() => setShowInstallBanner(false)}
            style={{ padding: "11px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.5)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
          >
            {isHe ? "אחרי" : "Later"}
          </button>
        </div>

        {!notifGranted && (
          <button
            onClick={requestNotifications}
            style={{ marginTop: 8, width: "100%", padding: "9px 0", borderRadius: 10, border: "1px solid rgba(255,215,0,.2)", background: "rgba(255,215,0,.05)", color: "#FFD700", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
          >
            🔔 {isHe ? "הפעל התראות גם" : "Enable notifications too"}
          </button>
        )}
      </div>
    );
  }

  // ── Notification permission request (no install prompt available = already installed or desktop) ──
  // Don't show prompt if already denied — user must unblock manually via browser settings
  if (!notifGranted && swReady && !installPrompt && (typeof window === "undefined" || Notification.permission !== "denied")) {
    return (
      <NotifPermissionPrompt
        isHe={isHe}
        onRequest={requestNotifications}
        onDismiss={() => setNotifGranted(true)} // hide even if denied
      />
    );
  }

  return null;
}

function NotifPermissionPrompt({ isHe, onRequest, onDismiss }: { isHe: boolean; onRequest: () => void; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  // Show after 8s — let user explore first
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 8000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed", bottom: 78, left: 12, right: 12, zIndex: 990,
        background: "rgba(7,7,10,.97)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,215,0,.2)", borderRadius: 18,
        padding: "14px 16px", maxWidth: 456, margin: "0 auto",
        boxShadow: "0 8px 30px rgba(0,0,0,.6)", animation: "slideUp .35s ease",
        direction: isHe ? "rtl" : "ltr", fontFamily: isHe ? "'Heebo'" : "'Manrope','Heebo'",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ fontSize: 28, flexShrink: 0 }}>🔔</span>
        <div style={{ flex: 1 }}>
          <p style={{ color: "#fff", fontWeight: 800, fontSize: 14, margin: 0 }}>
            {isHe ? "הפעל התראות" : "Enable Notifications"}
          </p>
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: 11, margin: "3px 0 10px", lineHeight: 1.4 }}>
            {isHe
              ? "קבל התראה מיידית כשספק עונה לך — לא תפספס שום מסר"
              : "Get instant alerts when a vendor replies — never miss a message"}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onRequest} style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#FFD700,#e6ac00)", color: "#000", fontWeight: 900, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              {isHe ? "הפעל" : "Enable"}
            </button>
            <button onClick={() => { setVisible(false); onDismiss(); }} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.08)", background: "none", color: "rgba(255,255,255,.35)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              {isHe ? "לא עכשיו" : "Not now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
