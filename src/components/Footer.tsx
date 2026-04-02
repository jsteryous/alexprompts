import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <Link href="/" className="text-[15px] font-semibold tracking-tight text-black">
            REBB Advisors
          </Link>
          <p className="mt-1 text-sm text-gray-400">
            Automated lead systems for local service businesses.
          </p>
        </div>

        <nav className="flex flex-wrap gap-6">
          <Link href="/how-it-works" className="text-sm text-gray-400 hover:text-black transition-colors">
            How It Works
          </Link>
          <Link href="/case-study" className="text-sm text-gray-400 hover:text-black transition-colors">
            Case Study
          </Link>
          <Link href="/contact" className="text-sm text-gray-400 hover:text-black transition-colors">
            Contact
          </Link>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-8">
        <p className="text-xs text-gray-300">
          &copy; {new Date().getFullYear()} REBB Advisors. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
