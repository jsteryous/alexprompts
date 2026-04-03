"use client";

import Link from "next/link";
import { useState } from "react";

const services = [
  { href: "/lead-intelligence", label: "Lead Intelligence", sub: "The Upstate Multiplier" },
  { href: "/outreach-automation", label: "Outreach Automation", sub: "Email & SMS sequences" },
  { href: "/seo", label: "Local SEO", sub: "Audits & GBP optimization" },
  { href: "/web-development", label: "Web Development", sub: "React sites in 5 days" },
];

const links = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/insights", label: "Insights" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-[15px] font-semibold tracking-tight text-black">
          REBB Advisors
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {/* Services dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-black transition-colors">
              Services
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {servicesOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3">
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden w-64">
                  {services.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="flex flex-col px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                      onClick={() => setServicesOpen(false)}
                    >
                      <span className="text-sm font-medium text-black">{s.label}</span>
                      <span className="text-xs text-gray-400 mt-0.5">{s.sub}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

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
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-1">
          {/* Mobile services accordion */}
          <button
            className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-black py-2"
            onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
          >
            Services
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className={`transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {mobileServicesOpen && (
            <div className="pl-3 flex flex-col gap-1 mb-1">
              {services.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="text-sm text-gray-500 hover:text-black py-1.5"
                  onClick={() => setOpen(false)}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          )}
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-gray-600 hover:text-black py-2"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="text-sm font-medium bg-black text-white px-4 py-2.5 rounded-lg text-center mt-2"
            onClick={() => setOpen(false)}
          >
            Get More Jobs
          </Link>
        </div>
      )}
    </header>
  );
}
