# The source registry

Every source the scout and the researcher can reach, sorted by **how often it changes**. That
sort order is the point of this file, and it exists because two engines died of the same cause.

## Why this file exists

The Upstate Brief published byte-identical market figures three weeks running. It was a weekly
brief pointed at Zillow and GGAR data that refreshes monthly, so two runs in three had nothing
new to say and said it anyway. The commercial deed analysis in `greenville/records.py` has the
same shape for a different reason. It is genuinely good work over 12,212 deed rows, and its
findings measure 14-year patterns that barely move between refreshes, so it supports one piece
and not a series.

**A source that does not change cannot carry a serial.** That is the whole lesson, and neither
engine had anywhere to write it down.

So sources come in two kinds, and the difference decides what you can do with one.

**CADENCE SOURCES** produce new documents faster than the publication publishes. They are what a
biweekly schedule actually runs on. A question grounded in one of these can be asked again in
six months against different evidence and give a different answer.

**DEPTH SOURCES** refresh annually or slower, or measure spans long enough that a refresh does
not move them. You mine one once for a landmark piece and then it becomes background for other
pieces. It is not a defect. A depth source is often where the best single finding lives. It just
gets spent once.

The scout enforces this at THE REFRESH GATE. Both kinds are allowed. What is not allowed is
generating a second question against a spent depth source, which is how you get three articles
about the same thing.

---

## Cadence sources

### Tier 1, the ones to build on

**County council agendas, ordinances, and minutes.** The single best cadence source available,
and the most under-used. Greenville County Council meets the first and third Tuesday of each
month, which is close to the publication's own target cadence. Support documents for council and
standing committee agendas are posted publicly.

- Greenville County Council minutes: https://www.greenvillecounty.org/Council/Minutes.aspx
- Greenville County boards and commissions calendar: https://www.greenvillecounty.org/apps/CalendarGC/CountyCouncil.aspx
- City of Greenville portal (CivicClerk): https://greenvillesc.portal.civicclerk.com/
- Spartanburg County agenda center: https://www.spartanburgcounty.gov/AgendaCenter

**Fee-in-lieu-of-tax (FILOT) ordinances specifically.** This is where the INCENTIVES EXPLAIN
BEHAVIOR commitment stops being a slogan. Every negotiated FILOT in South Carolina requires a
county council ordinance, three readings, and at least one public hearing, under Title 12
Chapter 44 of the state code. The agreement is then recorded with the county and with SCDOR.

What that means operationally is better than it sounds. There is a continuous dated public
stream showing exactly what a company was given and what it committed to in return, and the
three-reading requirement means you see the same deal three times before it is final, so you
have lead time rather than hindsight. It is also where original arithmetic falls out with almost
no effort: incentive dollars per job, the assessment-ratio reduction, the investment threshold
against actual investment, the term length against the payback. The spec's own example of a good
ratio, "$340,000 per job, more than the median house in Greenville County," is a FILOT ordinance
divided by a jobs commitment.

- Statute: https://www.scstatehouse.gov/code/t12c044.php
- The ordinances themselves live in the county agenda portals above.

**UCC filings.** Promoted to Tier 1 on August 14, 2026, and on reflection it may be the most
valuable source in this file. A UCC-1 financing statement is filed when a lender takes a security
interest, so `https://ucconline.sc.gov/UCCFiling/UCCMainPage.aspx` is a continuously updated,
searchable public record of **which South Carolina companies just borrowed money and what they
pledged.** It names the debtor, the collateral, and the lender.

That is the reader's own question asked of the whole state. A bank's portfolio manager wants to
know who is borrowing and against what; a developer wants to know which of their prospective
tenants just financed equipment for an expansion. It is a cadence source, nobody in local media
mines it, and it points directly at the small growing companies the inventory is now built to
find. Cross-reference a debtor against new business filings and building permits and you have a
company doing something, documented three ways, before anyone has announced anything.

**Job postings.** The most under-used public source about a private company, already flagged in
the scout. They reveal headcount direction, which functions are growing, what systems the
company runs, which markets it is entering, and roughly what it pays. Counted over time they
become a leading indicator nobody local computes. Read them as documents, not as listings. At a
twenty-person company, six open roles is a growth signal no announcement will ever carry.

