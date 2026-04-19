export type ClusterSlug =
  | "booking-forms"
  | "mobile-experience"
  | "trust-and-stale-content"
  | "lighthouse-core-vitals"
  | "cleanup-vs-rebuild";

export type Cluster = {
  slug: ClusterSlug;
  name: string;
  hubTitle: string;
  intro: string;
  description: string;
};

export const clusters: Record<ClusterSlug, Cluster> = {
  "booking-forms": {
    slug: "booking-forms",
    name: "Booking & Contact Forms",
    hubTitle: "Broken Booking & Contact Forms on Dental Websites",
    intro:
      "When a contact or booking form silently 404s, the practice never finds out. New patients fill in their details, hit Submit, and land on a blank page — then they call the practice down the street. These articles cover how forms break, how to test yours in under a minute, and what to fix first.",
    description:
      "How dental practice websites lose new patients to silently broken booking and contact forms — how to detect, test, and fix them.",
  },
  "mobile-experience": {
    slug: "mobile-experience",
    name: "Mobile Experience",
    hubTitle: "Mobile Experience on Dental Practice Websites",
    intro:
      "Most dental-website visitors arrive on a phone. Sites designed around desktop — no viewport tag, cramped layouts, tap targets that miss — lose them in under five seconds. These articles cover what breaks on mobile and what a clean mobile dental site actually looks like.",
    description:
      "Why dental websites fail on mobile, how the viewport tag and layout choices lose patients, and what a clean mobile site looks like.",
  },
  "trust-and-stale-content": {
    slug: "trust-and-stale-content",
    name: "Trust Signals & Stale Content",
    hubTitle: "Trust Signals, Stale Content & Google Profile Alignment",
    intro:
      "A 2019 copyright year. Stock photos of strangers in lab coats. An insurance list three years out of date. A Google Business Profile that does not match the website. These signals tell a first-time patient the practice is either abandoned or careless. These articles cover what a new patient checks in the first ten seconds, and how to fix what is actively damaging trust.",
    description:
      "New-patient trust signals on dental websites: staff photos, stale copyright, insurance pages, and Google Business Profile alignment.",
  },
  "lighthouse-core-vitals": {
    slug: "lighthouse-core-vitals",
    name: "Site Speed & Core Web Vitals",
    hubTitle: "Dental Website Speed, Lighthouse Scores & Core Web Vitals",
    intro:
      "Slow dental sites hurt twice — patients bounce before the page loads, and Google demotes the site in local results. These articles cover what actually makes a dental website slow (usually uncompressed hero images and a stack of tracking pixels), how to read a Lighthouse score without a developer, and which problems are cheap cleanup vs. which need a rebuild.",
    description:
      "What actually makes dental websites slow, how to read a Lighthouse score without a developer, and which problems are cheap to fix.",
  },
  "cleanup-vs-rebuild": {
    slug: "cleanup-vs-rebuild",
    name: "Cleanup vs. Rebuild",
    hubTitle: "When a Dental Website Needs a Cleanup vs. a Full Rebuild",
    intro:
      "Not every broken dental website should be cleaned up. Sometimes the foundation is gone and cleanup is throwing good money after bad. These articles cover the signals that cleanup is the right call, the signals that a rebuild is the only honest answer, and what a rebuild actually involves.",
    description:
      "How to tell if a dental practice website needs a quick cleanup or a full rebuild — specific signals and honest tradeoffs.",
  },
};

export const clusterSlugs = Object.keys(clusters) as ClusterSlug[];

export function isClusterSlug(x: unknown): x is ClusterSlug {
  return typeof x === "string" && (clusterSlugs as string[]).includes(x);
}
