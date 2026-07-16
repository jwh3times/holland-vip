# /ship Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the always-on docs-freshness Stop hook with an explicit `/ship` skill, backed by a CHANGELOG, a shared version-prediction script, and a CI guard.

**Architecture:** A single Node script (`scripts/next-version.mjs`) computes the next `major.minor.build` version and becomes the single source of truth for the release workflow, a new CI guard job, and the `/ship` skill. `/ship` refreshes docs (via the existing `docs-updater` subagent), writes the CHANGELOG entry for the version the merge will mint, runs fast checks, and opens/updates a PR. The Stop hook is removed.

**Tech Stack:** Node 24 (ESM `.mjs`), GitHub Actions (`ci.yml`, `version.yml`), Prettier, Claude Code skills (`.claude/skills/`) and subagents (`.claude/agents/`).

## Global Constraints

- **Node version:** 24, pinned in `.nvmrc`; workflows read it via `actions/setup-node` `node-version-file: ".nvmrc"`.
- **Prettier** (`.prettierrc`): `printWidth: 100`, `singleQuote: false`, `semi: true`, `tabWidth: 2`, `trailingComma: "es5"`, `arrowParens: "always"`, `endOfLine: "lf"`. `prettier --check .` covers **all** files incl. `CHANGELOG.md`, `docs/`, `.claude/` (nothing in `.prettierignore` excludes them).
- **Coverage gate:** 80% in `vitest.config.ts`, but its `include` is scoped to `app/`/`components/`/`lib/` only — `scripts/**` is out of coverage scope, so this plan does not affect the gate.
- **Version source of truth:** `node scripts/next-version.mjs` — in the current repo state it MUST print `1.1.5` (line `1.1`, highest existing build `v1.1.4` → next `5`).
- **`docs-updater` owns** `CLAUDE.md` + `README.md` only. `/ship` owns `CHANGELOG.md`.
- **Fast checks** (local, in `/ship`): `npm run format:check`, `npm run lint`, `npx tsc --noEmit`. Build/Vitest/Playwright stay CI-only.
- **PR base is `main`; no self-merge** — `/ship` stops at "PR open".
- Work happens on branch `agent/ship-skill` (already created; the spec commit lives there).

---

### Task 1: `scripts/next-version.mjs` — version single source of truth

**Files:**

- Create: `scripts/next-version.mjs`

**Interfaces:**

- Produces: a CLI that prints `<major>.<minor>.<build>\n` to stdout (e.g. `1.1.5`); exits non-zero with a `::error::…` message if `package.json` `version` is not plain 3-part SemVer. Consumed by Task 3 (CI guard), Task 4 (`version.yml`), Task 5 (`/ship`).

- [ ] **Step 1: Verify it does not exist yet (failing state)**

Run: `node scripts/next-version.mjs`
Expected: FAIL — `Cannot find module ...scripts/next-version.mjs`.

- [ ] **Step 2: Write the script**

Create `scripts/next-version.mjs` with exactly:

```javascript
// Prints the next release version (major.minor.build) that a merge to main will mint,
// matching the tag logic in .github/workflows/version.yml. Single source of truth:
// version.yml, the CI changelog guard, and the /ship skill all call this script.
//
// Reads package.json `version` as the major.minor release line (build acts as a floor),
// scans existing `v<major>.<minor>.*` tags, and prints `<major>.<minor>.<nextBuild>`.
// Requires tags in the working copy (callers run `git fetch --tags` / checkout depth 0).

import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const pkgPath = fileURLToPath(new URL("../package.json", import.meta.url));
const { version } = JSON.parse(readFileSync(pkgPath, "utf8"));

const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(version ?? "");
if (!match) {
  console.error(
    `::error::package.json version '${version}' must be plain <major>.<minor>.<build> SemVer.`
  );
  process.exit(1);
}

const [, major, minor, requested] = match;
const line = `${major}.${minor}`;
const prefix = `v${line}.`;

const tags = execFileSync("git", ["tag", "-l", `${prefix}*`], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);

const builds = tags
  .filter((tag) => tag.startsWith(prefix))
  .map((tag) => tag.slice(prefix.length))
  .filter((suffix) => /^\d+$/.test(suffix))
  .map(Number);

const requestedBuild = Number(requested);
const build =
  builds.length === 0 ? requestedBuild : Math.max(Math.max(...builds) + 1, requestedBuild);

process.stdout.write(`${line}.${build}\n`);
```

