"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { AppContextType, Lang, AppUser, Budget, TimelineItem, GalleryItem, EventInfo, VProfile, CatKey, Area, Vendor, GuestEntry, ChatThread } from "@/types";
import { createClient } from "@/lib/supabase/client";

const AppCtx = createContext<AppContextType | null>(null);

export function useApp(): AppContextType {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("he");
  const [user, setUser] = useState<AppUser | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginMode, setLoginMode] = useState<"owner" | "vendor">("owner");
  const [activeCat, setActiveCat] = useState<CatKey>("music");
  const [areaFilter, setAreaFilter] = useState<Area>("allAreas");

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

  useEffect(() => { localStorage.setItem("vm_likes",     JSON.stringify(likes));             }, [likes]);
  useEffect(() => { localStorage.setItem("vm_archived",  JSON.stringify(archived));          }, [archived]);
  useEffect(() => { localStorage.setItem("vm_budget",    JSON.stringify(budget));            }, [budget]);
  useEffect(() => { localStorage.setItem("vm_tl",        JSON.stringify(tlItems));           }, [tlItems]);
  useEffect(() => { localStorage.setItem("vm_vprices",   JSON.stringify(vendorPrices));      }, [vendorPrices]);
  useEffect(() => { localStorage.setItem("vm_eventinfo", JSON.stringify(eventInfo));         }, [eventInfo]);
  useEffect(() => { localStorage.setItem("vm_avail",     JSON.stringify(vendorAvailability));}, [vendorAvailability]);
  useEffect(() => { localStorage.setItem("vm_guests",    JSON.stringify(guests));            }, [guests]);
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
  const addGuest = useCallback((g: GuestEntry) => setGuests((p) => [...p, g]), []);
  const [vGallery, setVGallery] = useState<GalleryItem[]>([]);
  const [vPic, setVPic] = useState<string | null>(null);
  const [vAbout, setVAbout] = useState("");
  const [vProfile, setVProfile] = useState<VProfile>({ businessName: "", businessPrice: "", category: "" });
  const [toast, setToast] = useState("");
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [vendorIsPro, setVendorIsPro] = useState(false);

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

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }, []);

  return (
    <AppCtx.Provider value={{
      lang, setLang,
      user, setUser,
      showLogin, setShowLogin,
      loginMode, setLoginMode,
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
      guests, addGuest,
      chatThreads, setChatThreads,
      vendorIsPro, setVendorIsPro,
    }}>
      {children}
    </AppCtx.Provider>
  );
}
