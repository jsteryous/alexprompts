/**
 * Story-specific lead-image rendering for Greenville /real-estate posts, run
 * server-side on Vercel (the nightly Claude routine cannot reach Google or the
 * Supabase Storage API from its sandbox, so it publishes the row and this fills
 * the cover afterward, from the finalize cron).
 *
 * The cascade: geocode the reporter's LOCATION, render a Street View photo of the
 * site when Google has imagery there (a real photo of the actual place, so the
 * section is not wall-to-wall red-pin maps), otherwise a roadmap with a pin. Both
 * carry Google's own watermark, so no separate credit line is needed. Upload the
 * chosen image to the public `post-images` bucket and return its URL.
 *
 * This replaces the old `greenville-image` Supabase Edge Function: the agent is
 * out of the image path entirely now, so the key can live in Vercel env alongside
 * the one area-scan already uses, with no separate function or secret.
 *
 * Env (all server-only, already present for other features):
 *   - GOOGLE_PLACES_API_KEY (or GOOGLE_MAPS_KEY) — Maps Static, Geocoding, Street View Static
 *   - NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_KEY — for the Storage upload
 */
import { createClient } from "@supabase/supabase-js";

const BUCKET = "post-images";
const GMAPS = "https://maps.googleapis.com/maps/api";

export interface RenderResult {
  cover: string;
  coverKind: "streetview" | "map";
}

function googleKey(): string | undefined {
  return process.env.GOOGLE_PLACES_API_KEY ?? process.env.GOOGLE_MAPS_KEY;
}

/** True when both the Google key and the service-key Supabase env are set. */
export function greenvilleImageConfigured(): boolean {
  return (
    !!googleKey() &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_KEY
  );
}

/** Remove the Google API key from any string before it surfaces in an error. */
function scrub(s: string, key: string): string {
  return s.split(key).join("***").replace(/([?&]key=)[^&\s"']+/gi, "$1***");
}

/** Fetch a Google image URL, failing loudly on the tiny error sheet Google returns
 *  with a 200 on bad input (guard on content type and a sane minimum size). */
async function fetchImage(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  const type = res.headers.get("content-type") ?? "";
  const buf = await res.arrayBuffer();
  if (!res.ok || !type.startsWith("image/") || buf.byteLength < 2000) {
    throw new Error(`image fetch failed (${res.status}, ${type}, ${buf.byteLength}b)`);
  }
  return buf;
}

/**
 * Geocode `address` and render a cover for it, uploading to Storage and returning
 * the public URL. Prefers a Street View photo of the site, falls back to a
 * map-with-pin. Throws on a bad address or a Google/Storage failure so the caller
 * can leave cover_image null and retry on the next reconcile.
 */
export async function renderCover(address: string): Promise<RenderResult> {
  const key = googleKey();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!key) throw new Error("no Google key (GOOGLE_PLACES_API_KEY / GOOGLE_MAPS_KEY)");
  if (!supabaseUrl || !serviceKey) throw new Error("Supabase service env missing");

  const supabase = createClient(supabaseUrl, serviceKey);

  const upload = async (path: string, bytes: ArrayBuffer): Promise<string> => {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, Buffer.from(bytes), { contentType: "image/png", upsert: true });
    if (error) throw new Error(`storage upload failed: ${error.message}`);
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  };

  try {
    // 1. Geocode the address to a precise point.
    const geo = await fetch(
      `${GMAPS}/geocode/json?address=${encodeURIComponent(address)}&key=${key}`,
    ).then((r) => r.json());
    if (geo.status !== "OK" || !geo.results?.length) {
      throw new Error(scrub(`geocode ${geo.status}: ${geo.error_message ?? ""}`, key));
    }
    const { lat, lng } = geo.results[0].geometry.location as { lat: number; lng: number };
    const ll = `${lat},${lng}`;

    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const dir = `greenville/${stamp}-${crypto.randomUUID().slice(0, 8)}`;

    // 2. Street View: only if Google actually has imagery at the point. When it
    //    does it becomes the cover, because a street-level photo of the real place
    //    looks like a photo, not a red-pin map.
    const meta = await fetch(`${GMAPS}/streetview/metadata?location=${ll}&key=${key}`).then((r) =>
      r.json(),
    );
    if (meta.status === "OK") {
      const svUrl = `${GMAPS}/streetview?size=1200x675&location=${ll}&fov=80&key=${key}`;
      const cover = await upload(`${dir}/streetview.png`, await fetchImage(svUrl));
      return { cover, coverKind: "streetview" };
    }

    // 3. Map fallback: roadmap with a pin, wide for the card hero.
    const mapUrl =
      `${GMAPS}/staticmap?center=${ll}&zoom=16&size=1200x675&scale=2` +
      `&markers=color:red%7C${ll}&key=${key}`;
    const cover = await upload(`${dir}/map.png`, await fetchImage(mapUrl));
    return { cover, coverKind: "map" };
  } catch (e) {
    throw new Error(scrub(String(e instanceof Error ? e.message : e), key));
  }
}
