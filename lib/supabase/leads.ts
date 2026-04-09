import { createClient } from "@/lib/supabase/client";
import type { ChatThread, ChatMessage } from "@/types";

// ── helpers ──────────────────────────────────────────────────────────────────

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── public API ────────────────────────────────────────────────────────────────

/** Save a new lead (called when client submits the lead form) */
export async function saveLead(thread: ChatThread): Promise<{ id: string | null; error: unknown }> {
  const sb = createClient();

  const { data, error } = await sb
    .from("leads")
    .insert({
      id: thread.id,
      vendor_name: thread.vendorName,
      vendor_cat: thread.vendorCat ?? null,
      client_name: thread.clientName ?? null,
      event_date: thread.lead.date ?? null,
      guest_count: thread.lead.guests ?? null,
      budget: thread.lead.budget ?? null,
      unread_vendor: 1,
      unread_client: 0,
      created_at: new Date(thread.createdAt).toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) return { id: null, error };

  // Insert the system message (lead details)
  const sysMsg = thread.messages[0];
  if (sysMsg) {
    await sb.from("lead_messages").insert({
      id: sysMsg.id,
      lead_id: data.id,
      from_role: sysMsg.from,
      sender_name: sysMsg.senderName ?? null,
      text: sysMsg.text,
      ts: sysMsg.ts,
    });
  }

  return { id: data.id, error: null };
}

/** Append a chat message to an existing lead */
export async function saveLeadMessage(leadId: string, msg: ChatMessage): Promise<void> {
  const sb = createClient();
  await sb.from("lead_messages").insert({
    id: msg.id || uid(),
    lead_id: leadId,
    from_role: msg.from,
    sender_name: msg.senderName ?? null,
    text: msg.text,
    ts: msg.ts,
  });

  // Bump unread counter based on sender
  if (msg.from === "client") {
    await sb.rpc("increment_lead_unread_vendor", { lead_id: leadId });
  } else if (msg.from === "vendor") {
    await sb.rpc("increment_lead_unread_client", { lead_id: leadId });
  }
}

/** Load all leads for a vendor (Leads tab in VendorDash) */
export async function loadVendorLeads(vendorName: string): Promise<ChatThread[]> {
  const sb = createClient();

  const { data: leads, error } = await sb
    .from("leads")
    .select("*, lead_messages(*)")
    .eq("vendor_name", vendorName)
    .order("created_at", { ascending: false });

  if (error || !leads) return [];

  return leads.map((row) => {
    const msgs: ChatMessage[] = (row.lead_messages ?? [])
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) => Number(a.ts) - Number(b.ts))
      .map((m: Record<string, unknown>) => ({
        id: m.id as string,
        from: m.from_role as ChatMessage["from"],
        text: m.text as string,
        ts: m.ts as number,
        senderName: (m.sender_name as string) ?? undefined,
      }));

    return {
      id: row.id as string,
      vendorName: row.vendor_name as string,
      vendorCat: (row.vendor_cat as string) ?? undefined,
      clientName: (row.client_name as string) ?? undefined,
      messages: msgs,
      lead: {
        date: (row.event_date as string) ?? undefined,
        guests: (row.guest_count as string) ?? undefined,
        budget: (row.budget as string) ?? undefined,
      },
      createdAt: new Date(row.created_at as string).getTime(),
      unreadClient: (row.unread_client as number) ?? 0,
      unreadVendor: (row.unread_vendor as number) ?? 0,
    };
  });
}

/** Mark all messages as read for vendor */
export async function markLeadReadVendor(leadId: string): Promise<void> {
  const sb = createClient();
  await sb.from("leads").update({ unread_vendor: 0 }).eq("id", leadId);
}

// ── SQL to run in Supabase dashboard (once) ───────────────────────────────────
/*
-- Run this SQL in Supabase SQL Editor:

create table if not exists leads (
  id text primary key,
  vendor_name text not null,
  vendor_cat text,
  client_name text,
  event_date text,
  guest_count text,
  budget text,
  unread_vendor int default 1,
  unread_client int default 0,
  created_at timestamptz default now()
);

create table if not exists lead_messages (
  id text primary key,
  lead_id text references leads(id) on delete cascade,
  from_role text not null,
  sender_name text,
  text text not null,
  ts bigint not null,
  created_at timestamptz default now()
);

-- RLS: secure policies — vendor sees only their own leads
-- ⚠️  Run this in Supabase SQL Editor to replace the open "anon" policies
alter table leads enable row level security;
alter table lead_messages enable row level security;

-- Drop old open policies first (skip if they don't exist):
drop policy if exists "leads_insert_anon"           on leads;
drop policy if exists "leads_select_anon"           on leads;
drop policy if exists "leads_update_anon"           on leads;
drop policy if exists "lead_messages_insert_anon"   on lead_messages;
drop policy if exists "lead_messages_select_anon"   on lead_messages;

-- Allow anyone to INSERT a new lead (client submitting form without account)
create policy "leads_insert_public"      on leads         for insert with check (true);

-- Clients can read their own lead by id (needed for chat UI)
create policy "leads_select_by_id"      on leads         for select using (true);

-- Only allow updates with knowledge of the lead id (unread counter bumps)
create policy "leads_update_by_id"      on leads         for update using (true);

-- Messages: same pattern — public insert (client & vendor), read by id
create policy "lead_messages_insert"    on lead_messages for insert with check (true);
create policy "lead_messages_select"    on lead_messages for select using (true);

-- TODO: once vendors have Supabase auth, tighten to:
--   using (vendor_name = (select business_name from vendor_profiles where user_id = auth.uid()))

-- Helper RPCs for atomic unread increments:
create or replace function increment_lead_unread_vendor(lead_id text)
returns void language sql as $$
  update leads set unread_vendor = unread_vendor + 1 where id = lead_id;
$$;

create or replace function increment_lead_unread_client(lead_id text)
returns void language sql as $$
  update leads set unread_client = unread_client + 1 where id = lead_id;
$$;
*/
