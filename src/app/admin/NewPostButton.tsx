"use client";

import { useState, useTransition } from "react";

/**
 * "Write Article" — mints an empty draft and opens the composer on it, the way
 * Substack's New post button works. One click, no form: the section, the URL,
 * and the cover are all decided inside the editor, where the writing is.
 */
export default function NewPostButton({
  label = "Write Article",
  variant = "primary",
}: {
  label?: string;
  variant?: "primary" | "quiet";
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function create() {
    setError(null);
    start(async () => {
      try {
        const res = await fetch("/api/admin/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok || !j.id) {
          setError(j.error ?? `Failed (${res.status})`);
          return;
        }
        window.location.href = `/admin/edit/${j.id}`;
      } catch (exc) {
        setError((exc as Error).message);
      }
    });
  }

  const className =
    variant === "primary"
      ? "inline-flex items-center gap-1.5 text-sm font-semibold text-black bg-green-500 px-4 py-2 rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50"
      : "inline-flex items-center gap-1.5 text-sm font-medium theme-text-secondary border theme-border px-4 py-2 rounded-lg hover:border-[var(--border-strong)] transition-colors disabled:opacity-50";

  return (
    <div className="flex flex-col items-end gap-1">
      <button type="button" onClick={create} disabled={pending} className={className}>
        <span aria-hidden>✎</span>
        {pending ? "Opening…" : label}
      </button>
      {error && <span className="text-xs tone-hot-text">{error}</span>}
    </div>
  );
}
