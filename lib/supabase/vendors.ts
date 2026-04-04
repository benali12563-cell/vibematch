import { createClient } from "@/lib/supabase/client";
import type { Vendor, CatKey, Area } from "@/types";

// ── helpers ──────────────────────────────────────────────────────────────────

export function makeSlug(name: string) {
  // Keep Latin letters, Hebrew chars (U+0590–U+05FF), digits, hyphens
  return name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\u0590-\u05ff-]/g, "");
}

function dbToVendor(row: Record<string, unknown>): Vendor {
  return {
    id: row.id as string,
    name: row.business_name as string,
    sub: (row.category as string) || "",
    price: (row.price as string) || "",
    rating: 5,
    city: "",
    reviews: 0,
    desc: (row.about as string) || "",
    coupon: (row.coupon as string) || "",
    area: ((row.area as Area) || "center"),
    imgs: Array.isArray(row.gallery) ? (row.gallery as string[]) : [],
    niche: (row.niche as Record<string, string>) || {},
    deal: null,
    recommends: [],
    vendorReviews: [],
    whatsapp: (row.whatsapp as string) || undefined,
    phone: (row.phone as string) || undefined,
    instagram: (row.instagram as string) || undefined,
    tiktok: (row.tiktok as string) || undefined,
    website: (row.website as string) || undefined,
    google: (row.google as string) || undefined,
    waze: (row.waze as string) || undefined,
    catKey: (row.category as CatKey) || undefined,
    isPublished: true,
  };
}

// ── public API ────────────────────────────────────────────────────────────────

/** Save (upsert) a vendor profile when they hit "Publish" */
export async function saveVendorProfile(vendor: Vendor) {
  const sb = createClient();
  const slug = makeSlug(vendor.name);
  const { data, error } = await sb
    .from("vendor_profiles")
    .upsert(
      {
        slug,
        business_name: vendor.name,
        category: vendor.catKey ?? vendor.sub,
        price: vendor.price,
        about: vendor.desc,
        coupon: vendor.coupon,
        area: vendor.area,
        whatsapp: vendor.whatsapp || null,
        phone: vendor.phone || null,
        instagram: vendor.instagram || null,
        tiktok: vendor.tiktok || null,
        website: vendor.website || null,
        google: vendor.google || null,
        waze: vendor.waze || null,
        gallery: vendor.imgs,
        niche: vendor.niche,
        published: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" }
    )
    .select()
    .single();
  return { data, error };
}

/** Load all published vendors from DB */
export async function loadPublishedVendors(): Promise<Vendor[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("vendor_profiles")
    .select("*")
    .eq("published", true)
    .order("updated_at", { ascending: false });
  if (error || !data) return [];
  return data.map(dbToVendor);
}

/** Load a single vendor by slug (for /v/[id] page) */
export async function loadVendorBySlug(slug: string): Promise<Vendor | null> {
  const sb = createClient();
  const { data, error } = await sb
    .from("vendor_profiles")
    .select("*")
    .eq("slug", slug.toLowerCase())
    .eq("published", true)
    .single();
  if (error || !data) return null;
  return dbToVendor(data);
}

/** Increment view count for a vendor (fire-and-forget) */
export async function trackVendorView(slug: string, ref?: string) {
  const sb = createClient();
  if (ref) {
    await sb.from("referral_visits").insert({
      referrer_slug: ref,
      referrer_type: "vendor_view",
      page_visited: `/v/${slug}`,
    });
  }
}
