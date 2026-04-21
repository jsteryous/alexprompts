import Link from "next/link";
import type { Metadata } from "next";
import { marked } from "marked";

export const metadata: Metadata = {
  title: "Sample Proposal | REBB Advisors",
  description:
    "An example of the written proposal every REBB audit produces. Sanitized for a fictional Greenville dental practice: findings, recommended tier, scope, timeline, and terms.",
  openGraph: {
    title: "Sample Proposal | REBB Advisors",
    description:
      "What you get after a REBB audit: a written proposal with findings, a recommended tier, and a real scope. This one is a sanitized example.",
    type: "article",
    url: "https://rebbadvisors.com/sample-proposal",
    siteName: "REBB Advisors",
  },
  alternates: { canonical: "https://rebbadvisors.com/sample-proposal" },
};

const proposalMarkdown = `# Website Proposal — Pinecrest Family Dentistry

**Prepared for:** Pinecrest Family Dentistry — Greenville, SC
**Prepared by:** REBB Advisors
**Date:** April 19, 2026
**Proposal valid:** 30 days

---

## Executive Summary

Your audit surfaced seven issues. Two are critical — the new-patient booking form silently drops submissions, and the mobile viewport is not set. Two more (Lighthouse 38 on mobile, an unclaimed Google Business Profile) are the reason newer practices in Greenville are ranking above Pinecrest despite smaller patient bases.

Cleanup alone would fix the critical issues and buy breathing room, but it will not close the ranking and visibility gaps. For a practice your size (≈1,400 active patients, one location, two providers), **we recommend Tier 2 — Growth**. It fixes the breakage, installs the infrastructure that actually moves local rankings, and runs month-to-month so you can cancel the moment it is not producing.

Dominance is overkill at your current scale. Revisit it in 12–18 months if you add a second location or a third provider.

---

## Audit Findings

### 🔴 Critical

**1. Booking form returns HTTP 405**
The new-patient form on \`/appointments\` posts to an endpoint that no longer exists. Every submission silently fails. Estimated impact: 8–14 lost patient inquiries per month.

**2. Mobile viewport not set**
The site renders the desktop layout pinch-zoomed on phones. 71% of new-patient searches are mobile. Current mobile bounce rate: 78% (vs. 34% on desktop).

### 🟠 High

**3. Lighthouse mobile score: 38**
Page loads in 5.2 seconds on 4G. Largest Contentful Paint 4.8s, Total Blocking Time 920ms. Google Search Console shows ranking decline tied to Core Web Vitals failures starting Q3 2025.

**4. Google Business Profile unclaimed**
Your listing at 2100 Poinsett Hwy shows an auto-generated profile with no hours, no photos, no services. Competing practices rank above you in the map pack with 40+ reviews each.

### 🟡 Medium

**5. No structured data**
Missing LocalBusiness, Dentist, and Service schema. Google cannot confidently surface your hours, location, insurance accepted, or specialties in rich results.

**6. Thin service pages**
Five of nine service pages are under 200 words. In a market with 14 competing general dentists, this caps your ability to rank for procedure-specific terms (crowns, Invisalign, implants).

### ⚪ Low

**7. Footer copyright stuck at 2019**
A visible trust leak. Prospects reading the footer assume the practice is closed or inactive. Takes four minutes to fix.

---

## 🥉 Tier 1 — Cleanup

### "Stop the bleeding."

**Investment:** $1,500 (one-time)
**Timeline:** 48-hour turnaround
**Monthly ongoing:** None

### What's included

- Booking-form diagnosis and repair
- Mobile viewport + layout fixes on key pages
- Trust cleanup: copyright year, broken links, SSL verification
- Basic modernization: hero, CTAs, contact path
- Before/after screenshots at handoff

### What's NOT included

- Ongoing SEO or content work
- Google Business Profile management
- Schema / structured data implementation
- Visual redesign

### Ideal for

- Practices with a basically-working site that only needs the breakage fixed
- Owners who are already ranking well and do not need marketing support
- Anyone who wants to test REBB before committing to a retainer

---

## 🥈 Tier 2 — Growth  *(Recommended)*

### "Start actually ranking."

**Investment:** $3,500 (one-time setup)
**Timeline:** 2–3 week build, ongoing from month 2
**Monthly ongoing:** $500 / month — month-to-month, 30-day cancel

### What's included

**Everything in Cleanup, plus:**

- LocalBusiness + Dentist schema markup
- Google Business Profile: claim, optimize, photograph, populate services and insurance
- On-page SEO on home + top 5 service pages
- 2 patient-facing blog posts per month (SEO-optimized, published to your site)
- Review monitoring + response templates
- NAP (name/address/phone) consistency audit across 15+ local directories
- Monthly report by email: what shipped, what moved, what's next

### What's NOT included

- Visual redesign (that's Dominance)
- Paid ads management
- Social media management
- More than 2 posts per month

### Ideal for

- Established practices that want the phone to ring more
- Owners who do not want to hire a marketing person in-house
- Practices currently below the map pack for their primary keywords

---

## 🥇 Tier 3 — Dominance

### "Own the local market."

**Investment:** Custom scope — setup and monthly retainer quoted in the proposal. For a practice at Pinecrest's scale, Dominance is more than needed; the tier is usually scoped for multi-provider or expansion-stage practices.
**Timeline:** Confirmed in proposal
**Retainer:** Month-to-month, 30-day cancel

### What's included

**Everything in Growth, plus:**

- Visual refresh / redesign (conversion-focused)
- 4 long-form blog posts per month
- Active link building: 3–5 quality backlinks per month
- Review generation automation
- Before/after galleries + treatment landing pages
- Insurance + new-patient landing pages
- Core Web Vitals + conversion rate optimization pass each quarter
- Quarterly strategy review call

### Ideal for

- Multi-provider or expansion-stage practices
- Practices planning a second location
- Owners ready to out-rank every other dentist in the county

---

## Side-by-Side Comparison

| Feature                              | Cleanup        | Growth          | Dominance       |
| ------------------------------------ | -------------- | --------------- | --------------- |
| **Setup investment**                 | $1,500         | $3,500          | Custom          |
| **Monthly ongoing**                  | None           | $500            | Custom          |
| **Timeline**                         | 48 hours       | 2–3 weeks       | Quoted          |
| Booking-form repair                  | ✓              | ✓               | ✓               |
| Mobile viewport + layout fixes       | ✓              | ✓               | ✓               |
| Basic modernization                  | ✓              | ✓               | ✓               |
| Schema markup                        | —              | ✓               | ✓               |
| Google Business Profile management   | —              | ✓               | ✓               |
| On-page SEO                          | —              | Top 5 pages     | All pages       |
| Blog posts / month                   | —              | 2               | 4               |
| Review monitoring                    | —              | ✓               | ✓ + generation  |
| Active link building                 | —              | —               | 3–5 / month     |
| Visual refresh / redesign            | —              | —               | ✓               |
| Landing pages (insurance, services)  | —              | —               | ✓               |
| Quarterly CRO pass                   | —              | —               | ✓               |
| Contract term                        | One-time       | Month-to-month  | Month-to-month  |

---

## Recommended Tier for Pinecrest: Growth

The reasoning, in one paragraph:

Your site is not broken enough to only need Cleanup. Fixing the form and viewport stops the bleeding, but you will still be sitting below the map pack with no schema, no GBP, and five thin service pages. Those are the gaps that actually cost you rankings — and they will not close themselves. At the same time, Dominance is more than Pinecrest needs. A full redesign and four posts a month is the scope for a practice with three providers or two locations, not a solid two-provider practice that mostly needs to be findable.

Growth is the honest fit.

---

## Timeline & Milestones (Growth Build)

**Week 1 — Cleanup + technical foundation**
Booking form rebuilt and tested. Mobile viewport, SSL, Lighthouse, broken links, copyright year. LocalBusiness and Dentist schema shipped.

**Week 2 — Google Business Profile + on-page SEO**
GBP claimed, verified, filled, photographed. Home and top 5 service pages rewritten for intent. NAP audited across 15+ directories.

**Week 3 — Content engine online**
First two blog posts published. Review monitoring wired to your practice email. Monthly retainer begins. Next report lands end of month.

**Months 2+ — Ongoing**
Two posts per month. GBP posts and photos refreshed monthly. Reviews monitored; response templates ready for you or your front desk. End-of-month email report.

---

## Payment Options

**Option 1 — Standard**
50% of setup ($1,750) at contract signing. 50% at launch. Monthly retainer begins month 2.

**Option 2 — Paid in full**
Full setup paid at contract signing. 5% discount ($175 off setup). Monthly retainer begins month 2.

**Option 3 — Extended**
30% at contract signing ($1,050). Remaining setup split across three monthly invoices alongside retainer. No discount; no interest.

---

## Terms & Commitments

**Our promise**
- Monthly reports showing exactly what we did and what moved.
- Response within one business day on email.
- If something is not working, we pivot without being asked.
- No long-term contracts. Retainer is month-to-month with 30-day cancellation.

**What we need from you**
- Admin access to the site and Google Business Profile.
- Logo files and any existing brand assets.
- A 15-minute call to verify services, insurance accepted, and provider bios. That is the only required call.
- Review and approve blog content within 48 business hours.

**If you cancel**
- 30 days written notice. No exit fee.
- All assets — site, content, GBP access, analytics access, review response templates — stay with you.

---

## FAQ

**Q: Can we upgrade from Growth to Dominance later?**
A: Yes. If Growth results are working and you want to accelerate, we credit your first Dominance setup invoice against Growth's setup fee. No penalty for starting smaller.

**Q: What if we only want the Cleanup but none of the ongoing work?**
A: That is fine. Cleanup is a legitimate one-time engagement. We will not pressure you into a retainer.

**Q: How soon will we see ranking improvements?**
A: Technical fixes (schema, Core Web Vitals) register with Google in 2–4 weeks. On-page SEO and GBP work typically show in 6–12 weeks. Content-driven ranking is 4–6 months. We report monthly so you see the trend, not just the endpoint.

**Q: Do you guarantee rankings?**
A: No. Anyone who does is lying — Google's algorithm is not something we control. We guarantee the scope of work outlined here and the quality of execution.

**Q: What happens if our site platform is ancient?**
A: If the platform cannot support the Growth scope (some very old WordPress builds and proprietary CMSs cannot), we will say so in week 1 and either migrate you (custom quote) or refund the setup minus work completed. We will not pretend.

---

## Next Steps

1. **Review this proposal.** Share with anyone who needs to weigh in.
2. **Reply with questions or a signed approval.** Email [alex@rebbadvisors.com](mailto:alex@rebbadvisors.com).
3. **Signed agreement + setup payment.** We send a one-page agreement; 50% setup invoice follows.
4. **Kickoff.** 15-minute verification call scheduled within 48 hours of signing. Week 1 work begins the same day.

---

## Investment Summary

| Tier          | Setup   | Monthly   | 12-month total |
| ------------- | ------- | --------- | -------------- |
| **Cleanup**   | $1,500  | —         | $1,500         |
| **Growth**    | $3,500  | $500      | $9,500         |
| **Dominance** | Custom  | Custom    | Quoted per practice |

**Recommended: Growth — $9,500 over 12 months, cancellable with 30 days notice at any time.**

---

*Your real proposal will use your practice's actual audit findings, scope, and numbers — not Pinecrest's. Everything else you see here is how the document is structured.*
`;

