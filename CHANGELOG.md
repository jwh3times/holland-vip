# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) via the
`v<major>.<minor>.<build>` tags minted by `.github/workflows/version.yml`.

_Releases before 1.1.0 used a legacy 4-part `v1.0.0.x` tag scheme and predate this changelog._

## [Unreleased]

No unreleased changes.

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
