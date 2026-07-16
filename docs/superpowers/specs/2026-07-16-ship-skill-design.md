# Design: Replace the Stop hook with a `/ship` skill

**Date:** 2026-07-16
**Status:** Approved (pending spec review)

## Problem & motivation

`.claude/settings.json` currently registers a **Stop hook** that runs a docs-freshness
agent on _every_ stop of the main session. It is detection-only and, on drift, blocks the
stop and tells the session to invoke `docs-updater`.

We are replacing that always-on hook with an explicit **`/ship` skill**, modeled on the
guardiantracker repo's ship skill. Docs freshness moves _into_ the ship flow, so it runs
once — deliberately — when a branch is ready for a PR, instead of on every turn.

Because guardiantracker's ship skill is built around a CHANGELOG (backfill, write the entry
for the version the merge will mint, and a CI guard that verifies that prediction), we are
bringing that full machinery over. holland.vip has no CHANGELOG today; it releases via
`version.yml` auto-generated GitHub Release notes.

**Decisions locked during brainstorming:**

1. **Full CHANGELOG parity** — add `CHANGELOG.md`, backfill, ship writes the entry, add a CI
   guard job.
2. **Node `scripts/next-version.mjs` as single source of truth** — `version.yml`, the CI
   guard, and `/ship` all call it. `version.yml` is refactored to call it (true
   single-source, no drift).

## Repo facts this design relies on

- Versioning (`.github/workflows/version.yml`): on every push to `main`, reads
  `package.json` `version` (currently `1.1.0`) as the `major.minor` release line, scans
  `git tag -l "vMAJOR.MINOR.*"` for the highest build, and mints `v<major>.<minor>.<build>`
  where `build = max(highest_existing + 1, requested_build_floor)`.
- Latest tag on the current line is `v1.1.4`, so the next merge mints **`v1.1.5`**.
- Legacy pre-SemVer tags exist in a 4-part `v1.0.0.x` form (e.g. `v1.0.0.8`). These are not
  on the current scheme and are intentionally _not_ enumerated in the changelog.
- `docs-updater` subagent (`.claude/agents/docs-updater.md`) owns `CLAUDE.md` and
  `README.md`. It does **not** own `CHANGELOG.md`.
- Single npm package rooted at repo root; `npm run format:check` = `prettier --check .`
  covers every markdown file (CHANGELOG/CLAUDE/README) — no separate root command needed.
- Node is pinned via `.nvmrc` (single source; CI reads it with `node-version-file`).

## Deliverables

### 1. `scripts/next-version.mjs` (new — single source of truth)

Node ESM, matching the existing `scripts/seed-contributions.mjs`. No dependencies beyond
`node:fs` and `node:child_process`. Prints the bare next version (e.g. `1.1.5\n`) to stdout;
exits non-zero with a clear `::error::`-style message on a malformed `package.json` version.

Algorithm — a faithful port of the current `version.yml` inline logic:

1. Read `package.json` `version`; validate it matches `^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$`.
2. Split into `major`, `minor`, `requestedBuild`. `line = "${major}.${minor}"`.
3. `tags = git tag -l "v${line}.*"` (via `execFileSync("git", [...])`).
4. `builds = tags` with prefix `v${line}.` stripped, kept only if they match `^\d+$`,
   parsed to Number.
5. `lastBuild = builds.length ? Math.max(...builds) : null`.
6. `build = lastBuild === null ? requestedBuild : max(lastBuild + 1, requestedBuild)`.
7. Print `${line}.${build}`.

Requires tags to be present in the working copy (`git fetch --tags` beforehand in every
caller — CI checks out with `fetch-depth: 0`; `/ship` fetches tags in its preconditions).

### 2. `version.yml` refactor

Only touch to the release pipeline. Replace the inline `jq`/`sed`/`git` compute block with:

- Add an `actions/setup-node` step using `node-version-file: .nvmrc` (the checkout already
  uses `fetch-depth: 0`, so tags are present).
- `next=$(node scripts/next-version.mjs)` → `tag="v${next}"`.
- Keep the existing "tag already exists" guard, `git tag -a` / `git push`, `gh release
  create`, and the `$GITHUB_STEP_SUMMARY` block (derive its fields from `next`/`tag`).

Net effect on releases: byte-identical tag output, logic lives in one place. Risk is
bounded — the port is 1:1, and the new CI guard (deliverable 4) would flag any mismatch on
a PR before merge.

### 3. `CHANGELOG.md` (new)

