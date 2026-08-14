import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { isAdmin } from "@/lib/adminAuth";
import { sectionOf, formatDate } from "@/lib/posts";
import LoginForm from "./LoginForm";
import LogoutButton from "./LogoutButton";
import PublishButton from "./PublishButton";
import DeleteButton from "./DeleteButton";

// A gated editor, never a search result. robots.txt already disallows /admin;
// this is the second layer, for the case where the URL gets linked from
// somewhere Google can reach. `noindex` is also how a page opts out of the
// canonical guard (`npm run check:canonicals`).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// This is an authenticated, per-request view; never cache it.
export const dynamic = "force-dynamic";

const SECTION_LABEL: Record<string, string> = {
  realestate: "Real Estate",
  works: "Business",
  briefing: "Upstate Brief",
  newsletter: "Newsletter",
};
const SECTION_BASE: Record<string, string> = {
  realestate: "/real-estate",
  works: "/greenville-works",
  briefing: "/briefing",
  newsletter: "/archive",
};

interface Row {
  id: string;
  title: string | null;
  slug: string | null;
  status: string | null;
  tags: string[] | null;
  created_at: string;
  published_at: string | null;
}

async function getPosts(): Promise<Row[] | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  const client = createClient(url, key);
  const { data } = await client
    .from("blog_posts")
    .select("id, title, slug, status, tags, created_at, published_at")
    .order("created_at", { ascending: false })
    .limit(100);
  return (data as Row[]) ?? [];
}

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return <LoginForm />;
  }

  const posts = await getPosts();
  if (posts === null) {
    return (
      <Shell>
        <p className="text-sm tone-hot-text">
          Supabase is not configured on the server (missing URL or service key).
        </p>
      </Shell>
    );
  }

  const drafts = posts.filter((p) => p.status === "DRAFT");
  const published = posts.filter((p) => p.status === "PUBLISHED").slice(0, 20);

  return (
    <Shell>
      <section className="mb-12">
        <h2 className="text-sm font-semibold uppercase tracking-widest theme-text-muted mb-4">
          Drafts awaiting review ({drafts.length})
        </h2>
        {drafts.length === 0 ? (
          <p className="text-sm theme-text-muted">
            Nothing waiting. The engines will drop new drafts here as they run.
          </p>
        ) : (
          <ul className="space-y-3">
            {drafts.map((p) => (
              <PostRow key={p.id} post={p} draft />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest theme-text-muted mb-4">
          Recently published
        </h2>
        {published.length === 0 ? (
          <p className="text-sm theme-text-muted">No published posts yet.</p>
        ) : (
          <ul className="space-y-3">
            {published.map((p) => (
              <PostRow key={p.id} post={p} draft={false} />
            ))}
          </ul>
        )}
      </section>
    </Shell>
  );
}

function PostRow({ post, draft }: { post: Row; draft: boolean }) {
  const section = sectionOf(post);
  const base = SECTION_BASE[section];
  const live = post.slug ? `${base}/${post.slug}` : base;
  const date = formatDate(draft ? post.created_at : post.published_at);

  return (
    <li className="theme-card-strong border theme-border rounded-xl p-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="theme-card-muted theme-text-muted text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded">
            {SECTION_LABEL[section]}
          </span>
          <span className="text-xs theme-text-muted">{date}</span>
        </div>
        <p className="text-sm font-semibold theme-text-primary truncate">
          {post.title ?? "(untitled)"}
        </p>
        <p className="text-xs theme-text-muted truncate">{post.slug}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/admin/edit/${post.id}`}
          className="text-sm font-medium theme-text-secondary border theme-border px-4 py-2 rounded-lg hover:border-[var(--border-strong)] transition-colors"
        >
          Edit
        </Link>
        {draft ? (
          <>
            <DeleteButton id={post.id} />
            <PublishButton id={post.id} />
          </>
        ) : (
          <a
            href={live}
            className="text-sm font-medium theme-text-secondary border theme-border px-4 py-2 rounded-lg hover:border-[var(--border-strong)] transition-colors"
          >
            View
          </a>
        )}
      </div>
    </li>
  );
}

/**
 * The admin chrome. Every color here comes from the `.theme-*` tokens rather
 * than a Tailwind gray, because /admin sits outside Nav and Footer and used to
 * hardcode `bg-gray-50` + `bg-white`. That made the page stay white when the
 * site's dark toggle flipped `html.dark`, which is the one place the design
 * system was not actually driving the design (fixed August 1, 2026).
 */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 theme-header border-b theme-border px-6 py-3 flex items-center justify-between">
        <span className="theme-label text-xs font-semibold uppercase tracking-widest">
          Alex Prompts · Admin
        </span>
        <div className="flex items-center gap-3">
          <Link href="/" className="theme-link text-sm">
            ← Site
          </Link>
          <LogoutButton />
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-12">{children}</div>
    </div>
  );
}
