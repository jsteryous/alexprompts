export type PracticeTypeSlug =
  | "cosmetic-dentist-website"
  | "pediatric-dentist-website"
  | "sedation-dentist-website"
  | "emergency-dentist-website"
  | "fee-for-service-dentist-website";

export type PracticeType = {
  slug: PracticeTypeSlug;
  label: string;
  image: string;
  alt: string;
  headline: string;
  bullets: string[];
  heroEyebrow: string;
  heroH1Top: string;
  heroH1Bottom: string;
  heroLede: string;
  heroBody: string;
  metaTitle: string;
  metaDescription: string;
  serviceName: string;
  serviceDescription: string;
};

export const practiceTypes: Record<PracticeTypeSlug, PracticeType> = {
  "cosmetic-dentist-website": {
    slug: "cosmetic-dentist-website",
    label: "Cosmetic",
    image: "/practice-types/cosmetic.jpg",
    alt: "Close-up of a bright cosmetic dentistry smile",
    headline: "Cosmetic patients buy trust before they buy work.",
    bullets: [
      "Case results and before/afters above the fold.",
      "Short written narratives on every outcome.",
    ],
    heroEyebrow: "Cosmetic Dentist Website Design \u00b7 Greenville SC",
    heroH1Top: "Your cosmetic dental site",
    heroH1Bottom: "sells trust before work.",
    heroLede:
      "Website cleanup and rebuilds for cosmetic and implant practices across Greenville and the Upstate. Starting at $1,500. Screenshots of what\u2019s broken before you pay a dollar.",
    heroBody:
      "Veneers, Invisalign, and full-arch patients research for weeks before they book. If your before/afters live three clicks deep, your homepage is a headshot carousel, and the reviews page is stale, the consult never happens. We put case results above the fold, give every outcome a written narrative, and make the booking path match the price tag.",
    metaTitle: "Cosmetic Dentist Website Design | Greenville SC | REBB Advisors",
    metaDescription:
      "Cosmetic and implant dentist website cleanup and rebuilds in Greenville, SC. Case results above the fold, HIPAA-compliant intake, mobile-first booking. Starting at $1,500. Free audit first.",
    serviceName: "Cosmetic Dentist Website Design and Cleanup",
    serviceDescription:
      "Website cleanup and scoped rebuilds for cosmetic and implant dental practices \u2014 case-result galleries above the fold, HIPAA-compliant intake, mobile-first booking path, speed pass. Starting at $1,500.",
  },
  "pediatric-dentist-website": {
    slug: "pediatric-dentist-website",
    label: "Pediatric",
    image: "/practice-types/pediatric.jpg",
    alt: "Parent and child at a pediatric dental visit",
    headline: "A parent on a phone at 8pm will book in 30 seconds \u2014 or not at all.",
    bullets: [
      "Mobile booking path finishes under 30 seconds.",
      "\u201cWhat the first visit looks like\u201d above the scroll.",
    ],
    heroEyebrow: "Pediatric Dentist Website Design \u00b7 Greenville SC",
    heroH1Top: "Your pediatric dental site",
    heroH1Bottom: "has thirty seconds.",
    heroLede:
      "Website cleanup and rebuilds for pediatric practices across Greenville and the Upstate. Starting at $1,500. Screenshots of what\u2019s broken before you pay a dollar.",
    heroBody:
      "A parent on a phone at 8pm with a crying five-year-old does not read your mission statement. They tap, they need the answer to \u201cwill this be okay?\u201d in two seconds, and they book. If your site buries first-visit details behind a dropdown and the booking form takes 90 seconds on mobile, you lose the appointment to the next pin on the map.",
    metaTitle: "Pediatric Dentist Website Design | Greenville SC | REBB Advisors",
    metaDescription:
      "Pediatric dentist website cleanup and rebuilds in Greenville, SC. Mobile booking under 30 seconds, first-visit page above the fold, HIPAA-compliant intake. Starting at $1,500. Free audit first.",
    serviceName: "Pediatric Dentist Website Design and Cleanup",
    serviceDescription:
      "Website cleanup and scoped rebuilds for pediatric dental practices \u2014 mobile booking under 30 seconds, first-visit reassurance above the fold, HIPAA-compliant intake, speed pass. Starting at $1,500.",
  },
  "sedation-dentist-website": {
    slug: "sedation-dentist-website",
    label: "Sedation / Anxiety",
    image: "/practice-types/sedation.jpg",
    alt: "Calm, relaxed patient in a sedation dentistry chair",
    headline: "Fearful patients don\u2019t need a services grid. They need reassurance first.",
    bullets: [
      "Homepage leads with \u201cYour first visit.\u201d",
      "Comfort amenities named: weighted blanket, headphones, nitrous.",
    ],
    heroEyebrow: "Sedation Dentist Website Design \u00b7 Greenville SC",
    heroH1Top: "Fearful patients don\u2019t read",
    heroH1Bottom: "a services grid.",
    heroLede:
      "Website cleanup and rebuilds for sedation and anxiety-focused practices across Greenville and the Upstate. Starting at $1,500. Screenshots of what\u2019s broken before you pay a dollar.",
    heroBody:
      "The patient who searches \u201csedation dentist near me\u201d has put this off for years. Your homepage gets one shot to say \u201cyou won\u2019t feel it, you won\u2019t remember it, and here\u2019s what the first visit looks like.\u201d A generic services carousel sends them back to Google. Lead with the reassurance, name the amenities, and make the consult request a single tap.",
    metaTitle: "Sedation Dentist Website Design | Greenville SC | REBB Advisors",
    metaDescription:
      "Sedation dentist website cleanup and rebuilds in Greenville, SC. Reassurance-first homepage, comfort amenities named, HIPAA-compliant intake. Starting at $1,500. Free audit first.",
    serviceName: "Sedation Dentist Website Design and Cleanup",
    serviceDescription:
      "Website cleanup and scoped rebuilds for sedation and anxiety-focused dental practices \u2014 reassurance-led homepage, comfort amenities named, HIPAA-compliant intake, speed pass. Starting at $1,500.",
  },
  "emergency-dentist-website": {
    slug: "emergency-dentist-website",
    label: "Emergency",
    image: "/practice-types/emergency.jpg",
    alt: "Patient holding jaw in pain, using phone",
    headline:
      "Your site should be the first result when someone types \u201cemergency dentist near me.\u201d",
    bullets: [
      "Tap-to-call header with \u201cOpen now\u201d status.",
      "Same-day slots surfaced above the fold.",
    ],
    heroEyebrow: "Emergency Dentist Website Design \u00b7 Greenville SC",
    heroH1Top: "Emergency dentist searches",
    heroH1Bottom: "close in under a minute.",
    heroLede:
      "Website cleanup and rebuilds for emergency-focused practices across Greenville and the Upstate. Starting at $1,500. Screenshots of what\u2019s broken before you pay a dollar.",
    heroBody:
      "A cracked molar at 9pm is the highest-intent query in dentistry. The patient is not comparing five sites. They tap the first map pin, they want a phone number their thumb can hit, and they want to see \u201copen now\u201d before they scroll. If your header phone is plain text and your same-day slots are buried, the call goes to whoever wired it right.",
    metaTitle: "Emergency Dentist Website Design | Greenville SC | REBB Advisors",
    metaDescription:
      "Emergency dentist website cleanup and rebuilds in Greenville, SC. Tap-to-call header, \u201copen now\u201d status, same-day slots above the fold. Starting at $1,500. Free audit first.",
    serviceName: "Emergency Dentist Website Design and Cleanup",
    serviceDescription:
      "Website cleanup and scoped rebuilds for emergency-focused dental practices \u2014 tap-to-call header, \u201copen now\u201d availability surfaced above the fold, HIPAA-compliant intake, speed pass. Starting at $1,500.",
  },
  "fee-for-service-dentist-website": {
    slug: "fee-for-service-dentist-website",
    label: "Fee-for-service / Membership",
    image: "/practice-types/membership.jpg",
    alt: "Membership pricing and transparent dental billing",
    headline: "If you\u2019ve walked away from insurance, your website still acts like you take it.",
    bullets: [
      "Membership tiers priced openly, Stripe-backed signup.",
      "Every service transparently costed.",
    ],
    heroEyebrow: "Fee-for-service Dentist Website Design \u00b7 Greenville SC",
    heroH1Top: "You left insurance.",
    heroH1Bottom: "Your site didn\u2019t.",
    heroLede:
      "Website cleanup and rebuilds for fee-for-service and membership dental practices across Greenville and the Upstate. Starting at $1,500. Screenshots of what\u2019s broken before you pay a dollar.",
    heroBody:
      "Going out-of-network is a positioning decision. Your website has to make it one. That means membership tiers priced openly, every service transparently costed, a Stripe-backed signup that actually closes, and a homepage that does not lead with \u201cwe accept most insurances.\u201d If your site still reads like an in-network practice, patients assume that\u2019s the plan.",
    metaTitle:
      "Fee-for-service Dentist Website Design | Greenville SC | REBB Advisors",
    metaDescription:
      "Fee-for-service and membership dentist website cleanup and rebuilds in Greenville, SC. Transparent pricing, Stripe-backed membership signup, HIPAA-compliant intake. Starting at $1,500. Free audit first.",
    serviceName: "Fee-for-service Dentist Website Design and Cleanup",
    serviceDescription:
      "Website cleanup and scoped rebuilds for fee-for-service and membership dental practices \u2014 transparent pricing pages, Stripe-backed membership signup, HIPAA-compliant intake, speed pass. Starting at $1,500.",
  },
};

export const practiceTypeSlugs = Object.keys(practiceTypes) as PracticeTypeSlug[];

export const practiceTypeList: PracticeType[] = practiceTypeSlugs.map(
  (s) => practiceTypes[s],
);
