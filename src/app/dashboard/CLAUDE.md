# Dashboard Context — `src/app/dashboard/`

Internal CRM. Desktop-only by design. See `src/CLAUDE.md` for the broader frontend context and design tokens.

## Shell

- **`_components/DashboardShell.tsx`** — async server component wrapping every dashboard route. Owns header, `<DashNav>`, signed-in email + sign-out form, stat row slot, optional `filters` slot. Props: `title`, `subtitle`, `active`, `stats`, `filters?`, `children`. Stats render in their own row *below* the title (not beside the sign-out) — this is deliberate; the earlier right-rail placement crowded the chrome and forced a flex layout that couldn't breathe. Pair with `<StatTile>` for the stat row. Add a new tab by extending `TABS` in `_components/DashNav.tsx` + the `DashNavKey` union. `getCurrentUser()` lives in `_lib/auth.ts`. Do NOT rebuild the header per page.
- **`prospects/ProspectTable.tsx`** — client component that renders the prospects table + row-detail drawer. `page.tsx` stays a server component and just loads data. Any interactive child (mailto links, `<details>`, `OutreachCell`) must `stopPropagation` on click or it'll also open the drawer. Drawer re-mounts via `key={prospect.id}` so notes state resets cleanly per row — do NOT re-add a `useEffect` to sync notes.

## Tone Tokens (semantic colors)

- `tone-hot` (red, critical), `tone-warm` (amber, warning), `tone-cool` (blue, informational), `tone-good` / `tone-good-strong` (green, positive — strong for terminal wins like "booked"), `tone-neutral` (gray, pending), `tone-info` (purple, categorical — e.g. Trust/Family transfers).
- Pair with `border` to render the outline; use `-text` variants (`tone-hot-text`, `tone-warm-text`, `tone-cool-text`, `tone-good-text`) for color-only applications (score digits, link text, stat-tile numerals).
- Do NOT reintroduce raw `bg-red-50` / `text-amber-600` / `dark:text-blue-400` chains inside `src/app/dashboard/**`.

## Table Conventions

Applies to every table under `src/app/dashboard/**`. Deviating from these rules is usually a regression — check git log before "fixing" any of them.

- **Two font sizes only.** Body cells use `text-sm` for primary content and `text-xs` for meta (roles, dates, subcopy, truncated hostnames). Do NOT introduce `text-[10px]`, `text-[9px]`, or any arbitrary smaller size — the cascade got collapsed deliberately.
- **Headers are quiet.** `text-xs font-medium theme-text-muted`. No `uppercase tracking-widest` — that treatment belongs on marketing section labels, not on 9 columns of a CRM table where every header would shout equally.
- **Sticky thead.** `<thead className="sticky top-0 z-10 theme-card-muted">` on any table that can exceed ~15 rows. The outer `overflow-x-auto` wrapper doesn't block vertical sticky.
- **Row padding:** `px-4 py-3` for `<td>`, `px-4 py-2.5` for `<th>`. Do not revert to `py-4` — rows felt bloated on a 200+ row call list.
- **No rank/`#` column.** The tables are pre-sorted (score desc, severity desc). A visible rank number duplicates that and steals ~60px of width.
- **No emoji in dashboard UI.** Use text labels (`Mobile` / `Desktop`, not `📱` / `🖥`). The `↗` arrow on external links is fine — it's typographic, not pictographic. This keeps the Stripe/Linear aesthetic intact.

## Long-Term UX Roadmap

Ordered by leverage; do earlier items first.

**Done** — design tokens (`.tone-*`), shared shell (`DashboardShell` + `DashNav` + `StatTile`), typography/layout pass, prospects row-detail drawer with editable notes (`ProspectTable.tsx`). Leads-side drawer still pending — mirror the same pattern (`enriched_leads.notes` already exists).

**Next**
1. **Generic `<DataTable>` primitive** — column-def-driven table with sort, text filter, tag/status filter, pagination, URL-synced state, column visibility. TanStack Table is the default pick. Use on both dashboard pages. Biggest UX lever — every future internal view is a table.
2. **Generated Supabase types + shared types package** — kill the `as unknown as EnrichedLead[]` / `as unknown as Prospect[]` casts, catch schema drift at build time.
3. **`error.tsx` + nested `loading.tsx` per dashboard route** — prospects page currently throws into the void; leads page silently 500s on Supabase errors.
4. **A11y pass** — row focus styles, aria-labels on icon-only buttons, stat-tile labels, nested-interactive cleanup. Mostly solved for free by the DataTable primitive.
5. **URL as state** — filters/sort/selected-row in query params so dashboard views are linkable. Free once DataTable lands.

**Don't** — mobile responsive (desktop-only by design), more badge tones without a real use case, rebuilding the shell into a client component, adding react-query / SWR before server components demonstrably fall short.