- [ ] **Step 3: Run it and verify output**

Run: `node scripts/next-version.mjs`
Expected: prints exactly `1.1.5` (line 1.1, highest tag `v1.1.4` → build 5).

- [ ] **Step 4: Normalize formatting**

Run: `npx prettier --write scripts/next-version.mjs && npx prettier --check scripts/next-version.mjs`
Expected: `... (unchanged)` then a passing check (no diff — the source above is already Prettier-clean at printWidth 100).

- [ ] **Step 5: Commit**

```bash
git add scripts/next-version.mjs
git commit -m "feat: add next-version.mjs version source of truth"
```

---

### Task 2: `CHANGELOG.md` — create with backfill + the entry for this branch

**Files:**

- Create: `CHANGELOG.md`

**Interfaces:**

- Produces: a Keep a Changelog file whose **top released section** is `## [1.1.5]` (must equal `next-version.mjs` output for the Task 3 guard to pass on this branch's PR).

- [ ] **Step 1: Write `CHANGELOG.md`**

Create `CHANGELOG.md` with exactly:

```markdown
# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) via the
`v<major>.<minor>.<build>` tags minted by `.github/workflows/version.yml`.

_Releases before 1.1.0 used a legacy 4-part `v1.0.0.x` tag scheme and predate this changelog._

## [Unreleased]

No unreleased changes.

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

### Removed

- The `Stop` hook in `.claude/settings.json` that ran a docs-freshness agent on every stop; docs
  are now refreshed by `/ship`.

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

### Changed

- Adopted the three-part `v<major>.<minor>.<build>` SemVer release scheme in
  `.github/workflows/version.yml`.
```

- [ ] **Step 2: Verify the top released version matches next-version**

Run:

```bash
grep -m1 -E '^## \[[0-9]+\.[0-9]+\.[0-9]+\]' CHANGELOG.md | sed -E 's/^## \[([0-9.]+)\].*/\1/'
```

Expected: `1.1.5` — identical to `node scripts/next-version.mjs`.

- [ ] **Step 3: Normalize formatting**

Run: `npx prettier --write CHANGELOG.md && npx prettier --check CHANGELOG.md`
Expected: passing check.

- [ ] **Step 4: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs: add CHANGELOG with backfilled v1.1.x history"
```

---

### Task 3: CI `changelog` guard job in `ci.yml`

**Files:**

- Modify: `.github/workflows/ci.yml` (add a new `changelog` job under `jobs:`, after `unit`)

**Interfaces:**

- Consumes: `scripts/next-version.mjs` (Task 1), `CHANGELOG.md` top version (Task 2).
- Produces: a PR check that fails when the CHANGELOG top version ≠ the version the merge will mint.

- [ ] **Step 1: Add the job**

Append this job to `.github/workflows/ci.yml` (keep 2-space indentation; it is a sibling of `build`, `test`, `unit`):

```yaml
  changelog:
    name: Changelog Version
    runs-on: ubuntu-latest
    # PR-only: on push to main, version.yml mints the tag and next-version would advance
    # past the changelog's top entry, so the guard must not run there. Dependabot PRs don't
    # touch the changelog; version.yml still tags them, so exempt the bot.
    if: github.event_name == 'pull_request' && github.actor != 'dependabot[bot]'

    steps:
      - name: Checkout repository
        uses: actions/checkout@v7
        with:
          fetch-depth: 0 # full tags, needed to compute the next build number

      - name: Setup Node.js
        uses: actions/setup-node@v7
        with:
          node-version-file: ".nvmrc"

      - name: Verify CHANGELOG top version matches the version this merge will mint
        run: |
          expected=$(node scripts/next-version.mjs)
          top=$(grep -m1 -E '^## \[[0-9]+\.[0-9]+\.[0-9]+\]' CHANGELOG.md \
            | sed -E 's/^## \[([0-9.]+)\].*/\1/')
          echo "Expected (next-version): $expected"
          echo "CHANGELOG top released:  $top"
          if [ "$expected" != "$top" ]; then
            echo "::error::CHANGELOG top version '$top' does not match the version this merge will mint ('$expected'). Run /ship to update CHANGELOG.md."
            exit 1
          fi
```

- [ ] **Step 2: Simulate the job locally (both branches)**

Run the guard's shell logic locally:

```bash
expected=$(node scripts/next-version.mjs)
top=$(grep -m1 -E '^## \[[0-9]+\.[0-9]+\.[0-9]+\]' CHANGELOG.md | sed -E 's/^## \[([0-9.]+)\].*/\1/')
echo "$expected vs $top"; [ "$expected" = "$top" ] && echo PASS || echo FAIL
```

Expected: `1.1.5 vs 1.1.5` then `PASS`.

- [ ] **Step 3: Validate YAML parses**

Run: `node -e "const f=require('fs').readFileSync('.github/workflows/ci.yml','utf8'); if(!/^\s{2}changelog:/m.test(f)) throw new Error('changelog job missing'); console.log('changelog job present')"`
Expected: `changelog job present`.

- [ ] **Step 4: Normalize + commit**

```bash
npx prettier --write .github/workflows/ci.yml && npx prettier --check .github/workflows/ci.yml
git add .github/workflows/ci.yml
git commit -m "ci: add changelog version guard job"
```

---

### Task 4: Refactor `version.yml` to call `next-version.mjs`

**Files:**

- Modify: `.github/workflows/version.yml` (replace the inline compute step with a Node call; add a setup-node step)

**Interfaces:**

- Consumes: `scripts/next-version.mjs` (Task 1). Behavior is unchanged — same tag output.

- [ ] **Step 1: Add a setup-node step and replace the compute step**

In `.github/workflows/version.yml`, after the `actions/checkout@v7` step (which already sets `fetch-depth: 0`), insert a Node setup step, then replace the entire `Compute next version, push tag, and create release` step body. The final steps block reads:

```yaml
      - uses: actions/checkout@v7
        with:
          fetch-depth: 0 # full history + tags, needed to compute the next build number

      - name: Setup Node.js
        uses: actions/setup-node@v7
        with:
          node-version-file: ".nvmrc"

      - name: Compute next version, push tag, and create release
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          # Single source of truth — same script the /ship skill and the CI changelog guard use.
          version=$(node scripts/next-version.mjs)
          tag="v${version}"

          if git rev-parse -q --verify "refs/tags/${tag}" >/dev/null; then
            echo "::error::Computed tag '$tag' already exists."
            exit 1
          fi

          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git tag -a "$tag" -m "Release ${tag}"
          git push origin "refs/tags/${tag}"

          gh release create "$tag" \
            --verify-tag \
            --title "$tag" \
            --notes "Automated release for ${tag} from ${GITHUB_SHA}."

          {
            echo "### Release created: \`${tag}\`"
            echo ""
            echo "- Version: \`${version}\`"
            echo "- Commit: \`${GITHUB_SHA}\`"
          } >> "$GITHUB_STEP_SUMMARY"
```

Note: the `package.json` SemVer validation that used to live inline now lives in `next-version.mjs` (it exits non-zero with `::error::…` on a malformed version), so the workflow still fails loudly on a bad version.

- [ ] **Step 2: Confirm no inline compute logic remains**

Run: `grep -nE 'jq -r .version|BASH_REMATCH|last_build' .github/workflows/version.yml || echo "inline logic removed"`
Expected: `inline logic removed`.

- [ ] **Step 3: Confirm the script is now referenced**

Run: `grep -n "next-version.mjs" .github/workflows/version.yml`
Expected: one match inside the run block.

- [ ] **Step 4: Normalize + commit**

```bash
npx prettier --write .github/workflows/version.yml && npx prettier --check .github/workflows/version.yml
git add .github/workflows/version.yml
git commit -m "ci: compute release version via shared next-version.mjs"
```

---

### Task 5: `.claude/skills/ship/SKILL.md` — the ship skill

**Files:**

- Create: `.claude/skills/ship/SKILL.md`

**Interfaces:**

- Consumes: `scripts/next-version.mjs` (Task 1), `CHANGELOG.md` (Task 2), the `docs-updater` subagent, the `changelog` CI job (Task 3).

- [ ] **Step 1: Write the skill**

Create `.claude/skills/ship/SKILL.md` with exactly:

````markdown
---
name: ship
description: Ship the current branch — refresh docs, write the CHANGELOG entry for the version this merge will mint, run fast checks, push, and open or update the PR. Use when a feature branch is ready for review, or when the user says "ship it", "open a PR", or "push this".
---

# Ship

Take the current branch from "code is done" to "PR is open and green-able", and make sure the
changelog names the version this merge will actually create.

**Announce at start:** "I'm using the ship skill to open a PR for this branch."

## Why this exists

Every merge to `main` is auto-tagged `v<major>.<minor>.<build>` by
`.github/workflows/version.yml`, where `build` auto-increments. So a branch's changelog entry must
be written for **the version its merge will mint** — an `[Unreleased]` section alone is always
wrong the moment it lands. `/ship` computes that version and writes the entry, and the
`Changelog Version` CI job (`changelog` in `ci.yml`) verifies the prediction still holds at merge
time.

## Steps

### 1. Preconditions — stop if any fail

- **Not on `main`.** `main` is protected; work must be on a branch. If on `main`, stop and offer
  to create one (`git checkout -b agent/<topic>`).
- **Clean working tree.** Run `git status --porcelain`. If anything is uncommitted, stop and ask
  the user whether to commit it — do not commit silently.
- **`gh` authenticated.** `gh auth status` must succeed.
- **Tags present.** `git fetch --tags -q origin` (the version computation reads local tags).

### 2. Backfill any undocumented released versions

List tags newest-first and compare against `CHANGELOG.md`:

```bash
git tag -l "v*" --sort=-v:refname | head -8
```

Any `v<major>.<minor>.<build>` tag with **no** matching `## [x.y.z]` section is a released version
with no entry — in practice a merged Dependabot PR, which the CI guard exempts. Backfill it now:
read what that tag changed (`git show --stat <tag>`, and the `package.json` diff for dependency
bumps) and add a dated section in the right position. Keep it factual — name the packages and
versions. Ignore the legacy 4-part `v1.0.0.x` tags (pre-SemVer).

### 3. Compute the target version

```bash
node scripts/next-version.mjs
```

This prints a bare version (e.g. `1.1.5`) — no `v` prefix. It is the single source of truth;
`version.yml` and the `changelog` CI job call the same script. Do not compute it yourself.

### 4. Refresh the docs

Invoke the `docs-updater` subagent, scoped to **this branch's diff only** — not a full audit:

```bash
git diff $(git merge-base main HEAD)..HEAD --stat
```

Tell it exactly what changed and let it update the docs it owns (`CLAUDE.md`, `README.md`). It does
**not** own `CHANGELOG.md` — **you** write that in step 5, so tell it to leave `CHANGELOG.md` alone.

### 5. Write the CHANGELOG entry

Insert a section for the target version immediately below `## [Unreleased]`:

```markdown
## [Unreleased]

No unreleased changes.

## [1.1.5] - 2026-07-16

### Added

- ...
```

Rules:

- `## [Unreleased]` **stays**, with the `No unreleased changes.` placeholder.
- Date is today, `YYYY-MM-DD`.
- Group under Keep a Changelog headings — `Added`, `Changed`, `Fixed`, `Removed`, `Security`. Use
  one heading of each kind per section.
- Describe user-visible behavior and its consequences, derived from the branch diff. Not a commit
  log.
- **Idempotent:** if you already wrote a section for this version on a previous `/ship` of this
  branch, **rewrite it in place** — never stack a second one. If the target version changed since
  last time (someone merged first), renumber the existing section rather than adding a new one.

### 6. Fast checks — refuse to push if any fail

Tests (Vitest + Playwright) and the production build are **not** run here; CI owns them. These are
the cheap gates that catch most mistakes in seconds:

```bash
npm run format:check   # prettier --check . — covers CHANGELOG.md, CLAUDE.md, README.md too
npm run lint
npx tsc --noEmit
```

`npm run format:check` runs from the repo root and covers **all** markdown, so run it **after** the
doc/changelog edits in steps 4–5. Fix formatting with `npm run format`. If any check is red, stop
and report — do not push.

### 7. Commit the docs and changelog

```bash
git add -A
git commit -m "docs: update docs and changelog for v<version>"
```

### 8. Push and open or update the PR

```bash
git push -u origin "$(git branch --show-current)"
```

Then check whether a PR already exists for this branch:

```bash
gh pr list --head "$(git branch --show-current)" --state open --json number -q '.[0].number'
```

- **No PR** → `gh pr create --base main` with a title and a body derived from the changelog section
  you just wrote.
- **PR exists** → `gh pr edit <number>` to refresh the body. Do not open a second PR.

### 9. Report

Give the user: the PR URL, the version this merge will mint, and anything the fast checks or
backfill surfaced. State plainly that tests run in CI, not locally — do not imply the branch is
verified beyond the fast checks.

## Do not

- Merge the PR. `/ship` stops at "PR open".
- Push to `main`.
- Run the full test suites — that is CI's job and it makes this skill slow.
- Invent the version number. Always call `node scripts/next-version.mjs`.
````

- [ ] **Step 2: Verify frontmatter and key content**

Run: `grep -nE '^name: ship$|next-version.mjs|Announce at start' .claude/skills/ship/SKILL.md`
Expected: matches for the `name: ship` frontmatter, the `next-version.mjs` call, and the announce line.

- [ ] **Step 3: Normalize + commit**

```bash
npx prettier --write .claude/skills/ship/SKILL.md && npx prettier --check .claude/skills/ship/SKILL.md
git add .claude/skills/ship/SKILL.md
git commit -m "feat: add /ship skill"
```

---

### Task 6: Remove the Stop hook from `.claude/settings.json`

**Files:**

- Modify: `.claude/settings.json` (delete the `hooks` block; keep `permissions`)

- [ ] **Step 1: Rewrite the file**

Replace the entire contents of `.claude/settings.json` with exactly:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run:*)",
      "Bash(npm test:*)",
      "Bash(npm install:*)",
      "Bash(npx playwright test:*)",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)"
    ]
  }
}
```

- [ ] **Step 2: Verify the hook is gone and JSON is valid**

Run: `node -e "const s=require('./.claude/settings.json'); if(s.hooks) throw new Error('hooks still present'); console.log('no hooks; permissions intact:', !!s.permissions)"`
Expected: `no hooks; permissions intact: true`.

- [ ] **Step 3: Normalize + commit**

```bash
npx prettier --write .claude/settings.json && npx prettier --check .claude/settings.json
git add .claude/settings.json
git commit -m "chore: remove docs-freshness Stop hook (superseded by /ship)"
```

---

### Task 7: Update `CLAUDE.md` + `README.md` and run the final fast-check gate

**Files:**

- Modify: `CLAUDE.md` (the "Agents & docs automation" section; the `version.yml` and `ci.yml` CI/CD bullets)
- Modify: `README.md` (CI job wording at lines ~15, ~199, ~244 — now four jobs incl. the `changelog` guard; the "Versioning and Releases" section — add the CHANGELOG top-version guard + `/ship` workflow). Both files are owned by `docs-updater`; dispatch it scoped to the branch diff to reconcile both, rather than hand-editing README prose.

**Interfaces:**

- Consumes: everything from Tasks 1–6 (documents the new flow).

- [ ] **Step 1: Rewrite the "Agents & docs automation" section**

In `CLAUDE.md`, replace the whole `## Agents & docs automation` section body with:

