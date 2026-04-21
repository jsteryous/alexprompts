"use server";

import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const VALID_STATUSES = ["not_contacted", "contacted", "replied", "booked", "dead"] as const;
type ContactStatus = (typeof VALID_STATUSES)[number];

async function requireUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_KEY!;
  return createClient(url, key);
}

export async function updateContactStatus(formData: FormData) {
  await requireUser();

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  if (!id || !VALID_STATUSES.includes(status as ContactStatus)) {
    throw new Error("Invalid input");
  }

  const patch: Record<string, unknown> = { contact_status: status };
  if (status !== "not_contacted") patch.last_contacted_at = new Date().toISOString();
  else patch.last_contacted_at = null;

  const { error } = await serviceClient()
    .from("website_prospects")
    .update(patch)
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/dashboard/prospects");
}

export async function updateNotes(formData: FormData) {
  await requireUser();

  const id = formData.get("id") as string;
  const notes = (formData.get("notes") as string | null) ?? "";
  if (!id) throw new Error("Invalid input");

  const { error } = await serviceClient()
    .from("website_prospects")
    .update({ notes: notes.trim() === "" ? null : notes })
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/dashboard/prospects");
}

export async function bumpContactedAt(formData: FormData) {
  await requireUser();

  const id = formData.get("id") as string;
  if (!id) throw new Error("Invalid input");

  const client = serviceClient();
  const { data: row } = await client
    .from("website_prospects")
    .select("contact_status")
    .eq("id", id)
    .single();

  const patch: Record<string, unknown> = { last_contacted_at: new Date().toISOString() };
  if (!row?.contact_status || row.contact_status === "not_contacted") {
    patch.contact_status = "contacted";
  }

  const { error } = await client
    .from("website_prospects")
    .update(patch)
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/dashboard/prospects");
}
