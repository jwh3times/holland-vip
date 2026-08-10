---
# GENERATED — do not edit. Source: .agents/skills/ship/SKILL.md. Regenerate: npm run sync:agents
name: ship
description: Ship the current branch — classify its SemVer impact, refresh docs, write the CHANGELOG entry for the version this merge will mint, run fast checks, push, and open or update the PR. Use when a feature branch is ready for review, or when the user says "ship it", "open a PR", or "push this".
---

# Ship

Take the current branch from "code is done" to "PR is open and green-able", and make sure the
changelog names the version this merge will actually create.

**Announce at start:** "I'm using the ship skill to open a PR for this branch."

## Why this exists

Every merge to `main` is auto-tagged `v<major>.<minor>.<build>` by
`.github/workflows/version.yml`. `package.json` selects the major/minor release line and `build`
auto-increments within it. So `/ship` first classifies the branch as major, minor, or build-only,
then computes **the version its merge will mint** and writes that changelog entry — an
`[Unreleased]` section alone is always wrong the moment it lands. The `Changelog Version` CI job
(`changelog` in `ci.yml`) verifies the prediction still holds at merge time.

## Steps

### 1. Preconditions — stop if any fail

- **Not on `main`.** `main` is protected; work must be on a branch. If on `main`, stop and offer
  to create one (`git checkout -b agent/<topic>`).
- **Clean working tree.** Run `git status --porcelain`. If anything is uncommitted, stop and ask
  the user whether to commit it — do not commit silently.
- **`gh` authenticated.** `gh auth status` must succeed.
- **Tags present.** `git fetch --tags -q origin` (the version computation reads local tags).

### 2. Classify the release impact

Review the complete branch diff and its issue/spec against `origin/main`. Ignore release metadata
(`package.json`/`package-lock.json` version fields, `CHANGELOG.md`) and generated mirrors when
judging impact. Choose the highest class that applies:

- **Major** — an incompatible change to a public contract or user workflow that requires consumers
  to migrate, relearn, or update integrations. Removal or incompatible renaming of supported
  behavior belongs here.
- **Minor** — new backward-compatible user-visible behavior or a materially expanded supported
  capability.
- **Build-only** — backward-compatible fixes, dependency maintenance, performance/accessibility
  improvements, refactors, tests, docs, or agent/tooling changes that do not add a supported product
  capability.

State the classification and cite the decisive changes. When evidence is mixed, the highest impact
wins. The step is complete only when every user-visible or public-contract change in the diff is
accounted for.

Read the major/minor line from both `origin/main:package.json` and the branch's `package.json`:

- **Build-only** — keep the current release line unchanged.
- **Minor** — recommend the next minor line (`x.(y+1).0`).
- **Major** — recommend the next major line (`(x+1).0.0`).

If the branch already changes the release line, verify that it matches the classification; if it
does not, stop and ask the user which intent is correct. For a new major or minor line, show the
recommendation and get the user's confirmation before mutating release metadata, then run exactly
one of:

```bash
npm version minor --no-git-tag-version
npm version major --no-git-tag-version
```

These commands update both `package.json` and `package-lock.json`. Do not run either command for a
build-only release. Do not advance a release line twice when the branch already contains the
confirmed change.

### 3. Backfill any undocumented released versions

List tags newest-first and compare against `CHANGELOG.md`:

```bash
git tag -l "v*" --sort=-v:refname | head -8
```

Any `v<major>.<minor>.<build>` tag with **no** matching `## [x.y.z]` section is a released version
with no entry. Two things produce these: merged Dependabot PRs (which the CI guard exempts), and
PRs authored in the GitHub web UI, which have no local checkout and so cannot run `/ship` at all.
Both are normal — backfill is how the changelog stays whole, not an exception path.

Backfill each one now: read what that tag changed (`git show --stat <tag>`, and the `package.json`
diff for dependency bumps) and add a dated section in the right position. Keep it factual — name
the packages and versions. Ignore the legacy 4-part `v1.0.0.x` tags (pre-SemVer).

### 4. Compute the target version

```bash
node scripts/next-version.mjs
```

This prints a bare version (e.g. `1.1.5`) — no `v` prefix. It is the single source of truth;
`version.yml` and the `changelog` CI job call the same script. Do not compute it yourself.

### 5. Refresh the docs

Invoke the `docs-updater` subagent, scoped to **this branch's diff only** — not a full audit:

```bash
git diff $(git merge-base origin/main HEAD)..HEAD --stat
```

Use `origin/main`, not `main` — a clone that only fetched the feature branch has no local `main`.

Tell it exactly what changed and let it update the docs it owns (`CLAUDE.md`, `README.md`,
`AGENTS.md`). It does **not** own `CHANGELOG.md` — **you** write that in step 6, so tell it to
leave `CHANGELOG.md` alone.

### 6. Write the CHANGELOG entry

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

### 7. Refresh generated artifacts and run fast checks — refuse to push if any fail

Tests (Vitest + Playwright) and the production build are **not** run here; CI owns them. These are
the cheap gates that catch most mistakes in seconds:

```bash
npm run format:check
# If formatting is red: npm run format, then rerun format:check before continuing.
npm run sync:agents
node scripts/sync-agents.mjs --check
npm run lint
npx tsc --noEmit
```

`npm run format:check` runs from the repo root and covers **all** markdown, so run it **after** the
doc/changelog edits in steps 5–6. Formatting must be green before `npm run sync:agents`, because the
generator mirrors the formatted `.agents/skills/` sources into `.claude/skills/`.

Always run `npm run sync:agents`, even when this invocation did not knowingly edit an agent source:
the branch may contain a previously committed source edit with a stale generated counterpart. The
following `--check` is the same secret-free gate CI runs. If any check is red, stop and report — do
not push.

### 8. Commit the release metadata, docs, and changelog

```bash
git add package.json package-lock.json CHANGELOG.md CLAUDE.md README.md AGENTS.md .claude/skills .codex
git commit -m "docs: update docs and changelog for v<version>"
```

Stage the paths you actually touched rather than `git add -A`, so an untracked file that appeared
since step 1 can't ride along. Omit any listed path that does not exist. If `docs-updater` or the
sync command legitimately touched something else, add it explicitly.

### 9. Push and open or update the PR

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

### 10. Report

Give the user: the PR URL, the major/minor/build-only classification with its reason, the version
this merge will mint, and anything the fast checks or backfill surfaced. State plainly that tests
run in CI, not locally — do not imply the branch is verified beyond the fast checks.

## Do not

- Merge the PR. `/ship` stops at "PR open".
- Push to `main`.
- Run the full test suites — that is CI's job and it makes this skill slow.
- Invent the exact version number. Classify the release impact, then call
  `node scripts/next-version.mjs` after the release line is settled.
