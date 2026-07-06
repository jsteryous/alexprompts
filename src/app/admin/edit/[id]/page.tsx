import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { isAdmin } from "@/lib/adminAuth";
import Editor from "@/app/review/Editor";

interface Props {
  params: Promise<{ id: string }>;
}

async function getPost(id: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  const client = createClient(url, key);
  const { data } = await client
    .from("blog_posts")
    .select("id, title, slug, summary, body_md, status, tags")
    .eq("id", id)
    .single();
  return data;
}

export default async function AdminEditPage({ params }: Props) {
  const { id } = await params;

  if (!(await isAdmin())) {
    return (
      <ErrorPage
        heading="Not logged in"
        body="Your admin session expired. Log in again to edit this draft."
        href="/admin"
        linkText="→ Log in"
      />
    );
  }

  const post = await getPost(id);
  if (!post) {
    return (
      <ErrorPage
        heading="Not found"
        body={`No post found with ID: ${id}`}
        href="/admin"
        linkText="← Back to admin"
      />
    );
  }

  // No token prop: the Editor authenticates its Save/Publish calls with the
  // httpOnly admin cookie, so the secret never touches the URL.
  return (
    <div className="min-h-screen bg-gray-50">
      <Editor
        id={post.id}
        initialTitle={post.title ?? ""}
        initialSummary={post.summary ?? ""}
        initialBody={post.body_md ?? ""}
        status={post.status ?? "DRAFT"}
        slug={post.slug ?? ""}
      />
    </div>
  );
}

function ErrorPage({
  heading,
  body,
  href,
  linkText,
}: {
  heading: string;
  body: string;
  href: string;
  linkText: string;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-12 max-w-md w-full text-center">
        <h1 className="text-xl font-bold text-black mb-3">{heading}</h1>
        <p className="text-sm text-gray-500">{body}</p>
        <Link href={href} className="inline-block mt-6 text-sm text-gray-500 hover:text-black">
          {linkText}
        </Link>
      </div>
    </div>
  );
}
