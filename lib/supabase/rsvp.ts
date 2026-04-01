import { createClient } from "@/lib/supabase/client";

export interface RsvpEntry {
  invite_slug: string;
  guest_name: string;
  guest_count: number;
  status: "coming" | "not_coming";
}

/** Save an RSVP to the database */
export async function saveRsvp(entry: RsvpEntry) {
  const sb = createClient();
  const { data, error } = await sb.from("guest_rsvps").insert(entry).select().single();
  return { data, error };
}

/** Load RSVPs for an invite slug (for the event owner) */
export async function loadRsvps(invite_slug: string) {
  const sb = createClient();
  const { data, error } = await sb
    .from("guest_rsvps")
    .select("*")
    .eq("invite_slug", invite_slug)
    .eq("status", "coming")
    .order("created_at", { ascending: false });
  return { data: data ?? [], error };
}

/** Track a referral visit (fire-and-forget) */
export async function trackReferral(opts: {
  referrer_slug: string;
  referrer_type: "invite" | "vendor_share" | "user_share";
  page_visited: string;
}) {
  const sb = createClient();
  await sb.from("referral_visits").insert(opts);
}

/** Mark a referral as having registered */
export async function markReferralRegistered(referrer_slug: string) {
  const sb = createClient();
  await sb
    .from("referral_visits")
    .update({ registered: true })
    .eq("referrer_slug", referrer_slug)
    .eq("registered", false)
    .order("created_at", { ascending: false })
    .limit(1);
}
