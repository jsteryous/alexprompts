import type { Metadata } from "next";
import { site } from "@/lib/site";
import { getTool } from "@/lib/tools";
import { ToolShell } from "@/components/ToolShell";
import { DealAnalyzer } from "@/components/tools/DealAnalyzer";

const tool = getTool("deal-analyzer")!;

export const metadata: Metadata = {
  title: tool.title,
  description: tool.blurb,
  alternates: { canonical: `${site.url}/tools/${tool.slug}` },
};

export default function DealAnalyzerPage() {
  return (
    <ToolShell
      tool={tool}
      note="A quick screen, not investment advice. The numbers are only as good as your inputs, and they leave out things like loan fees, capital expenses, and appreciation. Confirm anything that matters before you make an offer."
    >
      <DealAnalyzer />
    </ToolShell>
  );
}
