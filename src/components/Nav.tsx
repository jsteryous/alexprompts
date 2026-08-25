"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { site } from "@/lib/site";
import Mark from "@/components/Mark";

// Nav clarity rule (July 2026): every label states its promise in the visitor's
// words. The newsletter archive lives in the footer only, so the nav stays short.
//
// COLLAPSED AUGUST 2026 for the consolidation. The nav used to carry three
// content tracks as peers (Upstate Brief, Moving to Greenville, SC Technology),
// which was honest when there were three engines and is now a menu of two
// retired sections. They keep their routes and their published work, and they
// moved to the footer under "Archives".
//
// "Reporting" labels the one live section. It started as a placeholder to be
// replaced when the publication got a name, and the name landed August 24, 2026
// (Rebrew, at rebrew.org), but the label was KEPT rather than swapped. The
// placeholder reasoning does not survive the rename: the name belongs in the
// wordmark, which now carries it, and a nav tab reading "Rebrew" next to a
// wordmark reading "Rebrew" says nothing. "Reporting" still does the job a nav
// label has to do, which is tell a stranger what is behind the link.
// Open to Alex's taste, not a placeholder any more.
//
// August 14, 2026: Reporting POINTS AT /reporting, which lists every published
// piece regardless of tag. It used to point at /greenville-works, so the site's
// main tab showed one engine's output and quietly hid the real-estate work. The
// per-section indexes still exist and are linked from the footer under Archives.
//
// ARTICLE routes are untouched by that change and must stay that way. A piece
// still lives at /greenville-works/<slug>, /real-estate/<slug>, /briefing/<slug>,
// or /archive/<slug>. Renaming those would break inbound links, the sitemap,
// every published URL, and the tags the engines write, for no reader benefit.
// The nine free tools were DELETED in August 2026, not hidden. They were built
// for the consumer buyer, which is the audience this publication stopped
// serving, and a calculator suite under a masthead reads as a lead-gen site
// rather than something you read. Their routes now 404 on purpose.
const links = [
  { href: "/reporting", label: "Reporting" },
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
        {/* The nameplate: the coffee-cup-and-house mark, then the name, set
            larger than the section links the way a masthead outranks its rail.
            The mark is sized in `em` so it tracks the fluid wordmark rather
            than fighting it, and it draws in currentColor so it flips with the
            theme for nothing.

            The blinking `▌` caret that used to trail the name was deleted in
            the August 2026 newspaper pass along with the rest of the AI-prompt
            motif, and THAT ban stands unchanged: no caret, no chevron, no
            blink, no `>`. A publication's own mark is a different object from a
            terminal affectation borrowed from a retired positioning, which is
            why one came back on August 25, 2026 and the other stays gone.
            See src/components/Mark.tsx. */}
        <Link
          href="/"
          className="theme-text-primary wordmark inline-flex items-center gap-2.5 whitespace-nowrap"
        >
          <Mark className="wordmark-mark w-[1.12em] h-[1.12em] shrink-0" />
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
