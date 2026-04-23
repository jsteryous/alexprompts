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

export type PracticeFaq = { q: string; a: string };

export type PracticeType = {
  slug: PracticeTypeSlug;
  label: string;
  image: string;
  imagePosition?: string;
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
  specialtyFaqs: PracticeFaq[];
};

export const practiceTypes: Record<PracticeTypeSlug, PracticeType> = {
  "cosmetic-dentist-website": {
    slug: "cosmetic-dentist-website",
    label: "Cosmetic",
    image: "/practice-types/cosmetic.jpg",
    imagePosition: "60% center",
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
    specialtyFaqs: [
      {
        q: "How do we show before/after photos without creating a HIPAA problem?",
        a: "Written patient authorization in your chart before any image leaves the operatory, and “for marketing use on rebbadvisors-style practice websites” as an explicit scope. We render case-result images from your own S3 bucket with no EXIF, no patient identifiers in filenames, and no crops that include tattoos, jewelry, or anything that could identify the patient. Anything borderline stays off the site.",
      },
      {
        q: "Should the homepage H1 say “veneers” or “cosmetic dentistry”?",
        a: "Depends on the audit. “Veneers” has higher commercial intent but lower volume; “cosmetic dentistry” is broader. If your Google Business Profile and review keywords lean heavily toward veneers or Invisalign, the H1 should too. The proposal picks a side based on what the search data actually shows — no guesswork.",
      },
      {
        q: "Do Invisalign-only practices need a different site than implant-heavy ones?",
        a: "Yes. Invisalign buyers are younger, mobile-first, and convert on clear pricing and treatment length. Implant buyers are older, research trust signals longer, and convert on surgeon credentials and full-arch case results. Same visual system can serve both, but the homepage hero and the case-result ordering are not the same.",
      },
      {
        q: "Can case-result photos actually hurt our Google ranking if they’re slow?",
        a: "Yes. Above-the-fold cosmetic case photos are usually the largest contentful paint on the page. Ship them at the wrong compression and you tank mobile Lighthouse, which Map Pack weights. Cleanup includes compressing and serving them in modern formats so the proof-of-work doesn’t cost you the search position that surfaces it.",
      },
    ],
  },
  "pediatric-dentist-website": {
    slug: "pediatric-dentist-website",
    label: "Pediatric",
    image: "/practice-types/pediatric.jpg",
    imagePosition: "30% center",
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
    specialtyFaqs: [
      {
        q: "What should a pediatric first-visit page actually include?",
        a: "The four things a nervous parent wants to know, in order: what the room looks like, whether they can be in it, what will and won't happen on the first appointment, and how long it takes. Written at a sixth-grade reading level, with a short video if you have one. Links to the intake form and directions go at the bottom, not the top.",
      },
      {
        q: "Should the homepage feel kid-styled or stay professional?",
        a: "Neither extreme works. Parents book; kids visit. A site that leans hard into cartoon branding reads as unserious to the decision-maker. A fully clinical site reads as intimidating to the five-year-old. The right balance is warm, bright, human photography and clear parent-facing copy — kid-facing touches belong in the operatory, not on the homepage.",
      },
      {
        q: "Do we need separate intake flows for new vs. existing patients?",
        a: "Yes. New-patient intake captures what the practice needs to book the first visit. The existing-patient path is usually one field (child name) plus a reason-for-visit dropdown and the calendar. Merging them into a single 14-field form is the single biggest reason pediatric mobile booking rates crater.",
      },
      {
        q: "Does adding video to the homepage help or hurt?",
        a: "Helps if the video is short (under 30 seconds), auto-muted, and compressed. Hurts on Lighthouse if it's a 12MB MP4 loading over LTE before the page paints. The audit tells you which column you're in and the Cleanup handles compression and poster frames if you're staying with video.",
      },
    ],
  },
  "sedation-dentist-website": {
    slug: "sedation-dentist-website",
    label: "Sedation / Anxiety",
    // TODO: replace /public/practice-types/sedation.jpg — current asset is ~22KB / ~600x400
    // and pixelates on the 520px hero. Re-source at ≥1600px wide, compress to ~150–250 KB.
    image: "/practice-types/sedation.jpg",
    imagePosition: "center 40%",
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
    specialtyFaqs: [
      {
        q: "Should sedation dentistry be in the H1 or only in the navigation?",
        a: "In the H1, if sedation is the wedge specialty that differentiates your practice from generalists nearby. Patients who type \"sedation dentist near me\" are pre-committed to the category — they need to see the word within the first screen, not discover it three clicks in. If sedation is one of several services and not the positioning, it belongs in the services section with its own landing page.",
      },
      {
        q: "Is it worth a dedicated page per sedation option (nitrous, oral, IV)?",
        a: "Usually yes. \"Sedation options\" as a single page tries to serve three different patients and ends up reassuring none of them. Short, plain-English per-option pages — what each feels like, who it's right for, recovery window, cost range — convert better and rank for separate long-tail queries in the same funnel.",
      },
      {
        q: "How do we talk about recovery without scaring patients?",
        a: "Concrete over vague. \"You'll feel groggy for about 2 hours and won't remember most of the visit — you'll need someone to drive you home\" reads safer than clinical language about half-lives and depressant mechanisms. Patients fear what they can't picture; specifics de-escalate.",
      },
      {
        q: "Does naming comfort amenities (weighted blanket, headphones) actually matter?",
        a: "Yes. Anxious patients pattern-match on small, tangible signals that the practice has thought about fear. A $40 weighted blanket in the operatory, named on the site, is a stronger trust signal than a paragraph about \"our compassionate approach.\" The Cleanup audit pulls this language into a single reassurance block on the homepage.",
      },
    ],
  },
  "emergency-dentist-website": {
    slug: "emergency-dentist-website",
    label: "Emergency",
    image: "/practice-types/emergency.jpg",
    imagePosition: "70% center",
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
    specialtyFaqs: [
      {
        q: "Is a dedicated emergency phone line worth paying for?",
        a: "If emergency is a real share of your revenue, yes. A second line routed to the on-call doctor after hours keeps real emergencies from going to the ER while the main line stays clean for next-day scheduling. If emergencies are incidental to a general practice, a single line with clear after-hours routing on the site is fine — the decision comes down to whether the site actually advertises emergency care as a service or just mentions it in passing.",
      },
      {
        q: "How should the site behave after hours?",
        a: "Two paths. Either the header swaps to a live \"After-hours line\" badge that points at the on-call doctor's line, or it surfaces a short triage page: \"Is this a true emergency?\" with plain-language guidance, an ER fallback link for severe symptoms, and a prominent \"book first slot tomorrow\" button. The Cleanup wires whichever model matches your actual after-hours coverage.",
      },
      {
        q: "Should \"emergency\" be a top-level page or hidden under services?",
        a: "Top-level. \"Emergency dentist near me\" is a distinct search intent from \"family dentist near me\" and it rewards dedicated pages with clear schema. Burying it under /services/emergency cedes the keyword to competitors who put it in their navigation.",
      },
      {
        q: "What's the right definition of \"same-day\" for our availability banner?",
        a: "Honest is the right definition. If you hold two emergency slots that cut off at 3pm, the banner says \"same-day slots open until 3pm today\" and goes dark after. A banner that promises same-day when the schedule is full torches trust the moment the patient calls and hears otherwise. Cleanup wires the banner to your calendar or practice hours — not to a guess.",
      },
    ],
  },
  "fee-for-service-dentist-website": {
    slug: "fee-for-service-dentist-website",
    label: "Fee-for-service / Membership",
    // TODO: replace /public/practice-types/membership.jpg — current asset is a clinical
    // microscope shot that has no visual connection to membership / transparent pricing.
    // Recommended subject: front-desk patient-facing pricing conversation, an iPad with
    // plan tiers, a signed membership card, or a handshake at check-in.
    image: "/practice-types/membership.jpg",
    imagePosition: "40% center",
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
    specialtyFaqs: [
      {
        q: "Should we still say \"we accept insurance\" if we file out-of-network?",
        a: "Not in the hero. An honest single line further down — \"We're out-of-network with most PPOs. We'll file for you and most patients recover 50–80% of the visit cost\" — is fine, and actually earns trust because it manages expectations. The hero is reserved for the thing that differentiates you: membership pricing and transparency.",
      },
      {
        q: "How explicit does service pricing need to be on the site?",
        a: "Starting prices per common procedure, at minimum. Ranges are acceptable (\"Crowns: $1,200–$1,800 depending on material\"). Opaque sites drive every pricing question into a phone call that often ends in no-shows; explicit pricing pre-qualifies the patient before the front desk ever talks to them.",
      },
      {
        q: "Do we need a Stripe-backed membership signup or is a PDF and manual enrollment fine?",
        a: "Stripe-backed whenever possible. Manual enrollment is a drop-off point: the patient has to print, sign, bring it in, and wait for activation. A \"Join\" button that collects payment and triggers a same-day welcome email converts significantly better. Cleanup scope includes the Stripe + welcome-email wiring if it isn't in place.",
      },
      {
        q: "What's the right way to talk about dropping insurance on the site?",
        a: "Once, briefly, framed around patient benefit: \"We left the insurance treadmill so we can spend real time with you and price every service honestly.\" Then never again. Repeating the insurance decision across the site turns it into the main story. It shouldn't be — the membership value and the transparent pricing should be.",
      },
    ],
  },
};

export const practiceTypeSlugs = Object.keys(practiceTypes) as PracticeTypeSlug[];

export const practiceTypeList: PracticeType[] = practiceTypeSlugs.map(
  (s) => practiceTypes[s],
);
