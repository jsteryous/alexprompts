/**
 * Owned email-list data access. The list lives in Supabase `subscribers` (see
 * supabase/schema.sql), reached with the service key so it is server-only and
 * never exposed through RLS. This is the asset we own, separate from Substack:
 * it lets us email people about site-only posts (Greenville /real-estate, Lab /lab)
 * that never go to Substack.
 *
 * Flow is double opt-in: a signup creates a `pending` row with a confirm token and
 * we email that token; confirming flips the row to `confirmed`. Only confirmed rows
 * receive broadcasts. Double opt-in protects deliverability and keeps spam-trap and
 * mistyped addresses off the list.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SubscriberStatus = "pending" | "confirmed" | "unsubscribed";

/** True when the service-key Supabase env is set (same vars the publish route uses). */
export function subscribersConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY;
}

function admin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_KEY!;
  return createClient(url, key);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Lowercase + trim and validate. Returns null when the address is not plausible. */
export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const e = raw.trim().toLowerCase();
  if (e.length < 3 || e.length > 254 || !EMAIL_RE.test(e)) return null;
  return e;
}

export type UpsertState = "new" | "resent" | "reactivated" | "already";

export interface UpsertResult {
  state: UpsertState;
  /** Present when the caller should send a confirmation email. */
  confirmToken?: string;
}

/**
 * Add a pending subscriber, or refresh an existing one, returning whether a
 * confirmation email should go out and the token to put in it.
 *   - new email                -> insert pending, send confirm
 *   - existing & confirmed      -> "already", no email
 *   - existing & pending        -> new token, resend confirm
 *   - existing & unsubscribed   -> new token, re-opt-in
 */
export async function upsertPending(email: string, source: string | null): Promise<UpsertResult> {
  const db = admin();
  const token = crypto.randomUUID();

  const { data: existing } = await db
    .from("subscribers")
    .select("id, status")
    .eq("email", email)
    .maybeSingle();

  if (!existing) {
    const { error } = await db.from("subscribers").insert({
      email,
      status: "pending",
      confirm_token: token,
      source,
    });
    if (error) throw new Error(error.message);
    return { state: "new", confirmToken: token };
  }

  if (existing.status === "confirmed") {
    return { state: "already" };
  }

  // pending or unsubscribed: issue a fresh token and (re)send confirmation.
  const { error } = await db
    .from("subscribers")
    .update({
      status: "pending",
      confirm_token: token,
      unsubscribed_at: null,
      source,
    })
    .eq("id", existing.id);
  if (error) throw new Error(error.message);
  return { state: existing.status === "unsubscribed" ? "reactivated" : "resent", confirmToken: token };
}

/** Flip a pending row to confirmed by its confirm token. Returns the email, or
 *  null when the token is unknown or already used. */
export async function confirmSubscriber(token: string): Promise<string | null> {
  const db = admin();
  const { data } = await db
    .from("subscribers")
    .select("id, email, status")
    .eq("confirm_token", token)
    .maybeSingle();
  if (!data) return null;

  if (data.status !== "confirmed") {
    const { error } = await db
      .from("subscribers")
      .update({ status: "confirmed", confirmed_at: new Date().toISOString(), confirm_token: null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
  }
  return data.email as string;
}

/** Unsubscribe by the per-recipient token carried in every broadcast. Idempotent:
 *  an unknown token returns null, an already-unsubscribed one returns the email. */
export async function unsubscribeByToken(token: string): Promise<string | null> {
  const db = admin();
  const { data } = await db
    .from("subscribers")
    .select("id, email, status")
    .eq("unsub_token", token)
    .maybeSingle();
  if (!data) return null;

  if (data.status !== "unsubscribed") {
    const { error } = await db
      .from("subscribers")
      .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
  }
  return data.email as string;
}

export interface ConfirmedSubscriber {
  email: string;
  unsub_token: string;
}

/** Every confirmed subscriber, for a broadcast send. */
export async function getConfirmedSubscribers(): Promise<ConfirmedSubscriber[]> {
  const db = admin();
  const { data, error } = await db
    .from("subscribers")
    .select("email, unsub_token")
    .eq("status", "confirmed");
  if (error) throw new Error(error.message);
  return (data ?? []) as ConfirmedSubscriber[];
}
