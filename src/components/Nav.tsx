"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { site } from "@/lib/site";

// Nav clarity rule (July 2026): every label states its promise in the visitor's
// words. The newsletter archive lives in the footer only, so the nav stays short.
//
// COLLAPSED AUGUST 2026 for the consolidation. The nav used to carry three
// content tracks as peers (Upstate Brief, Moving to Greenville, SC Technology),
// which was honest when there were three engines and is now a menu of two
// retired sections. They keep their routes and their published work, and they
// moved to the footer under "Archives".
//
// "Reporting" is a PLACEHOLDER label for the one live section, chosen because it
// is plain and institutional and says what the thing is. The publication is
// deliberately unnamed until a few issues exist (see scripts/publication/SPEC.md),
// and this label is the first thing that should change when the name lands.
//
// The ROUTE stays /greenville-works. Renaming it would break inbound links, the
// sitemap, every published article URL, and the `greenville works` tag the engine
// writes, for no reader benefit. Section labels have been changed independently
// of routes here before ("Greenville Works" -> "SC Technology", July 2026).
// The nine free tools were DELETED in August 2026, not hidden. They were built
// for the consumer buyer, which is the audience this publication stopped
// serving, and a calculator suite under a masthead reads as a lead-gen site
// rather than something you read. Their routes now 404 on purpose.
const links = [
  { href: "/greenville-works", label: "Reporting" },
  { href: "/about", label: "About" },
];

/**
 * The nav's ONE button.
 *
 * Label history: "Find an Agent" until July 30, 2026 (it named the mechanism and
 * assumed the visitor had already decided they wanted an agent), then "Buying or
 * Selling", then the question mark on August 1, 2026. The question is the point.
 * It turns a category into something the reader owes an answer to, and it is the
 * same question every article close now asks ("Are you looking to buy, or are you
 * thinking about selling?"), so the nav and the writing say one thing.
 *
 * Considered and rejected: "Get help" / "Get Assistance" (support-desk register,
 * and both imply the reader is in trouble) and "Get in touch". That last one is
 * the CTA button copy inside articles and works THERE only because "Thinking of
 * making a move?" sits directly above it and supplies the subject. A nav has no
 * such context, so it flattens into a generic contact link and draws recruiters
 * and vendors instead of buyers and sellers. Keep the subject in the label.
 *
 * Why it is the button and Subscribe is not (swapped August 1, 2026): referral
 * revenue is the north star and /find-a-pro is the site's #1 conversion surface,
 * but it used to render as the fifth of six identical text links while the
 * audience-growth CTA got the only visual emphasis. The hierarchy contradicted
 * the strategy. Subscribe keeps a nav text link and still has dedicated capture
 * on /subscribe, every article, the briefing index, and every tool page.
 *
 * The ROUTE stays /find-a-pro. Renaming it would break inbound links, the
 * sitemap, and the ref= attribution already stored in referral_leads.
 */
const primaryCta = { href: "/find-a-pro", label: "Buying or Selling?" };

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  if (pathname?.startsWith("/review") || pathname?.startsWith("/admin")) return null;

  return (
    <header className="theme-header fixed top-0 left-0 right-0 z-50 border-b">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* The nameplate. Serif and set larger than the section links, the way
            a masthead outranks its rail. The blinking `▌` caret that used to
            trail the name was deleted in the August 2026 newspaper pass along
            with the rest of the AI-prompt motif; a publication's mark is its
            name set in type. Do not add a glyph back. */}
        <Link
          href="/"
          className="theme-text-primary type-title inline-flex items-center whitespace-nowrap"
        >
          {site.name}
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="theme-link type-eyebrow hover:theme-text-primary"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/subscribe" className="theme-link type-eyebrow">
            Subscribe
          </Link>
          <Link
            href={primaryCta.href}
            className="theme-cta-accent type-eyebrow px-3.5 py-2.5"
          >
            {primaryCta.label}
          </Link>
        </nav>

        <button
          className="theme-text-secondary md:hidden p-2 -mr-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="theme-card-strong md:hidden border-t px-6 py-4 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="theme-link text-sm py-2"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/subscribe"
            className="theme-link text-sm py-2"
            onClick={() => setOpen(false)}
          >
            Subscribe
          </Link>
          <Link
            href={primaryCta.href}
            className="theme-cta-accent text-sm font-medium px-4 py-2.5 text-center mt-2"
            onClick={() => setOpen(false)}
          >
            {primaryCta.label}
          </Link>
        </div>
      )}
    </header>
  );
}
