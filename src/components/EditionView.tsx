import Link from "next/link";
import {
  type Edition,
  type EditionListing,
  type PaperItem,
  editionDateLine,
  editionHref,
  roman,
  safeImage,
  safeUrl,
  volumeOf,
} from "@/lib/editions";
import { DEPARTMENTS, clipId } from "@/lib/clips";
import ClipLayer from "@/components/ClipLayer";
import { SubscribeForm } from "@/components/SubscribeForm";
import { PAPER_FONTS_HREF } from "@/lib/paperFonts";

/**
 * THE REBREW INTELLIGENCER, rendered as a broadsheet (October 14, 2026).
 *
 * The page is a period newspaper: a blackletter nameplate, a dateline between
 * double rules, a lead story with stacked decks across the full width, then the
 * rest of the paper flowing down newspaper columns (one on a phone, three on a
 * desk). Advertisements sit in ruled boxes, and the sources the news was checked
 * against close the page, because every item of news in it is true.
 *
 * Every item is wrapped in <Clippable> so a reader can clip it out and share
 * it (src/lib/clips.ts, components/ClipLayer.tsx, /clip/<date>/<item>).
 *
 * Fonts (src/lib/paperFonts.ts): the nameplate is UnifrakturMaguntia, banner and
 * story headlines Oswald, decks, departments, letters and ads Libre Bodoni,
 * loaded from Google Fonts with a plain stylesheet link (next/font/google breaks
 * the Turbopack build, see src/CLAUDE.md). Both fall back to the site serif, so
 * the page reads correctly before or without them. Body copy stays on the
 * system serif for legibility.
 */

const FONTS = PAPER_FONTS_HREF;

const head = { fontFamily: "var(--font-head)" } as const;
const banner = { fontFamily: "var(--font-banner)" } as const;

function Paragraphs({ item, dropCap = false }: { item: PaperItem; dropCap?: boolean }) {
  return (
    <>
      {(item.paragraphs ?? []).map((p, i) => (
        <p
          key={i}
          className={`paper-body ${dropCap && i === 0 ? "paper-dropcap" : ""}`}
        >
          {item.dateline && i === 0 && (
            <span className="font-semibold tracking-wide uppercase text-[0.8125em]">{item.dateline}. </span>
          )}
          <span data-clip-p={i}>{p}</span>
        </p>
      ))}
      {item.signed && (
        <p className="paper-body text-right italic" style={head}>
          {item.signed}
        </p>
      )}
    </>
  );
}

/**
 * An illustration, printed the way a 1940s daily ran a news photograph:
 * inside a ruled frame, with a caption beneath and the credit in small type.
 * The grayscale and contrast filter is what lets a modern photograph sit on
 * the period page; `paper-plate` in globals.css carries it.
 */
