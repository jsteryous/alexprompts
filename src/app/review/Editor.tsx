"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { Editor as TiptapEditor } from "@tiptap/react";
import { mdToEditorHtml } from "@/lib/editorMarkdown";
import { retagForSection, type SectionKey } from "@/lib/editorSections";
import { sectionOf } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";
import { isPlaceholderSlug, slugify } from "@/lib/slug";
import PostSettings from "./PostSettings";
import RichText from "./RichText";

interface Props {
  id: string;
  /** Legacy query-token auth (the /review flow). Omit it under /admin, where
   *  the httpOnly admin cookie authorizes the Save/Publish/Upload calls. */
  token?: string;
  initialTitle: string;
  initialSummary: string;
  initialBody: string;
  status: string;
  /** The row's stored URL slug. A draft started by hand arrives with a
   *  placeholder (`untitled-xxxxxx`) that the title takes over. */
  slug: string;
  /** The row's stored tags, which decide the section it publishes to. */
  initialTags?: string[];
  /** Where the back arrow points. Defaults to the /admin drafts list. */
  backHref?: string;
  /** Public URL of the post (e.g. /real-estate/<slug>), for the View link. */
  livePath?: string;
  /** The cover stored on the row, which is the one Alex chose himself. There
   *  is no automatic cover anywhere downstream: a piece ships with this photo
   *  or with none. */
  initialCoverImage?: string | null;
  initialCoverCredit?: string | null;
}

type Msg = { kind: "ok" | "err"; text: string } | null;
type Mode = "write" | "preview";

/** Grow a textarea to fit its content, so the page scrolls instead of the box. */
function autosize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

// Web-size an image in the browser BEFORE upload, mirroring the cover-library
// spec (~1400px / ~300KB). next/image already serves stored covers as small
// responsive variants, but the ORIGINAL file is what the OG/share card uses raw,
// what the first transformation has to chew through, and what sits in storage,
// so a full-size phone photo must never land there. GIFs pass through
// (re-encoding would kill the animation); anything already small and within the
// width cap passes through; the re-encode is kept only when it actually shrinks
// the file.
const COVER_MAX_W = 1600; // hero renders 624px wide; 1600 covers 2x retina with room
const BODY_MAX_W = 1400; // same cap as the committed cover library
const REENCODE_QUALITY = 0.82;
const SKIP_BELOW_BYTES = 500 * 1024;

async function websizeImage(file: File, maxWidth: number): Promise<File> {
  if (file.type === "image/gif") return file;
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    return file; // browser cannot decode it here; let the server take the original
  }
  const scale = Math.min(1, maxWidth / bmp.width);
  if (scale === 1 && file.size <= SKIP_BELOW_BYTES) {
    bmp.close();
    return file;
  }
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bmp.close();
    return file;
  }
  // JPEG has no alpha; flatten any transparency onto white instead of black.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", REENCODE_QUALITY),
  );
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
    type: "image/jpeg",
  });
}

