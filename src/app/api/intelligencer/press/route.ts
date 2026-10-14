import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { timingSafeEqual } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { rateLimited } from "@/lib/rateLimit";
import { sendEmail } from "@/lib/email";
import { safeImage, safeUrl, type EditionContent, type PaperAd, type PaperItem } from "@/lib/editions";

/**
 * THE PRESS'S ONE DOOR (October 14, 2026).
 *
 * The "Rebrew Intelligencer press" routine reads the open web, so it must not
 * hold anything worth stealing. It used to carry the Supabase connector, whose
 * execute_sql reaches every table in the project (the CRM contacts and the
 * subscriber list included), and whatever it writes is published on a public
 * page. A planted instruction on any news site could have turned that into a
 * leak. Now the press holds only INTELLIGENCER_PRESS_SECRET, and this route is
 * everything that secret can do:
 *
 *   GET   what the press needs to write the next number: today's date in New
 *         York, whether today is already printed, the last four numbers, views
 *         per number, and the desk notes. Nothing else in the database.
 *   POST  one number for today. The server picks the number and the date, so a
 *         second number for the same day is refused by the unique slug. The
 *         JSON is rebuilt field by field with length caps, links must be http(s),
 *         pictures must pass `safeImage`, and dashes are refused so the house
 *         rule holds. Then the site emails Alex the link and the social lines
 *         through Resend, to PRESS_NOTIFY_EMAIL, an address the press cannot set.
 *
 * So a hijacked press can, at worst, print one bad number in a day.
 */

const TABLE = "intelligencer_editions";

function admin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  return url && key ? createClient(url, key) : null;
}

