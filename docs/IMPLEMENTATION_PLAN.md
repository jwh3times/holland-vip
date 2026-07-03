# Implementation Plan — Derived Backlog

- **Date:** 2026-07-03
- **Branch:** `claude/roadmap-implementation-plans-o9740c`
- **Status of source material:** **This repository has no roadmap or TODO document and no open
  GitHub issues.** There is no `ROADMAP.md`, no `private/TODO.md`, and a repo-wide sweep for
  `TODO` / `FIXME` / `HACK` markers across `app/`, `components/`, `lib/`, `tests/`, `scripts/`,
  and `.github/` found **zero** code-comment work markers. Everything below is a **DERIVED
  backlog**: each item traces to something directly observable in the codebase (a stray file, a
  degradation path, a CI gap, a missing standard artifact, or documentation drift) — none of it
  comes from a product roadmap, because none exists.

---

## 1. Latent-TODO inventory (what the sweep actually found)

| #   | Finding                                                                                                                                                                                                                                                                                                                                                           | Evidence                                                                                                                                                                                           |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **No `TODO`/`FIXME`/`HACK`/`XXX` markers anywhere** in `.ts/.tsx/.js/.mjs/.css/.yml/.md/.json` sources.                                                                                                                                                                                                                                                           | `grep -rE 'TODO\|FIXME\|HACK'` across the repo — no matches.                                                                                                                                       |
| 2   | **Stray internal document shipping to production.** `public/README.md` contains an unrelated review handoff ("Review Handoff v3 — Storybook + Figma Plan") from another project. Everything in `public/` is copied into `out/`, so this is served at `holland.vip/README.md`.                                                                                     | `public/README.md` (56 lines; git history: `dccfbdd add doc`). Repo `README.md` (line ~186) still describes `public/` as holding only site assets.                                                 |
| 3   | **`apple-touch-icon` is an SVG.** iOS does not support SVG apple-touch-icons, so home-screen bookmarks fall back to a screenshot tile. The web manifest also lists only SVG icons with a combined `"purpose": "any maskable"` (discouraged; Lighthouse flags it).                                                                                                 | `public/apple-touch-icon.svg`, `public/manifest.json` (`icons` array), `app/layout.tsx` (`icons.apple`). No `favicon.ico` exists in `public/`.                                                     |
| 4   | **No JSON-LD structured data.** Metadata (OG/Twitter/robots/sitemap/manifest) is thorough, but there is no `application/ld+json` block (e.g. schema.org `Person`/`WebSite`) anywhere.                                                                                                                                                                             | `grep -rn 'ld+json\|schema.org' app components lib` — no matches; `app/layout.tsx` `Metadata` export.                                                                                              |
| 5   | **Fallback snapshots have no refresh automation, and the repo fallback has no seeder at all.** `scripts/seed-contributions.mjs` refreshes `lib/github-contributions-fallback.json` manually; `lib/github-fallback.json` must be hand-edited (per the comment in `lib/github.ts`). Both snapshots are frozen at 2026-06-18.                                        | `scripts/seed-contributions.mjs` header comment; `lib/github.ts` lines 8–18 ("Update this array (and `github-fallback.json`)"); fallback JSON `pushedAt` dates / last calendar day = `2026-06-18`. |
| 6   | **Build-time degradation is silent.** `getFeaturedRepos()` / `getContributions()` degrade to the committed fallback with only a `console.warn` in the (unattended) Cloudflare build log — a site stuck on stale fallback data is undetectable from outside.                                                                                                       | `lib/github.ts` (`getFeaturedRepos` catch), `lib/github-contributions.ts` (`getContributions` catch).                                                                                              |
| 7   | **Smoke workflow covers only the homepage.** It asserts HTTP 200 + the string "Jerry Holland" + 4 of the 7 security headers. It never checks `robots.txt`, `sitemap.xml`, `manifest.json`, `og-image.png`, 404 behavior, or the `www` → apex 301 documented in README/CLAUDE.md.                                                                                  | `.github/workflows/smoke.yml`; `public/_headers` (7 headers, 4 asserted); README "Deployment" section (www redirect claim).                                                                        |
| 8   | **Refresh workflow is fire-and-forget.** `refresh.yml` POSTs the Cloudflare deploy hook and succeeds on any 2xx — it never verifies the rebuild deployed or that the baked GitHub data is actually fresh.                                                                                                                                                         | `.github/workflows/refresh.yml`.                                                                                                                                                                   |
| 9   | **README claims "Performance optimized (Core Web Vitals)" but nothing measures it.** Accessibility has an automated gate (axe via `@axe-core/playwright` in `tests/accessibility.spec.ts`); performance has no equivalent.                                                                                                                                        | `README.md` Features list; `package.json` devDependencies; `.github/workflows/ci.yml` (no perf job).                                                                                               |
| 10  | **Documentation drift.** (a) `CLAUDE.md` says the GitHub fetchers "degrade to empty data" — they degrade to committed fallback snapshots. (b) `lib/README.md` documents only `utils.ts` and carries an aspirational "Common Utilities to Add" list, while `lib/` now also holds `github.ts`, `github-contributions.ts`, `site-config.ts`, and two fallback JSONs. | `CLAUDE.md` line 248; `lib/README.md` vs actual `lib/` contents.                                                                                                                                   |
| 11  | **No RFC 9116 `security.txt`.** `SECURITY.md` defines private vulnerability reporting, but there is no machine-discoverable `/.well-known/security.txt` on the live site.                                                                                                                                                                                         | `SECURITY.md` exists; `public/.well-known/` does not.                                                                                                                                              |
| 12  | **Firefox/WebKit Playwright projects never run in CI.** Documented as a known limitation ("a test that passes in CI may still surface Firefox/WebKit-specific failures"), but no scheduled job ever exercises them.                                                                                                                                               | `CLAUDE.md` Testing section; `playwright.config.ts` (5 projects); `ci.yml` (chromium + Mobile Chrome only).                                                                                        |

