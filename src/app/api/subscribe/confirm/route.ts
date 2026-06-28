import { NextRequest } from "next/server";
import { confirmSubscriber, subscribersConfigured } from "@/lib/subscribers";
import { htmlPage } from "@/lib/htmlPage";

// GET /api/subscribe/confirm?token=<uuid>
// The link in the double opt-in email. Flips a pending row to confirmed and shows
// a plain result page. Returns HTML because a person clicks this from their inbox.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!subscribersConfigured()) {
    return htmlPage("Not available", "The subscription service is not configured.", 503);
  }

  const token = new URL(req.url).searchParams.get("token");
  if (!token) {
    return htmlPage("Link incomplete", "This confirmation link is missing its token.", 400);
  }

  let email: string | null;
  try {
    email = await confirmSubscriber(token);
  } catch {
    return htmlPage("Something went wrong", "Please try the link again in a moment.", 500);
  }

  if (!email) {
    return htmlPage(
      "Link expired",
      "This confirmation link is no longer valid. You can subscribe again to get a fresh one.",
      400,
    );
  }

  return htmlPage(
    "You're subscribed",
    "You'll get new posts in your inbox. Thanks for reading. You can unsubscribe from any email.",
    200,
  );
}
