// VibeMatch Service Worker — PWA + Push Notifications
const CACHE = "vibematch-v2";
const PRECACHE = ["/", "/manage", "/profile", "/timeline"];

// ── Install: pre-cache shell ──────────────────────────────────────────────────
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE).catch(() => {}))
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ────────────────────────────────────────────────
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first, cache fallback ─────────────────────────────────────
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("supabase") || e.request.url.includes("fonts.google")) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// ── Push: show notification ───────────────────────────────────────────────────
self.addEventListener("push", (e) => {
  const data = e.data?.json() ?? {};
  e.waitUntil(
    self.registration.showNotification(data.title || "VibeMatch", {
      body: data.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: data.tag || "vibematch",
      data: { url: data.url || "/" },
      vibrate: [100, 50, 100],
      actions: [
        { action: "open", title: data.actionLabel || "פתח" },
        { action: "dismiss", title: "סגור" },
      ],
    })
  );
});

// ── Notification click ────────────────────────────────────────────────────────
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  if (e.action === "dismiss") return;
  const url = e.notification.data?.url || "/";
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      const existing = wins.find((w) => w.url.includes(self.location.origin));
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});

// ── Message from app: show local notification ─────────────────────────────────
self.addEventListener("message", (e) => {
  if (e.data?.type === "NOTIFY") {
    const { title, body, tag, url } = e.data;
    self.registration.showNotification(title || "VibeMatch", {
      body: body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: tag || "vm-msg",
      data: { url: url || "/" },
      vibrate: [80, 40, 80],
    });
  }
});
