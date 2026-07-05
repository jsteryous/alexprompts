import type { Metadata } from "next";
import { site } from "@/lib/site";
import { getTool } from "@/lib/tools";
import { ToolShell } from "@/components/ToolShell";
import { CostOfLiving } from "@/components/tools/CostOfLiving";

const tool = getTool("cost-of-living")!;

export const metadata: Metadata = {
  title: tool.title,
  description: tool.blurb,
  alternates: { canonical: `${site.url}/tools/${tool.slug}` },
};

export default function CostOfLivingPage() {
  return (
    <ToolShell
      tool={tool}
      note="A purchasing-power estimate, not a budget. It uses the Bureau of Economic Analysis Regional Price Parities for 2023, an index of overall price levels where 100 is the national average, covering all goods and services. It compares whole metro areas, so your own neighborhood, housing choice, and lifestyle will move the real number. Housing is usually the largest single driver of the gap."
    >
      <CostOfLiving />
    </ToolShell>
  );
}
