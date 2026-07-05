"use client";

import { useMemo, useState } from "react";

/**
 * Greenville school lookup. Deliberately NOT a home-grown attendance-zone
 * calculator: cloning the district's zone boundaries would be derivative and
 * risky to keep accurate, and getting a zone wrong on a home purchase is
 * harmful. Instead this is an honest launcher. The visitor enters an address
 * once and gets routed to the authoritative sources:
 *   - Greenville County Schools' official "Find Your School by Address" locator
 *     (the only authoritative source for the zoned schools),
 *   - GreatSchools for ratings and reviews,
 *   - the South Carolina school report card for state performance data.
 * Pure client-side, no API, no committed data to maintain. It just builds the
 * right links and explains how assignment works, with fair-housing care.
 */

const GCS_LOCATOR = "https://public.greenville.k12.sc.us/GeoAddress.aspx";
const SC_REPORT_CARD = "https://screportcards.com/";
const GREATSCHOOLS_CITY = "https://www.greatschools.org/south-carolina/greenville/";

type LinkCard = {
  label: string;
  tag: string;
  href: string;
  desc: string;
  primary?: boolean;
};

export function SchoolLookup() {
  const [address, setAddress] = useState("");

  const links = useMemo<LinkCard[]>(() => {
    const q = address.trim();
    const greatSchools = q
      ? `https://www.greatschools.org/search/search.page?q=${encodeURIComponent(q)}`
      : GREATSCHOOLS_CITY;
    return [
      {
        label: "Official zoned schools",
        tag: "Greenville County Schools",
        href: GCS_LOCATOR,
        desc: "The district's own address locator. This is the authoritative answer for which elementary, middle, and high school a home is zoned to. Enter the address on their page.",
        primary: true,
      },
      {
        label: "Ratings and reviews",
        tag: "GreatSchools",
        href: greatSchools,
        desc: q
          ? "Opens a GreatSchools search for the address you entered, with ratings, test scores, and parent reviews."
          : "GreatSchools ratings, test scores, and reviews for Greenville. Enter an address above to search it directly.",
      },
      {
        label: "State performance data",
        tag: "SC Report Card",
        href: SC_REPORT_CARD,
        desc: "South Carolina's official school report cards: academics, teacher data, and student progress by school.",
      },
    ];
  }, [address]);

  return (
    <div className="grid gap-6">
      <label className="block max-w-xl">
        <span className="theme-text-secondary text-sm font-medium">Address or neighborhood</span>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="123 Main St, Greenville, SC 29601"
          className="theme-field w-full py-2.5 px-3 text-sm mt-1.5"
        />
        <span className="theme-text-muted text-xs mt-1.5 block">
          Optional. It prefills the GreatSchools search and reminds you what to type into the
          district locator.
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        {links.map((l) => (
          <a
            key={l.tag}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`group rounded-xl border theme-border p-5 transition-colors ${
              l.primary ? "theme-card-strong" : "theme-card-muted"
            } hover:border-[var(--accent)]`}
          >
            <div className="theme-text-muted text-xs font-semibold uppercase tracking-widest">
              {l.tag}
            </div>
            <div className="theme-text-primary text-lg font-bold mt-1 flex items-center gap-1.5">
              {l.label}
              <span className="theme-text-muted transition-transform group-hover:translate-x-0.5">
                &rarr;
              </span>
            </div>
            <p className="theme-text-secondary text-sm mt-2 leading-relaxed">{l.desc}</p>
          </a>
        ))}
      </div>

      <div className="theme-card-muted border theme-border rounded-xl p-5 max-w-3xl">
        <div className="theme-text-muted text-xs font-semibold uppercase tracking-widest">
          How assignment works in Greenville
        </div>
        <p className="theme-text-secondary text-sm mt-2 leading-relaxed">
          Most Greenville County students are assigned to schools by their home address, so the
          zoned schools travel with the house. The district also runs magnet, charter, and choice
          programs you can apply to outside your zone. Zone lines get redrawn as schools open and
          enrollment shifts, so a listing or an old map is not a guarantee. Before you make an offer
          on a home for its schools, confirm the current zones with the district and, if a specific
          program matters, check its application window and seats.
        </p>
      </div>
    </div>
  );
}
