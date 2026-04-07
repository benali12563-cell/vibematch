import type { Metadata } from "next";
import { DV, CATS } from "@/lib/constants";
import { makeSlug } from "@/lib/supabase/vendors";
import type { Vendor, CatKey } from "@/types";
import VendorPageClient from "./VendorPageClient";

// ── helpers (server-safe) ─────────────────────────────────────────────────────

function findVendorInDV(slug: string): { vendor: Vendor; catKey: CatKey } | null {
  const name = decodeURIComponent(slug).replace(/-/g, " ").toLowerCase();
  for (const cat of CATS) {
    const v = (DV[cat.k] ?? []).find(
      (v) =>
        v.name.toLowerCase() === name ||
        makeSlug(v.name) === slug.toLowerCase()
    );
    if (v) return { vendor: v, catKey: cat.k };
  }
  return null;
}

// ── generateMetadata (SSR) ────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const found = findVendorInDV(id);

  if (!found) {
    return {
      title: "ספק | VibeMatch",
      description: "מצאו ספקי אירועים מובילים בישראל — מחירים שקופים, זמינות בזמן אמת.",
    };
  }

  const { vendor, catKey } = found;
  const catLabel = CATS.find((c) => c.k === catKey)?.he ?? catKey;
  const title = `${vendor.name} — ${catLabel} | VibeMatch`;
  const description = vendor.desc
    ? vendor.desc.slice(0, 155)
    : `${vendor.name} · ${vendor.sub} · ${vendor.city} · ${vendor.price}`;
  const image = vendor.imgs?.[0] ?? "https://vibematch-nine.vercel.app/og-default.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 800, height: 1200, alt: vendor.name }],
      type: "profile",
      locale: "he_IL",
      siteName: "VibeMatch",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: `https://vibematch-nine.vercel.app/v/${id}`,
    },
  };
}

// ── Page (renders client component) ──────────────────────────────────────────

export default function VendorPublicPage({ params }: { params: Promise<{ id: string }> }) {
  return <VendorPageClient params={params} />;
}
