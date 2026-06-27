import type { Metadata } from "next";
import { site } from "@/lib/site";
import { getTool } from "@/lib/tools";
import { ToolShell } from "@/components/ToolShell";
import { ListingPromptBuilder } from "@/components/tools/ListingPromptBuilder";

const tool = getTool("listing-prompt")!;

export const metadata: Metadata = {
  title: tool.title,
  description: tool.blurb,
  alternates: { canonical: `${site.url}/tools/${tool.slug}` },
};

export default function ListingPromptPage() {
  return (
    <ToolShell
      tool={tool}
      note="The prompt is built to keep the copy Fair Housing safe, but you are still the author. Read what Claude writes, check every fact against the property, and make sure it follows your brokerage and MLS rules before you publish."
    >
      <ListingPromptBuilder />
    </ToolShell>
  );
}
