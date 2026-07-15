"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import type { EditorCover } from "@/lib/editorCover";

interface Props {
  id: string;
  /** Legacy query-token auth (the /review flow). Omit it under /admin, where
   *  the httpOnly admin cookie authorizes the Save/Publish/Upload calls. */
  token?: string;
  initialTitle: string;
  initialSummary: string;
  initialBody: string;
  status: string;
  slug: string;
  /** Where the back arrow points. Defaults to the /admin drafts list. */
  backHref?: string;
  /** Public URL of the post (e.g. /real-estate/<slug>), for the View link. */
  livePath?: string;
  /** The custom cover stored on the row, when Alex has set one himself. */
  initialCoverImage?: string | null;
  initialCoverCredit?: string | null;
  /** The curated library photo the post falls back to when no custom cover is
   *  set (resolved server-side; the photo /api/publish will stamp). */
  libraryCover?: EditorCover | null;
}

type Msg = { kind: "ok" | "err"; text: string } | null;
type Mode = "write" | "preview";

/** Grow a textarea to fit its content, so the page scrolls instead of the box. */
function autosize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

export default function Editor({
  id,
  token,
  initialTitle,
  initialSummary,
  initialBody,
  status,
  backHref = "/admin",
  livePath,
  initialCoverImage = null,
  initialCoverCredit = null,
  libraryCover = null,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [summary, setSummary] = useState(initialSummary);
  const [body, setBody] = useState(initialBody);
  const [coverImage, setCoverImage] = useState<string | null>(initialCoverImage);
  const [coverCredit, setCoverCredit] = useState<string | null>(initialCoverCredit);
  const [mode, setMode] = useState<Mode>("write");
  const [saving, startSave] = useTransition();
  const [publishing, startPublish] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [message, setMessage] = useState<Msg>(null);
  const [dragOver, setDragOver] = useState(false);
  const [coverDrag, setCoverDrag] = useState(false);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const summaryRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);

  // What was last written to the database. Dirty means the state has drifted
  // from it; autosave and the header indicator both key off this.
  const [savedState, setSavedState] = useState({
    title: initialTitle,
    summary: initialSummary,
    body: initialBody,
    coverImage: initialCoverImage,
    coverCredit: initialCoverCredit,
  });
  const dirty =
    title !== savedState.title ||
    summary !== savedState.summary ||
    body !== savedState.body ||
    coverImage !== savedState.coverImage ||
    coverCredit !== savedState.coverCredit;

  // Query suffix that carries the token for the /review flow; the /admin flow
  // relies on the cookie instead, so it stays empty.
  const authQuery = token ? `?token=${encodeURIComponent(token)}` : "";

  // The cover the article will actually publish with right now: the custom one
  // when set, otherwise the curated library pick.
  const displayCover = coverImage
    ? { url: coverImage, credit: coverCredit, custom: true as const }
    : libraryCover
      ? { url: libraryCover.url, credit: libraryCover.credit, custom: false as const }
      : null;

  // Substack-style borderless fields grow with their content.
  useEffect(() => autosize(titleRef.current), [title]);
  useEffect(() => autosize(summaryRef.current), [summary]);
  useEffect(() => {
    if (mode === "write") autosize(bodyRef.current);
  }, [body, mode]);

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
    const snapshot = { title, summary, body, coverImage, coverCredit };
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
          }),
        });
        const json = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          setMessage({ kind: "err", text: json.error ?? `Save failed (${resp.status})` });
          return;
        }
        setSavedState(snapshot);
      } catch (exc) {
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
    if (status === "PUBLISHED" || !dirty || saving || uploading || coverUploading) return;
    const t = setTimeout(() => saveRef.current(), 2500);
    return () => clearTimeout(t);
  }, [title, summary, body, coverImage, coverCredit, dirty, saving, uploading, coverUploading, status]);

  // Cmd/Ctrl+S saves instead of opening the browser save dialog.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
      const fd = new FormData();
      fd.append("file", file);
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

  // ── text helpers ──────────────────────────────────────────────────────────
  function insertAtCursor(text: string) {
    const ta = bodyRef.current;
    const start = ta ? ta.selectionStart : body.length;
    const end = ta ? ta.selectionEnd : body.length;
    const next = body.slice(0, start) + text + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      if (!ta) return;
      ta.focus();
      const pos = start + text.length;
      ta.setSelectionRange(pos, pos);
    });
  }

  function wrap(before: string, after = before, placeholder = "text") {
    const ta = bodyRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = body.slice(start, end) || placeholder;
    const next = body.slice(0, start) + before + sel + after + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + sel.length);
    });
  }

  function linePrefix(prefix: string) {
    const ta = bodyRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const lineStart = body.lastIndexOf("\n", start - 1) + 1;
    const block = body.slice(lineStart, end) || "text";
    const prefixed = block
      .split("\n")
      .map((l) => prefix + l)
      .join("\n");
    const next = body.slice(0, lineStart) + prefixed + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(lineStart, lineStart + prefixed.length);
    });
  }

  function insertLink() {
    const ta = bodyRef.current;
    if (!ta) return;
    const sel = body.slice(ta.selectionStart, ta.selectionEnd) || "link text";
    const url = window.prompt("Link URL", "https://");
    if (!url) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const md = `[${sel}](${url})`;
    setBody(body.slice(0, start) + md + body.slice(end));
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + md.length;
      ta.setSelectionRange(pos, pos);
    });
  }

  // ── body image upload ─────────────────────────────────────────────────────
  async function uploadFiles(files: File[]) {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (!images.length) return;
    setMessage(null);
    setUploading(true);
    for (const file of images) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const resp = await fetch(`/api/admin/upload${authQuery}`, { method: "POST", body: fd });
        const json = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          setMessage({ kind: "err", text: json.error ?? `Upload failed (${resp.status})` });
          continue;
        }
        insertAtCursor(`\n\n![](${json.url})\n\n`);
      } catch (exc) {
        setMessage({ kind: "err", text: (exc as Error).message });
      }
    }
    setUploading(false);
  }

  function onPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files: File[] = [];
    for (const it of items) {
      if (it.kind === "file" && it.type.startsWith("image/")) {
        const f = it.getAsFile();
        if (f) files.push(f);
      }
    }
    if (files.length) {
      e.preventDefault();
      uploadFiles(files);
    }
  }

  function onDrop(e: React.DragEvent<HTMLTextAreaElement>) {
    setDragOver(false);
    const files = Array.from(e.dataTransfer?.files ?? []).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (files.length) {
      e.preventDefault();
      uploadFiles(files);
    }
  }

  const words = body.split(/\s+/).filter(Boolean).length;
  const saveState = saving
    ? "Saving…"
    : dirty
      ? status === "PUBLISHED"
        ? "Unsaved changes"
        : "Unsaved"
      : "Saved";

  return (
    <>
      {/* Sticky header: back, state, actions. Kept slim, Substack-style. */}
      <div className="sticky top-0 z-20 h-14 bg-white/95 backdrop-blur border-b border-gray-200 px-4 md:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={backHref}
            className="text-sm text-gray-500 hover:text-black shrink-0 inline-flex items-center gap-1"
          >
            ← Drafts
          </Link>
          <span
            className={`text-xs px-2 py-0.5 rounded font-medium uppercase shrink-0 ${
              status === "PUBLISHED"
                ? "bg-green-50 text-green-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {status}
          </span>
          <span
            className={`text-xs shrink-0 ${dirty && !saving ? "text-amber-600 font-medium" : "text-gray-400"}`}
          >
            {saveState}
          </span>
          {message && (
            <span
              className={`text-xs font-medium truncate ${
                message.kind === "ok" ? "text-green-700" : "text-red-600"
              }`}
            >
              {message.text}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden md:inline text-xs text-gray-400 pr-2">
            {words.toLocaleString()} words
          </span>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving}
            className="text-sm font-medium text-gray-600 hover:text-black px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          {status !== "PUBLISHED" ? (
            <button
              type="button"
              onClick={publish}
              disabled={dirty || publishing}
              className="inline-flex items-center gap-2 bg-green-500 text-black font-semibold text-sm px-4 md:px-5 py-2 rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={dirty ? "Save first, then publish" : "Publish"}
            >
              {publishing ? "Publishing…" : "Publish →"}
            </button>
          ) : (
            <a
              href={livePath ?? backHref}
              className="inline-flex items-center gap-2 bg-black text-white font-semibold text-sm px-4 md:px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              View →
            </a>
          )}
        </div>
      </div>

      {/* One centered, article-width column, like the Substack composer. */}
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-10 pb-32">
        {/* ── Cover photo ─────────────────────────────────────────────────── */}
        <section className="mb-8">
          {displayCover ? (
            <figure>
              <div
                className={`relative group rounded-xl overflow-hidden border transition-colors ${
                  coverDrag ? "border-indigo-500 border-2" : "border-gray-200"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setCoverDrag(true);
                }}
                onDragLeave={() => setCoverDrag(false)}
                onDrop={onCoverDrop}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayCover.url}
                  alt=""
                  className="aspect-[2/1] w-full object-cover"
                />
                {/* Hover actions, mirroring Substack's image menu. */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 group-hover:opacity-100 group-hover:bg-black/35 transition-all">
                  <CoverBtn
                    label={coverUploading ? "Uploading…" : "Change photo"}
                    disabled={coverUploading}
                    onClick={() => coverFileRef.current?.click()}
                  />
                  <CoverBtn label="Image URL" onClick={coverFromUrl} />
                  {displayCover.custom && <CoverBtn label="Remove" onClick={resetCover} />}
                </div>
                {coverUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 text-sm font-medium text-gray-700">
                    Uploading…
                  </div>
                )}
              </div>
              <figcaption className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-xs text-gray-400">
                  {displayCover.custom
                    ? "Your cover. Publishes exactly as shown."
                    : `${libraryCover?.label ?? "Auto cover"}. Drop or upload a photo to use your own.`}
                </span>
                <span className="flex gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => coverFileRef.current?.click()}
                    className="text-gray-500 hover:text-black underline underline-offset-2"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={coverFromUrl}
                    className="text-gray-500 hover:text-black underline underline-offset-2"
                  >
                    URL
                  </button>
                  {displayCover.custom && (
                    <button
                      type="button"
                      onClick={resetCover}
                      className="text-gray-500 hover:text-red-600 underline underline-offset-2"
                    >
                      Remove
                    </button>
                  )}
                </span>
              </figcaption>
              {displayCover.custom ? (
                <input
                  type="text"
                  value={coverCredit ?? ""}
                  onChange={(e) => setCoverCredit(e.target.value || null)}
                  placeholder="Photo credit (optional, shows under the hero)"
                  className="mt-1 w-full text-xs text-gray-500 bg-transparent border-b border-transparent focus:border-gray-300 focus:outline-none py-1 placeholder-gray-300"
                />
              ) : (
                displayCover.credit && (
                  <p className="mt-1 text-xs text-gray-400">{displayCover.credit}</p>
                )
              )}
            </figure>
          ) : (
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
              className={`w-full aspect-[4/1] rounded-xl border-2 border-dashed flex items-center justify-center text-sm transition-colors ${
                coverDrag
                  ? "border-indigo-500 text-indigo-600 bg-indigo-50"
                  : "border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600"
              }`}
            >
              {coverUploading ? "Uploading…" : "＋ Add a cover photo (click or drop an image)"}
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
          placeholder="Title"
          spellCheck
          className="w-full resize-none overflow-hidden bg-transparent text-3xl md:text-4xl font-bold tracking-tight text-black placeholder-gray-300 focus:outline-none"
        />
        <textarea
          ref={summaryRef}
          rows={1}
          value={summary}
          onChange={(e) => setSummary(e.target.value.replace(/\n/g, " "))}
          placeholder="Add a subtitle…"
          spellCheck
          className="mt-3 w-full resize-none overflow-hidden bg-transparent text-lg md:text-xl text-gray-500 placeholder-gray-300 focus:outline-none"
        />

        {/* ── Write | Preview + formatting toolbar ─────────────────────────── */}
        <div className="sticky top-14 z-10 mt-6 -mx-4 md:-mx-6 px-4 md:px-6 py-1.5 bg-white/95 backdrop-blur border-b border-gray-100 flex flex-wrap items-center gap-1">
          <div className="inline-flex rounded-full bg-gray-100 p-0.5 mr-2">
            {(["write", "preview"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition-colors ${
                  mode === m ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          {mode === "write" && (
            <>
              <ToolBtn label="B" title="Bold" bold onClick={() => wrap("**")} />
              <ToolBtn label="i" title="Italic" italic onClick={() => wrap("*")} />
              <Divider />
              <ToolBtn label="H2" title="Heading" onClick={() => linePrefix("## ")} />
              <ToolBtn label="H3" title="Subheading" onClick={() => linePrefix("### ")} />
              <Divider />
              <ToolBtn label="🔗" title="Link" onClick={insertLink} />
              <ToolBtn label="❝" title="Quote" onClick={() => linePrefix("> ")} />
              <ToolBtn label="•" title="Bullet list" onClick={() => linePrefix("- ")} />
              <ToolBtn label="1." title="Numbered list" onClick={() => linePrefix("1. ")} />
              <Divider />
              <ToolBtn
                label={uploading ? "Uploading…" : "🖼 Image"}
                title="Insert image"
                wide
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              />
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  uploadFiles(files);
                }}
              />
            </>
          )}
        </div>

        {/* ── Body: write or full-article preview ─────────────────────────── */}
        {mode === "write" ? (
          <textarea
            ref={bodyRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onPaste={onPaste}
            onDrop={onDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            placeholder="Write in markdown. Paste or drop an image right in."
            spellCheck
            className={`mt-6 w-full min-h-[55vh] resize-none overflow-hidden bg-transparent text-[17px] leading-relaxed text-gray-800 placeholder-gray-300 focus:outline-none rounded-lg ${
              dragOver ? "ring-2 ring-indigo-400" : ""
            }`}
          />
        ) : (
          <article className="mt-8">
            <div
              className="prose prose-neutral max-w-none"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </article>
        )}
      </div>
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
      className="bg-white/95 text-sm font-medium text-gray-800 px-3.5 py-1.5 rounded-full shadow-sm hover:bg-white transition-colors disabled:opacity-60"
    >
      {label}
    </button>
  );
}

function ToolBtn({
  label,
  title,
  onClick,
  bold,
  italic,
  wide,
  disabled,
}: {
  label: string;
  title: string;
  onClick: () => void;
  bold?: boolean;
  italic?: boolean;
  wide?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`h-8 ${wide ? "px-2.5" : "w-8"} inline-flex items-center justify-center text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-black transition-colors disabled:opacity-40 ${
        bold ? "font-bold" : ""
      } ${italic ? "italic font-serif" : ""}`}
    >
      {label}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-5 bg-gray-200 mx-1" aria-hidden />;
}
