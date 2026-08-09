# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) via the
`v<major>.<minor>.<build>` tags minted by `.github/workflows/version.yml`.

_Releases before 1.1.0 used a legacy 4-part `v1.0.0.x` tag scheme and predate this changelog._

## [Unreleased]

No unreleased changes.

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
