import { createClient } from "@/lib/supabase/client";

export interface EventPage {
  slug: string;
  host_name: string;
  event_date?: string;
  event_address?: string;
  waze_link?: string;
  event_notes?: string;
  vendor_names?: string[];
  confirmed_count?: number;
}

export async function saveEventPage(data: EventPage): Promise<void> {
  const sb = createClient();
  void sb.from("event_pages").upsert(data, { onConflict: "slug" });
}

export async function loadEventPage(slug: string): Promise<EventPage | null> {
  const sb = createClient();
  const { data } = await sb.from("event_pages").select("*").eq("slug", slug).single();
  return data ?? null;
}