function Plate({ item, eager = false }: { item: PaperItem; eager?: boolean }) {
  const img = safeImage(item.image);
  if (!img) return null;
  return (
    <figure className="break-inside-avoid border border-[var(--foreground)] p-1.5 mb-4">
      {/* Remote, openly licensed pictures from Commons or the Library of Congress;
          next/image would need every such host whitelisted. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img.url}
        alt={img.caption}
        loading={eager ? "eager" : "lazy"}
        className="paper-plate w-full h-auto max-h-[28rem] object-cover"
      />
      {img.caption && (
        <figcaption className="theme-text-primary text-center italic text-[0.9375rem] leading-snug mt-2" style={head}>
          {img.caption}
        </figcaption>
      )}
      <p className="theme-text-muted text-center text-[0.6875rem] leading-snug mt-1">
        {img.source ? (
          <a href={img.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            {img.credit}
          </a>
        ) : (
          img.credit
        )}
      </p>
    </figure>
  );
}

function Headline({ item, size = "md" }: { item: PaperItem; size?: "md" | "sm" }) {
  if (!item.headline) return null;
  return (
    <header className="text-center mb-3">
      <h3
        className={`theme-text-primary uppercase font-bold leading-[1.08] tracking-[0.01em] ${
          size === "md" ? "text-[1.375rem]" : "text-[1.125rem]"
        }`}
        style={banner}
      >
        {item.headline}
      </h3>
      {(item.decks ?? []).map((d, i) => (
        <p key={i} className="theme-text-secondary text-[0.9375rem] leading-snug mt-1 italic" style={head}>
          {d}
        </p>
      ))}
      <div className="mx-auto mt-2 w-10 border-t theme-border" aria-hidden="true" />
    </header>
  );
}

/** A department heading, like "BY WIRE", set between rules. */
function Department({ title }: { title: string }) {
  return (
    <h2
      className="theme-text-primary text-center uppercase font-bold tracking-[0.2em] text-[0.8125rem] border-y-2 border-[var(--foreground)] py-1.5 mb-4"
      style={head}
    >
      {title}
    </h2>
  );
}

/** One clippable item: the scissors (components/ClipLayer.tsx) find it by `data-clip`, and a clip page links back to it by id. */
function Clippable({ id, className = "", children }: { id: string; className?: string; children: React.ReactNode }) {
  return (
    <div id={id} data-clip={id} className={`clip-target ${className}`}>
      {children}
    </div>
  );
}

function Block({ children }: { children: React.ReactNode }) {
  return <section className="break-inside-avoid-column mb-7">{children}</section>;
}

export default function EditionView({
  edition,
  prev,
  next,
}: {
  edition: Edition;
  prev?: EditionListing | null;
  next?: EditionListing | null;
}) {
  const c = edition.content ?? {};
  const lead = c.lead;
  const decks = lead?.decks ?? [];
  const sources = (c.sources ?? [])
    .map((s) => ({ title: s.title ?? s.url ?? "", url: safeUrl(s.url) }))
    .filter((s) => s.url);

  return (
    <article className="theme-page pt-24 md:pt-28 pb-20" data-clip-root>
      <link rel="stylesheet" href={FONTS} precedence="default" />
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* ── Nameplate ─────────────────────────────────────────────── */}
        <header className="text-center">
          <div className="flex items-center justify-between gap-3 type-eyebrow theme-text-muted border-b theme-border pb-2">
            <span>Vol. {roman(volumeOf(edition.slug))}. No. {edition.number}.</span>
            <span className="hidden sm:inline">Published Tuesdays, Thursdays &amp; Saturdays</span>
            <span>Price: Free</span>
          </div>
          <h1
            className="theme-text-primary leading-none mt-5 mb-3 text-[2.6rem] sm:text-[4rem] md:text-[5.5rem]"
            style={{ fontFamily: "'UnifrakturMaguntia', var(--font-serif)" }}
          >
            The Rebrew Intelligencer
          </h1>
          <p className="theme-text-secondary italic text-[0.9375rem] md:text-[1.0625rem]" style={head}>
            And ye shall know the truth, and the truth shall make you free. John 8:32
          </p>
          <div className="mt-4 border-t-[3px] border-[var(--foreground)]" />
          <div className="flex items-center justify-between gap-3 py-1.5 type-eyebrow theme-text-primary">
            <span className="hidden sm:inline">Greenville, South Carolina</span>
            <span className="mx-auto sm:mx-0">{editionDateLine(edition.slug)}</span>
            <Link href="/office" className="hidden sm:inline hover:underline underline-offset-4">
              C. P. Ashby, Editor
            </Link>
          </div>
          <div className="border-t border-[var(--foreground)]" />
          <div className="mt-[3px] border-t border-[var(--foreground)]" />
        </header>

        {/* ── The lead ──────────────────────────────────────────────── */}
        {lead && (
          <section className="mt-8 md:mt-10 pb-8 border-b-2 border-[var(--foreground)]">
            <Clippable id={clipId("lead")}>
            <header className="text-center max-w-4xl mx-auto mb-6">
              <h2
                className="theme-text-primary uppercase font-bold leading-[0.98] tracking-[0.005em] text-[2.25rem] sm:text-[3.25rem] md:text-[4.25rem]"
                style={banner}
              >
                {lead.headline ?? edition.headline}
              </h2>
              {decks.map((d, i) => (
                <div key={i}>
                  <div className="mx-auto my-2.5 w-16 border-t theme-border" aria-hidden="true" />
                  <p
                    className={`theme-text-primary leading-snug ${
                      i === 0
                        ? "uppercase font-bold tracking-wide text-[1.0625rem] md:text-[1.375rem]"
                        : "italic text-[1rem] md:text-[1.1875rem] theme-text-secondary"
                    }`}
                    style={head}
                  >
                    {d}
                  </p>
                </div>
              ))}
            </header>
            {safeImage(lead.image) && (
              <div className="max-w-3xl mx-auto">
                <Plate item={lead} eager />
              </div>
            )}
            <div className="paper-columns md:columns-2 lg:columns-3">
              <Paragraphs item={lead} dropCap />
            </div>
            </Clippable>
          </section>
        )}

        {/* ── The rest of the paper ─────────────────────────────────── */}
        <div className="paper-columns mt-8 md:columns-2 lg:columns-3">
          {(c.dispatches ?? []).length > 0 && (
            <>
              <Block>
                <Department title={DEPARTMENTS.dispatch} />
                <Clippable id={clipId("dispatch", 0)}>
                  <Headline item={c.dispatches![0]} />
                  <Plate item={c.dispatches![0]} />
                  <Paragraphs item={c.dispatches![0]} />
                </Clippable>
              </Block>
              {c.dispatches!.slice(1).map((d, i) => (
                <Block key={i}>
                  <Clippable id={clipId("dispatch", i + 1)}>
                    <Headline item={d} />
                    <Plate item={d} />
                    <Paragraphs item={d} />
                  </Clippable>
                </Block>
              ))}
            </>
          )}

          {c.markets && (
            <Block>
              <Department title={DEPARTMENTS.market} />
              <Clippable id={clipId("market")}>
                <Headline item={c.markets} />
                <Paragraphs item={c.markets} />
              </Clippable>
            </Block>
          )}

          {c.editorial && (
            <Block>
              <Department title={DEPARTMENTS.editorial} />
              <Clippable id={clipId("editorial")}>
                <Headline item={c.editorial} />
                <Paragraphs item={c.editorial} />
              </Clippable>
            </Block>
          )}

          {(c.letters ?? []).length > 0 && (
            <Block>
              <Department title={DEPARTMENTS.letter} />
              {c.letters!.map((l, i) => (
                <Clippable key={i} id={clipId("letter", i)} className={i > 0 ? "mt-5 pt-4 border-t theme-border" : ""}>
                  {l.reader && <p className="type-eyebrow theme-text-muted mb-1">From a reader</p>}
                  <Headline item={l} size="sm" />
                  <Paragraphs item={l} />
                </Clippable>
              ))}
              <p className="mt-4 text-right italic text-[0.875rem]" style={head}>
                <Link href="/letters" className="theme-link underline underline-offset-4">
                  Write to the Editor
                </Link>
              </p>
            </Block>
          )}

          {(c.amusements ?? []).length > 0 && (
            <Block>
              <Department title={DEPARTMENTS.amusement} />
              {c.amusements!.map((a, i) => (
                <Clippable key={i} id={clipId("amusement", i)} className={i > 0 ? "mt-5" : ""}>
                  <Headline item={a} size="sm" />
                  <Paragraphs item={a} />
                </Clippable>
              ))}
            </Block>
          )}

          {(c.miscellany ?? []).length > 0 && (
            <Block>
              <Department title={DEPARTMENTS.around} />
              {c.miscellany!.map((m, i) => (
                <Clippable key={i} id={clipId("around", i)} className={i > 0 ? "mt-5" : ""}>
                  <Headline item={m} size="sm" />
                  <Paragraphs item={m} />
                </Clippable>
              ))}
            </Block>
          )}
        </div>

        {/* ── Advertisements ────────────────────────────────────────── */}
        {(c.advertisements ?? []).length > 0 && (
          <section className="mt-4 pt-6 border-t-2 border-[var(--foreground)]">
            <Department title="Advertisements" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {c.advertisements!.map((ad, i) => (
                <Clippable key={i} id={clipId("ad", i)} className="border-2 border-[var(--foreground)] p-1">
                  <div className="border theme-border px-4 py-5 text-center h-full">
                    {ad.headline && (
                      <p className="theme-text-primary uppercase font-bold leading-[1.05] text-[1.375rem]" style={banner}>
                        {ad.headline}
                      </p>
                    )}
                    {(ad.lines ?? []).map((line, j) => (
                      <p
                        key={j}
                        className={`theme-text-secondary leading-snug mt-2 ${j === 0 ? "italic" : "text-[0.9375rem]"}`}
                        style={head}
                      >
                        <span data-clip-p={j}>{line}</span>
                      </p>
                    ))}
                  </div>
                </Clippable>
              ))}
            </div>
          </section>
        )}

        {/* ── Delivery: every number by email (src/lib/editionEmail.ts) ── */}
        <section className="mt-10 pt-8 border-t-2 border-[var(--foreground)]">
          <div className="max-w-xl mx-auto">
            <SubscribeForm source="edition" cta="Deliver it" />
          </div>
        </section>

        {/* ── Authorities consulted, and the colophon ───────────────── */}
        <footer className="mt-10 pt-5 border-t-[3px] border-double border-[var(--foreground)]">
          {sources.length > 0 && (
            <div className="mb-6">
              <h2 className="type-eyebrow theme-text-muted mb-2">Sources for this edition</h2>
              <ol className="columns-1 md:columns-2 gap-8 text-[0.8125rem] theme-text-secondary list-decimal pl-5">
                {sources.map((s, i) => (
                  <li key={i} className="break-inside-avoid mb-1">
                    <a href={s.url!} target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--border-strong)] underline-offset-2 hover:decoration-[var(--accent)]">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <p className="text-[0.8125rem] theme-text-muted leading-relaxed max-w-3xl">
            The Rebrew Intelligencer is written and set in type by a machine, an artificial
            intelligence, three mornings a week. The news in it is real and is checked against the
            authorities listed above. The Editor, his household, his correspondents, the letters (save
            those marked as from a reader) and the advertisements are inventions, and nothing in them should be taken for fact or for
            advice.
          </p>
          <nav className="mt-6 flex flex-wrap items-center justify-between gap-4 type-eyebrow">
            <span>
              {prev ? (
                <Link href={editionHref(prev)} className="theme-link">
                  Previous number
                </Link>
              ) : null}
            </span>
            <Link href="/editions" className="theme-link">
              All back issues
            </Link>
            <span>
              {next ? (
                <Link href={editionHref(next)} className="theme-link">
                  Next number
                </Link>
              ) : null}
            </span>
          </nav>
        </footer>
      </div>
      <ClipLayer slug={edition.slug} number={edition.number} />
    </article>
  );
}
