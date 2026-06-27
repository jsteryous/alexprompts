/**
 * Single source of truth for the free tools under /tools.
 *
 * The site is utility-first: a visitor should be able to *do* something useful
 * the moment they land, then subscribe because we were already useful once. This
 * registry drives the /tools hub, the homepage "Start here" row, and nav, so a
 * tool ships in exactly one place and shows up everywhere.
 *
 * Brand fit: the most on-brand tools FEED Claude (they hand you a ready-to-paste
 * prompt) rather than replace it. The calculators are the hard-data companions.
 * Keep copy in house voice (no em dashes, no fragments). Every tool page ends in
 * a soft subscribe capture; utility is the hook, email is the catch.
 */

export type ToolStatus = "live" | "soon";
export type ToolAudience = "agents" | "investors" | "both";

export interface ToolEntry {
  /** Route segment under /tools (also the registry key). */
  slug: string;
  title: string;
  /** One-line description for cards. Plain English, an outcome not a feature. */
  blurb: string;
  /** Who it is for. Renders as a chip. */
  audience: ToolAudience;
  status: ToolStatus;
  /** Card button label for live tools. */
  cta: string;
}

export const toolCatalog: ToolEntry[] = [
  {
    slug: "deal-analyzer",
    title: "Rental deal analyzer",
    blurb:
      "Type in a property and see the monthly cash flow, cap rate, and cash-on-cash return in seconds, no spreadsheet.",
    audience: "investors",
    status: "live",
    cta: "Run the numbers",
  },
  {
    slug: "mortgage",
    title: "Mortgage and affordability",
    blurb:
      "Work out a monthly payment, or run it backward to see the price a budget actually buys.",
    audience: "both",
    status: "live",
    cta: "Open calculator",
  },
  {
    slug: "listing-prompt",
    title: "Listing prompt builder",
    blurb:
      "Answer a few questions about the property and get a ready-to-paste Claude prompt that writes fair-housing-safe listing copy.",
    audience: "agents",
    status: "live",
    cta: "Build the prompt",
  },
  {
    slug: "area-scan",
    title: "Neighborhood area scan",
    blurb:
      "Drop an address and get a 60-second read on what is already nearby: amenities, density, and how crowded a category is.",
    audience: "investors",
    status: "soon",
    cta: "Coming soon",
  },
];

export function liveTools(): ToolEntry[] {
  return toolCatalog.filter((t) => t.status === "live");
}

export function getTool(slug: string): ToolEntry | undefined {
  return toolCatalog.find((t) => t.slug === slug);
}

export const audienceLabel: Record<ToolAudience, string> = {
  agents: "For agents",
  investors: "For investors",
  both: "Agents and investors",
};
