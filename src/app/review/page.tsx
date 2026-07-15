import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { resolveEditorCover } from "@/lib/editorCover";
import { sectionOf } from "@/lib/posts";
import Editor from "./Editor";

const SECTION_BASE: Record<string, string> = {
  realestate: "/real-estate",
  works: "/greenville-works",
  briefing: "/briefing",
  newsletter: "/archive",
};

interface Props {
  searchParams: Promise<{ id?: string; token?: string }>;
}

async function getPost(id: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  const client = createClient(url, key);
  const { data } = await client
    .from("blog_posts")
    .select("id, title, slug, summary, body_md, status, created_at, topic, tags, cover_image, cover_credit, image_address")
    .eq("id", id)
    .single();
  return data;
}

export default async function ReviewPage({ searchParams }: Props) {
  const { id, token } = await searchParams;
  const secret = process.env.PUBLISH_SECRET;

  if (!secret || !id || !token || token !== secret) {
    return <ErrorPage heading="Unauthorized" body="Invalid or missing token." />;
  }

  const post = await getPost(id);
  if (!post) {
    return <ErrorPage heading="Not found" body={`No post found with ID: ${id}`} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Editor
        id={post.id}
        token={token}
        initialTitle={post.title ?? ""}
        initialSummary={post.summary ?? ""}
        initialBody={post.body_md ?? ""}
        status={post.status ?? "DRAFT"}
        slug={post.slug ?? ""}
        backHref="/admin"
        livePath={`${SECTION_BASE[sectionOf(post)]}/${post.slug ?? ""}`}
        initialCoverImage={post.cover_image ?? null}
        initialCoverCredit={post.cover_credit ?? null}
        libraryCover={resolveEditorCover({ ...post, cover_image: null })}
      />
    </div>
  );
}

function ErrorPage({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-12 max-w-md w-full text-center">
        <h1 className="text-xl font-bold text-black mb-3">{heading}</h1>
        <p className="text-sm text-gray-500">{body}</p>
        <Link href="/" className="inline-block mt-6 text-sm text-gray-500 hover:text-black">
          ← alexprompts.com
        </Link>
      </div>
    </div>
  );
}
