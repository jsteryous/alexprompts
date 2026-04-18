import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { signOut } from "./login/actions";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// ── Types ────────────────────────────────────────────────────────────────────

interface EnrichedLead {
  id: string;
  created_at: string;
  principal_name: string | null;
  principal_role: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  linkedin_url: string | null;
  search_evidence: string | null;
  enrichment_status: string;
  trade_tag: string | null;
  event_type: string | null;
  location: string | null;
  valuation: number | null;
  score: number | null;
  tag: string | null;
  transfer_type: string | null;
  notes: string | null;
  market_signals: { entity_name: string | null; location: string | null } | null;
}

interface Props {
  searchParams: Promise<{ client?: string }>;
}

// ── Confidence tier derivation ────────────────────────────────────────────────
// Maps the standardized principal_role strings from enrich.py to display tiers.
// Role constants defined in enrich.py:
//   ROLE_MORTGAGE_SIG  = "Mortgage Signature"
//   ROLE_TAX_CARE_OF   = "Tax Record – Care Of"
//   ROLE_GIS_OWNER     = "Tax Record – GIS"
//   ROLE_GIS_MAIL_FLIP = "Tax Record – Mailing"
//   ROLE_SOS_INITIALS  = "SC SOS – Initials Match"
//   SC SOS dynamic:      "SC SOS – {filing role}"
//   ROLE_PRESS_UBJ     = "Business Press – UBJ"
//   ROLE_PRESS_GBIZ    = "Business Press – GSABiz"
//   ROLE_WEB_SEARCH    = "Web Search"

type ConfidenceTier = "verified" | "matched" | "inferred" | "pending";

interface TierDisplay {
  label: string;
  tier: ConfidenceTier;
}

function getConfidenceTier(
  principalRole: string | null,
  enrichmentStatus: string
): TierDisplay {
  if (enrichmentStatus === "pending" || !principalRole) {
    return { tier: "pending", label: "Needs Research" };
  }

  if (principalRole.startsWith("Mortgage Signature")) {
    return { tier: "verified", label: "Verified · Signature" };
  }
  if (principalRole.startsWith("Tax Record")) {
    return { tier: "verified", label: "Verified · Tax Record" };
  }
  if (principalRole === "SC SOS – Initials Match") {
    return { tier: "matched", label: "Matched · SOS + Initials" };
  }
  if (principalRole.startsWith("SC SOS")) {
    return { tier: "matched", label: "Matched · SC SOS" };
  }
  if (principalRole.startsWith("Business Press")) {
    return { tier: "matched", label: "Matched · Business Press" };
  }
  if (principalRole === "Web Search") {
    return { tier: "inferred", label: "Inferred · Web Search" };
  }

  return { tier: "inferred", label: "Inferred" };
}

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getLeads(clientSlug?: string): Promise<EnrichedLead[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return [];

  const client = createClient(url, key);

  let query = client
    .from("enriched_leads")
    .select(
      "id, created_at, principal_name, principal_role, contact_email, contact_phone, linkedin_url, " +
      "search_evidence, enrichment_status, trade_tag, event_type, location, valuation, score, tag, transfer_type, notes, " +
      "market_signals(entity_name, location)"
    )
    .in("enrichment_status", ["enriched", "pending"])
    .order("score", { ascending: false, nullsFirst: false });

  if (clientSlug) {
    // Filter by client via join — fetch client id first
    const { data: clientRow } = await client
      .from("clients")
      .select("id")
      .eq("slug", clientSlug)
      .single();
    if (clientRow?.id) {
      query = query.eq("client_id", clientRow.id);
    }
  }

  const { data } = await query.limit(200);
  const leads = (data as unknown as EnrichedLead[]) ?? [];

  // Deduplicate enriched leads by principal_name — same person can appear from
  // multiple signals (deed + mortgage, two transfers). For the call list, keep
  // the highest-scoring row per person. Pending leads (no name) are kept as-is.
  const seen = new Map<string, EnrichedLead>();
  const pending: EnrichedLead[] = [];

  for (const lead of leads) {
    if (!lead.principal_name) {
      pending.push(lead);
      continue;
    }
    const key = lead.principal_name.toLowerCase().trim();
    const existing = seen.get(key);
    if (!existing || (lead.score ?? 0) > (existing.score ?? 0)) {
      seen.set(key, lead);
    }
  }

  return [
    ...Array.from(seen.values()),
    ...pending,
  ].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

// ── Formatting helpers ────────────────────────────────────────────────────────

function isStreetAddress(s: string | null | undefined): boolean {
  return !!s && /^\d{1,5}\s+[A-Za-z]/.test(s.trim());
}

function formatValuation(v: number | null): string {
  if (!v) return "—";
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toLocaleString()}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Badge components (inline styles for server component) ─────────────────────

function TagBadge({ tag }: { tag: string | null }) {
  const map: Record<string, string> = {
    HOT: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50",
    WARM: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50",
    COLD: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50",
  };
  if (!tag) return null;
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[tag] ?? "theme-card-muted theme-text-muted border"}`}>
      {tag}
    </span>
  );
}

function TierBadge({ tier, label }: TierDisplay) {
  const map: Record<ConfidenceTier, string> = {
    verified: "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900/50",
    matched:  "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50",
    inferred: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50",
    pending:  "bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-900/60 dark:text-gray-400 dark:border-gray-800",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[tier]}`}>
      {label}
    </span>
  );
}

