import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/lib/site";
import { getTool } from "@/lib/tools";
import { isConfigured } from "@/lib/areaScan";
import { ToolShell } from "@/components/ToolShell";
import { AreaScan } from "@/components/tools/AreaScan";

const tool = getTool("area-scan")!;

export const metadata: Metadata = {
  title: tool.title,
  description: tool.blurb,
  alternates: { canonical: `${site.url}/tools/${tool.slug}` },
};

// Reads the key on the server only, to render the right state. No key -> the tool
// shows a clean "not configured" panel instead of a failing scan.
export const dynamic = "force-dynamic";

export default function AreaScanPage() {
  // Dark until launch: the page 404s while the tool is `soon`, matching the
  // gated /api/area-scan route, so nothing about the paid tool is reachable yet.
  if (tool.status !== "live") notFound();

  return (
    <ToolShell
      tool={tool}
      note="A quick read on an area, not a market study. Place counts come from Google Places (top out at 20 per category and miss anything Google has not mapped); the neighborhood profile is US Census ACS 5-year estimates at the tract level, which carry margins of error. Use it to form a question, not to make the call."
    >
      <AreaScan configured={isConfigured()} />
    </ToolShell>
  );
}
