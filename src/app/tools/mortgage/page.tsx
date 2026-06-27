import type { Metadata } from "next";
import { site } from "@/lib/site";
import { getTool } from "@/lib/tools";
import { ToolShell } from "@/components/ToolShell";
import { MortgageCalc } from "@/components/tools/MortgageCalc";

const tool = getTool("mortgage")!;

export const metadata: Metadata = {
  title: tool.title,
  description: tool.blurb,
  alternates: { canonical: `${site.url}/tools/${tool.slug}` },
};

export default function MortgagePage() {
  return (
    <ToolShell
      tool={tool}
      note="An estimate, not a loan quote. It assumes a fixed rate and leaves out PMI, points, and closing costs. Your lender's numbers are the ones that count."
    >
      <MortgageCalc />
    </ToolShell>
  );
}
