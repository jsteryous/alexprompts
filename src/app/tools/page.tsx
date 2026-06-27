import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { toolCatalog, audienceLabel } from "@/lib/tools";
import { ToolIcon } from "@/components/ToolIcon";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Free tools for real estate agents and investors: a rental deal analyzer, a mortgage and affordability calculator, and a Claude listing prompt builder. No sign-up.",
  alternates: { canonical: `${site.url}/tools` },
};

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

export default function ToolsPage() {
  return (
    <>
      <section className="theme-page pt-32 pb-16 border-b theme-border">
        <div className="max-w-3xl mx-auto px-6">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-4">
            <span className="opacity-50">{"> "}</span>Free tools
          </span>
          <h1 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            Tools you can use right now
          </h1>
          <p className="theme-text-muted text-lg max-w-xl leading-relaxed">
            No sign-up, nothing to install. Run a deal, size up a payment, or build a listing prompt
            for Claude. Free, and yours to use as often as you like.
          </p>
        </div>
      </section>

      <section className="theme-section py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6">
          <ul className="grid gap-5 md:grid-cols-2">
            {toolCatalog.map((t) => {
              const live = t.status === "live";
              const card = (
                <div
                  className={`theme-card-strong border theme-border rounded-2xl p-7 h-full flex flex-col ${
                    live ? "group-hover:opacity-90 transition-opacity" : "opacity-70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <span
                      className="inline-flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
                      style={{ background: "var(--accent-soft)" }}
                    >
                      <ToolIcon slug={t.slug} className="theme-label w-7 h-7" />
                    </span>
                    <div className="flex flex-wrap items-center gap-2 justify-end">
                      <span className="theme-badge text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded">
                        {audienceLabel[t.audience]}
                      </span>
                      {!live && (
                        <span className="theme-warn-badge text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded">
                          Coming soon
                        </span>
                      )}
                    </div>
                  </div>
                  <h2 className="theme-text-primary text-xl font-bold tracking-tight mb-2">{t.title}</h2>
                  <p className="theme-text-muted text-sm leading-relaxed flex-1">{t.blurb}</p>
                  <span
                    className={`inline-flex items-center gap-1.5 text-sm font-semibold mt-5 ${
                      live ? "theme-text-primary" : "theme-text-muted"
                    }`}
                  >
                    {t.cta}
                    {live && <ArrowIcon className="w-3.5 h-3.5" />}
                  </span>
                </div>
              );
              return (
                <li key={t.slug}>
                  {live ? (
                    <Link href={`/tools/${t.slug}`} className="group block h-full">
                      {card}
                    </Link>
                  ) : (
                    card
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
