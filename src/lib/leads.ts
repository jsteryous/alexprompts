/**
 * Referral-lead data access. Leads live in Supabase `referral_leads` (see
 * supabase/schema.sql), reached with the service key so the row is server-only
 * and never exposed through RLS.
 *
 * This is the site's #1 revenue path: a buyer/seller/relocation lead Alex refers
 * to a vetted agent for a fee. It is deliberately separate from the newsletter
 * `subscribers` list (src/lib/subscribers.ts): a person filling out
 * /buying-or-selling is a HOT lead asking to be contacted, not a newsletter signup,
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
  /** First-party attribution (Phase 4): where the lead came from. */
  refSlug: string | null; // article slug the in-article CTA carried in ?ref=
  referrer: string | null; // document.referrer
  landingPath: string | null; // path the form was submitted from
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  /**
   * SMS consent record (10DLC / TCPA). TCPA puts the burden of proving consent
   * on the sender, so the boolean alone is not enough: the row also carries WHEN
   * it was given, the IP it came from, and the EXACT wording that was on screen
   * at the time. The wording is stamped server-side from src/lib/legal.ts, never
   * taken from the request body. When consent is absent these are all null and
   * the person must not be texted.
   */
  smsConsent: boolean;
  smsConsentAt: string | null;
  smsConsentIp: string | null;
  smsConsentText: string | null;
}

/**
 * True when a lead already carries `marker` in its message.
 *
 * This exists for the scheduler webhook (/api/booking) and nothing else. Cal.com
 * retries a delivery it did not get a 2xx for, and a retry after a successful
 * insert would put the same booked call in the table twice, which quietly
 * corrupts every conversion rate in supabase/queries.sql. The webhook writes the
 * Cal booking uid into the message text and checks for it here first.
 *
 * The uid lives in `message` rather than in a column of its own on purpose: a
 * dedicated column means a migration Alex has to remember to apply before the
 * route works, and the failure mode of forgetting would be silent duplicates.
 * This table is small and the scan is cheap. If bookings ever outgrow that,
 * promote it to its own indexed column.
 *
 * Returns false when the lookup itself fails. Losing a real booking is worse
 * than storing a duplicate one, so an unreachable database falls through to the
 * insert rather than swallowing the lead.
 */
export async function leadExistsWithMarker(marker: string): Promise<boolean> {
  const db = admin();
  const { data, error } = await db
    .from("referral_leads")
    .select("id")
    .ilike("message", `%${marker}%`)
    .limit(1);
  if (error) return false;
  return (data ?? []).length > 0;
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
    ref_slug: lead.refSlug,
    referrer: lead.referrer,
    landing_path: lead.landingPath,
    utm_source: lead.utmSource,
    utm_medium: lead.utmMedium,
    utm_campaign: lead.utmCampaign,
    sms_consent: lead.smsConsent,
    sms_consent_at: lead.smsConsentAt,
    sms_consent_ip: lead.smsConsentIp,
    sms_consent_text: lead.smsConsentText,
  });
  if (error) throw new Error(error.message);
}
