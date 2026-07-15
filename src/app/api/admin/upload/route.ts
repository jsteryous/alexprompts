import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/adminAuth";

// Where body images live. Same public bucket the cover cron uses.
const BUCKET = "post-images";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/avif": "avif",
};

// POST /api/admin/upload  (multipart form-data, fields "file" + optional "kind")
// [?token=<secret>]
// Uploads a pasted/dropped image to Supabase Storage and returns its public URL.
// kind=cover files the image under cover/ (the editor's cover-photo picker);
// anything else lands under body/ (inserted as markdown). Cookie-authed (the
// /admin flow) or a ?token= fallback (the /review flow). Same-origin, size- and
// type-checked.
export async function POST(req: NextRequest) {
  if (!process.env.PUBLISH_SECRET) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  const token = new URL(req.url).searchParams.get("token");
  if (!isAuthorized(req, token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
  }

  let file: File | null = null;
  let kind = "body";
  try {
    const form = await req.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
    if (form.get("kind") === "cover") kind = "cover";
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }
  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const ext = EXT[file.type];
  if (!ext) {
    return NextResponse.json({ error: `Unsupported image type: ${file.type || "unknown"}` }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image too large (max 10 MB)" }, { status: 413 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const name = `${kind}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const supabase = createClient(url, key);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(name, bytes, { contentType: file.type, upsert: false });
  if (error) {
    return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
  }

  const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;
  return NextResponse.json({ ok: true, url: publicUrl });
}

function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}
