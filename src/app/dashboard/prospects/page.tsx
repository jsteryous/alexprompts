import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { signOut } from "../login/actions";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Always render fresh — avoid Next.js caching stale Supabase responses after
// a re-audit.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ── Types ────────────────────────────────────────────────────────────────────

interface AuditIssues {
  viewport_missing?: boolean;
  no_https?: boolean;
  mixed_content?: boolean;
  stale_copyright?: number | null;
  forms_found?: number;
  forms_unreachable?: boolean;
  forms_unverifiable?: number;
  lighthouse_mobile?: number | null;
  jquery_version?: string | null;
}

interface RankedEmail {
  email: string;
  score: number;
  role_hint: string;
}

interface Prospect {
  id: string;
  created_at: string;
  audited_at: string | null;
  place_id: string;
  business_name: string;
  vertical: string;
  address: string | null;
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
  audit_error: string | null;
  contact_status: string | null;
  notes: string | null;
  contact_emails: RankedEmail[] | null;
  primary_email: string | null;
  decision_maker_name: string | null;
  decision_maker_title: string | null;
}

interface Props {
  searchParams: Promise<{ vertical?: string; status?: string }>;
}

// ── Data ─────────────────────────────────────────────────────────────────────

async function getProspects(vertical?: string, status?: string): Promise<Prospect[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return [];

  const client = createClient(url, key);

  let q = client
    .from("website_prospects")
    .select(
      "id, created_at, audited_at, place_id, business_name, vertical, address, city, county, " +
      "phone, website_url, google_rating, google_review_count, audit_status, issues, " +
      "severity_score, severity_tag, mobile_screenshot_url, desktop_screenshot_url, " +
      "lighthouse_mobile_score, audit_error, contact_status, notes, " +
      "contact_emails, primary_email, decision_maker_name, decision_maker_title"
    )
    .order("severity_score", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(300);

  if (vertical) q = q.eq("vertical", vertical);
  if (status)   q = q.eq("audit_status", status);

  const { data } = await q;
  return (data as unknown as Prospect[]) ?? [];
}

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

// ── Presentation ─────────────────────────────────────────────────────────────

function SeverityBadge({ score, tag }: { score: number | null; tag: string | null }) {
  if (score === null) return <span className="theme-text-muted text-xs">—</span>;
  const color =
    tag === "HOT"  ? "text-red-600 dark:text-red-400" :
    tag === "WARM" ? "text-amber-600 dark:text-amber-400" :
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
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900/60">
        NO WEBSITE
      </span>
    );
  }
  if (!issues) return <span className="theme-text-muted text-xs">—</span>;

  const chips: { label: string; tone: "bad" | "warn" }[] = [];
  if (issues.viewport_missing)  chips.push({ label: "No viewport", tone: "bad" });
  if (issues.no_https)          chips.push({ label: "No HTTPS", tone: "bad" });
  if (issues.mixed_content)     chips.push({ label: "Mixed content", tone: "warn" });
  if (issues.forms_unreachable) chips.push({ label: "Broken form", tone: "bad" });
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
          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
            c.tone === "bad"
              ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/40"
              : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40"
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
  const alternates = (prospect.contact_emails ?? [])
    .filter((r) => r.email !== primary)
    .slice(0, 3);

  if (!dmName && !primary && alternates.length === 0) {
    return <span className="text-xs theme-text-muted">—</span>;
  }

  return (
    <div className="space-y-1">
      {dmName && (
        <div>
          <p className="text-xs font-semibold theme-text-primary leading-tight">{dmName}</p>
          {dmTitle && (
            <p className="text-[10px] theme-text-muted leading-tight">{dmTitle}</p>
          )}
        </div>
      )}
      {primary && (
        <a
          href={`mailto:${primary}`}
          className="block text-xs text-blue-600 dark:text-blue-400 hover:underline break-all"
          title={`Send email to ${primary}`}
        >
          {primary}
        </a>
      )}
      {alternates.length > 0 && (
        <details className="text-[10px]">
          <summary className="theme-text-muted hover:theme-text-secondary cursor-pointer select-none">
            +{alternates.length} more
          </summary>
          <ul className="mt-1 space-y-0.5">
            {alternates.map((r) => (
              <li key={r.email} className="break-all">
                <a
                  href={`mailto:${r.email}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                  title={`${r.role_hint} · score ${r.score}`}
                >
                  {r.email}
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function DashNav({ active }: { active: "leads" | "prospects" }) {
  const tab = (href: string, label: string, key: "leads" | "prospects") => (
    <Link
      href={href}
      className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
        active === key
          ? "theme-card-strong theme-text-primary border theme-border"
          : "theme-text-muted hover:theme-text-primary"
      }`}
    >
      {label}
    </Link>
  );
  return (
    <div className="flex items-center gap-1">
      {tab("/dashboard", "Leads", "leads")}
      {tab("/dashboard/prospects", "Prospects", "prospects")}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ProspectsPage({ searchParams }: Props) {
  const { vertical, status } = await searchParams;
  const user = await getCurrentUser();
  const prospects = await getProspects(vertical, status);

  const hot        = prospects.filter((p) => p.severity_tag === "HOT").length;
  const noWebsite  = prospects.filter((p) => p.audit_status === "no_website").length;
  const pending    = prospects.filter((p) => p.audit_status === "pending").length;

  const verticalLink = (slug: string | undefined, label: string) => (
    <Link
      href={slug ? `/dashboard/prospects?vertical=${slug}` : "/dashboard/prospects"}
      className={`text-xs px-2 py-1 rounded ${
        vertical === slug
          ? "theme-badge"
          : "theme-text-muted hover:theme-text-primary"
      }`}
    >
      {label}
    </Link>
  );

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
              <DashNav active="prospects" />
            </div>
            <h1 className="text-2xl font-bold theme-text-primary">Website Prospects</h1>
            <p className="text-sm theme-text-muted mt-1">
              Upstate businesses with broken or missing websites we can fix.
            </p>
          </div>
          <div className="flex items-start gap-8">
            <div className="flex gap-6 text-right">
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{noWebsite}</p>
                <p className="text-xs theme-text-muted">No website</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{hot}</p>
                <p className="text-xs theme-text-muted">HOT</p>
              </div>
              <div>
                <p className="text-2xl font-bold theme-text-secondary">{pending}</p>
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

        <div className="max-w-7xl mx-auto px-6 pb-4 flex items-center gap-2">
          <span className="text-xs theme-text-muted mr-1">Vertical:</span>
          {verticalLink(undefined, "All")}
          {verticalLink("dental", "Dental")}
          {verticalLink("personal_injury", "Personal Injury")}
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {prospects.length === 0 ? (
          <div className="text-center py-24 theme-text-muted">
            <p className="text-sm">
              No prospects yet. Run{" "}
              <code className="theme-text-secondary">
                python -m prospects.run_prospects --discover --vertical dental --county greenville
              </code>{" "}
              to populate.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border theme-border theme-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b theme-border theme-card-muted">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest theme-text-muted w-8">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest theme-text-muted">Severity</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest theme-text-muted">Business</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest theme-text-muted">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest theme-text-muted">City</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest theme-text-muted">Vertical</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest theme-text-muted">Issues</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest theme-text-muted">Proof</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest theme-text-muted">Rating</th>
                </tr>
              </thead>
              <tbody>
                {prospects.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`border-b theme-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                      p.audit_status === "error" ? "opacity-50" : ""
                    }`}
                  >
                    <td className="px-4 py-4 theme-text-muted text-xs">{i + 1}</td>
                    <td className="px-4 py-4">
                      <SeverityBadge score={p.severity_score} tag={p.severity_tag} />
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold theme-text-primary text-sm leading-snug">
                        {p.business_name}
                      </p>
                      {p.website_url ? (
                        <a
                          href={p.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline transition-colors truncate max-w-[220px] block mt-0.5"
                        >
                          {(() => { try { return new URL(p.website_url).hostname; } catch { return p.website_url; } })()} ↗
                        </a>
                      ) : (
                        <span className="text-xs text-red-600 dark:text-red-400 mt-0.5 block">No website</span>
                      )}
                      {p.phone && <p className="text-xs theme-text-muted mt-0.5">{p.phone}</p>}
                    </td>
                    <td className="px-4 py-4 max-w-[260px]">
                      <ContactCell prospect={p} />
                    </td>
                    <td className="px-4 py-4 theme-text-secondary text-xs">
                      {p.city || "—"}
                      {p.county && <p className="theme-text-muted text-[10px]">{p.county}</p>}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs theme-text-secondary capitalize">
                        {p.vertical.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-4 max-w-[260px]">
                      <IssueChips issues={p.issues} status={p.audit_status} />
                      {p.audit_error && (
                        <p className="text-[10px] text-red-600 dark:text-red-400 mt-1 truncate" title={p.audit_error}>
                          {p.audit_error}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        {p.mobile_screenshot_url && (
                          <a
                            href={p.mobile_screenshot_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] theme-text-muted hover:theme-text-primary border theme-border rounded px-1.5 py-0.5"
                          >
                            📱 mobile
                          </a>
                        )}
                        {p.desktop_screenshot_url && (
                          <a
                            href={p.desktop_screenshot_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] theme-text-muted hover:theme-text-primary border theme-border rounded px-1.5 py-0.5"
                          >
                            🖥 desktop
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs theme-text-secondary tabular-nums whitespace-nowrap">
                      {p.google_rating ? (
                        <>
                          <span>{p.google_rating.toFixed(1)}★</span>
                          <p className="text-[10px] theme-text-muted">{p.google_review_count ?? 0} reviews</p>
                        </>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs theme-text-muted mt-4 text-right opacity-70">
          {prospects.length} prospects · sorted by severity desc
        </p>
      </div>
    </div>
  );
}
