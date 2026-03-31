"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { AppContextType, Lang, AppUser, Budget, TimelineItem, GalleryItem, EventInfo, VProfile, CatKey, Area } from "@/types";

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
  const [likes, setLikes] = useState<string[]>([]);
  const [archived, setArchived] = useState<string[]>([]);
  const [budget, setBudget] = useState<Budget>({ total: 0, spent: 0, items: [] });
  const [tlItems, setTlItems] = useState<TimelineItem[]>([]);
  const [vGallery, setVGallery] = useState<GalleryItem[]>([]);
  const [vPic, setVPic] = useState<string | null>(null);
  const [vAbout, setVAbout] = useState("");
  const [vProfile, setVProfile] = useState<VProfile>({ businessName: "", businessPrice: "", category: "" });
  const [vendorPrices, setVendorPrices] = useState<Record<string, number>>({});
  const [eventInfo, setEventInfo] = useState<EventInfo>({ address: "", wazeLink: "", date: "", notes: "" });
  const [toast, setToast] = useState("");
  const [onboardingDone, setOnboardingDone] = useState(false);

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
    }}>
      {children}
    </AppCtx.Provider>
  );
}