```markdown
## Agents & docs automation

The `docs-updater` subagent (`.claude/agents/docs-updater.md`) keeps CLAUDE.md and README.md in
sync with the code. It is invoked by the **`/ship` skill** (`.claude/skills/ship/SKILL.md`), scoped
to the branch diff, when a branch is ready for a PR — there is no longer a docs-freshness Stop hook.
`/ship` also writes the `CHANGELOG.md` entry for the version the merge will mint (computed by
[scripts/next-version.mjs](scripts/next-version.mjs)), runs the fast checks
(`npm run format:check`, `npm run lint`, `npx tsc --noEmit`), and opens or updates the PR.
`docs-updater` does not own `CHANGELOG.md` — `/ship` does.
```

- [ ] **Step 2: Update the `ci.yml` CI/CD bullet**

In the CI/CD list, change the `Validation` bullet: replace "with three jobs" with "with four jobs", and append this sentence before the final bold "A PR will fail CI..." note:

```markdown
The `changelog` job verifies the top `CHANGELOG.md` version matches the version the merge will mint (via [scripts/next-version.mjs](scripts/next-version.mjs)) and is skipped for Dependabot.
```

- [ ] **Step 3: Update the `version.yml` CI/CD bullet**

Append this sentence to the end of the `Versioning` bullet:

