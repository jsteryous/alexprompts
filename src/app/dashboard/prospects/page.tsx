import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import DashboardShell from "../_components/DashboardShell";
import StatTile from "../_components/StatTile";
import ProspectTable, { type Prospect } from "./ProspectTable";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Always render fresh — avoid Next.js caching stale Supabase responses after
// a re-audit.
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  searchParams: Promise<{ vertical?: string; status?: string }>;
}

async function getProspects(vertical?: string, status?: string): Promise<Prospect[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return [];

  const client = createClient(url, key);

  let q = client
    .from("website_prospects")
    .select(
      "id, business_name, vertical, city, county, phone, website_url, " +
      "google_rating, google_review_count, audit_status, issues, " +
      "severity_score, severity_tag, mobile_screenshot_url, desktop_screenshot_url, " +
      "lighthouse_mobile_score, place_id, facebook_url, " +
      "audit_error, contact_status, last_contacted_at, " +
      "contact_emails, primary_email, fallback_email, decision_maker_name, decision_maker_title, notes, " +
      "packet_html_url, packet_envelope_text, packet_generated_at, packet_emailed_at"
    )
    .order("severity_score", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(300);

  if (vertical) q = q.eq("vertical", vertical);
  if (status)   q = q.eq("audit_status", status);

  const { data, error } = await q;
  if (error) {
    console.error("[prospects] getProspects failed:", error.message, error.details);
    throw new Error(`website_prospects query failed: ${error.message}`);
  }
  return (data as unknown as Prospect[]) ?? [];
}

export default async function ProspectsPage({ searchParams }: Props) {
  const { vertical, status } = await searchParams;
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
    <DashboardShell
      active="prospects"
      title="Website Prospects"
      subtitle="Upstate businesses with broken or missing websites we can fix."
      stats={
        <>
          <StatTile label="HOT"        value={hot}       tone="hot" />
          <StatTile label="No website" value={noWebsite} tone="warm" />
          <StatTile label="Pending"    value={pending}   tone="muted" />
        </>
      }
      filters={
        <div className="flex items-center gap-2">
          <span className="text-xs theme-text-muted mr-1">Vertical:</span>
          {verticalLink(undefined, "All")}
          {verticalLink("dental", "Dental")}
          {verticalLink("personal_injury", "Personal Injury")}
        </div>
      }
    >
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
        <ProspectTable prospects={prospects} />
      )}

      <p className="text-xs theme-text-muted mt-4 text-right opacity-70">
        {prospects.length} prospects · sorted by severity desc · click row for detail
      </p>
    </DashboardShell>
  );
}
