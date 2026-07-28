"use client";

import { useState, useTransition } from "react";

/**
 * Two-step delete for a draft row. The first click arms it and the second one
 * commits, which keeps an irreversible action off a single stray tap without
 * putting a blocking confirm() dialog in the way.
 */
export default function DeleteButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function remove() {
    if (!armed) {
      setArmed(true);
      return;
    }
    setError(null);
    start(async () => {
      try {
        const res = await fetch("/api/admin/delete", {
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
        setArmed(false);
      } catch (exc) {
        setError((exc as Error).message);
        setArmed(false);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        {armed && !pending && (
          <button
            type="button"
            onClick={() => setArmed(false)}
            className="text-sm font-medium text-gray-500 px-2 py-2 hover:text-black transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className={
            armed
              ? "text-sm font-semibold text-white bg-red-600 px-4 py-2 rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50"
              : "text-sm font-medium text-gray-500 border border-gray-200 px-4 py-2 rounded-lg hover:border-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
          }
        >
          {pending ? "Deleting…" : armed ? "Confirm delete" : "Delete"}
        </button>
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
