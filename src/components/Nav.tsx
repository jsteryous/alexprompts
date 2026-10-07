"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site, newsletterUrl } from "@/lib/site";

/**
 * The masthead bar, reframed October 7, 2026 ("Just good stories.").
 *
 * The name set in serif type, then two quiet links. That is all, on purpose:
 * the homepage IS the list of stories, so a "Stories" tab would point at the
 * page the wordmark already opens, and a minimalist bar has no room for a
 * button. Two short links also fit beside the name on the narrowest phone, so
 * there is no hamburger menu to open.
 *
 * Retired here and kept out deliberately: the coffee-cup-and-house mark (it
 * tied the name to real estate, which is no longer the beat; the drawing
 * survives in Mark.tsx and the favicon until a new mark is chosen), the
 * "Reporting" tab (the old work is the footer's Archive now), and the
 * "Buying or Selling?" button (the page itself was removed October 7, 2026).
 *
 * Subscribe goes to Substack, the primary channel since October 2026.
 */
export default function Nav() {
  const pathname = usePathname();
  if (pathname?.startsWith("/review") || pathname?.startsWith("/admin")) return null;

  return (
    <header className="theme-header fixed top-0 left-0 right-0 z-50 border-b">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif theme-text-primary text-[1.5rem] md:text-[1.625rem] tracking-tight"
        >
          {site.name}
        </Link>

        <nav className="flex items-center gap-6 md:gap-8">
          <Link href="/about" className="theme-link type-eyebrow">
            About
          </Link>
          <a
            href={newsletterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="theme-link type-eyebrow"
          >
            Subscribe
          </a>
        </nav>
      </div>
    </header>
  );
}