**SEC filings.** 10-K, 10-Q, 8-K, DEF 14A. Event-driven, so 8-Ks arrive continuously for any
public company with South Carolina operations. EDGAR full-text search is at
https://www.sec.gov/edgar/search/ and covers filing text rather than just metadata.

> Operational note: SEC blocks requests without a descriptive User-Agent, so an automated fetch
> needs one set per SEC policy. A 403 from EDGAR is almost always this and not a missing document.

### Tier 2, real cadence, narrower use

**SC Public Service Commission dockets.** Continuous, and it is where the utility and large-load
story lives, including the unwritten large-load tariff the August 1 grid piece was built around.
Searchable by docket, organization, or individual.

- https://dms.psc.sc.gov/Web/Dockets

**SC Secretary of State business filings.** New entities, registered agents, and officers.
Continuous. Useful for identifying who is actually behind an LLC on a deed.

- https://businessfilings.sc.gov/
- Search entry: https://sos.sc.gov/online-filings/business-entities/file-and-search-online

**WARN notices.** Layoffs and closings, 60-day notice required, filed with SC DEW. Event-driven
and a genuine leading indicator for an employer's trouble. DEW publishes the current report and
past reports; several third-party aggregators mirror it, and the state filing is the source of
record.

- https://dew.sc.gov/employers/employer-resources

**SC Ports Authority statistics.** Monthly, with a rolling 13-month history, monthly rail moves,
pier containers, and TEU totals. Inland Port Greer is in the Upstate and is directly relevant to
any logistics or distribution subject.

- https://scspa.com/about-the-port/statistics/

**Building permits.** Monthly at the county and municipal level. Moves fast enough to carry a
series and is the most direct public read on what is actually being built rather than announced.

**Court dockets and litigation.** Event-driven. Useful for customer concentration, contract
disputes, and the mechanism half of a BREAK analysis.

---

## Depth sources

Spend each once, then treat it as background.

**The Greenville County commercial deed record.** `scripts/greenville/records.py` over the
county's public ArcGIS service, 12,212 rows spanning 2008 to 2026. Parcel-assembly clusters,
countywide portfolio holders, and a repeat-sale index on 829 validated pairs.

Two lags to state honestly, both of which live in the world rather than in the pipeline. The
deed record itself runs about four months behind. The index requires both sales to be
assessor-confirmed arm's length, and the assessor reviews on roughly a two-year lag, so the
validated index currently ends at 2024. Loosening that requirement contaminates it badly, which
an early run proved by producing a "90% loss" artifact that turned out to be lender takebacks
and five-dollar nominal transfers.

**Status: unspent.** The strongest single finding in it is the loss-share trend, which runs from
47% in 2013 to 11% in 2022 and 2023 before ticking to 13% in 2024. Note that the pooled
all-years figure of 18% is an artifact of blending post-crisis wreckage with the recent era and
should not be the headline. Note also that 2023 shows the highest median annual return in the
whole series, which resolves once you see these are resales annualized over a 4.7-year median
hold, so a 2023 sale mostly reflects a 2018 purchase.

**The Greenville residential pulse.** `scripts/greenville/housing.py`, ZIP-level Zillow series
across Greenville County. Monthly refresh, so it sits at the boundary. It is the only
proprietary dataset in the operation. Monthly is too slow to carry a biweekly series on its own
and it is fine as a supporting cut inside a piece.

**GGAR monthly indicators.** Monthly, document-only, so it is attributed in words with no link.

**Census ACS and County Business Patterns.** Annual. Good for a comparison-market cut so a word
like "expensive" has something to mean.

**BLS QCEW.** Quarterly, with a lag. Wages and employment by county and industry.

**10-Ks specifically.** Annual, unlike the 8-Ks above. The document itself is a depth source even
though the filer is a cadence source.

**Assessor rolls and property tax records.** Annual reassessment cycles.

---

## The rule this file exists to enforce

Before committing to a question, name the source that answers it and say which kind it is. If it
is a depth source, check whether it has already been spent. If it has, the question is dead no
matter how good it looks, and the honest move is to stop the run rather than write the same
piece again with different sentences.
