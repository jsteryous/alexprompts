"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site, socials, tools } from "@/lib/site";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/review")) return null;

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
          <Link href="/guides" className="theme-link text-sm">
            Guides
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
        <p className="theme-label text-xs font-semibold uppercase tracking-widest mb-3">
          Parts of Claude we cover
        </p>
        <p className="theme-text-muted text-sm leading-relaxed max-w-3xl">
          {tools.join(" · ")}
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-8">
        <p className="theme-text-muted text-xs">
          &copy; {new Date().getFullYear()} {site.name}. Written by {site.author}.
        </p>
      </div>
    </footer>
  );
}
