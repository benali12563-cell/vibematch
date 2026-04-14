"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import type { AppContextType, Lang, AppUser, Budget, TimelineItem, GalleryItem, EventInfo, VProfile, CatKey, Area, Vendor, GuestEntry, ChatThread, A11ySettings } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { loadUserLikes } from "@/lib/supabase/vendors";

const AppCtx = createContext<AppContextType | null>(null);

export function useApp(): AppContextType {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => ls<Lang>("vm_lang", "he"));
  const [user, setUser] = useState<AppUser | null>(null);
  const [activeCat, setActiveCat] = useState<CatKey>(() => ls<CatKey>("vm_cat", "music"));
  const [areaFilter, setAreaFilter] = useState<Area>(() => ls<Area>("vm_area", "allAreas"));

  // ── Persisted to localStorage ──────────────────────────────────────────────
  function ls<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try { return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback; } catch { return fallback; }
  }

  const [likes, setLikes] = useState<string[]>(() => ls("vm_likes", []));
  const [archived, setArchived] = useState<string[]>(() => ls("vm_archived", []));
  const [budget, setBudget] = useState<Budget>(() => ls("vm_budget", { total: 0, spent: 0, items: [] }));
  const [tlItems, setTlItems] = useState<TimelineItem[]>(() => ls("vm_tl", []));
  const [vendorPrices, setVendorPrices] = useState<Record<string, number>>(() => ls("vm_vprices", {}));
  const [eventInfo, setEventInfo] = useState<EventInfo>(() => ls("vm_eventinfo", { address: "", wazeLink: "", date: "", notes: "" }));
  const [vendorAvailability, setVendorAvailability] = useState<Record<string, string[]>>(() => ls("vm_avail", {}));
  const [guests, setGuests] = useState<GuestEntry[]>(() => ls("vm_guests", []));
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(() => ls("vm_chats", []));
  const [a11y, setA11y] = useState<A11ySettings>(() => ls("vm_a11y", { reducedMotion: false, largeText: false, highContrast: false }));

  useEffect(() => { localStorage.setItem("vm_lang",      JSON.stringify(lang));              }, [lang]);
  useEffect(() => { localStorage.setItem("vm_cat",       JSON.stringify(activeCat));         }, [activeCat]);
  useEffect(() => { localStorage.setItem("vm_area",      JSON.stringify(areaFilter));        }, [areaFilter]);
  useEffect(() => { localStorage.setItem("vm_likes",     JSON.stringify(likes));             }, [likes]);
  useEffect(() => { localStorage.setItem("vm_archived",  JSON.stringify(archived));          }, [archived]);
  useEffect(() => { localStorage.setItem("vm_budget",    JSON.stringify(budget));            }, [budget]);
  useEffect(() => { localStorage.setItem("vm_tl",        JSON.stringify(tlItems));           }, [tlItems]);
  useEffect(() => { localStorage.setItem("vm_vprices",   JSON.stringify(vendorPrices));      }, [vendorPrices]);
  useEffect(() => { localStorage.setItem("vm_eventinfo", JSON.stringify(eventInfo));         }, [eventInfo]);
  useEffect(() => { localStorage.setItem("vm_avail",     JSON.stringify(vendorAvailability));}, [vendorAvailability]);
  useEffect(() => { localStorage.setItem("vm_guests",    JSON.stringify(guests));            }, [guests]);
  useEffect(() => { localStorage.setItem("vm_chats",     JSON.stringify(chatThreads));       }, [chatThreads]);
  useEffect(() => { localStorage.setItem("vm_a11y",      JSON.stringify(a11y));              }, [a11y]);

  // Apply a11y CSS classes to <html> element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("a11y-motion",   a11y.reducedMotion);
    root.classList.toggle("a11y-text",     a11y.largeText);
    root.classList.toggle("a11y-contrast", a11y.highContrast);
  }, [a11y]);
  // ─────────────────────────────────────────────────────────────────────────
  const [onboardingDone, setOnboardingDoneRaw] = useState(
    () => typeof window !== "undefined" && localStorage.getItem("vm_onboarded") === "1"
  );
  const setOnboardingDone = useCallback((v: boolean | ((prev: boolean) => boolean)) => {
    setOnboardingDoneRaw((prev) => {
      const next = typeof v === "function" ? v(prev) : v;
      if (typeof window !== "undefined") localStorage.setItem("vm_onboarded", next ? "1" : "0");
      return next;
    });
  }, []);
  const [selectedDate, setSelectedDate] = useState("");
  const [publishedVendors, setPublishedVendors] = useState<Vendor[]>([]);
  const [vGallery, setVGallery] = useState<GalleryItem[]>([]);
  const [vPic, setVPic] = useState<string | null>(null);
  const [vAbout, setVAbout] = useState("");
  const [vProfile, setVProfile] = useState<VProfile>({ businessName: "", businessPrice: "", category: "" });
  const [toast, setToast] = useState("");

  // Restore Supabase session on mount + listen for auth changes
  useEffect(() => {
    const sb = createClient();
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser((prev) => prev ?? {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
          email: session.user.email,
          role: "owner",
        });
      }
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
        setUser((prev) => ({
          id: session.user.id,
          name: prev?.name || session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
          email: session.user.email,
          role: prev?.role ?? "owner",
        }));
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync likes from DB when user logs in
  useEffect(() => {
    if (!user?.name) return;
    loadUserLikes(user.name).then((dbLikes) => {
      if (!dbLikes.length) return;
      setLikes((prev) => {
        const combined = new Set([...prev, ...dbLikes]);
        return Array.from(combined);
      });
    }).catch(() => {});
  }, [user?.name]); // eslint-disable-line react-hooks/exhaustive-deps

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(""), 3000);
  }, []);

  return (
    <AppCtx.Provider value={{
      lang, setLang,
      user, setUser,
      activeCat, setActiveCat,
      areaFilter, setAreaFilter,
      likes, setLikes,
      archived, setArchived,
      budget, setBudget,
      tlItems, setTlItems,
      vGallery, setVGallery,
      vPic, setVPic,
      vAbout, setVAbout,
      vProfile, setVProfile,
      vendorPrices, setVendorPrices,
      eventInfo, setEventInfo,
      toast, showToast,
      onboardingDone, setOnboardingDone,
      vendorAvailability, setVendorAvailability,
      selectedDate, setSelectedDate,
      publishedVendors, setPublishedVendors,
      guests, setGuests,
      chatThreads, setChatThreads,
      a11y, setA11y,
    }}>
      {children}
    </AppCtx.Provider>
  );
}
