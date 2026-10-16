"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Sends one anonymous pageview to /api/hit on each route change: the path and
 * the referring site, nothing else. See src/app/api/hit/route.ts.
 */
// The referrer only means something on the first view of a visit; after that,
// document.referrer still names the outside site on every client-side route
// change, which would credit it with views it did not send.
let firstView = true;

export default function PageHit() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname) return;
    const payload = JSON.stringify({ path: pathname, ref: firstView ? document.referrer : "" });
    firstView = false;
    try {
      if (!navigator.sendBeacon?.("/api/hit", new Blob([payload], { type: "application/json" }))) {
        fetch("/api/hit", { method: "POST", body: payload, keepalive: true, headers: { "content-type": "application/json" } });
      }
    } catch {
      // Counting is best effort and must never break a page.
    }
  }, [pathname]);
  return null;
}
