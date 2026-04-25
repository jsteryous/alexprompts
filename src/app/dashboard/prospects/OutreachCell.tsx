"use client";

import { useTransition } from "react";
import { updateContactStatus, bumpContactedAt } from "./actions";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "not_contacted", label: "Not contacted" },
  { value: "contacted",     label: "Contacted" },
  { value: "replied",       label: "Replied" },
  { value: "booked",        label: "Booked" },
  { value: "dead",          label: "Dead" },
];

function statusTone(status: string): string {
  switch (status) {
    case "contacted": return "tone-cool";
    case "replied":   return "tone-good";
    case "booked":    return "tone-good-strong";
    case "dead":      return "tone-neutral line-through";
    default:          return "bg-transparent theme-text-muted border-transparent";
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const days = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface Props {
  id: string;
  status: string;
  lastContactedAt: string | null;
}

export default function OutreachCell({ id, status, lastContactedAt }: Props) {
  const [pending, startTransition] = useTransition();
  const current = status || "not_contacted";

  return (
    <div className="flex flex-col gap-1 min-w-[140px]">
      <select
        disabled={pending}
        value={current}
        onChange={(e) => {
          const next = e.target.value;
          startTransition(async () => {
            const fd = new FormData();
            fd.set("id", id);
            fd.set("status", next);
            await updateContactStatus(fd);
          });
        }}
        className={`text-xs font-medium px-2 py-1 rounded border cursor-pointer ${statusTone(current)} ${
          pending ? "opacity-50" : ""
        }`}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <div className="flex items-center gap-2 text-xs theme-text-muted">
        <span className="tabular-nums" title={lastContactedAt ?? "never contacted"}>
          {formatDate(lastContactedAt)}
        </span>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              const fd = new FormData();
              fd.set("id", id);
              await bumpContactedAt(fd);
            });
          }}
          className="text-xs theme-text-muted hover:theme-text-primary underline decoration-dotted underline-offset-2"
          title="Stamp last-contacted date to now"
        >
          touch
        </button>
      </div>
    </div>
  );
}