Aspirational statements that are already true (verified, **not** backlog): sitemap
(`app/sitemap.ts` → `out/sitemap.xml`), `robots.txt`, OG image (`public/og-image.png`,
1200×630 declared), 404/error/loading routes (`app/not-found.tsx`, `app/error.tsx`,
`app/loading.tsx`), a11y test gate, 80% Vitest coverage gate, formatting gate, dependency
review, CodeQL default setup, version tagging, Node pin via `.nvmrc`.

---

## 2. Prioritized derived backlog

| Pri | Item                                                                                   | Traces to inventory # | Size |
| --- | -------------------------------------------------------------------------------------- | --------------------- | ---- |
| P0  | **B1 — Remove the stray internal doc shipping at `/README.md`**                        | 2                     | S    |
| P1  | **B2 — Fix Apple touch icon / manifest icons / legacy favicon**                        | 3                     | M    |
| P1  | **B3 — Add JSON-LD structured data (`Person` + `WebSite`)**                            | 4                     | S    |
| P1  | **B4 — Automate fallback-snapshot refresh (repos + contributions)**                    | 5                     | M    |
| P2  | **B5 — Broaden the production smoke check**                                            | 7                     | S    |
| P2  | **B6 — Surface live-vs-fallback data source as an observable marker**                  | 6 (+8)                | S/M  |
| P2  | **B7 — Fix documentation drift (CLAUDE.md fallback claim; `lib/README.md` inventory)** | 10                    | S    |
| P3  | **B8 — Publish RFC 9116 `security.txt`**                                               | 11                    | S    |
| P3  | **B9 — Add a Lighthouse CI performance budget job**                                    | 9                     | M    |
| P3  | **B10 — Verify the weekly refresh actually deployed (chain refresh → smoke)**          | 8                     | S    |
| P3  | **B11 — Scheduled cross-browser Playwright run (Firefox/WebKit)**                      | 12                    | S    |

---

## 3. Detailed plans (top 7)

### B1 — Remove the stray internal doc shipping at `/README.md` (P0, S)

**Objective & rationale.** `public/README.md` is not the asset-inventory doc the repo README
describes — it is an unrelated internal review handoff for a Storybook/Figma plan
(evidence: `public/README.md` full contents; `git log -- public/README.md` shows it added by
`dccfbdd add doc`). Because `output: "export"` copies `public/` verbatim into `out/`
([next.config.ts](../next.config.ts)), this internal document is publicly served at
`https://holland.vip/README.md`. It leaks internal process content and is plainly accidental.

