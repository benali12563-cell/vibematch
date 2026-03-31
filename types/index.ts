import type { Dispatch, SetStateAction } from "react";

export type Lang = "he" | "en";
export type CatKey = "venues" | "food" | "music" | "lighting" | "photo" | "beauty" | "entertainment" | "design" | "logistics" | "ceremony" | "digital";
export type Area = "allAreas" | "north" | "center" | "south" | "jerusalem";
export type UserRole = "owner" | "vendor" | "admin";

export interface Deal {
  text: string;
  endsIn: number;
}

export interface Vendor {
  id?: string;
  name: string;
  sub: string;
  price: string;
  rating: number;
  city: string;
  reviews: number;
  desc: string;
  coupon: string;
  area: Area;
  imgs: string[];
  niche: Record<string, string>;
  deal: Deal | null;
  recommends: string[];
  vendorReviews: VendorReview[];
  whatsapp?: string;
  phone?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  website?: string;
  google?: string;
  waze?: string;
}

export interface VendorReview {
  user: string;
  rating: number;
  text: string;
}

export interface AppUser {
  id?: string;
  name: string;
  phone?: string;
  email?: string;
  role: UserRole;
  is_admin?: boolean;
  points?: number;
  badges?: string[];
}

export interface BudgetItem {
  name: string;
  cat: CatKey;
  amount: number;
}

export interface Budget {
  total: number;
  spent: number;
  items: BudgetItem[];
}

export interface TimelineItem {
  id: number;
  label: string;
  time: string;
}

export interface GalleryItem {
  id: number;
  src: string;
}

export interface EventInfo {
  address: string;
  wazeLink: string;
  date: string;
  notes: string;
  type?: string;
  style?: string;
  vibe?: string;
  budget?: string;
}

export interface VProfile {
  businessName: string;
  businessPrice: string;
  category: CatKey | "";
  [key: string]: string;
}

export type Setter<T> = Dispatch<SetStateAction<T>>;

export interface AppContextType {
  lang: Lang;
  setLang: Setter<Lang>;
  user: AppUser | null;
  setUser: Setter<AppUser | null>;
  showLogin: boolean;
  setShowLogin: Setter<boolean>;
  loginMode: "owner" | "vendor";
  setLoginMode: Setter<"owner" | "vendor">;
  activeCat: CatKey;
  setActiveCat: Setter<CatKey>;
  areaFilter: Area;
  setAreaFilter: Setter<Area>;
  likes: string[];
  setLikes: Setter<string[]>;
  archived: string[];
  setArchived: Setter<string[]>;
  budget: Budget;
  setBudget: Setter<Budget>;
  tlItems: TimelineItem[];
  setTlItems: Setter<TimelineItem[]>;
  vGallery: GalleryItem[];
  setVGallery: Setter<GalleryItem[]>;
  vPic: string | null;
  setVPic: Setter<string | null>;
  vAbout: string;
  setVAbout: Setter<string>;
  vProfile: VProfile;
  setVProfile: Setter<VProfile>;
  vendorPrices: Record<string, number>;
  setVendorPrices: Setter<Record<string, number>>;
  eventInfo: EventInfo;
  setEventInfo: Setter<EventInfo>;
  toast: string;
  showToast: (msg: string) => void;
  onboardingDone: boolean;
  setOnboardingDone: Setter<boolean>;
}
