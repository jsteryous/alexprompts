"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import OutreachCell from "./OutreachCell";
import { updateNotes } from "./actions";
import { generateFbMessage, fbSearchUrl } from "@/lib/messageDraft";

// ── Types (mirror page.tsx) ─────────────────────────────────────────────────

interface AuditIssues {
  viewport_missing?: boolean;
  no_https?: boolean;
  mixed_content?: boolean;
  stale_copyright?: number | null;
  forms_found?: number;
  forms_unreachable?: boolean;
  forms_unreachable_status?: number | null;
  forms_unreachable_action?: string | null;
  forms_unreachable_page?: string | null;
  forms_unverifiable?: number;
  lighthouse_mobile?: number | null;
  jquery_version?: string | null;
}

interface RankedEmail {
  email: string;
  score: number;
  role_hint: string;
}

export interface Prospect {
  id: string;
  place_id: string | null;
  business_name: string;
  vertical: string;
  city: string | null;
  county: string | null;
  phone: string | null;
  website_url: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  audit_status: string;
  issues: AuditIssues | null;
  severity_score: number | null;
  severity_tag: string | null;
  mobile_screenshot_url: string | null;
  desktop_screenshot_url: string | null;
  lighthouse_mobile_score: number | null;
  facebook_url: string | null;
  audit_error: string | null;
  contact_status: string | null;
  last_contacted_at: string | null;
  contact_emails: RankedEmail[] | null;
  primary_email: string | null;
  fallback_email: string | null;
  decision_maker_name: string | null;
  decision_maker_title: string | null;
  notes: string | null;
}

// ── Cells ───────────────────────────────────────────────────────────────────

function SeverityBadge({ score, tag }: { score: number | null; tag: string | null }) {
  if (score === null) return <span className="theme-text-muted text-xs">—</span>;
  const color =
    tag === "HOT"  ? "tone-hot-text" :
    tag === "WARM" ? "tone-warm-text" :
                     "theme-text-secondary";
  return (
    <div className="flex items-center gap-2">
      <span className={`text-base font-bold tabular-nums ${color}`}>{score}</span>
      {tag && (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full theme-card-muted theme-text-secondary border theme-border">
          {tag}
        </span>
      )}
    </div>
  );
}

function IssueChips({ issues, status }: { issues: AuditIssues | null; status: string }) {
  if (status === "no_website") {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full border tone-hot">
        NO WEBSITE
      </span>
    );
  }
  if (!issues) return <span className="theme-text-muted text-xs">—</span>;

  const chips: { label: string; tone: "bad" | "warn" }[] = [];
  if (issues.viewport_missing)  chips.push({ label: "No viewport", tone: "bad" });
  if (issues.no_https)          chips.push({ label: "No HTTPS", tone: "bad" });
  if (issues.mixed_content)     chips.push({ label: "Mixed content", tone: "warn" });
  if (issues.forms_unreachable) {
    let label = "Broken form";
    const pageUrl = issues.forms_unreachable_page;
    if (pageUrl) {
      try {
        const path = new URL(pageUrl).pathname.replace(/\/$/, "");
        if (path && path !== "") label = `Broken form ${path}`;
      } catch { /* fall through */ }
    }
    const s = issues.forms_unreachable_status;
    if (s) label += ` · ${s}`;
    chips.push({ label, tone: "bad" });
  }
  if (issues.stale_copyright)   chips.push({ label: `©${issues.stale_copyright}`, tone: "warn" });
  if (issues.lighthouse_mobile !== null && issues.lighthouse_mobile !== undefined && issues.lighthouse_mobile < 40) {
    chips.push({ label: `Mobile ${issues.lighthouse_mobile}`, tone: "bad" });
  }
  if (chips.length === 0) return <span className="text-xs theme-text-muted">Clean</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {chips.map((c) => (
        <span
          key={c.label}
          className={`text-xs font-medium px-1.5 py-0.5 rounded border ${
            c.tone === "bad" ? "tone-hot" : "tone-warm"
          }`}
        >
          {c.label}
        </span>
      ))}
    </div>
  );
}

