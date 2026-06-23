"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { newsletterUrl, site } from "@/lib/site";

const links = [
  { href: "/archive", label: "Guides" },
  { href: "/about", label: "About" },
  { href: "/#follow", label: "Follow" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  if (pathname?.startsWith("/review")) return null;

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
          <a
            href={newsletterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="theme-cta text-sm font-medium px-4 py-2 rounded-lg"
          >
            Subscribe
          </a>
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
          <a
            href={newsletterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="theme-cta text-sm font-medium px-4 py-2.5 rounded-lg text-center mt-2"
            onClick={() => setOpen(false)}
          >
            Subscribe
          </a>
        </div>
      )}
    </header>
  );
}
