"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/case-study", label: "Case Study" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-[15px] font-semibold tracking-tight text-black">
          REBB Advisors
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-gray-500 hover:text-black transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="text-sm font-medium bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Get More Jobs
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 -mr-2 text-gray-600"
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

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-gray-600 hover:text-black"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="text-sm font-medium bg-black text-white px-4 py-2.5 rounded-lg text-center"
            onClick={() => setOpen(false)}
          >
            Get More Jobs
          </Link>
        </div>
      )}
    </header>
  );
}
