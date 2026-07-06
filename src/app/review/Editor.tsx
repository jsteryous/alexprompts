"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

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
}

type Msg = { kind: "ok" | "err"; text: string } | null;

export default function Editor({
  id,
  token,
  initialTitle,
  initialSummary,
  initialBody,
  status,
  backHref = "/admin",
  livePath,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [summary, setSummary] = useState(initialSummary);
  const [body, setBody] = useState(initialBody);
  const [saving, startSave] = useTransition();
  const [publishing, startPublish] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<Msg>(null);
  const [dragOver, setDragOver] = useState(false);

  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const dirty =
    title !== initialTitle || summary !== initialSummary || body !== initialBody;

  // Query suffix that carries the token for the /review flow; the /admin flow
  // relies on the cookie instead, so it stays empty.
  const authQuery = token ? `?token=${encodeURIComponent(token)}` : "";

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

  // ── image upload ──────────────────────────────────────────────────────────
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
        setMessage({ kind: "ok", text: "Image added." });
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

  // ── save / publish ────────────────────────────────────────────────────────
  function save() {
    setMessage(null);
    startSave(async () => {
      try {
        const resp = await fetch("/api/review/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, token, title, summary, body_md: body }),
        });
        const json = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          setMessage({ kind: "err", text: json.error ?? `Save failed (${resp.status})` });
          return;
        }
        setMessage({ kind: "ok", text: "Saved." });
      } catch (exc) {
        setMessage({ kind: "err", text: (exc as Error).message });
      }
    });
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

  return (
    <>
      {/* Sticky action bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={backHref}
            className="text-sm text-gray-500 hover:text-black shrink-0 inline-flex items-center gap-1"
          >
            ← Drafts
          </Link>
          <span className="hidden sm:inline text-xs font-semibold uppercase tracking-widest text-green-600">
            Draft Review
          </span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-medium uppercase shrink-0">
            {status}
          </span>
          {dirty && <span className="text-xs text-amber-600 font-medium shrink-0">Unsaved</span>}
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
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving}
            className="inline-flex items-center gap-2 bg-black text-white font-semibold text-sm px-4 md:px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-6">
        {/* Title + summary */}
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
            Title
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl md:text-3xl font-bold tracking-tight text-black bg-transparent border-b border-gray-200 focus:border-black focus:outline-none pb-2"
          />
        </label>

        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
            Summary
          </span>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            className="w-full text-base text-gray-700 bg-white border border-gray-200 rounded-lg p-3 focus:border-black focus:outline-none resize-y"
          />
        </label>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 border border-gray-200 rounded-lg p-1.5 bg-gray-50">
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
          <span className="ml-auto text-xs text-gray-400 pr-1 hidden md:inline">
            {body.length.toLocaleString()} chars ·{" "}
            {body.split(/\s+/).filter(Boolean).length.toLocaleString()} words
          </span>
        </div>

        {/* Write | Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <span className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
              Write (paste or drag an image right in)
            </span>
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
              rows={30}
              spellCheck
              className={`w-full font-mono text-sm text-gray-800 bg-white border rounded-lg p-4 focus:outline-none resize-y leading-relaxed ${
                dragOver ? "border-green-500 border-2" : "border-gray-200 focus:border-black"
              }`}
            />
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
              Preview (how it looks on the site)
            </span>
            <div className="border border-gray-200 rounded-lg p-6 bg-white overflow-auto" style={{ maxHeight: "calc(30rem + 2rem)" }}>
              <div
                className="prose prose-neutral max-w-none"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
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
      className={`h-8 ${wide ? "px-3" : "w-8"} inline-flex items-center justify-center text-sm text-gray-700 bg-white border border-gray-200 rounded hover:border-black hover:text-black transition-colors disabled:opacity-40 ${
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
