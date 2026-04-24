import Link from "next/link";
import type { Metadata } from "next";
import { marked } from "marked";

export const metadata: Metadata = {
  title: "Sample Proposal | REBB Advisors",
  description:
    "An example of the written proposal every REBB audit produces. Sanitized for a fictional Greenville dental practice: findings, scope, timeline, and terms.",
  openGraph: {
    title: "Sample Proposal | REBB Advisors",
    description:
      "What you get after a REBB audit: a written proposal with findings, a scoped recommendation, and a real timeline. This one is a sanitized example.",
    type: "article",
    url: "https://rebbadvisors.com/sample-proposal",
    siteName: "REBB Advisors",
  },
  alternates: { canonical: "https://rebbadvisors.com/sample-proposal" },
};

const proposalMarkdown = `# Website Proposal — Pinecrest Family Dentistry

**Prepared for:** Pinecrest Family Dentistry — Greenville, SC
**Prepared by:** REBB Advisors
**Date:** April 21, 2026
**Proposal valid:** 30 days

---

## Executive Summary

Your audit surfaced seven issues. Two are critical — the new-patient contact form silently drops submissions, and the mobile viewport is not set. Two more (Lighthouse 38 on mobile, an unclaimed Google Business Profile) are the reason newer practices in Greenville are ranking above Pinecrest despite smaller patient bases.

The $1,500 Cleanup fixes the critical breakage and the stale-trust issues, but it does not close the ranking and visibility gaps on its own. For a practice your size (≈1,400 active patients, one location, two providers), **we recommend Cleanup plus a scoped rebuild with ongoing care** — $4,500 setup plus $500 per month, month-to-month. Scope, timeline, and what you get for the retainer are spelled out below. If the Cleanup is all you want, that is a fine answer too; skip to the Cleanup-only track at the bottom.

---

## Audit Findings

### 🔴 Critical

**1. Contact form returns HTTP 405**
The new-patient form on \`/appointments\` posts to an endpoint that no longer exists. Every submission silently fails. Estimated impact: 8–14 lost patient inquiries per month. Separately, the form currently stores submissions in a plugin database on a host with no signed Business Associate Agreement — any symptom-describing message is Protected Health Information on non-compliant infrastructure.

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

## Recommended Scope

### Cleanup + scoped rebuild with ongoing care.

**Setup:** $4,500 (one-time)
**Timeline:** Two- to three-week build, ongoing from month 2
**Monthly retainer:** $500 / month — month-to-month, 30-day cancellation, no long-term contract

### What the setup covers

- **Cleanup, first.** Contact form replaced with a HIPAA-compliant intake under a signed Business Associate Agreement. Mobile viewport and layout fixed on every page. Lighthouse pass (image compression, script pruning, critical-render path cleanup). Copyright year, broken links, SSL verified. Hero, CTAs, and contact path refreshed.
- **Weave, LocalMed, RevenueWell — preserved.** Before launch we document every integration wired to the current site and submit a test record through the live form. We show you the entry on the receiving end before we invoice.
- **LocalBusiness + Dentist schema markup.** Hours, location, insurance accepted, and specialties surfaced for Google rich results.
- **Google Business Profile.** Claimed, verified, filled, photographed. Services and insurance populated. Categories aligned to dental-specific terms.
- **On-page SEO on home + top five service pages.** Rewritten for intent, not keyword density.
- **NAP consistency audit across 15+ local directories.** Broken or inconsistent listings corrected.

### What the retainer covers

- Two patient-facing articles per month, written for questions your patients actually ask and published to your site.
- Review monitoring. We draft responses to new reviews; you approve before they post.
- GBP posts and photos refreshed monthly.
- End-of-month email report: what shipped, what moved, what is queued.

### What this scope does NOT include

- Paid ads management.
- Social media management.
- A full visual redesign (this is a refresh, not a rebuild of the site's look and feel).
- More than two posts per month.

---

## Timeline & Milestones

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
50% of setup ($2,250) at contract signing. 50% at launch. Monthly retainer begins month 2.

**Option 2 — Paid in full**
Full setup paid at contract signing. 5% discount ($225 off setup). Monthly retainer begins month 2.

**Option 3 — Extended**
30% at contract signing ($1,350). Remaining setup split across three monthly invoices alongside retainer. No discount; no interest.

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

**Q: What if we only want the Cleanup but none of the ongoing work?**
A: That is fine. The $1,500 Cleanup is a legitimate one-time engagement. We will not pressure you into a retainer.

**Q: Can we expand scope later?**
A: Yes. If the scoped rebuild is working and you want to push further — more content, paid ads integration, additional locations — we quote the delta against the work already done. No penalty for starting where you are.

**Q: How soon will we see ranking improvements?**
A: Technical fixes (schema, Core Web Vitals) register with Google in 2–4 weeks. On-page SEO and GBP work typically show in 6–12 weeks. Content-driven ranking is 4–6 months. We report monthly so you see the trend, not just the endpoint.

**Q: Do you guarantee rankings?**
A: No. Anyone who does is lying — Google's algorithm is not something we control. We guarantee the scope of work outlined here and the quality of execution.

**Q: What happens if our site platform is ancient?**
A: If the platform cannot support this scope, we will say so in week 1 and either migrate you (custom quote) or refund the setup minus work completed. We will not pretend.

---

## Next Steps

1. **Review this proposal.** Share with anyone who needs to weigh in.
2. **Reply with questions or a signed approval.** Email [alex@rebbadvisors.com](mailto:alex@rebbadvisors.com).
3. **Signed agreement + setup payment.** We send a one-page agreement; 50% setup invoice follows.
4. **Kickoff.** 15-minute verification call scheduled within 48 hours of signing. Week 1 work begins the same day.

---

## Investment Summary

| Scope              | Setup   | Monthly | 12-month total |
| ------------------ | ------- | ------- | -------------- |
| **Cleanup only**   | $1,500  | —       | $1,500         |
| **Recommended**    | $4,500  | $500    | $10,500        |

**Recommended: $10,500 over 12 months — $4,500 setup plus $500/month retainer, cancellable with 30 days notice at any time.**

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
