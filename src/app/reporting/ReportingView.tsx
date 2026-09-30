import Link from "next/link";
import { postHref, sectionLabel, formatDate, type ArchivePost } from "@/lib/posts";
import { TOPICS, topicLabel, topicOf, type TopicKey } from "@/lib/topics";
import { PostCover } from "@/components/PostCover";

/**
 * The body of /reporting and of each /reporting/<topic> tab. `active` is null on
 * the unfiltered page. The tabs are plain links to static routes, so each one is
 * cached, shareable, and indexable, and none of them creates an article URL.
 */
export function ReportingView({
  posts,
  active,
  heading,
  intro,
}: {
  posts: ArchivePost[];
  active: TopicKey | null;
  heading: string;
  /** Only the unfiltered page carries one; the topic tabs are heading-only. */
  intro?: string;
}) {
  const tabs: { href: string; label: string; key: TopicKey | null }[] = [
    { href: "/reporting", label: "All", key: null },
    ...TOPICS.map((t) => ({ href: `/reporting/${t.key}`, label: t.label, key: t.key })),
  ];

  return (
    <>
      <section className="theme-page theme-border pt-32 pb-10 border-b">
        <div className="max-w-3xl mx-auto px-6">
          <span
            className="theme-label type-eyebrow inline-block border-t-2 pt-2 mb-6"
            style={{ borderColor: "var(--accent)" }}
          >
            Reporting
          </span>
          <h1 className={`theme-text-primary type-h1 ${intro ? "mb-5" : "mb-10"}`}>{heading}</h1>
          {intro && <p className="theme-text-muted type-body-lg max-w-xl mb-10">{intro}</p>}

          <nav aria-label="Topics" className="flex flex-wrap gap-2">
            {tabs.map((t) => {
              const on = t.key === active;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  aria-current={on ? "page" : undefined}
                  className={`type-eyebrow px-3 py-2 border transition-colors ${
                    on
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] theme-text-primary"
                      : "theme-border theme-text-muted hover:border-[var(--border-strong)]"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      <section className="theme-section py-16">
        <div className="max-w-3xl mx-auto px-6">
          {posts.length > 0 ? (
            <ul className="divide-y theme-border">
              {posts.map((p) => {
                const topic = topicOf(p);
                return (
                  <li key={p.id} className="py-7 first:pt-0">
                    <Link
                      href={postHref(p)}
                      className="group grid grid-cols-1 sm:grid-cols-[12rem_1fr] gap-5"
                    >
                      <PostCover
                        src={p.cover_image}
                        alt={p.title}
                        sizes="(max-width: 640px) 100vw, 192px"
                        className="aspect-[16/9] w-full border theme-border"
                      />
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="theme-badge type-eyebrow px-2 py-1">
                            {topic ? topicLabel(topic) : sectionLabel(p)}
                          </span>
                          {p.published_at && (
                            <time className="theme-text-muted type-eyebrow">
                              {formatDate(p.published_at)}
                            </time>
                          )}
                        </div>
                        <h2 className="theme-text-primary type-h3 mb-2 group-hover:opacity-80">
                          {p.title}
                        </h2>
                        {p.summary && (
                          <p className="theme-text-muted type-body leading-relaxed">{p.summary}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="border theme-border p-10">
              <p className="theme-text-secondary type-body-lg mb-2">
                {active ? "Nothing is filed here yet." : "The first pieces are on the way."}
              </p>
              <p className="theme-text-muted type-body">
                Each piece starts with a paper or a number and works out what it means for a
                house in Greenville.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
