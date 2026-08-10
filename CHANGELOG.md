# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) via the
`v<major>.<minor>.<build>` tags minted by `.github/workflows/version.yml`.

_Releases before 1.1.0 used a legacy 4-part `v1.0.0.x` tag scheme and predate this changelog._

## [Unreleased]

No unreleased changes.

## [1.1.31] - 2026-08-09

### Added

- A root `CONTEXT.md` now defines the portfolio's domain language, including the distinctions
  between skills and capabilities, professional projects and featured repositories, and current
  exploration versus established expertise.

### Changed

- The `/ship` workflow now classifies each branch as major, minor, or build-only before computing
  its exact release, confirms major/minor release-line changes, regenerates agent artifacts, and
  verifies the same sync gate enforced by CI.
- The installed engineering workflows now carry work through review, accepted fixes, the required
  changelog entry, and PR creation, while preserving this repo's existing tracker and domain-doc
  configuration on setup reruns.

### Fixed

- Agent-facing guidance now matches the repository's actual CSS tokens, static-export Playwright
  target, 95% coverage gate, generated-file banners, framework version, and test inventory.
- Repo-local skill guidance now uses the real standards sources, Vitest-native examples,
  skill-relative support files, and neutral triage examples; all generated Claude mirrors and
  project skill hashes were refreshed from the authored sources.

## [1.1.30] - 2026-08-09

