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
with no entry. Two things produce these: merged Dependabot PRs (which the CI guard exempts), and
PRs authored in the GitHub web UI, which have no local checkout and so cannot run `/ship` at all.
Both are normal — backfill is how the changelog stays whole, not an exception path.

Backfill each one now: read what that tag changed (`git show --stat <tag>`, and the `package.json`
diff for dependency bumps) and add a dated section in the right position. Keep it factual — name
the packages and versions. Ignore the legacy 4-part `v1.0.0.x` tags (pre-SemVer).

### 3. Compute the target version

```bash
node scripts/next-version.mjs
```

This prints a bare version (e.g. `1.1.5`) — no `v` prefix. It is the single source of truth;
`version.yml` and the `changelog` CI job call the same script. Do not compute it yourself.

### 4. Refresh the docs

Invoke the `docs-updater` subagent, scoped to **this branch's diff only** — not a full audit:

```bash
git diff $(git merge-base origin/main HEAD)..HEAD --stat
```

Use `origin/main`, not `main` — a clone that only fetched the feature branch has no local `main`.

Tell it exactly what changed and let it update the docs it owns (`CLAUDE.md`, `README.md`,
`AGENTS.md`). It does **not** own `CHANGELOG.md` — **you** write that in step 5, so tell it to
leave `CHANGELOG.md` alone.

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
git add CHANGELOG.md CLAUDE.md README.md AGENTS.md
git commit -m "docs: update docs and changelog for v<version>"
```

Stage the paths you actually touched rather than `git add -A`, so an untracked file that appeared
since step 1 can't ride along. If `docs-updater` legitimately touched something else, add it
explicitly.

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
