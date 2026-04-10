import { createClient } from "@/lib/supabase/client";
import { CATS } from "@/lib/constants";
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
    sub: (() => { const ck = row.category as string; const c = CATS.find(x => x.k === ck); return c ? c.he : ck || ""; })(),
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

  if (!slug) return { data: null, error: new Error("Vendor name produces empty slug") };

  // Guard: if a vendor with this slug already exists under a DIFFERENT business name, reject
  const { data: existing } = await sb
    .from("vendor_profiles")
    .select("business_name")
    .eq("slug", slug)
    .maybeSingle();
  if (existing && existing.business_name !== vendor.name) {
    return { data: null, error: new Error(`Slug "${slug}" is already taken by "${existing.business_name}"`) };
  }

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
  // Increment view_count (requires column: alter table vendor_profiles add column if not exists view_count int default 0;)
  void sb.rpc("increment_vendor_view", { vendor_slug: slug.toLowerCase() });
  if (ref) {
    void sb.from("referral_visits").insert({
      referrer_slug: ref,
      referrer_type: "vendor_view",
      page_visited: `/v/${slug}`,
    });
  }
}

/** Increment like count for a vendor */
export async function trackVendorLike(slug: string) {
  const sb = createClient();
  void sb.rpc("increment_vendor_like", { vendor_slug: slug.toLowerCase() });
}

/** Load stats for a vendor (view_count, like_count) */
export async function loadVendorStats(slug: string): Promise<{ views: number; likes: number }> {
  const sb = createClient();
  const { data } = await sb
    .from("vendor_profiles")
    .select("view_count, like_count")
    .eq("slug", slug.toLowerCase())
    .single();
  return { views: (data?.view_count as number) ?? 0, likes: (data?.like_count as number) ?? 0 };
}

/*
── SQL to run in Supabase (once) ─────────────────────────────────────────────
alter table vendor_profiles add column if not exists view_count int default 0;
alter table vendor_profiles add column if not exists like_count  int default 0;

create or replace function increment_vendor_view(vendor_slug text)
returns void language sql security definer as $$
  update vendor_profiles set view_count = view_count + 1 where slug = vendor_slug;
$$;

create or replace function increment_vendor_like(vendor_slug text)
returns void language sql security definer as $$
  update vendor_profiles set like_count = like_count + 1 where slug = vendor_slug;
$$;
─────────────────────────────────────────────────────────────────────────────
*/