function TransferTypeBadge({ transferType }: { transferType: string | null }) {
  if (transferType !== "NOMINAL_TRANSFER") return null;
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/50">
      Trust / Family
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

async function getCurrentUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export default async function DashboardPage({ searchParams }: Props) {
  const { client: clientSlug } = await searchParams;

  // Middleware already enforces auth — this is a secondary check for display
  const user = await getCurrentUser();

  const leads = await getLeads(clientSlug);
  const enrichedCount = leads.filter((l) => l.enrichment_status === "enriched").length;
  const pendingCount  = leads.filter((l) => l.enrichment_status === "pending").length;
  const hotCount      = leads.filter((l) => l.tag === "HOT").length;

  return (
    <div className="min-h-screen theme-text-primary">
      {/* Header */}
      <div className="border-b theme-border">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-semibold uppercase tracking-widest theme-label">
                REBB Advisors
              </span>
              <div className="flex items-center gap-1">
                <Link
                  href="/dashboard"
                  className="text-sm px-3 py-1.5 rounded-md theme-card-strong border theme-border theme-text-primary transition-colors"
                >
                  Leads
                </Link>
                <Link
                  href="/dashboard/prospects"
                  className="text-sm px-3 py-1.5 rounded-md theme-text-muted hover:theme-text-primary transition-colors"
                >
                  Prospects
                </Link>
              </div>
            </div>
            <h1 className="text-2xl font-bold theme-text-primary">Ranked Call List</h1>
            <p className="text-sm theme-text-muted mt-1">
              Who do I call this week to make money?
            </p>
          </div>
          <div className="flex items-start gap-8">
            <div className="flex gap-6 text-right">
              <div>
                <p className="text-2xl font-bold theme-text-primary">{enrichedCount}</p>
                <p className="text-xs theme-text-muted">Enriched</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{hotCount}</p>
                <p className="text-xs theme-text-muted">HOT</p>
              </div>
              <div>
                <p className="text-2xl font-bold theme-text-secondary">{pendingCount}</p>
                <p className="text-xs theme-text-muted">Pending</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs theme-text-muted mb-1">{user?.email}</p>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-xs theme-text-muted hover:theme-text-primary transition-colors"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {leads.length === 0 ? (
          <div className="text-center py-24 theme-text-muted">
            <p className="text-sm">No leads yet. Run the enrichment pipeline to populate the list.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border theme-border theme-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b theme-border theme-card-muted">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest theme-text-muted w-8">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest theme-text-muted">Score</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest theme-text-muted">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest theme-text-muted">Grantee / Borrower</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest theme-text-muted">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest theme-text-muted">Event</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest theme-text-muted">Value</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest theme-text-muted">Evidence</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest theme-text-muted">Added</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => {
                  const { tier, label } = getConfidenceTier(lead.principal_role, lead.enrichment_status);
                  const isPending = lead.enrichment_status === "pending";

                  return (
                    <tr
                      key={lead.id}
                      className={`border-b theme-border transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
                        isPending ? "opacity-60" : ""
                      }`}
                    >
                      {/* Rank */}
                      <td className="px-4 py-4 theme-text-muted text-xs">{i + 1}</td>

                      {/* Score + tag */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-base font-bold tabular-nums ${
                            (lead.score ?? 0) >= 85 ? "text-green-700 dark:text-green-400" :
                            (lead.score ?? 0) >= 70 ? "text-amber-600 dark:text-amber-400" :
                            "theme-text-secondary"
                          }`}>
                            {lead.score ?? "—"}
                          </span>
                          <TagBadge tag={lead.tag} />
                        </div>
                        <TransferTypeBadge transferType={lead.transfer_type} />
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-4">
                        {isPending ? (
                          <span className="theme-text-muted italic text-xs">Needs research</span>
                        ) : (
                          <div>
                            <p className="font-semibold theme-text-primary text-sm leading-snug">
                              {lead.principal_name ?? "Unknown"}
                            </p>
                            {lead.principal_role && (
                              <p className="text-xs theme-text-muted leading-snug mt-0.5">
                                {lead.principal_role.split(" – ").slice(1).join(" – ") || lead.principal_role}
                              </p>
                            )}
                            {lead.contact_email && (
                              <p className="text-xs text-green-700 dark:text-green-400 mt-1">{lead.contact_email}</p>
                            )}
                            {lead.contact_phone && (
                              <p className="text-xs theme-text-secondary">{lead.contact_phone}</p>
                            )}
                            {lead.linkedin_url && (
                              <a
                                href={lead.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline transition-colors mt-0.5 inline-block"
                              >
                                LinkedIn ↗
                              </a>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Source LLC */}
                      <td className="px-4 py-4 theme-text-secondary text-xs max-w-[160px]">
                        <p className="truncate" title={lead.market_signals?.entity_name ?? ""}>
                          {lead.market_signals?.entity_name ?? "—"}
                        </p>
                        {lead.trade_tag && (
                          <p className="theme-text-muted mt-0.5 uppercase tracking-wide text-[10px]">
                            {lead.trade_tag}
                          </p>
                        )}
                      </td>

                      {/* Location / address */}
                      <td className="px-4 py-4 theme-text-secondary text-xs max-w-[180px]">
                        {(() => {
                          const addr = isStreetAddress(lead.location) ? lead.location : null;
                          const sigLoc = lead.market_signals?.location ?? null;
                          const grantorName = sigLoc && !isStreetAddress(sigLoc) ? sigLoc : null;
                          return (
                            <>
                              {addr ? (
                                <p className="truncate" title={addr}>{addr}</p>
                              ) : (
                                <span className="theme-text-muted italic">No address</span>
                              )}
                              {grantorName && (
                                <p className="theme-text-muted text-[10px] truncate mt-0.5" title={grantorName}>
                                  {grantorName}
                                </p>
                              )}
                            </>
                          );
                        })()}
                      </td>

                      {/* Event type */}
                      <td className="px-4 py-4">
                        <span className="text-xs theme-text-secondary whitespace-nowrap">
                          {lead.event_type ?? "—"}
                        </span>
                      </td>

                      {/* Valuation */}
                      <td className="px-4 py-4 theme-text-secondary text-xs tabular-nums whitespace-nowrap">
                        {lead.transfer_type === "NOMINAL_TRANSFER" ? "—" : formatValuation(lead.valuation)}
                      </td>

                      {/* Evidence / confidence tier */}
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span title={lead.notes ?? undefined}>
                            <TierBadge tier={tier} label={label} />
                          </span>
                          {lead.search_evidence && !isPending && (() => {
                            const rawUrl = lead.search_evidence.match(/^https?:\/\/[^\s]+/)?.[0];
                            let hostname: string | null = null;
                            try { hostname = rawUrl ? new URL(rawUrl).hostname : null; } catch { /* ignore */ }
                            return (
                              <a
                                href={rawUrl ?? undefined}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] theme-text-muted hover:underline truncate max-w-[180px] block transition-colors"
                                title={lead.search_evidence}
                              >
                                {hostname ?? lead.search_evidence.slice(0, 40)}
                              </a>
                            );
                          })()}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 theme-text-muted text-xs whitespace-nowrap">
                        {formatDate(lead.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs theme-text-muted mt-4 text-right opacity-70">
          {leads.length} leads · sorted by score desc
        </p>
      </div>
    </div>
  );
}
