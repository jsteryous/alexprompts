import { NextResponse, after } from "next/server";
import { revalidatePath } from "next/cache";
import { timingSafeEqual } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { rateLimited } from "@/lib/rateLimit";
import { sendEmail } from "@/lib/email";
import { broadcastEdition } from "@/lib/editionEmail";

/** Room for the subscriber send that runs in after() once the press has its answer. */
export const maxDuration = 300;
import { LETTER_WINDOW_DAYS, READER_LETTERS_PER_NUMBER, letterParagraphs, undash } from "@/lib/letters";
import { safeImage, safeUrl, safeVideo, type EditionContent, type PaperAd, type PaperItem, type Ticker } from "@/lib/editions";

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
 *         per number, the desk notes, and unprinted letters from readers.
 *         Nothing else in the database.
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
  const lettersSince = new Date(Date.now() - LETTER_WINDOW_DAYS * 86400000).toISOString();
  const [recent, hits, notes, letters] = await Promise.all([
    sb.from(TABLE).select("number, slug, headline, content").order("number", { ascending: false }).limit(4),
    sb.from("page_hits").select("path, views").gte("day", since),
    sb.from("intelligencer_notes").select("created_at, note").order("id", { ascending: false }).limit(5),
    // Never the reader's email: the press sees only what could be printed.
    sb.from("intelligencer_letters").select("id, created_at, signed, body")
      .eq("status", "new").gte("created_at", lettersSince).order("id", { ascending: true }).limit(8),
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
    reader_letters: letters.data ?? [],
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
  if (o.video !== undefined && o.video !== null) {
    if (!opts.image) throw new Invalid(`${field} may not carry a film`);
    if (out.image) throw new Invalid(`${field} may carry an image or a film, not both`);
    const raw = o.video as Record<string, unknown>;
    const video = {
      youtube: str(raw.youtube, `${field}.video.youtube`, 20, true),
      caption: str(raw.caption, `${field}.video.caption`, 300, true),
    };
    if (!safeVideo(video)) throw new Invalid(`${field}.video.youtube must be an eleven-character YouTube video id`);
    out.video = video;
  }
  for (const k of Object.keys(out) as (keyof PaperItem)[]) if (out[k] === undefined) delete out[k];
  return out;
}

function num(v: unknown, field: string, min: number, max: number): number | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v !== "number" || !Number.isFinite(v) || v < min || v > max) {
    throw new Invalid(`${field} must be a number between ${min} and ${max}`);
  }
  return Math.round(v * 100) / 100;
}

/** The closes as numbers, in ranges no real close will leave for decades. */
function ticker(v: unknown): Ticker | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v !== "object" || Array.isArray(v)) throw new Invalid("ticker must be an object");
  const o = v as Record<string, unknown>;
  const session = str(o.session, "ticker.session", 10);
  if (session && !/^\d{4}-\d{2}-\d{2}$/.test(session)) throw new Invalid("ticker.session must be YYYY-MM-DD");
  const t: Ticker = {
    session,
    dow: num(o.dow, "ticker.dow", 1000, 1_000_000),
    sp500: num(o.sp500, "ticker.sp500", 100, 100_000),
    nasdaq: num(o.nasdaq, "ticker.nasdaq", 500, 500_000),
  };
  for (const k of Object.keys(t) as (keyof Ticker)[]) if (t[k] === undefined) delete t[k];
  return Object.keys(t).length ? t : undefined;
}

function items(v: unknown, field: string, maxItems: number, opts: { image?: boolean } = {}): PaperItem[] | undefined {
  if (v === undefined || v === null) return undefined;
  if (!Array.isArray(v)) throw new Invalid(`${field} must be an array`);
  if (v.length > maxItems) throw new Invalid(`${field} has more than ${maxItems} entries`);
  return v.map((x, i) => item(x, `${field}[${i}]`, opts)!);
}

/**
 * Letters: invented ones are ordinary items; a reader's letter is named by
 * `reader_letter_id` with the press's headline and an optional Editor's `reply`,
 * and its words are filled in from the database in POST (resolveReaderLetters).
 */
type LetterDraft = PaperItem & { readerLetterId?: number; reply?: string };

function letterItems(v: unknown): LetterDraft[] | undefined {
  if (v === undefined || v === null) return undefined;
  if (!Array.isArray(v)) throw new Invalid("letters must be an array");
  if (v.length > 4) throw new Invalid("letters has more than 4 entries");
  const out = v.map((x, i): LetterDraft => {
    const o = (x ?? {}) as Record<string, unknown>;
    if (o.reader_letter_id === undefined || o.reader_letter_id === null) {
      if (o.reader !== undefined) throw new Invalid(`letters[${i}].reader is set by the site, not the press`);
      return item(x, `letters[${i}]`)!;
    }
    const id = o.reader_letter_id;
    if (typeof id !== "number" || !Number.isInteger(id) || id < 1) throw new Invalid(`letters[${i}].reader_letter_id must be a letter id`);
    let reply = str(o.reply, `letters[${i}].reply`, 300);
    if (reply) reply = `[${reply.replace(/^\[|\]$/g, "").trim()}]`;
    return { headline: str(o.headline, `letters[${i}].headline`, 200, true), readerLetterId: id, reply };
  });
  const readers = out.filter((l) => l.readerLetterId);
  if (readers.length > READER_LETTERS_PER_NUMBER) throw new Invalid(`at most ${READER_LETTERS_PER_NUMBER} reader letters per number`);
  if (new Set(readers.map((l) => l.readerLetterId)).size !== readers.length) throw new Invalid("a reader letter appears twice");
  return out;
}