**Current state.** 56-line markdown file at `public/README.md`, deployed on every push to
`main`. Sibling directory READMEs (`components/README.md`, `lib/README.md`) are legitimate
in-repo docs — but those directories are not copied into the export; `public/` is unique in
that anything placed there ships.

**Design / approach.** Delete the file rather than rewrite it: a README inside `public/` will
always be published, so `public/` should contain only intentional web-served assets
(`_headers`, icons, OG image, `manifest.json`, `robots.txt`). If asset documentation is
wanted, put it in the root `README.md` "Project Structure" section (already lists every
`public/` file) — no new served file. This honors the static-export constraint that
`public/` = deployed payload.

**Steps.**

1. `git rm public/README.md`.
2. Search for references: `grep -rn "public/README" .` — the root `README.md` project-structure
   tree does not list it, so no doc edits are strictly required; confirm.
3. Rebuild (`npm run build`) and verify `out/README.md` no longer exists.

**Testing plan.** `npm run build` + assert `test ! -f out/README.md`. Optionally add a live
check to `smoke.yml` (see B5: assert `https://holland.vip/README.md` returns 404 after the next
deploy). No Vitest/Playwright impact (coverage `include` only spans `app/`, `components/`,
`lib/`). Run `npm run lint` and `npm run format:check` as usual.

**Docs updates.** None required (root README never listed the file). If B5 adds the 404
assertion, mention it in the CLAUDE.md smoke bullet.

**Risks.** Effectively none — content is unrelated to the site. Only risk is that someone
externally linked to `holland.vip/README.md`; that URL 404ing is the desired outcome.

**Size:** S.

---

### B2 — Fix Apple touch icon, manifest icons, and legacy favicon (P1, M)

**Objective & rationale.** iOS Safari does not render SVG `apple-touch-icon`s — a home-screen
bookmark of `holland.vip` currently gets a degraded screenshot tile. Evidence:
`public/apple-touch-icon.svg` is the only Apple icon; `app/layout.tsx` declares
`icons.apple: "/apple-touch-icon.svg"`. Additionally, `public/manifest.json` lists only SVG
icons and marks one `"purpose": "any maskable"` — the combined purpose is discouraged (a
maskable rendering crops an icon designed for `any`), and installability checks expect PNG
192×192/512×512 entries. Finally there is no `/favicon.ico`; legacy user agents, RSS readers,
and some crawlers request it unconditionally and currently 404.

**Current state.** `public/` contains `icon.svg` (favicon), `apple-touch-icon.svg`,
`manifest.json` (2 SVG icon entries), `og-image.{png,svg}`. `app/layout.tsx` `metadata.icons`
lists the SVG favicon + SVG apple icon. `tests/seo.spec.ts` asserts a `link[rel="icon"]`
exists.