export default function Editor({
  id,
  token,
  initialTitle,
  initialSummary,
  initialBody,
  status,
  slug: initialSlug,
  initialTags = [],
  backHref = "/admin",
  livePath,
  initialCoverImage = null,
  initialCoverCredit = null,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [summary, setSummary] = useState(initialSummary);
  const [body, setBody] = useState(initialBody);
  const [coverImage, setCoverImage] = useState<string | null>(initialCoverImage);
  const [coverCredit, setCoverCredit] = useState<string | null>(initialCoverCredit);
  const [slug, setSlug] = useState(initialSlug);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("write");
  const [saving, startSave] = useTransition();
  const [publishing, startPublish] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [message, setMessage] = useState<Msg>(null);
  const [coverDrag, setCoverDrag] = useState(false);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const summaryRef = useRef<HTMLTextAreaElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<TiptapEditor | null>(null);

  const published = status === "PUBLISHED";
  const section = useMemo<SectionKey>(() => sectionOf({ tags }), [tags]);
  const host = new URL(SITE_URL).host;

  // The URL follows the title while the slug is still the minted placeholder,
  // so a piece started from the Write Article button gets a real address just
  // by being given a name. Editing the slug by hand, or opening an
  // engine-written draft (which arrives with a real slug), stops that for good.
  const slugAuto = useRef(!published && isPlaceholderSlug(initialSlug));
  useEffect(() => {
    if (!slugAuto.current) return;
    const next = slugify(title);
    if (next) setSlug(next);
  }, [title]);

  function editSlug(next: string) {
    slugAuto.current = false;
    setSlug(next.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"));
  }

  function moveSection(next: SectionKey) {
    setTags((prev) => retagForSection(prev, next));
  }

  // The exact payload of the last save that FAILED. Autosave re-runs whenever
  // `saving` flips back to false, so without this a save the server keeps
  // refusing (a slug another post already holds, most likely) would retry every
  // 2.5 seconds forever. Retry once the document actually changes, not before.
  const failedRef = useRef<string | null>(null);

  // What was last written to the database. Dirty means the state has drifted
  // from it; autosave and the header indicator both key off this.
  const [savedState, setSavedState] = useState({
    title: initialTitle,
    summary: initialSummary,
    body: initialBody,
    coverImage: initialCoverImage,
    coverCredit: initialCoverCredit,
    slug: initialSlug,
    tags: JSON.stringify(initialTags),
  });
  const dirty =
    title !== savedState.title ||
    summary !== savedState.summary ||
    body !== savedState.body ||
    coverImage !== savedState.coverImage ||
    coverCredit !== savedState.coverCredit ||
    slug !== savedState.slug ||
    JSON.stringify(tags) !== savedState.tags;

  // Query suffix that carries the token for the /review flow; the /admin flow
  // relies on the cookie instead, so it stays empty.
  const authQuery = token ? `?token=${encodeURIComponent(token)}` : "";

  // The cover is Alex's own photo or nothing at all. Publishing no longer
  // stamps a stock photo from the curated library, so an empty slot here is a
  // decision that survives to the live page rather than a gap something fills.

  // The rich-text document is seeded ONCE from the stored markdown. `body`
  // stays markdown from then on: RichText converts on every keystroke, so
  // autosave, the word count, the preview, and the save payload are all
  // unchanged from when this was a plain textarea.
  const [initialHtml] = useState(() => mdToEditorHtml(initialBody));

  // Substack-style borderless fields grow with their content.
  useEffect(() => autosize(titleRef.current), [title]);
  useEffect(() => autosize(summaryRef.current), [summary]);

  // Measuring at mount alone is not enough. The first measure runs before the
  // web font has swapped in and before a resize changes where the text wraps,
  // and a title that later wraps to two lines keeps its one-line height, which
  // clips the second line under the subtitle. Re-measure when the fonts are
  // ready and on every resize.
  useEffect(() => {
    function fit() {
      autosize(titleRef.current);
      autosize(summaryRef.current);
    }
    fit();
    document.fonts?.ready.then(fit).catch(() => {});
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // Live preview is rendered SERVER-SIDE through the same marked + sanitize-html
  // pipeline the article page uses, so what you see is how it renders on the site
  // (and the HTML is sanitized, safe to inject). Debounced to ~400ms.
  const [previewHtml, setPreviewHtml] = useState("<p>Loading preview…</p>");
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const resp = await fetch(`/api/admin/preview${authQuery}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ md: body }),
        });
        const json = await resp.json().catch(() => ({}));
        if (!cancelled && resp.ok) setPreviewHtml(json.html || "<p><em>Nothing yet.</em></p>");
      } catch {
        /* keep the last good preview */
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [body, authQuery]);

  // ── save / publish ────────────────────────────────────────────────────────
  function save() {
    if (saving) return;
    const snapshot = {
      title,
      summary,
      body,
      coverImage,
      coverCredit,
      slug,
      tags: JSON.stringify(tags),
    };
    setMessage(null);
    startSave(async () => {
      try {
        const resp = await fetch("/api/review/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            token,
            title: snapshot.title,
            summary: snapshot.summary,
            body_md: snapshot.body,
            cover_image: snapshot.coverImage,
            cover_credit: snapshot.coverCredit,
            slug: snapshot.slug,
            tags,
          }),
        });
        const json = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          failedRef.current = JSON.stringify(snapshot);
          setMessage({ kind: "err", text: json.error ?? `Save failed (${resp.status})` });
          return;
        }
        failedRef.current = null;
        setSavedState(snapshot);
      } catch (exc) {
        failedRef.current = JSON.stringify(snapshot);
        setMessage({ kind: "err", text: (exc as Error).message });
      }
    });
  }

  // The Save/autosave/shortcut paths all go through the ref so the effects
  // below can stay dependency-clean.
  const saveRef = useRef(save);
  saveRef.current = save;

  // Substack-style autosave, DRAFTS ONLY: a published post saves manually so an
  // edit never goes live (and revalidates) mid-thought.
  useEffect(() => {
    if (published || !dirty || saving || uploading || coverUploading) return;
    const pending = JSON.stringify({
      title,
      summary,
      body,
      coverImage,
      coverCredit,
      slug,
      tags: JSON.stringify(tags),
    });
    if (failedRef.current === pending) return;
    const t = setTimeout(() => saveRef.current(), 2500);
    return () => clearTimeout(t);
  }, [
    title,
    summary,
    body,
    coverImage,
    coverCredit,
    slug,
    tags,
    dirty,
    saving,
    uploading,
    coverUploading,
    published,
  ]);

  // Cmd/Ctrl+S saves instead of opening the browser save dialog. Bold, italic,
  // and link shortcuts are NOT here: TipTap binds Cmd+B/I/K itself, scoped to
  // the editor, so a global handler would double-fire them.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // A draft started from Write Article opens with the caret in the title, the
  // way a new Substack post does. An engine draft opens untouched, so the page
  // does not scroll itself to the top of an article Alex is here to read.
  useEffect(() => {
    if (!initialTitle && !initialBody) titleRef.current?.focus();
    // Mount only: this is where the caret STARTS, not where it is kept.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Move the caret from the subtitle into the body.
  //
  // The DOM node is focused FIRST and the TipTap command only places the caret
  // afterwards, because the command is the half that can fail: on an instance
  // torn down by a hot reload it throws, and anything after it in the same
  // callback never runs. Focusing the element first means the worst case is a
  // caret at the wrong end of the body rather than a keystroke landing back in
  // the subtitle. The timer (not requestAnimationFrame, which browsers pause in
  // a background tab) gives a just-mounted editor a tick to exist, for the case
  // where this fires right after switching back from Preview.
  function focusBody() {
    setMode("write");
    setTimeout(() => {
      const ed = bodyRef.current;
      let dom: HTMLElement | null = null;
      try {
        dom = (ed?.view?.dom as HTMLElement | undefined) ?? null;
      } catch {
        /* an editor torn down under us; fall back to the DOM below */
      }
      dom = dom ?? document.querySelector<HTMLElement>(".ProseMirror");
      dom?.focus();
      try {
        ed?.commands.focus("start");
      } catch {
        /* the element already has focus, which is the part that matters */
      }
    }, 0);
  }

  function publish() {
    setMessage(null);
    startPublish(async () => {
      try {
        const resp = await fetch("/api/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, token }),
        });
        const json = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          setMessage({ kind: "err", text: json.error ?? `Publish failed (${resp.status})` });
          return;
        }
        window.location.href = json.path ?? "/";
      } catch (exc) {
        setMessage({ kind: "err", text: (exc as Error).message });
      }
    });
  }

  // ── cover photo ───────────────────────────────────────────────────────────
  async function uploadCover(file: File) {
    if (!file.type.startsWith("image/")) return;
    setMessage(null);
    setCoverUploading(true);
    try {
      const sized = await websizeImage(file, COVER_MAX_W);
      const fd = new FormData();
      fd.append("file", sized);
      fd.append("kind", "cover");
      const resp = await fetch(`/api/admin/upload${authQuery}`, { method: "POST", body: fd });
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setMessage({ kind: "err", text: json.error ?? `Upload failed (${resp.status})` });
        return;
      }
      setCoverImage(json.url);
      setCoverCredit(null);
    } catch (exc) {
      setMessage({ kind: "err", text: (exc as Error).message });
    } finally {
      setCoverUploading(false);
    }
  }

  function coverFromUrl() {
    const url = window.prompt("Image URL", coverImage ?? "https://");
    if (!url || !url.trim() || url.trim() === "https://") return;
    setCoverImage(url.trim());
    setCoverCredit(null);
  }

  function resetCover() {
    setCoverImage(null);
    setCoverCredit(null);
  }

  function onCoverDrop(e: React.DragEvent) {
    e.preventDefault();
    setCoverDrag(false);
    const file = Array.from(e.dataTransfer?.files ?? []).find((f) =>
      f.type.startsWith("image/"),
    );
    if (file) uploadCover(file);
  }

  // ── body image upload ─────────────────────────────────────────────────────
  // Handed to RichText, which owns paste, drop, and the slash menu's Image item
  // and inserts the returned URL as a captionable figure.
  async function uploadImage(file: File): Promise<string | null> {
    if (!file.type.startsWith("image/")) return null;
    setMessage(null);
    setUploading(true);
    try {
      const sized = await websizeImage(file, BODY_MAX_W);
      const fd = new FormData();
      fd.append("file", sized);
      const resp = await fetch(`/api/admin/upload${authQuery}`, { method: "POST", body: fd });
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setMessage({ kind: "err", text: json.error ?? `Upload failed (${resp.status})` });
        return null;
      }
      return json.url as string;
    } catch (exc) {
      setMessage({ kind: "err", text: (exc as Error).message });
      return null;
    } finally {
      setUploading(false);
    }
  }

  const words = body.split(/\s+/).filter(Boolean).length;
  // What still has to be true before this can go live. The publish route
  // refuses an empty piece anyway; saying so here is friendlier than a red bar
  // after the click.
  const blocker = !title.trim()
    ? "Give it a title first"
    : !body.trim()
      ? "Write something first"
      : !slug.trim()
        ? "Give it a URL in settings"
        : dirty
          ? "Save first, then publish"
          : null;
  const saveState = saving
    ? "Saving…"
    : dirty
      ? status === "PUBLISHED"
        ? "Unsaved changes"
        : "Unsaved"
      : "Saved";

  return (
    <>
      {/* Sticky header: back, state, actions. Kept slim, Substack-style.
          All colors come from the `.theme-*` tokens: the editor renders outside
          Nav/Footer and used to hardcode white + Tailwind grays, so it ignored
          the site's dark toggle entirely (fixed August 1, 2026). */}
      <div className="sticky top-0 z-20 h-14 theme-header border-b theme-border px-4 md:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={backHref}
            className="theme-link text-sm shrink-0 inline-flex items-center gap-1"
          >
            ← Drafts
          </Link>
          {/* One line, not three chips. Substack says where you are and whether
              it is saved, and nothing else; the section moved into Settings,
              which is the only place it can be changed anyway. */}
          <span className="text-xs shrink-0 theme-text-muted">
            <span className={published ? "tone-good-text font-medium" : "tone-warm-text font-medium"}>
              {published ? "Published" : "Draft"}
            </span>
            <span className="px-1.5" aria-hidden>
              ·
            </span>
            <span className={dirty && !saving ? "tone-warm-text font-medium" : ""}>{saveState}</span>
          </span>
          {message && (
            <span
              className={`text-xs font-medium truncate ${
                message.kind === "ok" ? "tone-good-text" : "tone-hot-text"
              }`}
            >
              {message.text}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden md:inline text-xs theme-text-muted pr-2">
            {uploading ? "Uploading image…" : `${words.toLocaleString()} words`}
          </span>
          <button
            type="button"
            onClick={() => setMode(mode === "write" ? "preview" : "write")}
            className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
              mode === "preview"
                ? "theme-text-primary bg-[var(--surface-muted)]"
                : "theme-text-secondary hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
            }`}
            title="See it the way the site renders it"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="text-sm font-medium theme-text-secondary hover:text-[var(--foreground)] px-3 py-2 rounded-lg hover:bg-[var(--surface-muted)] transition-colors"
            title="Post settings"
          >
            Settings
          </button>
          {(dirty || saving) && (
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="text-sm font-medium theme-text-secondary hover:text-[var(--foreground)] px-3 py-2 rounded-lg hover:bg-[var(--surface-muted)] transition-colors disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          )}
          {!published ? (
            <button
              type="button"
              onClick={publish}
              disabled={Boolean(blocker) || publishing}
              className="inline-flex items-center gap-2 bg-green-500 text-black font-semibold text-sm px-4 md:px-5 py-2 rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={blocker ?? "Publish"}
            >
              {publishing ? "Publishing…" : "Publish →"}
            </button>
          ) : (
            <a
              href={livePath ?? backHref}
              className="theme-cta inline-flex items-center gap-2 font-semibold text-sm px-4 md:px-5 py-2 rounded-lg transition-colors"
            >
              View →
            </a>
          )}
        </div>
      </div>

      {/* One centered, article-width column, like the Substack composer. */}
      <div className="max-w-[44rem] mx-auto px-4 md:px-6 pt-14 md:pt-16 pb-40">
        {/* ── Cover photo ───────────────────────────────────────────────────
            Substack keeps the cover out of the writer's way: a text button
            above the title until there is a photo, then the photo itself with
            its controls on hover. The old version led with a dashed 4:1 frame
            and carried a caption row, a link row, and a credit field on the
            page at all times, which is three rows of furniture above the first
            word of the piece. */}
        <section className={coverImage ? "mb-10" : "mb-6"}>
          {coverImage ? (
            <figure
              className="group"
              onDragOver={(e) => {
                e.preventDefault();
                setCoverDrag(true);
              }}
              onDragLeave={() => setCoverDrag(false)}
              onDrop={onCoverDrop}
            >
              <div
                className={`relative overflow-hidden transition-colors ${
                  coverDrag ? "outline outline-2 outline-[var(--accent)]" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImage} alt="" className="aspect-[2/1] w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 group-hover:bg-black/35 transition-all">
                  <CoverBtn
                    label={coverUploading ? "Uploading…" : "Change"}
                    disabled={coverUploading}
                    onClick={() => coverFileRef.current?.click()}
                  />
                  <CoverBtn label="URL" onClick={coverFromUrl} />
                  <CoverBtn label="Remove" onClick={resetCover} />
                </div>
                {coverUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[var(--background)]/60 text-sm font-medium theme-text-secondary">
                    Uploading…
                  </div>
                )}
              </div>
              <input
                type="text"
                value={coverCredit ?? ""}
                onChange={(e) => setCoverCredit(e.target.value || null)}
                placeholder="Add a photo credit"
                className="mt-2 w-full text-xs theme-text-muted bg-transparent focus:outline-none py-0.5 placeholder-[var(--foreground-muted)]"
              />
            </figure>
          ) : (
            /* No cover yet, and nothing will add one later. A quiet text
               button, the way Substack does it, so an empty slot never becomes
               furniture above an unwritten title. Click it, or drop a photo. */
            <button
              type="button"
              onClick={() => coverFileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setCoverDrag(true);
              }}
              onDragLeave={() => setCoverDrag(false)}
              onDrop={onCoverDrop}
              disabled={coverUploading}
              className={`group flex items-center gap-3 text-sm rounded-lg px-2 py-1.5 -ml-2 transition-colors ${
                coverDrag
                  ? "text-[var(--accent)] bg-[var(--accent-soft)]"
                  : "theme-text-muted hover:text-[var(--foreground-soft)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              <span aria-hidden className="text-base leading-none">+</span>
              <span>{coverUploading ? "Uploading…" : "Add a cover image"}</span>
            </button>
          )}
          <input
            ref={coverFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) uploadCover(file);
            }}
          />
        </section>

        {/* ── Title + subtitle, borderless like the Substack composer ─────── */}
        <textarea
          ref={titleRef}
          rows={1}
          value={title}
          onChange={(e) => setTitle(e.target.value.replace(/\n/g, " "))}
          onKeyDown={(e) => {
            // Enter walks down the page instead of doing nothing: title to
            // subtitle to body, which is the opening move in Substack.
            if (e.key === "Enter") {
              e.preventDefault();
              summaryRef.current?.focus();
            }
          }}
          placeholder="Title"
          spellCheck
          className="w-full resize-none overflow-hidden bg-transparent text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] theme-text-primary placeholder-[var(--foreground-muted)] focus:outline-none"
        />
        <textarea
          ref={summaryRef}
          rows={1}
          value={summary}
          onChange={(e) => setSummary(e.target.value.replace(/\n/g, " "))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              focusBody();
            }
          }}
          placeholder="Add a subtitle…"
          spellCheck
          className="mt-4 w-full resize-none overflow-hidden bg-transparent text-xl md:text-2xl leading-snug theme-text-muted placeholder-[var(--foreground-muted)] focus:outline-none"
        />

        {/* ── Body: rich text, or a render through the site's own pipeline ── */}
        {mode === "write" ? (
          <RichText
            initialHtml={initialHtml}
            onChange={setBody}
            onUploadImage={uploadImage}
            onReady={(ed) => {
              bodyRef.current = ed;
            }}
          />
        ) : (
          <article className="mt-8">
            {/* theme-prose is what makes the preview readable in dark mode; the
                bare `prose prose-neutral` it used to carry is hardcoded dark ink. */}
            <div
              className="prose theme-prose max-w-none"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </article>
        )}
      </div>

      <PostSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        section={section}
        onSection={moveSection}
        slug={slug}
        onSlug={editSlug}
        locked={published}
        host={host}
      />
    </>
  );
}

function CoverBtn({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="bg-[var(--surface-strong)] theme-text-primary text-sm font-medium px-3.5 py-1.5 rounded-full shadow-sm transition-colors disabled:opacity-60"
    >
      {label}
    </button>
  );
}
