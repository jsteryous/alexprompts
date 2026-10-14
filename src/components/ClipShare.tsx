"use client";

import { useState, useSyncExternalStore } from "react";

const noop = () => () => {};
/** True in a browser with a share sheet. False on the server, so hydration agrees. */
function useCanShare(): boolean {
  return useSyncExternalStore(noop, () => typeof navigator.share === "function", () => false);
}

/**
 * The share controls for one clipping: the phone's share sheet where there is
 * one, copy the link, download the picture, or post it to LinkedIn. Used on the
 * /clip page and inside the sheet that opens when a reader clips on the paper.
 */
export default function ClipShare({
  url,
  imageUrl,
  title,
  fileName,
}: {
  url: string;
  imageUrl: string;
  title: string;
  fileName: string;
}) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const canShare = useCanShare();

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  async function download() {
    setSaving(true);
    try {
      const blob = await (await fetch(imageUrl)).blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } finally {
      setSaving(false);
    }
  }

  const button =
    "type-eyebrow border border-[var(--foreground)] px-4 py-2.5 theme-text-primary hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors";

  return (
    <div className="flex flex-wrap justify-center gap-2.5">
      {canShare && (
        <button type="button" className={button} onClick={() => navigator.share({ title, url }).catch(() => {})}>
          Share
        </button>
      )}
      <button type="button" className={button} onClick={copy}>
        {copied ? "Link copied" : "Copy link"}
      </button>
      <button type="button" className={button} onClick={download} disabled={saving}>
        {saving ? "Saving" : "Download image"}
      </button>
      <a
        className={button}
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Post on LinkedIn
      </a>
    </div>
  );
}