/** Copies each named reader's letter in exactly as written and signed. */
async function resolveReaderLetters(sb: SupabaseClient, letters: LetterDraft[] | undefined): Promise<number[]> {
  const ids = (letters ?? []).flatMap((l) => (l.readerLetterId ? [l.readerLetterId] : []));
  if (!ids.length) return [];
  const { data } = await sb.from("intelligencer_letters").select("id, body, signed").in("id", ids).eq("status", "new");
  const byId = new Map((data ?? []).map((r) => [r.id as number, r]));
  for (const l of letters!) {
    if (!l.readerLetterId) continue;
    const row = byId.get(l.readerLetterId);
    if (!row) throw new Invalid(`reader letter ${l.readerLetterId} is not an unprinted letter`);
    l.paragraphs = [...letterParagraphs(row.body), ...(l.reply ? [l.reply] : [])];
    l.signed = undash(row.signed);
    l.reader = true;
    delete l.readerLetterId;
    delete l.reply;
  }
  return ids;
}

/** Rebuilds the edition from known fields only; anything else is dropped. */
function validate(body: unknown): { headline: string; summary: string; content: EditionContent; pictureNote?: string } {
  if (!body || typeof body !== "object") throw new Invalid("body must be a JSON object");
  const b = body as Record<string, unknown>;
  const c = (b.content ?? {}) as Record<string, unknown>;
  if (typeof c !== "object" || Array.isArray(c)) throw new Invalid("content must be an object");

  const content: EditionContent = {
    lead: item(c.lead, "lead", { image: true }),
    dispatches: items(c.dispatches, "dispatches", 6, { image: true }),
    oddities: items(c.oddities, "oddities", 5, { image: true }),
    markets: item(c.markets, "markets"),
    editorial: item(c.editorial, "editorial"),
    letters: letterItems(c.letters),
    amusements: items(c.amusements, "amusements", 3),
    miscellany: items(c.miscellany, "miscellany", 5),
    social: strs(c.social, "social", 3, 300),
    ticker: ticker(c.ticker),
  };
  if (!content.lead?.paragraphs?.length) throw new Invalid("lead.paragraphs is required");
  if (!content.dispatches?.length) throw new Invalid("dispatches is required");
  // The lead, one dispatch and one oddity may each carry a picture. No. 2 went out
  // bare because the prompt let the press skip the search without trying, so the door
  // now refuses a lead with no picture unless the press says what it searched for.
  const dispatchPictures = (content.dispatches ?? []).filter((i) => i.image || i.video).length;
  const oddPictures = (content.oddities ?? []).filter((i) => i.image || i.video).length;
  if (dispatchPictures > 1) throw new Invalid("at most one dispatch may carry a picture");
  if (oddPictures > 1) throw new Invalid("at most one oddity may carry a picture");
  const pictureNote = str(b.picture_note, "picture_note", 600, false);
  if (!content.lead?.image && !content.lead?.video && !pictureNote) {
    throw new Invalid(
      "the lead needs an image or a video (see ILLUSTRATIONS). If no picture passed after three searches, send picture_note naming the searches and why each failed",
    );
  }

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
  return { headline, summary, content, pictureNote: pictureNote || undefined };
}

/**
 * Asks YouTube whether each film exists and may be embedded, and writes the
 * channel's name as the credit. oEmbed answers 401 or 404 for a private,
 * deleted or unembeddable film.
 */
async function checkFilms(content: EditionContent): Promise<void> {
  const items = [content.lead, ...(content.dispatches ?? []), ...(content.oddities ?? [])];
  for (const item of items) {
    const v = item?.video;
    if (!v?.youtube) continue;
    const watch = `https://www.youtube.com/watch?v=${v.youtube}`;
    let res: Response;
    try {
      res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watch)}`, { signal: AbortSignal.timeout(8000) });
    } catch {
      throw new Invalid(`could not reach YouTube to check film ${v.youtube}; try again`);
    }
    if (!res.ok) throw new Invalid(`film ${v.youtube} is private, deleted or may not be embedded (YouTube answered ${res.status})`);
    const info = (await res.json()) as { author_name?: string };
    v.credit = undash((info.author_name ?? "YouTube").slice(0, 120));
    v.source = watch;
  }
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

  try {
    await checkFilms(parsed.content);
  } catch (e) {
    if (e instanceof Invalid) return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }

  let readerLetterIds: number[];
  try {
    readerLetterIds = await resolveReaderLetters(sb, parsed.content.letters);
  } catch (e) {
    if (e instanceof Invalid) return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }

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

  if (readerLetterIds.length) {
    await sb.from("intelligencer_letters").update({ status: "printed", printed_in: slug }).in("id", readerLetterIds);
  }

  revalidatePath("/");
  revalidatePath("/editions");
  revalidatePath(`/edition/${slug}`);

  // Tell Alex. The address comes from the server's own environment, never the request.
  const to = process.env.PRESS_NOTIFY_EMAIL;
  const link = `https://www.rebrew.org/edition/${slug}`;
  let emailed = "skipped: PRESS_NOTIFY_EMAIL not set";
  if (to) {
    const lines = [...(parsed.content.social ?? []), ...(parsed.pictureNote ? [`No lead picture: ${parsed.pictureNote}`] : [])];
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

  // Then the subscribers, after the press has its answer: a send to the whole list
  // can take a while, and the press must never wait on it or retry because of it.
  after(async () => {
    const result = await broadcastEdition(sb, slug);
    if (!result.body.ok) console.error("[press] subscriber email:", JSON.stringify(result.body));
  });

  return NextResponse.json({ number, slug, url: link, emailed, subscribers: "sending" }, { status: 201 });
}
