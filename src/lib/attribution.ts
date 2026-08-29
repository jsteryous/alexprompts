"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * First-party lead attribution, captured once on mount from the URL and the
 * referrer. No third-party analytics anywhere in this: the six fields below are
 * everything we know about where a lead came from, and they ride along on the
 * POST to /api/refer, which writes them onto the referral_leads row. The
 * read-side queries live in supabase/queries.sql.
 *
 * It lives here rather than inside a form because there are now two capture
 * surfaces (the full ReferralForm on /buying-or-selling and the compact
 * QuickContact on the Greenville agents landing page), and a second copy of this
 * logic is a second place for the field names to drift out of sync with the
 * route that stores them.
 *
 * `landingPath` is the path the form was SUBMITTED from, which is the useful
 * thing to know when more than one page carries a form.
 */
export interface Attribution {
  refSlug: string | null;
  referrer: string | null;
  landingPath: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
}

/** Capture attribution once, on mount. Read `.current` inside the submit handler. */
export function useAttribution(): RefObject<Attribution | null> {
  const attribution = useRef<Attribution | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const val = (k: string) => params.get(k)?.trim() || null;
    attribution.current = {
      refSlug: val("ref"),
      referrer: document.referrer || null,
      landingPath: window.location.pathname || null,
      utmSource: val("utm_source"),
      utmMedium: val("utm_medium"),
      utmCampaign: val("utm_campaign"),
    };
  }, []);

  return attribution;
}
