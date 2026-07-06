"use client";

import { useState, useTransition } from "react";

export default function PublishButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function publish() {
    setError(null);
    start(async () => {
      try {
        const res = await fetch("/api/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (res.ok) {
          window.location.reload();
          return;
        }
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? `Failed (${res.status})`);
      } catch (exc) {
        setError((exc as Error).message);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={publish}
        disabled={pending}
        className="text-sm font-semibold text-black bg-green-500 px-4 py-2 rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50"
      >
        {pending ? "Publishing…" : "Publish"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
