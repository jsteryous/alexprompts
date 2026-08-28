-- Referral attribution queries.
--
-- Paste any block into the Supabase SQL editor. These are the read-only questions
-- worth asking of `referral_leads` once traffic exists; nothing here writes.
--
-- Attribution notes, so the numbers are read correctly:
--   * `ref_slug` is populated ONLY when a lead arrives through the in-article
--     `ReferralCta` (it carries `?ref=<slug>`), which renders on `/real-estate`
--     articles. A lead that lands on `/find-a-pro` directly has a NULL ref_slug,
--     so "(no article)" is not a failure, it is the direct/nav path.
--   * `status = 'dead'` covers test rows and dud leads. Every query below excludes
--     it so a test submit never inflates a conversion rate.
--   * There is no cost data here. Referral revenue lands outside the app, so
--     `placed` is the last state this database knows about.


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Which articles produce leads. The core question.
-- ─────────────────────────────────────────────────────────────────────────────
select
  coalesce(ref_slug, '(direct / no article)') as article,
  count(*)                                          as leads,
  count(*) filter (where status <> 'new')            as worked,
  count(*) filter (where status = 'placed')          as placed,
  min(created_at)::date                             as first_lead,
  max(created_at)::date                             as last_lead
from referral_leads
where status <> 'dead'
group by 1
order by leads desc;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Every published real-estate guide, with its lead count INCLUDING zeros.
--    This is the one that tells you which guides to write more of and which
--    topics are dead weight. Query 1 cannot show you a guide that produced
--    nothing, because it has no rows to group.
-- ─────────────────────────────────────────────────────────────────────────────
select
  p.slug,
  p.title,
  p.published_at::date                        as published,
  (current_date - p.published_at::date)       as days_live,
  count(l.id)                                 as leads
from blog_posts p
left join referral_leads l
  on l.ref_slug = p.slug
 and l.status <> 'dead'
where p.status = 'PUBLISHED'
  and 'greenville' = any(p.tags)
group by p.slug, p.title, p.published_at
order by leads desc, p.published_at desc;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Channel mix. Where leads come from before they hit the site.
-- ─────────────────────────────────────────────────────────────────────────────
select
  coalesce(utm_source, referrer, '(direct)') as channel,
  coalesce(utm_campaign, '(no campaign)')    as campaign,
  count(*)                                   as leads
from referral_leads
where status <> 'dead'
group by 1, 2
order by leads desc;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Which surface captures. Tells you whether the referral page earns its
--    place as the #1 conversion surface, or whether tools/articles do the work.
-- ─────────────────────────────────────────────────────────────────────────────
select
  coalesce(landing_path, '(unknown)') as landing_path,
  count(*)                            as leads
from referral_leads
where status <> 'dead'
group by 1
order by leads desc;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. The funnel. Intent against status, so a stall shows up by lead type.
-- ─────────────────────────────────────────────────────────────────────────────
select
  intent,
  count(*)                                  as leads,
  count(*) filter (where status = 'new')       as new,
  count(*) filter (where status = 'contacted') as contacted,
  count(*) filter (where status = 'placed')    as placed
from referral_leads
where status <> 'dead'
group by intent
order by leads desc;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Weekly volume, and how much of it the articles carry. This is the trend
--    line that says whether the SEO bet is compounding or flat.
-- ─────────────────────────────────────────────────────────────────────────────
select
  date_trunc('week', created_at)::date              as week,
  count(*)                                          as leads,
  count(*) filter (where ref_slug is not null)      as from_articles
from referral_leads
where status <> 'dead'
group by 1
order by week desc;


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Response time. A hot lead that sat for three days is a lost referral fee.
-- ─────────────────────────────────────────────────────────────────────────────
select
  count(*) filter (where status = 'new')                                as awaiting_contact,
  round(avg(extract(epoch from (contacted_at - created_at)) / 3600), 1) as avg_hours_to_contact,
  max(extract(epoch from (contacted_at - created_at)) / 3600)::int      as worst_hours_to_contact
from referral_leads
where status <> 'dead';


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. The open work queue. Oldest uncontacted lead first.
-- ─────────────────────────────────────────────────────────────────────────────
select
  created_at::date as arrived,
  name, email, phone, intent, location, moving_from, timeframe,
  coalesce(ref_slug, landing_path, '(unknown)') as came_from
from referral_leads
where status = 'new'
order by created_at asc;


-- ─────────────────────────────────────────────────────────────────────────────
-- 9. The texting list. Who has actually consented to receive an SMS.
--
-- Check this BEFORE sending anything, including a one-off manual text. A phone
-- number in the phone column is not permission; sms_consent = true is. The
-- consent_shown column is the exact wording that was on the screen when they
-- agreed, which is what proves consent if it is ever questioned, so if a row
-- has consent with no wording stored, treat it as unproven and leave it alone.
--
-- Unlike the queries above, this one does NOT exclude status = 'dead': someone
-- who went cold as a lead may still have a live texting consent, and the two
-- have nothing to do with each other.
-- ─────────────────────────────────────────────────────────────────────────────
select
  created_at::date  as arrived,
  name, phone, intent, location, status,
  sms_consent_at    as consented_at,
  sms_consent_ip    as consented_ip,
  sms_consent_text  as consent_shown
from referral_leads
where sms_consent
order by created_at desc;
