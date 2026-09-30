-- Topic-tab backfill for /reporting (September 30, 2026).
-- Files each published post under one `topic:<key>` tag (src/lib/topics.ts).
-- Section tags are untouched, so no URL moves. Idempotent: an existing topic
-- tag is replaced, never duplicated. RUN ONLY AFTER the topic-tabs code is
-- deployed, or ArticleView shows the raw `topic:` tag as a badge.
-- "Here goes!" is left without a topic on purpose (it shows under All only).
with m(pat, topic) as (values
 ('Comparison is the thief of joy%','real-estate'),
 ('How to get the best sale price%','real-estate'),
 ('Upstate Brief: Greenville Homes Take a Week Longer%','real-estate'),
 ('Upstate Brief: Greenville Homes Take Longer to Sell%','real-estate'),
 ('Greenville''s For-Sale Supply Outpaces%','real-estate'),
 ('Upstate Brief: Greenville Inventory Up 12%%','real-estate'),
 ('Who Is Buying Commercial Real Estate%','real-estate'),
 ('Best Areas to Invest%','real-estate'),
 ('How to Analyze a Rental Property%','real-estate'),
 ('Average Rent in Greenville%','real-estate'),
 ('Greenville County Approves 460 New Homes%','real-estate'),
 ('A Greer Apartment Complex%','real-estate'),
 ('A 90-Unit Senior Apartment%','real-estate'),
 ('A $28M Downtown Greenville Townhome%','real-estate'),
 ('How to Find a Real Estate Agent%','real-estate'),
 ('Selling a House in Greenville%','real-estate'),
 ('Is Now a Good Time to Buy%','real-estate'),
 ('Closing Costs in South Carolina%','finance'),
 ('Your Monthly Payment%','finance'),
 ('How Much House Can You Afford%','finance'),
 ('First-Time Home Buyer%','finance'),
 ('Upstate Brief: Mortgage Rates Tick Up%','finance'),
 ('Greenville''s Grid Can Probably Absorb%','urban-economics'),
 ('A $2.8 Billion Data Center%','urban-economics'),
 ('Greenville Bets $135 Million%','urban-economics'),
 ('Greenville legalized "missing middle"%','urban-economics'),
 ('Greenville County moves to ask voters%','urban-economics'),
 ('Greenville Approves Designs for $282 Million%','urban-economics'),
 ('Upstate Brief: Novant Health%','urban-economics'),
 ('Greenville, SC School Zone%','lifestyle'),
 ('North Main, Greenville%','lifestyle'),
 ('Greenville SC vs. Charlotte%','lifestyle'),
 ('Cost of Living: Greenville, SC vs. Atlanta%','lifestyle'),
 ('Cost of Living in Greenville, SC%','lifestyle'),
 ('Moving to Greenville, SC%','lifestyle'),
 ('Out-of-State Buyers%','lifestyle')
)
update blog_posts p
set tags = array_append(
  array(select t from unnest(coalesce(p.tags, '{}')) t where lower(t) not like 'topic:%'),
  'topic:' || m.topic)
from m
where p.status = 'PUBLISHED' and p.title like m.pat
returning m.topic, p.title;
