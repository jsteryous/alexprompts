import type { Metadata } from "next";
import { site } from "@/lib/site";
import { getTool } from "@/lib/tools";
import { ToolShell } from "@/components/ToolShell";
import { SchoolLookup } from "@/components/tools/SchoolLookup";

const tool = getTool("schools")!;

export const metadata: Metadata = {
  title: tool.title,
  description: tool.blurb,
  alternates: { canonical: `${site.url}/tools/${tool.slug}` },
};

export default function SchoolsPage() {
  return (
    <ToolShell
      tool={tool}
      note="A starting point, not the final word. Attendance zones are set by Greenville County Schools and can change year to year, so the district's own address locator is the only authoritative source for which schools a home is zoned to. Ratings from GreatSchools and the South Carolina report card are one input among many, and a school rating is never a stand-in for who lives in a neighborhood. Confirm the zoned schools with the district before you buy."
    >
      <SchoolLookup />
    </ToolShell>
  );
}
