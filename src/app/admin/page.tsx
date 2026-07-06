import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { isAdmin } from "@/lib/adminAuth";
import { sectionOf, formatDate } from "@/lib/posts";
import LoginForm from "./LoginForm";
import LogoutButton from "./LogoutButton";
import PublishButton from "./PublishButton";

// This is an authenticated, per-request view; never cache it.
export const dynamic = "force-dynamic";

const SECTION_LABEL: Record<string, string> = {
  realestate: "Real Estate",
  works: "Greenville Works",
  newsletter: "Newsletter",
};
const SECTION_BASE: Record<string, string> = {
  realestate: "/real-estate",
  works: "/greenville-works",
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
        <p className="text-sm text-red-600">
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
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-4">
          Drafts awaiting review ({drafts.length})
        </h2>
        {drafts.length === 0 ? (
          <p className="text-sm text-gray-400">
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
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-4">
          Recently published
        </h2>
        {published.length === 0 ? (
          <p className="text-sm text-gray-400">No published posts yet.</p>
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
    <li className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
            {SECTION_LABEL[section]}
          </span>
          <span className="text-xs text-gray-400">{date}</span>
        </div>
        <p className="text-sm font-semibold text-black truncate">
          {post.title ?? "(untitled)"}
        </p>
        <p className="text-xs text-gray-400 truncate">{post.slug}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/admin/edit/${post.id}`}
          className="text-sm font-medium text-gray-700 border border-gray-200 px-4 py-2 rounded-lg hover:border-black transition-colors"
        >
          Edit
        </Link>
        {draft ? (
          <PublishButton id={post.id} />
        ) : (
          <a
            href={live}
            className="text-sm font-medium text-gray-700 border border-gray-200 px-4 py-2 rounded-lg hover:border-black transition-colors"
          >
            View
          </a>
        )}
      </div>
    </li>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-green-600">
          Alex Prompts · Admin
        </span>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-gray-500 hover:text-black">
            ← Site
          </Link>
          <LogoutButton />
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-12">{children}</div>
    </div>
  );
}