Closes [#99](https://github.com/jwh3times/holland-vip/issues/99).

### Added

- `tests/global-setup.ts` — the e2e suite now refuses to run against a server that isn't this site.
  `reuseExistingServer` is on locally and accepts whatever already holds port 3000; since that's the
  Next.js default, another project's dev server could silently become the system under test. It
  happened twice during the architecture review — 20 of 72 tests failed with assertions that read
  like a regression here, and nothing in the output mentioned the port. A false _pass_ was possible
  the same way.

  The check probes `baseURL` and, if something answers, requires this site's `og:url` and name
  before any test runs. Nothing listening is fine — Playwright starts ours. Only a foreign server is
  rejected, and the error names the port, the foreign `<title>`, what was missing, and the
  `netstat`/`lsof` command to find the process.

### Changed

- `siteUrl` moved from `app/layout.tsx` into `siteConfig.url`, joined by `siteConfig.name`, so the
  identity check reads the same source the metadata does and can't drift from it.

## [1.1.29] - 2026-08-09

Closes [#92](https://github.com/jwh3times/holland-vip/issues/92), the last finding from the
architecture review tracked in [#93](https://github.com/jwh3times/holland-vip/issues/93).

### Changed

- **The unit-coverage gate now measures code where coverage means something, at 95% instead of 80%.**
  A component whose body is a single JSX expression is one statement to V8, so it reported 100% the
  moment anything rendered it — `components/ui/section.tsx` scored 4/4 over 118 physical lines.
  Across the old scope V8 instrumented 180 lines of 2,023 physical (9%), so the headline percentage
  described almost nothing while reading as a guarantee. `components/sections/**` and the pure-JSX
  shells (`section`, `card`, `badge`, `bento-grid`) are now excluded, and all four thresholds are
  95% over the remaining 19 files.
- The excluded modules are not untested. Their behaviour is asserted through the seams added
  earlier in the review — surface alternation and the anchor registry in `section.test.tsx`,
  rendered copy in `sections.test.tsx`, accents in `accent.test.tsx`.

### Added

- Tests for the five branches that were uncovered in the narrowed scope, each asserting what the
  branch is for rather than merely executing it:
  - `app/page.tsx` — the empty-repos path drops the Open Source section, and the sections that
    remain still alternate surfaces. This is the mechanism that stops a missing section re-phasing
    the ones below it.
  - `components/mode-toggle.tsx` — the SSR placeholder, reachable only through `renderToString`.
    Asserts it is inert and announces no theme-dependent label before hydration.
  - `lib/github.ts` and `lib/github-contributions.ts` — the documented degrade-to-empty arms for a
    corrupt committed snapshot.
  - `lib/github-contributions.ts` — an unrecognised `contributionLevel` renders as level 0 rather
    than `undefined`, which would break the heatmap's class lookup.
- `@types/react-dom` as a devDependency, needed for `react-dom/server` in the SSR test.

### Notes

- The narrowed scope sits at 100% on all four metrics, five points above the gate. The gate was
  verified to bite: removing three `lib` test files drops branches to 61% and fails with exit 1 on
  all four metrics. That same regression would have passed the old 80% gate on statements (81.6%)
  and lines (84.6%).

## [1.1.28] - 2026-08-09

The two independent items from [#92](https://github.com/jwh3times/holland-vip/issues/92) — the ones
that needed no decision about the coverage threshold.

### Added

- `parseRepos()` in `lib/github.ts` and `parseCalendar()` in `lib/github-contributions.ts`, replacing
  unchecked `as` casts over the two committed fallback snapshots. Both return `null` rather than
  throwing, so the degradation path still can't break the build; a malformed snapshot now degrades
  to empty rather than rendering garbage.
- `tests/unit/github-fallback.test.ts` — 10 cases asserting the committed snapshots parse, cover
  every entry in `FEATURED_REPO_SLUGS`, and hold ascending ISO dates across 50–54 weeks.
- `aria-controls` on the mobile menu toggle, and `id="mobile-menu"` on the panel it opens.

### Changed

- The e2e specs no longer select on Tailwind utility classes. `mobile-navigation.spec.ts` targets
  `data-testid="desktop-nav"` and `#mobile-menu` instead of `.hidden.md:flex` and
  `.md:hidden` + `.last()`, and asserts `aria-expanded` flips. `accessibility.spec.ts` asserts the
  skip link's measured geometry — collapsed to ≤2px, larger and visible on focus — instead of
  matching class names, and adds a check that it is the first tabbable element.

### Fixed

- The skip-link assertions were vacuous. `toHaveClass(/sr-only/)` matches the substring inside
  `focus:not-sr-only`, so it passed even when `sr-only` was absent and the link was never hidden.
  Confirmed by removing `sr-only` from `app/layout.tsx`: the new geometry assertion fails, the old
  one did not.

## [1.1.27] - 2026-08-09

Wave 3 of the architecture review tracked in [#93](https://github.com/jwh3times/holland-vip/issues/93),
part three and the last of the wave: the `globals.css` interface
([#90](https://github.com/jwh3times/holland-vip/issues/90)).

### Added

- `tests/unit/globals-css.test.ts` — a guard on the `globals.css` interface. It fails the build on
  a utility class with no caller, an `@keyframes` block no animation references, a CSS variable
  nothing reads, a class undocumented in `CLAUDE.md` or `AGENTS.md`, or two text tokens with
  identical values in both themes. This replaces the by-hand audit that found the original dead
  classes.

### Removed

- `.text-badge` / `--badge-text` and `.text-subheading` / `--subheading-text`. Both were
  byte-identical to `--heading-text` in light and dark, so they were exact aliases of
  `.text-heading` and offered callers three names for one colour. Their two call sites now use
  `.text-heading` directly — no visual change.

### Changed

- `CLAUDE.md` and `AGENTS.md` now document `.bento-card-bg` and `.card-bg-white-80`, the last two
  utility classes missing from the files agents are told to read.

### Notes

- The remaining single-caller classes stay. `card-bg-*` and `text-badge-*` have one reference each
  because that reference is `lib/accent.ts`, and `section-surface` / `section-surface-contrast`
  because theirs is `components/ui/section.tsx` — one consumer because the consumer is the seam.
  `hero-section`, `glass`, `gradient-text-blue`, and `bento-card-bg` express theme-aware gradients,
  `backdrop-filter`, and `background-clip: text`, which utility classes can't replace.

## [1.1.26] - 2026-08-09

Wave 3 of the architecture review tracked in [#93](https://github.com/jwh3times/holland-vip/issues/93),
part two: the content seam ([#86](https://github.com/jwh3times/holland-vip/issues/86)).

### Added

- `content/` — ten typed modules holding what the site says, separate from how it looks:
  `hero`, `about`, `skills`, `capabilities`, `problem-solving`, `experience`, `projects`,
  `education`, `contact`, and `open-source`. Editing the resume is now a one-file change that
  doesn't involve opening a component.

### Changed

- Section components no longer own any copy. The nine unshared record shapes they each defined now
  share one vocabulary, and the four sections that had prose welded into JSX — About's three
  biography paragraphs, Education's school, degrees and badges, Hero, and Contact — carry it as
  data.
- `content/projects.ts` names an icon with a `ProjectIcon` key rather than embedding JSX in a data
  array; `ProjectsSection` maps the key to a Lucide component, keeping presentation out of content.
- `ProblemSolving` renders its three per-card rows from `challengeRows` instead of three
  near-identical JSX blocks.
- `tests/unit/sections.test.tsx` imports the content modules and asserts against them instead of
  restating nine of their strings, so a resume edit no longer breaks the test file. The assertions
  also got stronger: they now cover every career highlight, skill, capability, challenge row, role,
  project, degree, and education badge rather than one sample of each.
- Docs corrected while updating them: the contact email is read from `siteConfig.email` in
  `lib/site-config.ts`, not hardcoded in `app/page.tsx` as `CLAUDE.md` and `README.md` claimed.

### Notes

- This change is text-for-text lossless. The rendered text of `out/index.html` was compared against
  `main` after normalizing whitespace and is identical.

## [1.1.25] - 2026-08-09

Wave 3 of the architecture review tracked in [#93](https://github.com/jwh3times/holland-vip/issues/93),
part one: the accent seam ([#89](https://github.com/jwh3times/holland-vip/issues/89)).

### Added

- `lib/accent.ts` — the site's accent palette as one union and one token table. `Accent` is
  `blue | green | purple | orange`; `accent[key]` yields `text`, `bullet`, `dot`, `ring`, `border`,
  `cardBg`, `badge`, and `iconChip`. `accentAt(index)` cycles for lists with no inherent accent.
- `components/ui/badge.tsx` — the pill badge, replacing five hand-written copies of the same class
  string that had drifted into two token orderings, one of them baked into content data.
- `components/ui/card.tsx` — the card shell, replacing five near-copies that had drifted on padding
  and on `transition-all` vs `transition-colors`. Takes an optional `accent` for tinted cards,
  `padding` (`md` / `lg`), and `interactive` for the hover lift.
- `tests/unit/accent.test.tsx` — 12 cases, including a guard that each accent's tokens actually name
  that accent, which catches a copy-paste slip like `green.dot = "bg-blue-500"`.

### Changed

- Content records across the section modules carry `accent: Accent` instead of `colorClass`,
  `bulletColor`, or inline Tailwind strings. The two local types both named `ColorKey` — which meant
  different things in `AboutSection` and `ExperienceSection` — are gone, as is `OpenSourceSection`'s
  index-cycled `accents` array. Adding a fifth accent is now one edit instead of seven.
- Green and orange heading text settles on the 700 shade. Both 600 and 700 were already in use
  (`SkillsSection` had 700; `AboutSection` and `TechnicalCapabilities` had 600), and 700 is the one
  that clears WCAG AA for normal-size text on the light surfaces. Blue and purple stay at 600.
- `README.md`'s `lib/` tree now lists the modules that are actually there rather than only
  `utils.ts`.

### Notes

- `ContributionHeatmap`'s level scale is deliberately left alone — it maps contribution intensity
  0–4, which is not accent identity.

## [1.1.24] - 2026-08-09

Wave 2 of the architecture review tracked in [#93](https://github.com/jwh3times/holland-vip/issues/93):
the Section shell ([#85](https://github.com/jwh3times/holland-vip/issues/85)).

### Added

- `components/ui/section.tsx` — the page-section shell every body section renders through. It owns
  the `py-20` rhythm, the centered container, the `h2`, the typed anchor id, and the background
  surface. Exports `Section`, `SECTION_IDS` / `NAV_SECTION_IDS` (the anchor registry),
  `SectionSurface`, `SectionSurfaceProps`, and `surfaceAt`.
- Playwright coverage for the two contracts that previously had none: no two adjacent sections
  share a computed background, and every nav anchor resolves to a section that exists.
- `tests/unit/section.test.tsx` — 13 cases covering the shell, the alternation invariant, and the
  id registry.

### Changed

- **Sections no longer choose their own background.** `app/page.tsx` holds the ordered
  `bodySections` list and derives each surface from position via `surfaceAt(index)`. The nine body
  sections accept `SectionSurfaceProps` and forward it. `HeroSection` is unaffected — it keeps its
  own background and sits outside the alternation.
- `OpenSourceSection`'s empty-repos check moved up into `app/page.tsx`, which now drops the section
  from the ordered list rather than having the section return `null` at render time.
- `Navigation` builds its links from `NAV_SECTION_IDS` and a total `Record<NavSectionId, string>`
  of labels instead of a hand-written array of `{ href, label }` literals. A nav link pointing at a
  section id that doesn't exist is now a type error.
- Section heading margins collapsed from four values (`mb-4`, `mb-6`, `mb-12`, `mb-16`) to one
  rule: `mb-12`, or `mb-4` when a subtitle follows. Education, Experience, and Problem-Solving
  headings tighten slightly; Contact's loosens.
- `ContactSection`'s intro paragraph now renders as the shell's subtitle: centered and constrained
  to `max-w-2xl`, at the shared subtitle size rather than `text-lg`.

### Fixed

- **Adjacent sections rendered on the same background.** `OpenSourceSection` and `EducationSection`
  were both `section-surface`, breaking the alternation the docs describe. Worse, `OpenSourceSection`
  returning `null` at runtime silently re-phased every section below it. Both are structural now:
  surfaces are assigned from position after the list is built.
- `#education` was an anchor nothing linked to and nothing checked. It is still deliberately absent
  from the nav, but that is now a recorded decision in the id registry rather than an accident.

## [1.1.23] - 2026-08-09

Wave 1 of the architecture review tracked in [#93](https://github.com/jwh3times/holland-vip/issues/93)
— four independent findings, none of which touch the section modules.

### Added

- `components/ui/cta.tsx` — the site's call-to-action module. Interface is two variants
  (`primary`, `secondary`) and two sizes (`md`, `lg`); the implementation derives the rendered
  element from the props (no `href` → `<button>`, `/…` → `next/link`, anything else → `<a>` with
  `target`/`rel` for external hosts) and owns focus-visible rings the hand-copied CTAs never had.
- `lib/github-fetch.ts` — `githubFetch` (auth headers, `force-cache`, non-OK → throw, optional
  `requireToken`) and `withFallback` (degrade to a committed snapshot, warn once). Both
  `getFeaturedRepos` and `getContributions` now sit behind it.
- `lib/github-contributions-query.mjs` — the GraphQL query and contribution-level map, shared with
  `scripts/seed-contributions.mjs` so a query change can't silently drift the committed snapshot.
  Plain `.mjs` because that script runs under bare `node` with no build step.
- Tests: `tests/unit/cta.test.tsx` (11 cases, element derivation and variants),
  `tests/unit/github-fetch.test.ts` (9 cases asserting the fetch/degrade policy directly), and
  two `agent-sync` cases covering binary asset copying and CRLF sources.

### Changed

- `getFeaturedRepos` now documents its request count and failure mode: one request per entry in
  `FEATURED_REPO_SLUGS` via `Promise.all`, so a single failure discards the whole batch.
  `getContributions` issues one.
- `scripts/lib/agent-sync.mjs` states in its header that `syncAll` is the entry point and the pure
  transforms are exported only as test handles.

### Removed

- `components/ui/button.tsx` and its test — 24 declared variant/size combinations over a four-line
  implementation with one production caller using two of them. The one ghost icon button is
  inlined into `mode-toggle.tsx`; the five real CTAs now go through `Cta`.
- `@radix-ui/react-slot` and `class-variance-authority` dependencies, unused once `button.tsx` went.
- Dead `globals.css` surface: `.text-balance` (Tailwind v4 provides it), `.animate-fadeIn`,
  `.animate-slideInLeft`, `.animate-slideInRight`, `.animate-scaleIn`, their four `@keyframes`
  blocks, and the unreferenced `--border` / `--muted-foreground` variables.
- `bannerLine` and `DEFAULT_PATHS` from the `agent-sync` module's exports — zero callers each.

### Fixed

- `ContactSection`'s CTA rendered in its own flat blue rather than the site's primary style; it now
  matches the other CTAs.

## [1.1.22] - 2026-08-08

### Added

- `docs/agents/` config consumed by the `mattpocock/skills` engineering skills (triage,
  to-tickets, to-spec, domain-modeling, etc.): `issue-tracker.md` (GitHub Issues via `gh`, with
  wayfinding operations), `triage-labels.md` (the five canonical triage-role labels, kept at
  their defaults), and `domain.md` (single-context `CONTEXT.md`/`docs/adr/` consumption rules —
  neither exists yet and is created lazily by `domain-modeling` when needed).
- `## Agent skills` section in `AGENTS.md` pointing to the new `docs/agents/*.md` files.

## [1.1.21] - 2026-08-07

### Added

- 25 third-party skills from `mattpocock/skills` under `.agents/skills/`, with provenance and
  content hashes recorded in `skills-lock.json`.

### Changed

- **Inverted the skill sync direction.** `.agents/skills/<name>/**` is now the authored source and
  `.claude/skills/<name>/**` is the generated mirror (previously the reverse). This matches where
  the skill installer writes, so installing or updating a skill is a one-way operation instead of
  a manual copy. Subagents are unchanged: `.claude/agents/<name>.md` still generates
  `.codex/agents/<name>.toml`.
- Moved the `ship` skill's authored source to `.agents/skills/ship/SKILL.md` so all skills follow
  one model.
- `.prettierignore` now excludes `.claude/skills/` instead of `.agents/`, so Prettier formats the
  authored skill sources and leaves the generated mirror to `scripts/sync-agents.mjs`.
- `sync-agents.yml` stages `.claude/skills`/`.codex` rather than `.agents`/`.codex`; without this
  the auto-sync workflow would have silently stopped committing drift.

### Notes

- The whole skill directory is drift-controlled — references, `scripts/*.sh`, and
  `agents/openai.yaml` — not just `SKILL.md`.
- The generated mirror must not be replaced with symlinks into `.agents/`: this repo is developed
  on Windows with `core.symlinks=false`, so Git commits duplicated content instead of links, and
  the generator skips symlinked directories and would prune the mirror as extraneous.

## [1.1.20] - 2026-08-07

### Security

- Resolved all open Dependabot alerts by refreshing transitive lockfile entries: `postcss`
  8.5.15 → 8.5.26 (GHSA-r28c-9q8g-f849 path traversal, GHSA-fxqj-rqcc-2cmp incomplete fix) and
  `brace-expansion` 1.1.15 → 1.1.18 / 5.0.6 → 5.0.9 (GHSA-3jxr-9vmj-r5cp ReDoS, plus
  GHSA-mh99-v99m-4gvg and GHSA-rgw5-rvv9-x895 surfaced by `npm audit`). `npm audit` now reports
  0 vulnerabilities.

### Changed

- Synced `package-lock.json` with the declared `package.json` ranges, which had drifted:
  `next` 16.2.9 → 16.3.0, `eslint` 10.5.0 → 10.8.0, `typescript-eslint` 8.61.1 → 8.65.0,
  `@tailwindcss/postcss` 4.3.1 → 4.3.3, `@vitejs/plugin-react` 6.0.2 → 6.0.5.

## [1.1.19] - 2026-08-07

### Changed

- Dependency bumps: `next` and `@next/eslint-plugin-next` 16.2.12 → 16.3.0,
  `@testing-library/user-event` 14.6.1 → 14.6.3.

## [1.1.18] - 2026-08-05

### Changed

- Dependency bump (transitive, lockfile only): `fast-uri` 3.1.4 → 3.1.5.

## [1.1.17] - 2026-08-03

### Changed

- Dependency bumps: `@playwright/test` 1.62.0 → 1.62.1, `@types/react` 19.2.17 → 19.2.18,
  `@vitejs/plugin-react` 6.0.4 → 6.0.5.

## [1.1.16] - 2026-07-30

### Changed

- Dependency bump: `lucide-react` 1.27.0 → 1.28.0.

## [1.1.15] - 2026-07-29

### Changed

- Dependency bumps: `@types/node` 26.1.1 → 26.1.2, `eslint` 10.7.0 → 10.8.0,
  `globals` 17.7.0 → 17.8.0, `jsdom` 30.0.0 → 30.0.1.

## [1.1.14] - 2026-07-27

### Changed

- Dependency bump (major): `jsdom` 29.1.1 → 30.0.0.

## [1.1.13] - 2026-07-27

### Changed

- Dependency bumps: `next` and `@next/eslint-plugin-next` 16.2.11 → 16.2.12,
  `@playwright/test` 1.61.1 → 1.62.0, `@radix-ui/react-slot` 1.3.1 → 1.3.3,
  `lucide-react` 1.26.0 → 1.27.0.

## [1.1.12] - 2026-07-23

### Changed

- Dependency bumps: `@eslint-react/eslint-plugin` 5.13.1 → 5.18.0, `eslint` 10.6.0 → 10.7.0,
  `typescript-eslint` 8.63.0 → 8.65.0, `lucide-react` 1.25.0 → 1.26.0,
  `@radix-ui/react-slot` 1.3.0 → 1.3.1.

## [1.1.11] - 2026-07-23

### Added

- Codex CLI support: skills and subagents are now generated from the canonical `.claude/` sources
  by `scripts/sync-agents.mjs` (`npm run sync:agents`), producing `.agents/skills/**` (a verbatim
  mirror of `.claude/skills/**`) and `.codex/agents/*.toml` (a transform of `.claude/agents/*.md`,
  with `sandbox_mode` derived from the `tools:` list and `model` omitted). Edit only the `.claude/`
  sources — every generated file carries a `GENERATED — do not edit` banner.
- `.github/workflows/sync-agents.yml`: on pull requests, regenerates the Codex artifacts and
  auto-commits any drift back to the branch (requires the `SYNC_PAT` secret; skips forks;
  self-terminating).
- A secret-free `node scripts/sync-agents.mjs --check` step in the `ci.yml` `build` job that fails
  the build on stale Codex artifacts, so drift is caught even before the auto-commit secret is set.

### Changed

- `.prettierignore` now excludes the generated `.agents/` and `.codex/` directories.

## [1.1.10] - 2026-07-22

### Changed

- Bumped the transitive `fast-uri` dependency from 3.1.2 to 3.1.4 (lockfile only).

## [1.1.9] - 2026-07-22

### Changed

- Bumped `next` and `@next/eslint-plugin-next` to 16.2.11, `react` and `react-dom` to 19.2.8, and
  `@vitejs/plugin-react` to 6.0.4.

## [1.1.8] - 2026-07-21

### Changed

- Bumped `prettier` from 3.9.5 to 3.9.6.

## [1.1.7] - 2026-07-21

### Changed

- Bumped `@testing-library/jest-dom` from 6.9.1 to 7.0.0.

## [1.1.6] - 2026-07-17

### Changed

- Bumped `lucide-react` to 1.25.0 and `@tailwindcss/postcss` to 4.3.3.

## [1.1.5] - 2026-07-16

### Added

- `/ship` skill (`.claude/skills/ship/SKILL.md`): refreshes docs, writes the `CHANGELOG.md`
  entry for the version the merge will mint, runs fast checks, and opens or updates the PR.
- `CHANGELOG.md`, following Keep a Changelog.
- `scripts/next-version.mjs`: the single source of truth for the next `major.minor.build`
  version, called by `version.yml`, the CI changelog guard, and `/ship`.
- CI `changelog` guard job in `.github/workflows/ci.yml` that fails a PR whose top
  `CHANGELOG.md` version does not match the version its merge will mint (skipped for Dependabot).

### Changed

- `.github/workflows/version.yml` now computes the release version via `scripts/next-version.mjs`
  instead of inline shell, so the tag workflow and the changelog guard share one implementation.
- The `docs-updater` agent now maintains `AGENTS.md` in addition to `CLAUDE.md` and `README.md`,
  so agent-facing guidance no longer drifts unnoticed.

### Fixed

- An unsound cast in `tests/unit/github-contributions.test.ts` that made `npx tsc --noEmit` fail
  (`TS2352`). No CI job type-checks test files, so it went unnoticed until `/ship` began gating on
  `tsc`.
- `.prettierignore` now excludes `.superpowers/` agent scratch. Prettier doesn't read nested
  `.gitignore` files, so `npm run format:check` failed on untracked working files.

### Removed

- The `Stop` hook in `.claude/settings.json` that ran a docs-freshness agent on every stop; docs
  are now refreshed once per `/ship`, when a branch is ready for review, rather than on every turn.

## [1.1.4] - 2026-07-15

### Changed

- Added `npm` and `github-actions` labels to `.github/dependabot.yml`.

## [1.1.3] - 2026-07-15

### Changed

- Moved the Dependabot update schedule to 05:00.

## [1.1.2] - 2026-07-14

### Changed

- Bumped `actions/setup-node` from 6 to 7.

## [1.1.1] - 2026-07-10

### Changed

- Bumped grouped minor/patch dependencies: `lucide-react` 1.23 → 1.24, `prettier` 3.9.4 → 3.9.5.

## [1.1.0] - 2026-07-09

### Added

- `AGENTS.md`: agent-facing guidance (commands, CI/CD, conventions, constraints) for coding
  agents that don't read `CLAUDE.md`.

### Changed

- Adopted the three-part `v<major>.<minor>.<build>` SemVer release scheme in
  `.github/workflows/version.yml`.
