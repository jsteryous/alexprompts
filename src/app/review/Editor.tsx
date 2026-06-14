"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

interface Props {
  id: string;
  token: string;
  initialTitle: string;
  initialSummary: string;
  initialBody: string;
  status: string;
  slug: string;
}

export default function Editor({
  id,
  token,
  initialTitle,
  initialSummary,
  initialBody,
  status,
  slug,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [summary, setSummary] = useState(initialSummary);
  const [body, setBody] = useState(initialBody);
  const [saving, startSave] = useTransition();
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const dirty =
    title !== initialTitle || summary !== initialSummary || body !== initialBody;

  const publishUrl = `/api/publish?id=${id}&token=${token}`;

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
        // Reload so the server-rendered preview reflects saved state.
        setTimeout(() => window.location.reload(), 600);
      } catch (exc) {
        setMessage({ kind: "err", text: (exc as Error).message });
      }
    });
  }

  return (
    <>
      {/* Sticky action bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-green-600">
            Alex Prompts · Draft Review
          </span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-medium uppercase">
            {status}
          </span>
          {dirty && (
            <span className="text-xs text-amber-600 font-medium">Unsaved changes</span>
          )}
          {message && (
            <span
              className={`text-xs font-medium ${
                message.kind === "ok" ? "text-green-700" : "text-red-600"
              }`}
            >
              {message.text}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-gray-500 hover:text-black">
            ← Site
          </Link>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving}
            className="inline-flex items-center gap-2 bg-black text-white font-semibold text-sm px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          {status !== "PUBLISHED" && (
            <a
              href={publishUrl}
              className={`inline-flex items-center gap-2 bg-green-500 text-black font-semibold text-sm px-5 py-2 rounded-lg hover:bg-green-400 transition-colors ${
                dirty ? "opacity-50 pointer-events-none" : ""
              }`}
              title={dirty ? "Save first, then publish" : "Publish"}
            >
              Publish Now →
            </a>
          )}
          {status === "PUBLISHED" && (
            <a
              href={`/archive/${slug}`}
              className="inline-flex items-center gap-2 bg-black text-white font-semibold text-sm px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              View Live →
            </a>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">
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
            rows={3}
            className="w-full text-base text-gray-700 bg-white border border-gray-200 rounded-lg p-3 focus:border-black focus:outline-none resize-y"
          />
        </label>

        <label className="block">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Body (Markdown)
            </span>
            <span className="text-xs text-gray-400">
              {body.length.toLocaleString()} chars · {body.split(/\s+/).filter(Boolean).length.toLocaleString()} words
            </span>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={32}
            spellCheck
            className="w-full font-mono text-sm text-gray-800 bg-white border border-gray-200 rounded-lg p-4 focus:border-black focus:outline-none resize-y leading-relaxed"
          />
        </label>
      </div>
    </>
  );
}
