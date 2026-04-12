import { createClient } from "@/lib/supabase/client";
import { makeSlug } from "./vendors";
import type { VendorReview } from "@/types";

/** Save a review (replace any existing review by same user for same vendor) */
export async function saveReview(
  vendorName: string,
  userName: string,
  rating: number,
  text: string
): Promise<{ error: Error | null }> {
  const sb = createClient();
  const slug = makeSlug(vendorName);
  // Delete previous review by this user for this vendor (allow re-review)
  await sb.from("reviews").delete().eq("vendor_slug", slug).eq("user_name", userName);
  const { error } = await sb.from("reviews").insert({ vendor_slug: slug, user_name: userName, rating, text });
  return { error: error ? new Error(error.message) : null };
}

/** Load all reviews for a vendor */
export async function loadVendorReviews(vendorName: string): Promise<VendorReview[]> {
  const sb = createClient();
  const slug = makeSlug(vendorName);
  const { data } = await sb
    .from("reviews")
    .select("user_name, rating, text")
    .eq("vendor_slug", slug)
    .order("created_at", { ascending: false })
    .limit(50);
  if (!data) return [];
  return data.map((r) => ({
    user: r.user_name as string,
    rating: r.rating as number,
    text: (r.text as string) || "",
  }));
}
