"use client";

import { useEffect } from "react";
import { SECTIONS, type SectionKey } from "@/lib/editorSections";

/**
 * Post settings, the way Substack's composer keeps them: out of the writing
 * surface entirely, behind one button, holding only the two things the prose
 * cannot say for itself. Which section the piece belongs to, and what its URL
 * will be.
 *
 * Both are DRAFT-ONLY. A published post owns a live URL, and its section is
 * the first half of that URL, so the fields lock once it is out.
 * /api/review/save enforces the same rule server-side.
 */
export default function PostSettings({
  open,
  onClose,
  section,
  onSection,
  slug,
  onSlug,
  locked,
  host,
}: {
  open: boolean;
  onClose: () => void;
  section: SectionKey;
  onSection: (s: SectionKey) => void;
  slug: string;
  onSlug: (s: string) => void;
  locked: boolean;
  host: string;
}) {
  // Escape closes, the way every drawer on the web does.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const base = SECTIONS[section].base;

  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-black/30"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed right-0 top-0 bottom-0 z-40 w-full max-w-sm theme-header border-l theme-border overflow-y-auto"
        role="dialog"
        aria-label="Post settings"
      >
        <div className="flex items-center justify-between px-5 h-14 border-b theme-border">
          <span className="theme-label text-xs font-semibold uppercase tracking-widest">
            Post settings
          </span>
          <button
            type="button"
            onClick={onClose}
            className="theme-link text-sm px-2 py-1"
          >
            Done
          </button>
        </div>

        <div className="px-5 py-6 space-y-8">
          <div>
            <h3 className="text-sm font-semibold theme-text-primary mb-1">Section</h3>
            <p className="text-xs theme-text-muted mb-3">
              Where the piece files, and the first half of its address.
            </p>
            <div className="space-y-1.5">
              {(Object.keys(SECTIONS) as SectionKey[]).map((key) => {
                const s = SECTIONS[key];
                const active = key === section;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={locked}
                    onClick={() => onSection(key)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      active
                        ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                        : "theme-border hover:border-[var(--border-strong)]"
                    }`}
                  >
                    <span className="block text-sm font-medium theme-text-primary">
                      {s.label}
                    </span>
                    <span className="block text-xs theme-text-muted">{s.base}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold theme-text-primary mb-1">URL</h3>
            <p className="text-xs theme-text-muted mb-3">
              {locked
                ? "This post is published, so its address is fixed. Unpublish it to move it."
                : "Follows the title until you change it here. Lowercase letters, numbers, and hyphens."}
            </p>
            <div
              className={`flex items-center border theme-border rounded-lg px-3 py-2 gap-1 ${
                locked ? "opacity-60" : "focus-within:border-[var(--border-strong)]"
              }`}
            >
              <span className="text-xs theme-text-muted whitespace-nowrap">
                {host}
                {base}/
              </span>
              <input
                type="text"
                value={slug}
                disabled={locked}
                onChange={(e) => onSlug(e.target.value)}
                spellCheck={false}
                className="flex-1 min-w-0 bg-transparent text-sm theme-text-primary focus:outline-none"
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
