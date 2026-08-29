"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site, socials } from "@/lib/site";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/review") || pathname?.startsWith("/admin")) return null;

  return (
    <footer className="theme-card-strong border-t">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-start justify-between gap-10">
        <div>
          <Link href="/" className="theme-text-primary type-title">
            {site.name}
          </Link>
          <p className="theme-text-muted mt-1 text-sm max-w-xs">{site.tagline}</p>
        </div>

        {/* Split into three groups in the August 2026 consolidation. It used to
            be one flat row of eleven links where a retired section sat beside a
            live one and both sat beside a Twitter handle. The ARCHIVES group is
            where the two stopped tracks live now: /briefing (the weekly Upstate
            Brief) and /real-estate (the evergreen guides) keep their routes and
            every published piece, they just no longer read as things you should
            expect more of. */}
        <nav className="flex flex-wrap gap-x-10 gap-y-6">
          <div className="flex flex-col gap-2">
            <span className="theme-text-muted type-eyebrow mb-1">Read</span>
            <Link href="/reporting" className="theme-link text-sm">
              Reporting
            </Link>
            <Link href="/subscribe" className="theme-link text-sm">
              Subscribe
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <span className="theme-text-muted type-eyebrow mb-1">Archives</span>
            <Link href="/briefing" className="theme-link text-sm">
              Upstate Brief
            </Link>
            <Link href="/real-estate" className="theme-link text-sm">
              Real Estate Guides
            </Link>
            <Link href="/archive" className="theme-link text-sm">
              Newsletter
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <span className="theme-text-muted type-eyebrow mb-1">Alex</span>
            <Link href="/about" className="theme-link text-sm">
              About
            </Link>
            <Link href="/buying-or-selling" className="theme-link text-sm">
              Buying or Selling?
            </Link>
            {/* Footer only, on purpose. The nav has room for one button and
                that button is the buy/sell page; a reader with a tip or a
                correction looks in the footer, which is where every
                publication puts this. */}
            <Link href="/contact" className="theme-link text-sm">
              Contact
            </Link>
            {socials.map((s) => (
              <a
                key={s.key}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="theme-link text-sm"
              >
                {s.label}
              </a>
            ))}
          </div>
        </nav>
      </div>

      {/* The fine-print row. Legal sits here rather than up in the link
          columns because that is where a reader looks for it, and because the
          10DLC campaign wants the privacy policy reachable from any page on
          the site. Both pages were unlinked from everything until August 28,
          2026, on the reasoning that they are compliance documents rather than
          part of the publication. They still stay out of the nav and the
          sitemap. */}
      <div className="max-w-6xl mx-auto px-6 pb-8 border-t theme-border pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="theme-text-muted text-xs">
          &copy; {new Date().getFullYear()} {site.name}. Written by {site.author}.
        </p>
        <nav className="flex items-center gap-5">
          <Link href="/privacy" className="theme-link text-xs">
            Privacy
          </Link>
          <Link href="/terms" className="theme-link text-xs">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
