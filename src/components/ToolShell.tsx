import Link from "next/link";
import { audienceLabel, type ToolEntry } from "@/lib/tools";
import { ToolIcon } from "@/components/ToolIcon";
import { SubscribeForm } from "@/components/SubscribeForm";
import { ReferralCta } from "@/components/ReferralCta";

/**
 * Shared chrome for every /tools page: the header (audience chip, title, blurb),
 * the interactive tool itself (children), an honest not-advice note, and the soft
 * subscribe capture every tool ends in. Server component; the interactive part is
 * a client component passed as children. Keep this the only place tool pages
 * differ from the rest of the site, so they stay consistent as the catalog grows.
 */
export function ToolShell({
  tool,
  note,
  children,
}: {
  tool: ToolEntry;
  /** The honest caveat shown under the tool. Keep it short and plain. */
  note: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <section className="theme-page pt-32 pb-12 border-b theme-border">
        <div className="max-w-3xl mx-auto px-6">
          <Link
            href="/tools"
            className="theme-link inline-flex items-center gap-1.5 text-sm font-medium mb-6"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            All tools
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <span
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl shrink-0"
              style={{ background: "var(--accent-soft)" }}
            >
              <ToolIcon slug={tool.slug} className="theme-label w-8 h-8" />
            </span>
            <span className="theme-badge inline-block text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded">
              {audienceLabel[tool.audience]}
            </span>
          </div>
          <h1 className="theme-text-primary type-h1 mb-4">
            {tool.title}
          </h1>
          <p className="theme-text-muted type-body-lg max-w-xl">{tool.blurb}</p>
        </div>
      </section>

      <section className="theme-section py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-6">
          {children}

          <p className="theme-text-muted text-xs leading-relaxed mt-8 max-w-xl">{note}</p>
        </div>
      </section>

      {/* The closing conversion surface. Relocation/buyer-intent tools (leadCta)
          send that intent to the /find-a-pro referral form, the site's #1 revenue
          path; everything else keeps the soft subscribe capture (utility is the
          hook, email is the catch), owned-list so the reader is caught on-site. */}
      {tool.leadCta ? (
        <section className="theme-section-contrast py-16 md:py-20 border-t theme-border">
          <div className="max-w-2xl mx-auto px-6">
            {/* ?ref=tool:<slug> lands in referral_leads.ref_slug, so leads can be
                grouped by which tool drove them. */}
            <ReferralCta slug={`tool:${tool.slug}`} />
          </div>
        </section>
      ) : (
        <section className="theme-section-contrast py-16 md:py-20 border-t theme-border">
          <div className="max-w-2xl mx-auto px-6">
            <SubscribeForm
              source={`tool:${tool.slug}`}
              heading="Get the Upstate Brief every Monday"
              blurb="The week in Upstate real estate in a five-minute read, plus the Greenville guides and the technology pieces when they ship. None of it hits Substack, and it is free."
              cta="Subscribe free"
            />
          </div>
        </section>
      )}
    </>
  );
}
