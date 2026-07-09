import type { Metadata } from "next";
import { site } from "@/lib/site";
import { getTool } from "@/lib/tools";
import { ToolShell } from "@/components/ToolShell";
import { WireSafety } from "@/components/tools/WireSafety";

const tool = getTool("wire-safety")!;

export const metadata: Metadata = {
  title: tool.title,
  description: tool.blurb,
  alternates: { canonical: `${site.url}/tools/${tool.slug}` },
};

export default function WireSafetyPage() {
  return (
    <ToolShell
      tool={tool}
      note="This tool reads public DNS and domain registration records in your browser and explains what they mean. It cannot see your email and it cannot tell you whether a specific message is genuine, so a page of good signs is never permission to skip the phone call. The one reliable protection is confirming wiring instructions by voice on a number you already trust, never one taken from the email itself. This is education, not security, legal, or financial advice."
    >
      <WireSafety />
    </ToolShell>
  );
}