function ContactCell({ prospect }: { prospect: Prospect }) {
  const dmName = prospect.decision_maker_name;
  const dmTitle = prospect.decision_maker_title;
  const primary = prospect.primary_email;
  const fallback = prospect.fallback_email;
  const ranked = prospect.contact_emails ?? [];
  const primaryEntry = primary ? ranked.find((r) => r.email === primary) : null;
  const headlineEmail = primary ?? fallback ?? null;
  const alternates = ranked
    .filter((r) => r.email !== primary && r.email !== fallback)
    .slice(0, 3);

  if (!dmName && !headlineEmail && alternates.length === 0) {
    return <span className="text-xs theme-text-muted">—</span>;
  }

  return (
    <div className="space-y-1">
      {dmName && (
        <div>
          <p className="text-xs font-semibold theme-text-primary leading-tight">{dmName}</p>
          {dmTitle && <p className="text-xs theme-text-muted leading-tight">{dmTitle}</p>}
        </div>
      )}
      {primary && (
        <div className="flex items-baseline gap-1.5">
          <a
            href={`mailto:${primary}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs tone-cool-text hover:underline break-all"
            title={primaryEntry ? `${primaryEntry.role_hint} · score ${primaryEntry.score}` : primary}
          >
            {primary}
          </a>
          {primaryEntry && (
            <span className="text-xs font-semibold uppercase tracking-wider tone-good-text shrink-0">
              {primaryEntry.score}
            </span>
          )}
        </div>
      )}
      {!primary && fallback && (
        <div className="flex items-baseline gap-1.5">
          <a
            href={`mailto:${fallback}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs theme-text-muted hover:underline break-all italic"
            title="Shared inbox — not a person-identified address"
          >
            {fallback}
          </a>
          <span className="text-xs uppercase tracking-wider theme-text-muted shrink-0">shared</span>
        </div>
      )}
      {alternates.length > 0 && (
        <details className="text-xs" onClick={(e) => e.stopPropagation()}>
          <summary className="theme-text-muted hover:theme-text-secondary cursor-pointer select-none">
            +{alternates.length} more
          </summary>
          <ul className="mt-1 space-y-0.5">
            {alternates.map((r) => (
              <li key={r.email} className="break-all">
                <a
                  href={`mailto:${r.email}`}
                  className="tone-cool-text hover:underline"
                  title={`${r.role_hint} · score ${r.score}`}
                >
                  {r.email}
                </a>
                <span className="theme-text-muted ml-1">· {r.score}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

// ── Outreach draft (FB DM) ──────────────────────────────────────────────────

function OutreachDraft({ prospect }: { prospect: Prospect }) {
  // Recompute when prospect identity changes (drawer remounts via key on row),
  // but keep useMemo to avoid regenerating on unrelated re-renders.
  const initial = useMemo(() => generateFbMessage(prospect), [prospect]);
  const [text, setText] = useState(initial);
  const [copied, setCopied] = useState(false);
  const dirty = text !== initial;

  const fbHref = prospect.facebook_url ?? fbSearchUrl(prospect);
  const fbLabel = prospect.facebook_url ? "Open on Facebook" : "Search Facebook";

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Older browsers / clipboard blocked — silent fail; user can select manually.
    }
  };

  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-widest theme-label">
        Outreach
      </h3>
      <div className="theme-card-muted border theme-border rounded p-3 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={fbHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs theme-cta rounded px-3 py-1.5 inline-block"
          >
            {fbLabel} ↗
          </a>
          {!prospect.facebook_url && (
            <span className="text-xs theme-text-muted">
              FB page not auto-resolved — opens a pre-filled search
            </span>
          )}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={Math.max(8, text.split("\n").length + 1)}
          spellCheck
          className="w-full text-sm theme-card theme-text-primary border theme-border rounded p-3 resize-y focus:outline-none focus:ring-1 focus:ring-current"
        />
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onCopy}
            className="text-xs theme-cta rounded px-3 py-1.5"
          >
            {copied ? "Copied" : "Copy draft"}
          </button>
          {dirty && (
            <button
              type="button"
              onClick={() => setText(initial)}
              className="text-xs theme-text-muted hover:theme-text-primary border theme-border rounded px-3 py-1.5"
            >
              Reset
            </button>
          )}
          <span className="text-xs theme-text-muted">
            {text.length} chars{dirty ? " · edited" : ""}
          </span>
        </div>
      </div>
    </section>
  );
}

// ── Drawer ──────────────────────────────────────────────────────────────────

function hostname(url: string | null): string {
  if (!url) return "";
  try { return new URL(url).hostname; } catch { return url; }
}

function ProspectDrawer({
  prospect,
  onClose,
}: {
  prospect: Prospect;
  onClose: () => void;
}) {
  const [notes, setNotesState] = useState(prospect.notes ?? "");
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", prospect.id);
      fd.set("notes", notes);
      await updateNotes(fd);
      setSavedAt(Date.now());
    });
  };

  const dirty = (notes ?? "") !== (prospect.notes ?? "");
  const issues = prospect.issues;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed right-0 top-0 z-50 h-full w-full max-w-xl overflow-y-auto theme-card border-l theme-border shadow-xl"
        role="dialog"
        aria-label={`${prospect.business_name} detail`}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold theme-text-primary leading-tight">
                {prospect.business_name}
              </h2>
              <p className="text-xs theme-text-muted mt-1 capitalize">
                {prospect.vertical.replace("_", " ")}
                {prospect.city && <> · {prospect.city}</>}
                {prospect.county && <> · {prospect.county}</>}
              </p>
              {prospect.website_url && (
                <a
                  href={prospect.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs tone-cool-text hover:underline inline-block mt-1 break-all"
                >
                  {hostname(prospect.website_url)} ↗
                </a>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-xs theme-text-muted hover:theme-text-primary border theme-border rounded px-2 py-1"
              aria-label="Close"
            >
              Close (Esc)
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <SeverityBadge score={prospect.severity_score} tag={prospect.severity_tag} />
            <IssueChips issues={issues} status={prospect.audit_status} />
          </div>

          {/* Outreach — pre-generated FB DM draft + link to the practice's FB page */}
          <OutreachDraft prospect={prospect} />

          {/* Notes */}
          <section className="space-y-2">
            <div className="flex items-baseline justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-widest theme-label">Notes</h3>
              {savedAt && !dirty && (
                <span className="text-xs theme-text-muted">Saved</span>
              )}
              {dirty && (
                <span className="text-xs tone-warm-text">Unsaved</span>
              )}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotesState(e.target.value)}
              onBlur={() => { if (dirty) save(); }}
              rows={6}
              placeholder="Outreach context, call summaries, things to mention next time…"
              className="w-full text-sm theme-card-muted theme-text-primary border theme-border rounded p-3 resize-y focus:outline-none focus:ring-1 focus:ring-current"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={save}
                disabled={pending || !dirty}
                className="text-xs theme-cta rounded px-3 py-1.5 disabled:opacity-40"
              >
                {pending ? "Saving…" : "Save"}
              </button>
              <span className="text-xs theme-text-muted self-center">
                Auto-saves on blur
              </span>
            </div>
          </section>

          {/* Contact */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest theme-label">Contact</h3>
            <div className="theme-card-muted border theme-border rounded p-3">
              <ContactCell prospect={prospect} />
              {prospect.phone && (
                <p className="text-xs theme-text-muted mt-2">{prospect.phone}</p>
              )}
            </div>
          </section>

          {/* Screenshots */}
          {(prospect.mobile_screenshot_url || prospect.desktop_screenshot_url) && (
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-widest theme-label">Proof</h3>
              <div className="grid grid-cols-2 gap-3">
                {prospect.mobile_screenshot_url && (
                  <a
                    href={prospect.mobile_screenshot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border theme-border rounded overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={prospect.mobile_screenshot_url}
                      alt={`${prospect.business_name} mobile screenshot`}
                      loading="lazy"
                      className="w-full h-auto block"
                    />
                    <p className="text-xs theme-text-muted px-2 py-1 theme-card-muted border-t theme-border">Mobile ↗</p>
                  </a>
                )}
                {prospect.desktop_screenshot_url && (
                  <a
                    href={prospect.desktop_screenshot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border theme-border rounded overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={prospect.desktop_screenshot_url}
                      alt={`${prospect.business_name} desktop screenshot`}
                      loading="lazy"
                      className="w-full h-auto block"
                    />
                    <p className="text-xs theme-text-muted px-2 py-1 theme-card-muted border-t theme-border">Desktop ↗</p>
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Audit issue detail */}
          {issues && (
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-widest theme-label">Audit detail</h3>
              <dl className="text-xs space-y-1.5 theme-card-muted border theme-border rounded p-3">
                {issues.forms_unreachable && (
                  <div>
                    <dt className="theme-text-muted">Broken form</dt>
                    <dd className="theme-text-primary break-all">
                      {issues.forms_unreachable_page && (
                        <>Page: {issues.forms_unreachable_page}<br /></>
                      )}
                      {issues.forms_unreachable_action && (
                        <>Action: {issues.forms_unreachable_action}<br /></>
                      )}
                      {issues.forms_unreachable_status && (
                        <>Status: {issues.forms_unreachable_status}</>
                      )}
                    </dd>
                  </div>
                )}
                {issues.lighthouse_mobile !== null && issues.lighthouse_mobile !== undefined && (
                  <div className="flex justify-between">
                    <dt className="theme-text-muted">Lighthouse mobile</dt>
                    <dd className="theme-text-primary tabular-nums">{issues.lighthouse_mobile}</dd>
                  </div>
                )}
                {issues.stale_copyright != null && (
                  <div className="flex justify-between">
                    <dt className="theme-text-muted">Copyright year</dt>
                    <dd className="theme-text-primary tabular-nums">{issues.stale_copyright}</dd>
                  </div>
                )}
                {issues.forms_found != null && (
                  <div className="flex justify-between">
                    <dt className="theme-text-muted">Forms found</dt>
                    <dd className="theme-text-primary tabular-nums">{issues.forms_found}</dd>
                  </div>
                )}
                {issues.forms_unverifiable != null && issues.forms_unverifiable > 0 && (
                  <div className="flex justify-between">
                    <dt className="theme-text-muted">Forms unverifiable</dt>
                    <dd className="theme-text-primary tabular-nums">{issues.forms_unverifiable}</dd>
                  </div>
                )}
                {issues.jquery_version && (
                  <div className="flex justify-between">
                    <dt className="theme-text-muted">jQuery</dt>
                    <dd className="theme-text-primary">{issues.jquery_version}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="theme-text-muted">Viewport</dt>
                  <dd className="theme-text-primary">{issues.viewport_missing ? "missing" : "ok"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="theme-text-muted">HTTPS</dt>
                  <dd className="theme-text-primary">{issues.no_https ? "no" : "yes"}</dd>
                </div>
              </dl>
            </section>
          )}

          {prospect.audit_error && (
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-widest theme-label">Audit error</h3>
              <p className="text-xs tone-hot-text theme-card-muted border theme-border rounded p-3 break-all">
                {prospect.audit_error}
              </p>
            </section>
          )}
        </div>
      </aside>
    </>
  );
}

// ── Table ───────────────────────────────────────────────────────────────────

export default function ProspectTable({ prospects }: { prospects: Prospect[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = prospects.find((p) => p.id === openId) ?? null;

  return (
    <>
      <div className="overflow-x-auto rounded-xl border theme-border theme-card">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 theme-card-muted">
            <tr className="border-b theme-border">
              <th className="text-left px-4 py-2.5 text-xs font-medium theme-text-muted">Severity</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium theme-text-muted">Business</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium theme-text-muted">Contact</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium theme-text-muted">Outreach</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium theme-text-muted">City</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium theme-text-muted">Vertical</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium theme-text-muted">Issues</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium theme-text-muted">Notes</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium theme-text-muted">Rating</th>
            </tr>
          </thead>
          <tbody>
            {prospects.map((p) => (
              <tr
                key={p.id}
                onClick={() => setOpenId(p.id)}
                className={`border-b theme-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                  p.audit_status === "error" ? "opacity-50" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <SeverityBadge score={p.severity_score} tag={p.severity_tag} />
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold theme-text-primary text-sm leading-snug">
                    {p.business_name}
                  </p>
                  {p.website_url ? (
                    <a
                      href={p.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs tone-cool-text hover:underline transition-colors truncate max-w-[220px] block mt-0.5"
                    >
                      {hostname(p.website_url)} ↗
                    </a>
                  ) : (
                    <span className="text-xs tone-hot-text mt-0.5 block">No website</span>
                  )}
                  {p.phone && <p className="text-xs theme-text-muted mt-0.5">{p.phone}</p>}
                </td>
                <td className="px-4 py-3 max-w-[260px]">
                  <ContactCell prospect={p} />
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <OutreachCell
                    id={p.id}
                    status={p.contact_status ?? "not_contacted"}
                    lastContactedAt={p.last_contacted_at}
                  />
                </td>
                <td className="px-4 py-3 theme-text-secondary text-xs">
                  {p.city || "—"}
                  {p.county && <p className="theme-text-muted text-xs">{p.county}</p>}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs theme-text-secondary capitalize">
                    {p.vertical.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 max-w-[260px]">
                  <IssueChips issues={p.issues} status={p.audit_status} />
                  {p.audit_error && (
                    <p className="text-xs tone-hot-text mt-1 truncate" title={p.audit_error}>
                      {p.audit_error}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 max-w-[200px]">
                  {p.notes ? (
                    <p className="text-xs theme-text-secondary line-clamp-2" title={p.notes}>
                      {p.notes}
                    </p>
                  ) : (
                    <span className="text-xs theme-text-muted">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs theme-text-secondary tabular-nums whitespace-nowrap">
                  {p.google_rating ? (
                    <>
                      <span>{p.google_rating.toFixed(1)}★</span>
                      <p className="text-xs theme-text-muted">{p.google_review_count ?? 0} reviews</p>
                    </>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <ProspectDrawer
          key={open.id}
          prospect={open}
          onClose={() => setOpenId(null)}
        />
      )}
    </>
  );
}
