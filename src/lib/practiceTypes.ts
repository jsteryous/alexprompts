export type PracticeTypeSlug =
  | "cosmetic-dentist-website"
  | "pediatric-dentist-website"
  | "sedation-dentist-website"
  | "emergency-dentist-website"
  | "fee-for-service-dentist-website";

export type PracticeFixPattern = {
  label: string;
  problem: string;
  fix: string;
  result: string;
};

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
  fixesEyebrow: string;
  fixesHeadlineTop: string;
  fixesHeadlineBottom: string;
  fixesIntro: string;
  specificFixes: PracticeFixPattern[];
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
    fixesEyebrow: "What breaks for cosmetic practices",
    fixesHeadlineTop: "Cosmetic sites lose consults",
    fixesHeadlineBottom: "in three specific ways.",
    fixesIntro:
      "Across the cosmetic and implant sites we audit in the Upstate, three patterns repeat. Patients research veneers and Invisalign for weeks before they book \u2014 these are the places the site quietly loses them.",
    specificFixes: [
      {
        label: "Case-result burial",
        problem:
          "Before/after galleries live three clicks deep on a stale page with no treatment context. Patients can\u2019t see your work before they lose patience.",
        fix: "Above-the-fold case grid. Each result gets a short written narrative \u2014 treatment, timeline, outcome \u2014 so the work reads as proof, not decoration.",
        result: "Consult bookings climb because patients see the work before they scroll.",
      },
      {
        label: "Stock-photo hero",
        problem:
          "Homepage rotates generic smiling-stranger photos from a template library. Nothing signals that this practice actually does cosmetic work.",
        fix: "Single high-trust hero featuring a real before/after from the practice, paired with one sharp value claim \u2014 not a services list.",
        result: "Searchers who typed \u201cveneers near me\u201d see the work within a second of landing.",
      },
      {
        label: "Stale reviews page",
        problem:
          "Latest review shown is 14 months old. Cosmetic patients comparing two practices assume the newer reviews mean newer work.",
        fix: "Live feed of recent Google reviews, filtered toward cosmetic keywords, refreshed on every deploy. Schema marks them up so they surface in search.",
        result: "Social proof on the site matches what patients just saw on Google Maps.",
      },
    ],
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
    fixesEyebrow: "What breaks for pediatric practices",
    fixesHeadlineTop: "Pediatric sites lose parents",
    fixesHeadlineBottom: "in three specific ways.",
    fixesIntro:
      "Across the pediatric sites we audit in the Upstate, three patterns repeat. A parent on a phone at 8pm with a fussy child does not read your mission statement \u2014 these are the fixes that turn that tap into an appointment.",
    specificFixes: [
      {
        label: "90-second mobile form",
        problem:
          "Intake form asks 14 questions designed for adult oral surgery. Parent on a phone bails at field five.",
        fix: "Mobile form trimmed to name, child age, reason for visit, and best-time slot. Deeper fields expand only for existing patients.",
        result: "Booking completions climb on evenings and weekends \u2014 the windows parents actually have their hands free.",
      },
      {
        label: "No first-visit page",
        problem:
          "\u201cWhat to expect at your first visit\u201d is buried under Services \u2192 Pediatric \u2192 FAQ. Anxious parents give up and keep Googling.",
        fix: "Dedicated first-visit page linked from the hero, written at a sixth-grade reading level, with a short video if one exists.",
        result: "Parents who land with hesitation book instead of bouncing to a competitor whose site answers the question faster.",
      },
      {
        label: "Header phone not tap-to-call",
        problem:
          "Practice number is plain text \u2014 copy/paste only. The 8pm caller loses the number between tabs.",
        fix: "Sticky mobile header with a tap-to-call phone styled as a primary button. Desktop gets a text version; phones get the action.",
        result: "After-hours calls actually happen instead of being Googled again in the morning \u2014 by which point the parent has already booked somewhere else.",
      },
    ],
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
    fixesEyebrow: "What breaks for sedation practices",
    fixesHeadlineTop: "Sedation sites scare off",
    fixesHeadlineBottom: "the exact patients they need.",
    fixesIntro:
      "Across the sedation and anxiety-focused sites we audit in the Upstate, three patterns repeat. The patient searching \u201csedation dentist near me\u201d has put this off for years \u2014 these are the fixes that keep them from closing the tab.",
    specificFixes: [
      {
        label: "Services-grid homepage",
        problem:
          "Homepage opens with a twelve-tile services grid. It reads like a hospital, not a practice that understands fear.",
        fix: "Rewrite the homepage to open with \u201cYour first visit.\u201d Comfort amenities named up front: weighted blanket, headphones, nitrous, IV options.",
        result: "Searchers who specifically chose \u201csedation\u201d see reassurance in the first screen, not a procedure menu.",
      },
      {
        label: "No sedation-option breakdown",
        problem:
          "Site mentions \u201csedation dentistry\u201d once in passing. It doesn\u2019t explain nitrous vs. oral vs. IV or who each one is for.",
        fix: "Short plain-English page comparing sedation options \u2014 what each feels like, typical use cases, and the recovery window.",
        result: "Patients self-qualify before they call. The conversations get shorter and the no-show rate drops.",
      },
      {
        label: "Clinical language, no empathy",
        problem:
          "Copy leans on terms like \u201cdental anxiety\u201d and \u201coral sedation protocol.\u201d Patients don\u2019t Google themselves that way.",
        fix: "Rewrite for patient language: \u201chaven\u2019t been to a dentist in years,\u201d \u201cneedles terrify you,\u201d \u201cbad gag reflex,\u201d \u201clast visit was traumatic.\u201d",
        result: "Patients feel seen instead of clinical-ified. The call they\u2019ve been avoiding for five years actually gets made.",
      },
    ],
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
    fixesEyebrow: "What breaks for emergency practices",
    fixesHeadlineTop: "Emergency sites lose the call",
    fixesHeadlineBottom: "in three specific ways.",
    fixesIntro:
      "Across the emergency-focused sites we audit in the Upstate, three patterns repeat. A cracked molar at 9pm is the highest-intent query in dentistry \u2014 these are the places the site costs you the call.",
    specificFixes: [
      {
        label: "Phone not tap-to-call",
        problem:
          "Header number is rendered as plain text. The patient in pain has to copy, paste, and cross-check area codes before the call.",
        fix: "Sticky header with a tap-to-call phone and a live \u201cOpen now\u201d / \u201cAfter-hours line\u201d badge keyed to practice hours.",
        result: "Map-pack searches that land on the site convert on the first tap instead of scrolling to the next pin.",
      },
      {
        label: "Same-day availability hidden",
        problem:
          "Homepage doesn\u2019t mention walk-ins, emergency slots, or today\u2019s cutoff time. Patient assumes no openings and moves on.",
        fix: "\u201cSame-day emergency slots\u201d banner above the fold, keyed to today\u2019s availability with a clear cutoff time.",
        result: "High-intent mobile clicks actually call instead of bouncing back to the results page.",
      },
      {
        label: "No after-hours path",
        problem:
          "After-hours visitors hit a generic contact form and wait until Monday. True emergencies end up in the ER instead.",
        fix: "After-hours detection routes to an emergency hotline or a triage page with urgent-care guidance and the next-morning slot link.",
        result: "The practice captures real emergencies; non-emergencies get triaged without burning front-desk time in the morning.",
      },
    ],
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
    fixesEyebrow: "What breaks for fee-for-service practices",
    fixesHeadlineTop: "FFS sites still read",
    fixesHeadlineBottom: "like in-network ones.",
    fixesIntro:
      "Across the fee-for-service and membership sites we audit in the Upstate, three patterns repeat. Going out-of-network is a positioning decision \u2014 these are the places your website is still quietly undercutting it.",
    specificFixes: [
      {
        label: "\u201cWe accept most insurances\u201d",
        problem:
          "Homepage hero still positions the practice as in-network. Patients assume insurance billing and show up expecting a copay.",
        fix: "Rewrite the hero to lead with membership-plan value and transparent pricing. Move the insurance note to a single honest line further down.",
        result: "Insurance-only shoppers self-select out before they book. The patients who do call are already aligned with the model.",
      },
      {
        label: "Membership hidden in a PDF",
        problem:
          "Plan details live in a downloadable PDF with no pricing on the page. Patients bounce rather than download a flyer.",
        fix: "Membership tiers rendered as pricing cards on a live page \u2014 open pricing, included services, and a Stripe-backed \u201cJoin\u201d button.",
        result: "Plan signups convert on the site instead of requiring a phone call just to disclose the price.",
      },
      {
        label: "Opaque service pricing",
        problem:
          "No prices anywhere on the site. Visitors assume expensive, compare to an in-network competitor, and bounce.",
        fix: "Every common service shows a starting price. Membership-discounted prices render next to each as a visible reason to join.",
        result: "Transparent pricing reinforces the out-of-network positioning instead of fighting it.",
      },
    ],
  },
};

export const practiceTypeSlugs = Object.keys(practiceTypes) as PracticeTypeSlug[];

export const practiceTypeList: PracticeType[] = practiceTypeSlugs.map(
  (s) => practiceTypes[s],
);
