# Greenville cover library — image credits

Curated, freely-licensed photos of Greenville, South Carolina, used as lead images
for the `/real-estate` evergreen guides. Picked for quality and relevance by
`src/lib/greenvilleCovers.ts`; the finalize cron sets the matching one as a post's
`cover_image` and, for CC-BY images, writes the short credit line to `cover_credit`
(shown under the article hero). CC0 images need no visible credit.

When adding an image by hand: download it into this folder, append its entry to the subject's
array in `src/lib/greenvilleCovers.json`, and add its full record here. Prefer clean, landscape,
watermark-free photos of recognizable Greenville subjects. The monthly
`scripts/greenville/cover_ingest.py` pipeline (a GitHub Action) does the same thing automatically,
vision-gated, and appends its rows to the table below via a PR.

| File | Subject | Source (Wikimedia Commons) | Author | License |
|---|---|---|---|---|
| `downtown-falls.jpg` | Downtown / RiverPlace on the Reedy (city-level default) | [DowntownGreenvilleSC.jpg](https://commons.wikimedia.org/wiki/File:DowntownGreenvilleSC.jpg) | Tim (Atlanta, USA) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| `liberty-bridge.jpg` | Liberty Bridge, Falls Park | [Liberty Bridge at Falls Park 2017.jpg](https://commons.wikimedia.org/wiki/File:Liberty_Bridge_at_Falls_Park_2017.jpg) | Antony-22 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `reedy-river.jpg` | Reedy River falls + Liberty Bridge | [Reedy River, Greenville, SC (27947815395).jpg](https://commons.wikimedia.org/wiki/File:Reedy_River,_Greenville,_SC_(27947815395).jpg) | Nicolas Henderson | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| `north-main.jpg` | Main Street storefront block | [Greenvile - Buildings along North Main St.jpg](https://commons.wikimedia.org/wiki/File:Greenvile_-_Buildings_along_North_Main_St.jpg) | P. Hughes | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| `west-end.jpg` | West End, towers over the Reedy | [Eugenia Duke Bridge and Main Street Bridge crossing Reedy River, Downtown Greenville, SC.jpg](https://commons.wikimedia.org/wiki/File:Eugenia_Duke_Bridge_and_Main_Street_Bridge_crossing_Reedy_River,_Downtown_Greenville,_SC.jpg) | Spatms | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `swamp-rabbit-trail.jpg` | Swamp Rabbit Trail greenway | [Swamp Rabbit Trail, Greenville, SC June 2019.jpg](https://commons.wikimedia.org/wiki/File:Swamp_Rabbit_Trail,_Greenville,_SC_June_2019.jpg) | Thomson200 | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `travelers-rest.jpg` | Travelers Rest Main Street | [U.S. Route 276 in Travelers Rest, SC June 2019 1.jpg](https://commons.wikimedia.org/wiki/File:U.S._Route_276_in_Travelers_Rest,_SC_June_2019_1.jpg) | Thomson200 | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |

Images are the Commons-generated 1920px-wide renderings, downloaded July 2026.
