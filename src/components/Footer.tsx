"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cities, citySlugs } from "@/lib/cities";
import { practiceTypeList } from "@/lib/practiceTypes";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/review")) return null;

  return (
    <footer className="theme-card-strong border-t">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <Link href="/" className="theme-text-primary text-[15px] font-semibold tracking-tight">
            REBB Advisors
          </Link>
          <p className="theme-text-muted mt-1 text-sm">
            Website cleanup for dental practices in Greenville SC.
          </p>
        </div>

        <nav className="flex flex-wrap gap-6">
          <Link href="/#what-we-fix" className="theme-link text-sm">
            What We Fix
          </Link>
          <Link href="/#pricing" className="theme-link text-sm">
            Pricing
          </Link>
          <Link href="/sample-proposal" className="theme-link text-sm">
            Sample Proposal
          </Link>
          <Link href="/insights" className="theme-link text-sm">
            Insights
          </Link>
          <Link href="/contact" className="theme-link text-sm">
            Contact
          </Link>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-8 border-t theme-border pt-6">
        <p className="theme-label text-xs font-semibold uppercase tracking-widest mb-3">
          Service areas
        </p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {citySlugs.map((slug) => (
            <Link
              key={slug}
              href={`/dental-website-cleanup/${slug}`}
              className="theme-link text-sm"
            >
              {cities[slug].name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-8 border-t theme-border pt-6">
        <p className="theme-label text-xs font-semibold uppercase tracking-widest mb-3">
          Practice types
        </p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {practiceTypeList.map((p) => (
            <Link key={p.slug} href={`/${p.slug}`} className="theme-link text-sm">
              {p.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-8">
        <p className="theme-text-muted text-xs">
          &copy; {new Date().getFullYear()} REBB Advisors. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
