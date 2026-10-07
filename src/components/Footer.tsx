"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

/**
 * The footer, reframed October 7, 2026. One centered line of links and the
 * copyright, nothing else.
 *
 * Archive is /reporting, which lists everything published under the earlier
 * beats (Greenville real estate and sales performance). Those pieces keep their
 * URLs. /buying-or-selling stays linked here because it is still a live page
 * with a licensee disclosure; whether it stays at all is Alex's open decision.
 * Privacy and Terms must stay reachable from every page for SMS carrier vetting.
 * The social handles came off with the reframe; they still feed the JSON-LD
 * sameAs in layout.tsx through `socials` in site.ts.
 */
const links = [
  { href: "/about", label: "About" },
  { href: "/reporting", label: "Archive" },
  { href: "/contact", label: "Contact" },
  { href: "/buying-or-selling", label: "Buying or Selling" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/review") || pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t theme-border">
      <div className="max-w-5xl mx-auto px-6 py-12 text-center">
        <nav className="flex flex-wrap justify-center gap-x-7 gap-y-3 mb-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="theme-link type-eyebrow">
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="font-serif theme-text-muted text-sm">
          &copy; {new Date().getFullYear()} {site.name}. {site.tagline}
        </p>
      </div>
    </footer>
  );
}
