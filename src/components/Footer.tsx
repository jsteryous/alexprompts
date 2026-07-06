"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site, socials } from "@/lib/site";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/review") || pathname?.startsWith("/admin")) return null;

  return (
    <footer className="theme-card-strong border-t">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <Link href="/" className="theme-text-primary text-[15px] font-semibold tracking-tight">
            {site.name}
          </Link>
          <p className="theme-text-muted mt-1 text-sm">{site.tagline}</p>
        </div>

        <nav className="flex flex-wrap gap-6">
          <Link href="/tools" className="theme-link text-sm">
            Tools
          </Link>
          <Link href="/real-estate" className="theme-link text-sm">
            Real Estate
          </Link>
          <Link href="/greenville-works" className="theme-link text-sm">
            Greenville Works
          </Link>
          <Link href="/find-a-pro" className="theme-link text-sm">
            Find a Pro
          </Link>
          <Link href="/archive" className="theme-link text-sm">
            Archive
          </Link>
          <Link href="/about" className="theme-link text-sm">
            About
          </Link>
          {socials.map((s) => (
            <a
              key={s.key}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="theme-link text-sm"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-8 border-t theme-border pt-6">
        <p className="theme-text-muted text-xs">
          &copy; {new Date().getFullYear()} {site.name}. Written by {site.author}.
        </p>
      </div>
    </footer>
  );
}