```markdown
The next version is computed by [scripts/next-version.mjs](scripts/next-version.mjs) — the single source of truth shared with the `changelog` CI guard and the `/ship` skill.
```

- [ ] **Step 4: Run the full fast-check gate over the whole repo**

Run:

```bash
npm run format
npm run format:check
npm run lint
npx tsc --noEmit
```

Expected: `format` writes any drift (incl. the new `docs/superpowers/*.md` plan/spec), `format:check` passes, `lint` passes, `tsc` reports no errors.

- [ ] **Step 5: Confirm the changelog guard still passes end-to-end**

Run:

```bash
expected=$(node scripts/next-version.mjs)
top=$(grep -m1 -E '^## \[[0-9]+\.[0-9]+\.[0-9]+\]' CHANGELOG.md | sed -E 's/^## \[([0-9.]+)\].*/\1/')
[ "$expected" = "$top" ] && echo "GUARD PASS ($expected)" || echo "GUARD FAIL ($expected vs $top)"
```

Expected: `GUARD PASS (1.1.5)`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "docs: document /ship skill, CHANGELOG, and next-version.mjs in CLAUDE.md"
```

---

## Post-plan notes

- **Deviation from spec (flagged):** no 3-part `v1.0.0` tag exists (the legacy tags are 4-part `v1.0.0.x`), so the CHANGELOG's oldest entry is `## [1.1.0]` plus a one-line legacy note, rather than a synthetic `## [1.0.0]` section.
- **Not run locally by this plan:** the production build, Vitest coverage, and Playwright — they run in CI. `version.yml` is a config change; its real exercise is the next merge to `main`, which the `changelog` guard protects.
- After Task 7, this branch is itself ready to `/ship` (dogfood the new skill), which will refresh docs and rewrite the `## [1.1.5]` entry idempotently.