export default async function SampleProposalPage() {
  const html = await marked(proposalMarkdown);

  return (
    <div className="theme-page pt-24 md:pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <Link
            href="/"
            className="theme-text-muted text-xs hover:opacity-80 inline-flex items-center gap-1.5"
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to REBB Advisors
          </Link>
          <span className="theme-warn-badge inline-block text-[10px] font-semibold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full">
            Example deliverable — fictional practice
          </span>
        </div>

        <article className="theme-card-strong border rounded-md px-6 py-10 md:px-14 md:py-16 shadow-[0_24px_80px_rgba(32,24,13,0.08)]">
          <div
            className="theme-prose prose max-w-none prose-headings:tracking-tight prose-h1:text-3xl md:prose-h1:text-4xl prose-h2:text-2xl prose-h2:mt-10 prose-h2:border-b prose-h2:pb-2 prose-h3:text-lg prose-h3:mt-6 prose-table:text-sm prose-th:text-left prose-td:align-top prose-hr:my-10"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>

        <div className="mt-10 theme-card border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <p className="theme-text-primary font-semibold mb-1">
              Want one of these for your practice?
            </p>
            <p className="theme-text-muted text-sm leading-relaxed">
              Send your URL. You&apos;ll have a real one tomorrow — free.
            </p>
          </div>
          <Link
            href="/contact"
            className="theme-cta-accent inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-xl text-sm"
          >
            Get Free Audit
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