[Keep a Changelog](https://keepachangelog.com) + SemVer format.

- Top section is `## [Unreleased]` with a `No unreleased changes.` placeholder (this is the
  convention `/ship` maintains — the entry for the minted version is inserted _below_ it).
- Backfilled dated sections for the current `v1.1.x` line (`v1.1.0`–`v1.1.4`), contents
  derived factually from `git show --stat <tag>` and each tag's commit date
  (`git log -1 --format=%ad --date=short <tag>`). Grouped under Keep a Changelog headings
  (Added/Changed/Fixed/Removed/Security).
- One summarizing `## [1.0.0]` "Initial release" section. The legacy 4-part `v1.0.0.x` tags
  are noted as pre-SemVer, not enumerated.

Backfill completeness is for honesty, not a guard requirement — the CI guard only checks the
_top_ released version (deliverable 4).

### 4. CI guard job `changelog` in `ci.yml` (new)

On PRs to `main`:

- `if: github.actor != 'dependabot[bot]'` — bot PRs don't touch the changelog and
  `version.yml` still tags them; this exemption is what makes bot merges safe.
- Checkout `fetch-depth: 0`, `actions/setup-node` with `node-version-file: .nvmrc`.
- `expected=$(node scripts/next-version.mjs)`.
- `top=$(grep -m1 -E '^## \[[0-9]+\.[0-9]+\.[0-9]+\]' CHANGELOG.md | sed -E 's/^## \[([0-9.]+)\].*/\1/')`
  (skips `## [Unreleased]`, which has no version digits).
- Fail with an actionable message unless `expected == top`.

### 5. `.claude/skills/ship/SKILL.md` (new)

Adapted from guardiantracker to this stack. Announce at start:
"I'm using the ship skill to open a PR for this branch." Steps:

1. **Preconditions — stop if any fail:** not on `main` (offer `git checkout -b agent/<topic>`);
   clean working tree (`git status --porcelain` — ask before committing anything); `gh auth
   status` succeeds. Fetch tags (`git fetch --tags -q origin`).
2. **Backfill** any tag with no matching `## [x.y.z]` section (factual, from `git show`).
3. **Compute target version:** `node scripts/next-version.mjs` — the single source of truth;
   never hand-compute.
4. **Refresh docs:** invoke `docs-updater` scoped to this branch's diff only
   (`git diff $(git merge-base main HEAD)..HEAD --stat`). Tell it what changed; tell it to
   **leave `CHANGELOG.md` alone** (ship owns it).
5. **Write the CHANGELOG entry** for the target version immediately below `## [Unreleased]`
   (which stays, with its `No unreleased changes.` placeholder). Date = today `YYYY-MM-DD`;
   Keep a Changelog headings; user-visible behavior, not a commit log. **Idempotent** —
   rewrite in place on re-ship; renumber if the target version changed.
6. **Fast checks — refuse to push if any fail:** `npm run format:check`, `npm run lint`,
   `npx tsc --noEmit`. Run after the doc/changelog edits (root prettier covers all
   markdown). Fix formatting with `npm run format`. Build, unit-coverage, and Playwright are
   CI-owned and not run here.
7. **Commit** docs + changelog: `git commit -m "docs: update docs and changelog for v<version>"`.
8. **Push and open/update PR:** `git push -u origin <branch>`; if a PR exists
   (`gh pr list --head <branch> --state open ...`) `gh pr edit`, else `gh pr create --base
   main` with body derived from the changelog section. Do not open a second PR.
9. **Report:** PR URL, the version this merge will mint, anything backfill/checks surfaced.
   State plainly that tests run in CI, not locally.

**Do not:** merge the PR (stops at "PR open"; no self-merge), push to `main`, run full test
suites, or invent the version number.

### 6. `.claude/settings.json` edit

Delete the `hooks.Stop` block; keep the `permissions` block unchanged.

### 7. `CLAUDE.md` updates

Rewrite the "Agents & docs automation" section: docs are refreshed by `/ship` (which invokes
`docs-updater` on the branch diff) instead of a Stop hook. Add `CHANGELOG.md`,
`scripts/next-version.mjs`, and the `changelog` CI guard job to the CI/CD and repo
documentation. (Seeded here; `docs-updater` owns the final wording.)

## Fast-checks rationale

`format:check` + `lint` + `tsc --noEmit` run in seconds and catch the majority of pre-PR
mistakes. Unit tests (Vitest) are excluded from the local gate to keep `/ship` snappy — CI's
`unit` job runs them with the 80% coverage gate. (Reversible: add `npm run test:unit` to
step 6 if desired.)

## Non-goals / explicit choices

- No self-merge; `/ship` stops at "PR open".
- Backfill only the `v1.1.x` line + one `1.0.0` summary; legacy 4-part `v1.0.0.x` tags are
  not enumerated.
- Unit tests stay CI-only, not in the local fast-check gate.
- `version.yml`'s _behavior_ is unchanged — only its implementation is refactored to the
  shared script.

## Verification plan

- `node scripts/next-version.mjs` prints `1.1.5` in the current repo state.
- CHANGELOG top released version == `next-version` output (guard passes locally).
- `npm run format:check`, `npm run lint`, `npx tsc --noEmit` all green after edits.
- `ci.yml` and `version.yml` parse as valid YAML; the `changelog` job is skipped for
  dependabot and runs otherwise.
- Stop hook no longer fires (no docs-freshness agent on stop).