**Design / approach.** Generate PNG raster variants from the existing `icon.svg` /
`apple-touch-icon.svg` artwork (one-time asset generation — e.g. `sharp` in a throwaway
script or any SVG rasterizer; do **not** add a runtime dependency): `apple-touch-icon.png`
(180×180), `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (with safe-zone padding),
and `favicon.ico` (48/32/16 multi-size). Static export serves them from `public/` as-is
(images are `unoptimized`, so no pipeline concerns). Keep the SVGs: SVG favicon stays primary
for modern browsers; PNGs are additive fallbacks.

**Steps.**

1. Add rasters to `public/`: `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`,
   `icon-maskable-512.png`, `favicon.ico`.
2. `app/layout.tsx` — update `metadata.icons`:
   `apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]`; keep
   `icon.svg` first in `icon`, and note `favicon.ico` is picked up from `public/` by request
   path (Next also supports declaring it via `icons.shortcut`).
3. `public/manifest.json` — replace the icon array: keep the SVG (`"sizes": "any"`,
   `"purpose": "any"`), add `icon-192.png` / `icon-512.png` (`"purpose": "any"`) and
   `icon-maskable-512.png` (`"purpose": "maskable"`). Remove the combined `"any maskable"`.
4. Rebuild and verify all new files land in `out/`.

**Testing plan.** Extend `tests/seo.spec.ts` (runs in CI on chromium + Mobile Chrome):
assert `link[rel="apple-touch-icon"]` has an `href` ending `.png`; fetch `/manifest.json` via
`request` fixture and assert the icons array contains a `maskable` PNG entry and no combined
purpose; assert `GET /favicon.ico` returns 200 (in CI Playwright serves the real `out/`
artifact via `npx serve`, so this exercises the shipped payload). Unit coverage: no `.ts/.tsx`
logic changes beyond the `layout.tsx` metadata object, which `tests/unit/layout.test.tsx`
already covers — update its expectations for the new `icons` shape so the 80% gate is
unaffected. Run `npm run lint`, `npm run format:check`.

**Docs updates.** README "Project Structure" `public/` listing (add the new files);
CLAUDE.md has no icon inventory, no change needed. `docs-updater` Stop hook will flag
anything missed.

**Risks.** Maskable icon needs correct safe-zone padding or Android launchers crop the mark —
verify with a maskable preview tool. `favicon.ico` byte-size is trivial; no perf risk.
Multi-file asset PR — keep artwork identical to current SVG branding.

**Size:** M (mostly asset generation care, not code).

---

### B3 — Add JSON-LD structured data (P1, S)

**Objective & rationale.** The site invests heavily in SEO metadata (`app/layout.tsx` has full
OG/Twitter/robots config; `app/sitemap.ts`; `public/robots.txt`; a dedicated
`tests/seo.spec.ts`), but has zero schema.org structured data
(`grep 'ld+json'` — no matches). For a personal portfolio, a `Person` + `WebSite` JSON-LD
block is the standard next step: it feeds Google knowledge-panel/rich-result understanding and
is fully static.

**Current state.** No `<script type="application/ld+json">` anywhere. All person facts
already exist in code: name/title/description in `app/layout.tsx`, email + social profiles +
career start in `lib/site-config.ts` (`siteConfig`, `socialLinks`, `CAREER_START_YEAR`),
alumni info in `components/sections/EducationSection.tsx` (NCSU).

**Design / approach.** Build the JSON-LD object in a small pure module `lib/structured-data.ts`
exporting `personJsonLd()` / `websiteJsonLd()` (pure functions → trivially unit-testable,
mirroring how `lib/site-config.ts` centralizes facts — single source of truth, no duplicated
literals). Render in `app/layout.tsx` (server component, static export — the script is baked
into the HTML at build time; no client JS, no hydration concerns, no interaction with the
next-themes mount-guard pattern):

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }}
/>
```

`sameAs` derives from `socialLinks` hrefs; `email`/`url`/`jobTitle` from existing constants.
Note the CSP in `public/_headers` already allows inline scripts (`'unsafe-inline'` in
`script-src`, documented as intentional), so no `_headers` change is needed — and none should
be made, since `_headers` is the single security-header source of truth.

**Steps.**

1. Create `lib/structured-data.ts` with typed `personJsonLd()` and `websiteJsonLd()` (types can
   be minimal inline interfaces; no new dependency — do not add `schema-dts` unless wanted).
2. Import and render both scripts in `app/layout.tsx` `<body>` (or `<head>` via the layout —
   either is valid for JSON-LD).
3. Reuse `siteConfig` / `socialLinks` / `CAREER_START_YEAR` from `lib/site-config.ts`; add any
   missing fact (e.g. `alumniOf`) to `site-config.ts` rather than hardcoding in the new module.

**Testing plan.** Unit (Vitest, `tests/unit/structured-data.test.ts`): snapshot/assert the
generated objects (`@type: "Person"`, `sameAs` contains both social URLs, `url` is
`https://holland.vip`) — pure functions keep the 80% coverage gate comfortable, and update
`tests/unit/layout.test.tsx` to assert the script tags render. E2E: add a `tests/seo.spec.ts`
case that reads `script[type="application/ld+json"]`, `JSON.parse`s it, and asserts
`@type`/`name` — runs on chromium + Mobile Chrome in CI. `npm run lint` + `npm run format:check`.

**Docs updates.** CLAUDE.md "Site metadata" bullet: mention JSON-LD lives in
`lib/structured-data.ts` and renders from the layout. README Features list: extend the SEO
bullet.

