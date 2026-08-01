"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { site } from "@/lib/site";

// Nav clarity rule (July 2026): every label states its promise in the visitor's
// words. The newsletter archive lives in the footer only, so the nav stays short.
const links = [
  { href: "/briefing", label: "Upstate Brief" },
  { href: "/tools", label: "Tools" },
  { href: "/real-estate", label: "Moving to Greenville" },
  { href: "/greenville-works", label: "SC Technology" },
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
        <Link href="/" className="theme-text-primary text-[15px] font-semibold tracking-tight inline-flex items-center">
          {site.name}
          <span className="caret" aria-hidden>▌</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="theme-link text-sm">
              {link.label}
            </Link>
          ))}
          <Link href="/subscribe" className="theme-link text-sm">
            Subscribe
          </Link>
          <Link
            href={primaryCta.href}
            className="theme-cta-accent text-sm font-medium px-4 py-2 rounded-lg"
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
            className="theme-cta-accent text-sm font-medium px-4 py-2.5 rounded-lg text-center mt-2"
            onClick={() => setOpen(false)}
          >
            {primaryCta.label}
          </Link>
        </div>
      )}
    </header>
  );
}
