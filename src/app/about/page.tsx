import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";

const LINKEDIN_URL = "https://www.linkedin.com/in/alex-steryous-404266182/";
const CONTACT_EMAIL = "jsteryous@gmail.com";

export const metadata: Metadata = {
  title: "About Alex",
  description:
    "Alex Steryous is a sales and business development pro who got curious about AI and started building with it. Alex Prompts is the result. Say hi.",
  alternates: { canonical: `${site.url}/about` },
};

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`theme-label inline-block text-xs font-semibold uppercase tracking-[0.2em] ${className}`}>
      <span className="opacity-50">{"> "}</span>
      {children}
    </span>
  );
}

export default function AboutPage() {
  return (
    <>
      {/* ── Hero: photo + intro ── */}
      <section className="theme-page pt-32 md:pt-36 pb-16 md:pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid gap-10 md:grid-cols-[minmax(0,320px)_1fr] md:gap-12 items-center">
            <div className="mx-auto md:mx-0 w-full max-w-[280px]">
              <div className="overflow-hidden rounded-2xl border theme-border theme-card-strong shadow-sm">
                <Image
                  src="/alex.jpg"
                  alt="Alex Steryous"
                  width={560}
                  height={840}
                  priority
                  sizes="(max-width: 768px) 280px, 320px"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            <div>
              <Eyebrow className="mb-5">About</Eyebrow>
              <h1 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-[1.08] mb-6">
                Hey, I&apos;m Alex.
              </h1>
              <p className="theme-text-secondary text-lg leading-relaxed mb-5">
                I have spent about eight years in business development and sales. I started in
                IT recruiting, moved into SaaS sales, and most recently worked in land
                acquisitions. Technology is the part that has always pulled me in, so at some
                point I stopped just reading about what AI could do and started building with it.
              </p>
              <p className="theme-text-secondary text-lg leading-relaxed">
                Alex Prompts is what came out of that. The writing, the tools, and the site
                itself were all built with Claude. It is the clearest way I know to show what
                I mean rather than just say it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── The bridge: sales + building ── */}
      <section className="theme-section-contrast py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6">
          <Eyebrow className="mb-5">What gets me going</Eyebrow>
          <h2 className="theme-text-primary text-2xl md:text-4xl font-bold tracking-tight leading-tight mb-6">
            A salesperson who actually builds with the tools.
          </h2>
          <p className="theme-text-contrast-muted text-base md:text-lg leading-relaxed mb-6">
            Most people in sales can talk about a product. I wanted to know what it feels like
            to build one. So I taught myself to work with Claude and put it to real use, and
            this site is where that ended up. The tools here are not mockups. They run, and
            people use them.
          </p>
          <p className="theme-text-contrast-muted text-base md:text-lg leading-relaxed">
            That same curiosity is what makes me good in a sales seat. When I understand how a
            product genuinely works and where it actually helps, I can sell it honestly and
            well, which is the only way I know how to sell.
          </p>
        </div>
      </section>

      {/* ── What Alex Prompts is ── */}
      <section className="theme-section py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-6">
          <Eyebrow className="mb-5">What this is</Eyebrow>
          <h2 className="theme-text-primary text-2xl md:text-4xl font-bold tracking-tight leading-tight mb-6">
            So, what is Alex Prompts?
          </h2>
          <div className="theme-prose prose max-w-none">
            <p>
              It is a small commentary outlet on real estate in Greenville, South Carolina,
              plus a handful of free tools. I built it mostly to show what is possible when you
              build with Claude, and to keep myself sharp on the technology I want to sell.
            </p>
            <p>
              The tools are real and free to use. There is a rental deal analyzer, a mortgage
              and affordability calculator, a listing prompt builder, and a commercial buyers
              list pulled from public county records. The writing takes a local real estate
              story and works through both sides of it in plain English, without the hype or
              the doom.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link href="/tools" className="theme-cta inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-xl text-sm">
              See the tools <ArrowIcon className="w-4 h-4" />
            </Link>
            <Link href="/real-estate" className="theme-link inline-flex items-center gap-2 font-medium px-4 py-3 text-sm">
              Read the real estate coverage <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Light "want one like this?" ── */}
      <section className="theme-section-muted border-y theme-border py-14 md:py-16">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="theme-text-primary text-xl md:text-2xl font-bold tracking-tight leading-snug mb-3">
            Want a site like this one?
          </h2>
          <p className="theme-text-muted text-base leading-relaxed">
            This whole thing runs on Claude, and I am putting together a plain walkthrough of
            how it was built, start to finish, with no coding background assumed. If that is
            something you want, say hi below and I will send it your way when it is ready.
          </p>
        </div>
      </section>

      {/* ── Connect CTA ── */}
      <section className="theme-section-contrast py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <Eyebrow className="mb-5">Let&apos;s talk</Eyebrow>
          <h2 className="theme-text-primary text-2xl md:text-4xl font-bold tracking-tight mb-4">
            I am looking for my next role in SaaS and tech sales.
          </h2>
          <p className="theme-text-contrast-muted text-base md:text-lg mb-8 leading-relaxed">
            I am especially drawn to companies building in real estate and proptech, where I
            get to sell something I would actually use myself. If that sounds like a fit, or you
            just want to talk shop, reach out.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="theme-cta-accent inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-xl"
            >
              Connect on LinkedIn
              <ArrowIcon />
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="theme-link inline-flex items-center gap-2 font-medium px-5 py-3.5 text-sm"
            >
              {CONTACT_EMAIL} <ArrowIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