function authorized(req: Request): boolean {
  const secret = process.env.INTELLIGENCER_PRESS_SECRET;
  if (!secret || secret.length < 24) return false;
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Refuse before doing any work: unknown callers, and anyone guessing. */
function gate(req: Request): NextResponse | null {
  if (!process.env.INTELLIGENCER_PRESS_SECRET) {
    return NextResponse.json({ error: "press not configured" }, { status: 503 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!authorized(req)) {
    if (rateLimited(`press-fail:${ip}`, 10, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "too many attempts" }, { status: 429 });
    }
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

/** Today's date in New York as YYYY-MM-DD: the press prints on the East Coast. */
function todayNY(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function GET(req: Request) {
  const refused = gate(req);
  if (refused) return refused;
  const sb = admin();
  if (!sb) return NextResponse.json({ error: "database not configured" }, { status: 503 });

  const today = todayNY();
  const since = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);
  const [recent, hits, notes] = await Promise.all([
    sb.from(TABLE).select("number, slug, headline, content").order("number", { ascending: false }).limit(4),
    sb.from("page_hits").select("path, views").gte("day", since),
    sb.from("intelligencer_notes").select("created_at, note").order("id", { ascending: false }).limit(5),
  ]);

  // Views per number, plus the front page, which always shows the newest.
  const views: Record<string, number> = {};
  for (const h of hits.data ?? []) {
    if (h.path === "/" || /^\/edition\/\d{4}-\d{2}-\d{2}$/.test(h.path)) {
      views[h.path] = (views[h.path] ?? 0) + h.views;
    }
  }

  const editions = recent.data ?? [];
  return NextResponse.json({
    today,
    printed_today: editions.some((e) => e.slug === today),
    next_number: (editions[0]?.number ?? 0) + 1,
    recent: editions,
    views_last_14_days: views,
    notes: notes.data ?? [],
  });
}

// ── POST: validation ──────────────────────────────────────────────────────

class Invalid extends Error {}

const DASH = /[–—]/;

function str(v: unknown, field: string, max: number, required = false): string | undefined {
  if (v === undefined || v === null || v === "") {
    if (required) throw new Invalid(`${field} is required`);
    return undefined;
  }
  if (typeof v !== "string") throw new Invalid(`${field} must be a string`);
  const s = v.trim();
  if (s.length > max) throw new Invalid(`${field} is longer than ${max} characters`);
  if (DASH.test(s)) throw new Invalid(`${field} contains an em or en dash`);
  return s;
}

function strs(v: unknown, field: string, maxItems: number, maxLen: number): string[] | undefined {
  if (v === undefined || v === null) return undefined;
  if (!Array.isArray(v)) throw new Invalid(`${field} must be an array`);
  if (v.length > maxItems) throw new Invalid(`${field} has more than ${maxItems} entries`);
  return v.map((x, i) => str(x, `${field}[${i}]`, maxLen, true)!);
}

function item(v: unknown, field: string, opts: { image?: boolean } = {}): PaperItem | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v !== "object" || Array.isArray(v)) throw new Invalid(`${field} must be an object`);
  const o = v as Record<string, unknown>;
  const out: PaperItem = {
    headline: str(o.headline, `${field}.headline`, 200),
    decks: strs(o.decks, `${field}.decks`, 3, 300),
    dateline: str(o.dateline, `${field}.dateline`, 80),
    paragraphs: strs(o.paragraphs, `${field}.paragraphs`, 12, 2500),
    signed: str(o.signed, `${field}.signed`, 120),
  };
  if (o.image !== undefined && o.image !== null) {
    if (!opts.image) throw new Invalid(`${field} may not carry an image`);
    const raw = o.image as Record<string, unknown>;
    const image = {
      url: str(raw.url, `${field}.image.url`, 600, true),
      caption: str(raw.caption, `${field}.image.caption`, 300, true),
      credit: str(raw.credit, `${field}.image.credit`, 300, true),
      source: str(raw.source, `${field}.image.source`, 600, true),
    };
    if (!safeImage(image) || !safeUrl(image.source)) {
      throw new Invalid(`${field}.image must be https on Wikimedia Commons or loc.gov, with a credit and a source page`);
    }
    out.image = image;
  }
  for (const k of Object.keys(out) as (keyof PaperItem)[]) if (out[k] === undefined) delete out[k];
  return out;
}

function items(v: unknown, field: string, maxItems: number, opts: { image?: boolean } = {}): PaperItem[] | undefined {
  if (v === undefined || v === null) return undefined;
  if (!Array.isArray(v)) throw new Invalid(`${field} must be an array`);
  if (v.length > maxItems) throw new Invalid(`${field} has more than ${maxItems} entries`);
  return v.map((x, i) => item(x, `${field}[${i}]`, opts)!);
}

/** Rebuilds the edition from known fields only; anything else is dropped. */
function validate(body: unknown): { headline: string; summary: string; content: EditionContent } {
  if (!body || typeof body !== "object") throw new Invalid("body must be a JSON object");
  const b = body as Record<string, unknown>;
  const c = (b.content ?? {}) as Record<string, unknown>;
  if (typeof c !== "object" || Array.isArray(c)) throw new Invalid("content must be an object");

  const content: EditionContent = {
    lead: item(c.lead, "lead", { image: true }),
    dispatches: items(c.dispatches, "dispatches", 6, { image: true }),
    markets: item(c.markets, "markets"),
    editorial: item(c.editorial, "editorial"),
    letters: items(c.letters, "letters", 4),
    amusements: items(c.amusements, "amusements", 3),
    miscellany: items(c.miscellany, "miscellany", 5),
    social: strs(c.social, "social", 3, 300),
  };
  if (!content.lead?.paragraphs?.length) throw new Invalid("lead.paragraphs is required");
  if (!content.dispatches?.length) throw new Invalid("dispatches is required");
  const pictures = [content.lead, ...(content.dispatches ?? [])].filter((i) => i?.image).length;
  if (pictures > 2) throw new Invalid("at most two pictures per number");

  if (c.advertisements !== undefined) {
    if (!Array.isArray(c.advertisements) || c.advertisements.length > 6) {
      throw new Invalid("advertisements must be an array of at most 6");
    }
    content.advertisements = c.advertisements.map((a, i): PaperAd => {
      const o = (a ?? {}) as Record<string, unknown>;
      return {
        headline: str(o.headline, `advertisements[${i}].headline`, 120, true),
        lines: strs(o.lines, `advertisements[${i}].lines`, 4, 300),
      };
    });
  }

  if (!Array.isArray(c.sources) || c.sources.length === 0) throw new Invalid("sources is required");
  if (c.sources.length > 40) throw new Invalid("sources has more than 40 entries");
  content.sources = c.sources.map((s, i) => {
    const o = (s ?? {}) as Record<string, unknown>;
    const url = safeUrl(str(o.url, `sources[${i}].url`, 600, true));
    if (!url) throw new Invalid(`sources[${i}].url must be http(s)`);
    return { title: str(o.title, `sources[${i}].title`, 300, true), url };
  });

  for (const k of Object.keys(content) as (keyof EditionContent)[]) if (content[k] === undefined) delete content[k];

  const headline = str(b.headline, "headline", 160, true)!.replace(/\.$/, "");
  const summary = str(b.summary, "summary", 400, true)!;
  if (JSON.stringify(content).length > 150_000) throw new Invalid("the number is too long");
  return { headline, summary, content };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);
}

export async function POST(req: Request) {
  const refused = gate(req);
  if (refused) return refused;

  let parsed: ReturnType<typeof validate>;
  try {
    parsed = validate(await req.json());
  } catch (e) {
    const message = e instanceof Invalid ? e.message : "body must be valid JSON";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const sb = admin();
  if (!sb) return NextResponse.json({ error: "database not configured" }, { status: 503 });

  const slug = todayNY();
  const { data: last } = await sb.from(TABLE).select("number, slug").order("number", { ascending: false }).limit(1).maybeSingle();
  if (last?.slug === slug) return NextResponse.json({ error: "already printed today", slug }, { status: 409 });
  const number = (last?.number ?? 0) + 1;

  const { error } = await sb.from(TABLE).insert({
    number,
    slug,
    headline: parsed.headline,
    summary: parsed.summary,
    content: parsed.content,
    status: "published",
  });
  if (error) {
    const status = error.code === "23505" ? 409 : 500;
    return NextResponse.json({ error: status === 409 ? "already printed today" : "insert failed" }, { status });
  }

  revalidatePath("/");
  revalidatePath("/editions");
  revalidatePath(`/edition/${slug}`);

  // Tell Alex. The address comes from the server's own environment, never the request.
  const to = process.env.PRESS_NOTIFY_EMAIL;
  const link = `https://www.rebrew.org/edition/${slug}`;
  let emailed = "skipped: PRESS_NOTIFY_EMAIL not set";
  if (to) {
    const lines = parsed.content.social ?? [];
    const result = await sendEmail({
      to,
      subject: `Intelligencer No. ${number}: ${parsed.headline}`,
      text: [link, "", ...lines.flatMap((l) => [l, ""])].join("\n"),
      html:
        `<div style="font-family:Georgia,serif;font-size:16px;line-height:1.6;max-width:640px">` +
        `<p><a href="${link}">${escapeHtml(link)}</a></p>` +
        lines.map((l) => `<p>${escapeHtml(l)}</p>`).join("") +
        `</div>`,
    });
    emailed = result.ok ? "sent" : `failed: ${result.error ?? "unknown"}`;
  }

  return NextResponse.json({ number, slug, url: link, emailed }, { status: 201 });
}