**Risks.** Low. Only footgun is drift between JSON-LD facts and visible content — mitigated by
sourcing everything from `lib/site-config.ts`. `dangerouslySetInnerHTML` with
`JSON.stringify` of static data has no injection surface.

**Size:** S.

---

### B4 — Automate fallback-snapshot refresh (P1, M)

**Objective & rationale.** The Open Source section degrades to committed snapshots when the
build-time GitHub fetch fails (`lib/github.ts` `getFeaturedRepos()`,
`lib/github-contributions.ts` `getContributions()`). Those snapshots are frozen at
**2026-06-18** (repo `pushedAt` values in `lib/github-fallback.json`; last calendar day in
`lib/github-contributions-fallback.json`) and only get fresher when a human remembers to run
`scripts/seed-contributions.mjs` (contributions) or hand-edit JSON (repos — `lib/github.ts`
lines 8–18 say "Update this array (and `github-fallback.json`)"; **no seed script exists for
repos at all**). Unattended Cloudflare builds without `GITHUB_TOKEN`, or rate-limited ones,
will bake month-old data with no signal.

**Current state.** One manual seeder (`scripts/seed-contributions.mjs`, contributions only,
GraphQL, requires `GITHUB_TOKEN`); no repos seeder; no workflow refreshes either file; weekly
`refresh.yml` rebuilds the site but cannot freshen the _fallbacks_ (they're committed inputs).

**Design / approach.** Two parts, honoring "no runtime env vars" (this is all build/CI-side):

1. **`scripts/seed-repos.mjs`** — sibling of the contributions seeder: fetch each
   `FEATURED_REPO_SLUGS` repo via the same REST call shape as `lib/github.ts` `fetchRepo()`
   and write the normalized `Repo[]` to `lib/github-fallback.json`. Import `GITHUB_USER` /
   slugs cannot cross the `.mjs`/TS boundary cheaply — keep the seeder self-contained like
   `seed-contributions.mjs` already is (it re-declares `GITHUB_USER`), and add a unit test
   pinning the two slug lists in sync (read both files, compare arrays) so drift fails CI.
2. **`.github/workflows/seed-fallbacks.yml`** — monthly cron + `workflow_dispatch`: checkout,
   setup-node from `.nvmrc`, run both seeders with the built-in `${{ secrets.GITHUB_TOKEN }}`
   (REST works with it; the GraphQL contributions query needs a PAT-scoped token only if the
   default token proves insufficient — verify on first run, else use a fine-grained PAT secret
   like `refresh.yml` uses `CLOUDFLARE_DEPLOY_HOOK_URL`), run `npm run format` on the JSON,
   and open a PR via `peter-evans/create-pull-request` (a PR, not a push — `main` requires PRs
   and CI must gate the change; matches the repo's protection posture documented in
   CLAUDE.md/version.yml design).

**Steps.**

1. Add `scripts/seed-repos.mjs` (mirror `seed-contributions.mjs` structure: env-token check,
   fetch, normalize with the exact `Repo` field mapping from `lib/github.ts` `toRepo()`,
   `writeFile` with trailing newline + 2-space JSON).
2. Add npm scripts: `"seed:repos"`, `"seed:contributions"` (wrap the existing script) in
   `package.json`.
3. Add `.github/workflows/seed-fallbacks.yml` (monthly, e.g. `17 6 3 * *`; `permissions:
contents: write, pull-requests: write` scoped to the job; PR title
   `chore: refresh GitHub fallback snapshots`).
4. Add `tests/unit/seed-sync.test.ts`: assert `lib/github-fallback.json` slugs ===
   `FEATURED_REPO_SLUGS` order/content, and that both fallback files parse into the `Repo[]` /
   `ContributionCalendar` shapes (reuses exported types — keeps fallback edits honest).
5. Update the `lib/github.ts` doc comment (line 9–11) to point at `npm run seed:repos` instead
   of "update this array (and `github-fallback.json`)" by hand.

**Testing plan.** Unit: the new `seed-sync.test.ts` (shape + slug-sync assertions) — note
`scripts/**` is outside the Vitest coverage `include` (`app/**, components/**, lib/**` in
`vitest.config.ts`), so the seeder itself doesn't move the 80% gate; the _contract_ is what's
tested. E2E: none needed (no rendered behavior change). Workflow: first run via
`workflow_dispatch`, confirm the PR opens and CI passes on it. `npm run lint` +
`npm run format:check` (the seeded JSON must be Prettier-clean — the workflow runs
`npm run format` before committing).

**Docs updates.** CLAUDE.md CI/CD section: add a "Fallback seeding" bullet describing
`seed-fallbacks.yml` (cadence, token, PR flow). README workflows tree + the `.github/workflows`
listing. `lib/README.md` gets fixed in B7 — fold the two seeders into its inventory there.

**Risks.** GraphQL with the default `GITHUB_TOKEN` may 401 for the contributions query
(Actions token is repo-scoped; user contribution calendars may require a user PAT) — the
workflow must fail loudly (like `refresh.yml` does for its secret) rather than commit an empty
calendar; the seeder already throws on missing/failed token. PR automation on a protected
branch is deliberately chosen over direct push (a push would bypass CI and is likely blocked
anyway).

**Size:** M.

---

### B5 — Broaden the production smoke check (P2, S)

**Objective & rationale.** `smoke.yml` is the only thing that exercises the _deployed_ site
(CLAUDE.md: "the only check that exercises the deployed site"), but it verifies just the
homepage: HTTP 200, the string "Jerry Holland", and 4 headers (`content-security-policy`,
`strict-transport-security`, `x-content-type-options`, `x-frame-options`). Unverified today:
`robots.txt`, `sitemap.xml`, `manifest.json`, `og-image.png` (a broken OG image silently kills
link previews), 404 behavior, the `www.holland.vip` → apex 301 that README/CLAUDE.md both
document, and 3 of the 7 headers in `public/_headers` (`referrer-policy`,
`permissions-policy`, `x-dns-prefetch-control`). After B1 lands, `/README.md` returning 404 is
also worth pinning.

**Current state.** `.github/workflows/smoke.yml` — daily cron 07:23 UTC + dispatch, two steps
(homepage content; security headers).

**Design / approach.** Extend the existing workflow (same file, same curl style — no new
tooling, no Playwright-against-prod complexity):

- **Step "Standard artifacts respond":** loop over `robots.txt` (assert 200 + contains
  `Sitemap:`), `sitemap.xml` (200 + contains `<urlset`), `manifest.json` (200 + valid JSON via
  `jq -e .name`), `og-image.png` (200 + `content-type: image/png`).
- **Step "Redirects and 404s":** `curl -o /dev/null -w '%{http_code}' https://www.holland.vip/`
  without `-L`, assert `301` and `location: https://holland.vip/`; assert a garbage path
  (e.g. `/definitely-not-a-page-9f8e7`) returns `404`; after B1, assert `/README.md` → `404`.
- **Headers step:** add the 3 missing `require_header` lines to match `public/_headers`
  one-for-one (keeping `_headers` the single source of truth — the smoke asserts presence, it
  does not define values).

**Steps.**

1. Edit `.github/workflows/smoke.yml`: add the two steps, extend `require_header` list.
2. Keep `set -euo pipefail`, `--retry 3 --retry-delay 5`, and `::error::` annotations
   consistent with the existing steps.

**Testing plan.** No Vitest/Playwright surface (workflow-only). Validate YAML with
`npx prettier --check .github/workflows/smoke.yml` (the format gate covers YAML) and dry-run
the assertions locally against the live site with the same curl commands. Trigger once via
`workflow_dispatch` after merge.

**Docs updates.** CLAUDE.md "Post-deploy smoke" bullet: update the description of what it
asserts. README workflows list line for `smoke.yml`.

**Risks.** The www-redirect assertion depends on Cloudflare dashboard config (not in-repo) —
if the redirect rule is ever removed, smoke fails; that is the point, but confirm the current
behavior with one live curl before pinning the exact status code (301 vs 308). Flaky-network
handling already exists via curl retries.

**Size:** S.

---

### B6 — Surface live-vs-fallback data source as an observable marker (P2, S/M)

**Objective & rationale.** `getFeaturedRepos()` and `getContributions()` never throw — by
design they degrade to committed fallback JSON with only a build-log `console.warn`
(`lib/github.ts` line 89, `lib/github-contributions.ts` line 134). Cloudflare builds are
unattended, so the production site can silently run on stale snapshot data indefinitely (the
weekly `refresh.yml` rebuild makes it _more_ likely a failing token goes unnoticed — every
rebuild "succeeds"). There is currently no way to tell, from outside, which source a deploy
used.

**Current state.** `app/page.tsx` awaits both fetchers and passes data to
`OpenSourceSection`; degradation is invisible in the rendered HTML.

**Design / approach.** Thread a source flag through to a DOM data attribute — zero runtime
JS, static-export-safe, invisible to users:

1. Change both fetchers to return a discriminated result instead of bare data:
   `{ data: Repo[]; source: "live" | "fallback" }` (new exported type in each lib module;
   the catch branch returns `source: "fallback"`). Keep the never-throws contract.
2. `app/page.tsx` destructures and passes `data` as today, plus renders the section wrapper
   with `data-github-source={reposSource === "live" && contribSource === "live" ? "live" : "fallback"}`
   (attribute on the `OpenSourceSection` root — a new optional `dataSource` prop, composed
   with `cn()` untouched since this is an attribute, not a class).
3. Extend `smoke.yml` (builds on B5): `grep -o 'data-github-source="[a-z]*"' body.html` and
   emit a `::warning::` (not a failure — fallback is a _designed_ degradation, and a GitHub
   API outage should not page as a site outage) when the value is `fallback` for the daily
   run. A persistent warning streak is the operator signal to check the Cloudflare build env's
   `GITHUB_TOKEN`.

**Steps.**

1. `lib/github.ts`: add `export interface RepoResult { data: Repo[]; source: DataSource }`,
   adjust `getFeaturedRepos()`; same pattern in `lib/github-contributions.ts`
   (`ContributionsResult`). Export a shared `type DataSource = "live" | "fallback"` from
   `lib/github.ts`.
2. `app/page.tsx`: adapt call sites; pass `dataSource` to `OpenSourceSection`.
3. `components/sections/OpenSourceSection.tsx`: accept optional `dataSource?: DataSource`,
   spread as `data-github-source` on the `<section>`.
4. `.github/workflows/smoke.yml`: add the warning grep.

**Testing plan.** Unit (Vitest, existing files): `tests/unit/github.test.ts` /
`github-contributions.test.ts` already test the degradation paths — update assertions for the
new result shape (`source === "fallback"` when fetch rejects, `"live"` on success);
`tests/unit/OpenSourceSection.test.tsx` asserts the attribute renders;
`tests/unit/page.test.tsx` updated for the new fetcher return type. This is a
signature change, so the 80% gate is exercised by touched tests, not threatened. E2E: none
required (attribute is inert), but `tests/homepage.spec.ts` may pin that the attribute exists
with either value. `npm run lint`, `npm run format:check`.

**Docs updates.** CLAUDE.md "Build-time GitHub data" paragraph — describe the result shape and
marker (this also forces fixing the "degrade to empty data" inaccuracy — coordinate with B7).
README Features/E2E lists unchanged.

**Risks.** Breaking change to two lib signatures — all consumers are in-repo (one page + tests),
so the blast radius is fully visible. Do not fail smoke on `fallback`: a GitHub outage must not
masquerade as a holland.vip outage.

**Size:** S/M.

---

### B7 — Fix documentation drift (P2, S)

**Objective & rationale.** Two concrete inaccuracies found in the sweep:

- **CLAUDE.md line 248** claims the GitHub fetchers "degrade to empty data". They do not —
  both degrade to _committed fallback snapshots_ (`lib/github-fallback.json`,
  `lib/github-contributions-fallback.json`), which is a materially different behavior (stale
  content vs an empty section) and matters for anyone reasoning about the refresh/seed
  workflows. The repo has a docs-freshness Stop hook + `docs-updater` agent precisely to keep
  this file truthful.
- **`lib/README.md`** documents only `utils.ts` and still carries scaffold-era boilerplate
  ("Common Utilities to Add: `formatDate.ts`, `validation.ts`, `api.ts`…"), while the real
  `lib/` contains `github.ts`, `github-contributions.ts`, `site-config.ts`,
  `github-fallback.json`, `github-contributions-fallback.json`.

**Current state / design.** Pure documentation edits; no code. Rewrite `lib/README.md` as an
accurate inventory (one short subsection per module: purpose, key exports, related seeder or
consumer) and delete the aspirational "Common Utilities to Add" section (it is exactly the kind
of phantom roadmap this plan exists to avoid). Fix the CLAUDE.md sentence to "they degrade to
the committed fallback snapshots in `lib/*-fallback.json` (see `scripts/seed-contributions.mjs`)".

**Steps.**

1. Edit `CLAUDE.md` (Content Structure → "Build-time GitHub data" paragraph).
2. Rewrite `lib/README.md` inventory; keep the `cn()` usage example (it is accurate).
3. If B4/B6 land first, fold their additions (seeders, result shape) into the same edits.

**Testing plan.** `npm run format:check` (Prettier formats markdown and is CI-gated). No test
changes. The read-only docs Stop hook should come up clean afterward.

**Docs updates.** This item _is_ the docs update.

**Risks.** None beyond merge conflicts with B4/B6 — sequence it last of the three or rebase.

**Size:** S.

---

## 4. Remaining items — short outlines

### B8 — Publish RFC 9116 `security.txt` (P3, S)

`SECURITY.md` defines private vulnerability reporting, but scanners/researchers look for
`/.well-known/security.txt`. Add `public/.well-known/security.txt` with `Contact:` (the
SECURITY.md reporting channel), `Policy:` (GitHub SECURITY.md URL), `Expires:` (~1 year;
calendar a bump). Static export copies nested `public/` dirs into `out/` — verify with a build.
Extend `smoke.yml` to assert it returns 200 (pairs with B5). Docs: README Security section
one-liner. Risk: an expired `Expires:` field is worse than absence — pick a renewal reminder
(e.g. the monthly seed workflow of B4 could grep the date and warn).

### B9 — Lighthouse CI performance budget job (P3, M)

README claims "Performance optimized (Core Web Vitals)" with no measurement; a11y already has
an automated gate (axe in `tests/accessibility.spec.ts`), so perf is the asymmetry. Add a CI
job (needs `build`, downloads the `static-site` artifact like the Playwright job) running
`@lhci/cli` `lhci autorun` against `npx serve out` with budget assertions (performance ≥ 0.9,
LCP/CLS budgets) on chromium. Keep it non-blocking (`continue-on-error` or warn-level
assertions) initially to observe variance on shared runners before gating. Docs: CLAUDE.md
CI/CD bullet + README features. Risk: Lighthouse score noise on GitHub runners — budget on
metric values, not the composite score, if flaky.

### B10 — Verify the weekly refresh actually deployed (P3, S)

`refresh.yml` POSTs the Cloudflare deploy hook and stops at "2xx received". Add a follow-up
step (or a `workflow_call` reuse of the smoke job): sleep/poll for the build window
(~3–5 min), then re-run the smoke assertions — with B6 in place, also check
`data-github-source` and warn on `fallback` (a refresh that rebuilt into fallback data
defeats its purpose). Risk: Cloudflare build duration variance — poll with a deadline rather
than a fixed sleep.

### B11 — Scheduled cross-browser Playwright run (P3, S)

Firefox/WebKit projects exist in `playwright.config.ts` but never run in CI (chromium +
Mobile Chrome only) — CLAUDE.md documents the gap explicitly. Add a weekly scheduled workflow
(not per-PR; keeps PR CI fast, which is the current design intent) that builds and runs
`npx playwright test --project=firefox --project=webkit` (and optionally Mobile Safari)
against the `out/` artifact, `workflow_dispatch`-able. Failures open visibility without
blocking merges. Docs: CLAUDE.md testing section caveat gets a pointer to the scheduled run.

---

## 5. Suggested sequencing

1. **B1** (one-commit hygiene fix; ship immediately).
2. **B2 + B3** (independent; both small SEO/platform wins; both extend `tests/seo.spec.ts`).
3. **B5** (smoke breadth — also picks up B1's 404 assertion).
4. **B6 → B4 → B7** in that order (B6 changes the lib signatures, B4 adds the seeders, B7
   rewrites the docs once both are true).
5. **B8–B11** opportunistically.
