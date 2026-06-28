import type { Metadata } from "next";
import { site } from "@/lib/site";
import { getTool } from "@/lib/tools";
import { ToolShell } from "@/components/ToolShell";
import { BuyersList, type BuyersListData } from "@/components/tools/BuyersList";
import salesData from "@/data/commercialSales.json";

const tool = getTool("buyers-list")!;
const data = salesData as unknown as BuyersListData;

export const metadata: Metadata = {
  title: tool.title,
  description: tool.blurb,
  alternates: { canonical: `${site.url}/tools/${tool.slug}` },
};

export default function BuyersListPage() {
  return (
    <ToolShell
      tool={tool}
      note="Public records from Greenville County's GIS service, refreshed regularly. Buyer and seller names come straight from the county and are sometimes truncated; a buyer is the owner of record (often an LLC). Confirm any name, price, or address against the Register of Deeds before you act on it. This is information, not investment, legal, or financial advice."
    >
      <BuyersList data={data} />
    </ToolShell>
  );
}
