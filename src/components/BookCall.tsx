"use client";

import { bookingUrl, phoneNumber, telHref } from "@/lib/booking";

/**
 * The one button. It opens the scheduling page, and the visitor picks a time.
 *
 * This is the shortest honest path from a stranger reading the page to Alex on
 * the phone with them. The form below it (QuickContact / ReferralForm) is the
 * net for everyone who will not commit to a slot yet, and it stays: a scheduler
 * converts the decided and loses the undecided, so the page needs both.
 *
 * ATTRIBUTION SURVIVES THE HOP. The rendered href is the bare booking URL, so
 * server render, a no-JS visitor, a middle click, and "copy link address" all
 * get something that works. A real click builds the attributed URL instead,
 * carrying whatever the page was loaded with (?ref= from an in-article CTA, any
 * utm_*) plus the path that produced the booking, which is the one thing the
 * scheduling provider cannot know on its own. Cal.com, Calendly, and Google
 * appointment schedules all ignore parameters they do not recognise, so this is
 * safe on any of them, and a booking arriving through a provider webhook can
 * still be traced back to the article that earned it.
 *
 * The URL is built in the handler rather than in an effect on purpose: writing
 * state from an effect to patch an href causes a hydration-time render for no
 * benefit, and the eslint rule that forbids it is right.
 *
 * `layout` exists because this renders in two shapes: `hero` is the primary
 * action at the top of a conversion page, `inline` is a quieter version that
 * sits beside other copy.
 *
 * Renders NOTHING when NEXT_PUBLIC_BOOKING_URL is unset (see src/lib/booking.ts).
 * A "book a call" button that 404s is worse than no button on the one page a
 * stranger uses to decide whether this site is run by a real person.
 */
export function BookCall({ layout = "hero" }: { layout?: "hero" | "inline" }) {
  const base = bookingUrl();
  const phone = phoneNumber();

  if (!base) return null;

  /** The booking URL with this page's attribution appended. */
  function attributedHref(bookingBase: string): string {
    const from = new URLSearchParams(window.location.search);
    const carry = new URLSearchParams();
    for (const key of ["ref", "utm_source", "utm_medium", "utm_campaign"]) {
      const v = from.get(key)?.trim();
      if (v) carry.set(key, v);
    }
    carry.set("utm_content", window.location.pathname);
    return `${bookingBase}${bookingBase.includes("?") ? "&" : "?"}${carry.toString()}`;
  }

  function open(e: React.MouseEvent<HTMLAnchorElement>) {
    // Leave modified clicks alone so the browser does its normal thing; the
    // plain href is already a working link.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    window.open(attributedHref(base!), "_blank", "noopener,noreferrer");
  }

  const hero = layout === "hero";

  return (
    <div className={hero ? "" : "flex flex-wrap items-center gap-x-5 gap-y-2"}>
      <a
        href={base}
        onClick={open}
        target="_blank"
        rel="noopener noreferrer"
        className={`theme-cta-accent inline-flex items-center justify-center gap-2 font-semibold ${
          hero ? "w-full px-6 py-4 text-base" : "px-5 py-3 text-sm"
        }`}
      >
        <svg
          width="18"
          height="18"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
          className="shrink-0"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        Book a 15-minute call
      </a>

      {phone && (
        <p
          className={`theme-text-muted type-small leading-relaxed ${hero ? "mt-3 text-center" : ""}`}
        >
          Or call or text me at{" "}
          <a href={telHref(phone)} className="theme-link underline whitespace-nowrap">
            {phone}
          </a>
          .
        </p>
      )}
    </div>
  );
}
