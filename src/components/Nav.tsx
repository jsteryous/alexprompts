"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import DarkModeToggle from "./DarkModeToggle";

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
 * survives in Mark.tsx; the favicon became the nameplate's blackletter R on October 14, 2026), the
 * "Reporting" tab (the old work is the footer's Archive now), and the
 * "Buying or Selling?" button (the page itself was removed October 7, 2026).
 *
 * Subscribe goes to /subscribe, the owned list, since October 14, 2026: every
 * confirmed subscriber gets each number of the Intelligencer by email, and
 * Substack does not carry it.
 *
 * October 14, 2026: "Back Numbers" (/editions) joined the bar when the front
 * page became The Rebrew Intelligencer. About hides below `sm` so the bar
 * still fits a 390px phone beside the name; the footer carries it there.
 *
 * October 14, 2026: "The Office" (/office, the Editor's office) leads the bar,
 * since it is the way into everything else. Back Issues hides below `sm` to
 * keep the phone bar to two links; the stack of papers in the office reaches it.
 *
 * October 14, 2026: the light and dim switch moved here from a floating button
 * that sat on top of the paper's text on a phone.
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

        <nav className="flex items-center gap-5 md:gap-8">
          <Link href="/office" className="theme-link type-eyebrow whitespace-nowrap">
            The Office
          </Link>
          <Link href="/editions" className="theme-link type-eyebrow whitespace-nowrap hidden sm:inline">
            Back Issues
          </Link>
          <Link href="/about" className="theme-link type-eyebrow hidden sm:inline">
            About
          </Link>
          <Link href="/subscribe" className="theme-link type-eyebrow">
            Subscribe
          </Link>
          <DarkModeToggle />
        </nav>
      </div>
    </header>
  );
}
