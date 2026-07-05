/**
 * Referral-lead data access. Leads live in Supabase `referral_leads` (see
 * supabase/schema.sql), reached with the service key so the row is server-only
 * and never exposed through RLS.
 *
 * This is the site's #1 revenue path: a buyer/seller/relocation lead Alex refers
 * to a vetted agent for a fee. It is deliberately separate from the newsletter
 * `subscribers` list (src/lib/subscribers.ts): a person filling out
 * /find-an-agent is a HOT lead asking to be contacted, not a newsletter signup,
 * so there is no double opt-in. /api/refer stores the row here and emails Alex a
 * notification; storing succeeds even when email is not configured.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** True when the service-key Supabase env is set (same vars the publish route uses). */
export function leadsConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY;
}

function admin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_KEY!;
  return createClient(url, key);
}

export type LeadIntent = "buying" | "selling" | "both";
export type LeadTimeframe = "asap" | "3_months" | "6_months" | "exploring";

export interface LeadInput {
  name: string | null;
  email: string;
  phone: string | null;
  intent: LeadIntent | null;
  location: string | null;
  movingFrom: string | null;
  timeframe: LeadTimeframe | null;
  message: string | null;
  source: string | null;
}

/** Insert one referral lead. Throws on a database error so the route can 500. */
export async function insertLead(lead: LeadInput): Promise<void> {
  const db = admin();
  const { error } = await db.from("referral_leads").insert({
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    intent: lead.intent,
    location: lead.location,
    moving_from: lead.movingFrom,
    timeframe: lead.timeframe,
    message: lead.message,
    source: lead.source,
  });
  if (error) throw new Error(error.message);
}
