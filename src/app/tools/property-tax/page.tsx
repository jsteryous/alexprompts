import type { Metadata } from "next";
import { site } from "@/lib/site";
import { getTool } from "@/lib/tools";
import { ToolShell } from "@/components/ToolShell";
import { PropertyTax } from "@/components/tools/PropertyTax";

const tool = getTool("property-tax")!;

export const metadata: Metadata = {
  title: tool.title,
  description: tool.blurb,
  alternates: { canonical: `${site.url}/tools/${tool.slug}` },
};

export default function PropertyTaxPage() {
  return (
    <ToolShell
      tool={tool}
      note="An estimate, not a tax bill. South Carolina property tax runs on assessed value (4% of market value for an owner-occupied primary residence, 6% for a second home or rental) times your district's millage, and under Act 388 an owner-occupied home does not pay the school operating millage. Millage varies across Greenville County's 100-plus tax districts and changes at each reassessment, so the defaults here are representative Greenville County figures, not your exact district. Confirm your district's millage on the county Auditor's millage sheet, and your final number comes from the county Assessor and Auditor."
    >
      <PropertyTax />
    </ToolShell>
  );
}
