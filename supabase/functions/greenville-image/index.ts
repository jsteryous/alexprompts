// greenville-image — render a story-specific lead image for a Greenville post and
// host it in Supabase Storage, so the nightly routine never needs an API key and
// the public site never exposes one.
//
// The routine's image cascade is: a genuinely relevant Wikimedia Commons photo
// (decided in pass1, no key needed) -> THIS function for a map-with-pin (+ optional
// aerial / Street View) -> "none" only as a true last resort. This function owns the
// keyed half: geocode an address, render the images via Google Static Maps / Street
// View, upload them to the public `post-images` bucket, and return the hosted URLs.
//
// Secrets live HERE, not in the repo or on the agent:
//   - GOOGLE_MAPS_KEY        custom secret (set in Supabase -> Edge Functions -> Secrets),
//                            falling back to the project's existing GOOGLE_PLACES_API_KEY
//   - SUPABASE_URL           auto-injected by Supabase
//   - SUPABASE_SERVICE_ROLE_KEY  auto-injected by Supabase (used for the Storage upload)
//
// Auth: verify_jwt is on, so callers pass the PUBLIC anon key as a bearer token. That
// key is already shipped to browsers, so it is safe to hardcode in the routine.
//
// POST JSON: { "address": string, "aerial"?: boolean, "streetview"?: boolean }
// 200 JSON:  { ok, lat, lng, formatted, cover, aerial, streetview }
//   cover     = roadmap map-with-pin URL (always; this is the post cover)
//   aerial    = hybrid satellite URL, or null (only when requested)
//   streetview= Street View URL, or null (only when requested AND imagery exists)
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@2";

const BUCKET = "post-images";
const GMAPS = "https://maps.googleapis.com/maps/api";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Upload PNG bytes to the public bucket and return the public URL. Uses the
 *  supabase-js client so it works regardless of the project's key format. */
async function upload(
  supabase: SupabaseClient,
  path: string,
  bytes: ArrayBuffer,
): Promise<string> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, new Blob([bytes], { type: "image/png" }), {
      contentType: "image/png",
      upsert: true,
    });
  if (error) throw new Error(`storage upload failed: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Fetch a Google image URL and fail loudly if it returns an error payload. Google
 *  Static endpoints answer 200 with a tiny text/PNG error sheet on bad input, so we
 *  guard on both the content type and a sane minimum size. */
async function fetchImage(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  const type = res.headers.get("content-type") ?? "";
  const buf = await res.arrayBuffer();
  if (!res.ok || !type.startsWith("image/") || buf.byteLength < 2000) {
    throw new Error(`image fetch failed (${res.status}, ${type}, ${buf.byteLength}b)`);
  }
  return buf;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ ok: false, error: "POST only" }, 405);

  const key = Deno.env.get("GOOGLE_MAPS_KEY") ?? Deno.env.get("GOOGLE_PLACES_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!key) return json({ ok: false, error: "no Google key (GOOGLE_MAPS_KEY / GOOGLE_PLACES_API_KEY)" }, 500);
  if (!supabaseUrl || !serviceKey) {
    return json({ ok: false, error: "Supabase env missing" }, 500);
  }

  let body: { address?: string; aerial?: boolean; streetview?: boolean };
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "invalid JSON body" }, 400);
  }
  const address = (body.address ?? "").trim();
  if (!address) return json({ ok: false, error: "address required" }, 400);

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // 1. Geocode the address to a precise point.
    const geo = await fetch(
      `${GMAPS}/geocode/json?address=${encodeURIComponent(address)}&key=${key}`,
    ).then((r) => r.json());
    if (geo.status !== "OK" || !geo.results?.length) {
      return json({ ok: false, error: `geocode ${geo.status}: ${geo.error_message ?? ""}` }, 422);
    }
    const { lat, lng } = geo.results[0].geometry.location as { lat: number; lng: number };
    const formatted = geo.results[0].formatted_address as string;
    const ll = `${lat},${lng}`;

    // Shared storage prefix for this render: date + short random, no slug dependency.
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const dir = `greenville/${stamp}-${crypto.randomUUID().slice(0, 8)}`;

    // 2. Cover: roadmap with a pin, wide for the card hero. Always produced.
    const mapUrl =
      `${GMAPS}/staticmap?center=${ll}&zoom=16&size=1200x675&scale=2` +
      `&markers=color:red%7C${ll}&key=${key}`;
    const cover = await upload(supabase, `${dir}/map.png`, await fetchImage(mapUrl));

    // 3. Aerial: hybrid (satellite + street labels) of the site, when asked for.
    let aerial: string | null = null;
    if (body.aerial) {
      const aerialUrl =
        `${GMAPS}/staticmap?center=${ll}&zoom=18&size=1200x675&scale=2&maptype=hybrid` +
        `&markers=color:red%7C${ll}&key=${key}`;
      aerial = await upload(supabase, `${dir}/aerial.png`, await fetchImage(aerialUrl));
    }

    // 4. Street View: only if Google actually has imagery at the point.
    let streetview: string | null = null;
    if (body.streetview) {
      const meta = await fetch(
        `${GMAPS}/streetview/metadata?location=${ll}&key=${key}`,
      ).then((r) => r.json());
      if (meta.status === "OK") {
        const svUrl = `${GMAPS}/streetview?size=1200x675&location=${ll}&fov=80&key=${key}`;
        streetview = await upload(supabase, `${dir}/streetview.png`, await fetchImage(svUrl));
      }
    }

    return json({ ok: true, lat, lng, formatted, cover, aerial, streetview });
  } catch (e) {
    return json({ ok: false, error: String(e instanceof Error ? e.message : e) }, 500);
  }
});
