import Link from "next/link";

export default function Footer() {
  return (
    <footer className="theme-card-strong border-t">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <Link href="/" className="theme-text-primary text-[15px] font-semibold tracking-tight">
            REBB Advisors
          </Link>
          <p className="theme-text-muted mt-1 text-sm">
            Broken forms, mobile issues, and outdated business websites fixed fast.
          </p>
        </div>

        <nav className="flex flex-wrap gap-6">
          <Link href="/#what-we-fix" className="theme-link text-sm">
            What We Fix
          </Link>
          <Link href="/#pricing" className="theme-link text-sm">
            Pricing
          </Link>
          <Link href="/contact" className="theme-link text-sm">
            Free Screenshots
          </Link>
          <Link href="/contact" className="theme-link text-sm">
            Contact
          </Link>
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
