# Merging

From an open pull request to a finished merge. The order in which feature and Dependabot PRs merge,
and how each catches up with `main`, is in [releases](releases.md#merging-into-main); this file
holds the checks around it and what has gone wrong.

## Before merging

- **The maintainer works sessions in parallel**, from another agent session, an IDE or the web UI,
  so `main` can move mid-task. Before any rebase, PR or version computation, re-derive the state:
  `git fetch --all --tags --prune`, `git branch --show-current`, `git log --oneline origin/main..HEAD`,
  and `git reflog` when a branch's base is unclear. Never trust a `next-version.mjs` result from
  earlier in the session.
- **A green PR's `Changelog Version` check is provisional until it merges.** Another merge, a
  Dependabot one included, takes the version the branch names and flips the check to red with no
  change to the branch. Fix it with `git rebase origin/main`, renumber the heading, `npm ci` (the
  merge may have moved dependencies), re-run the gates, then `git push --force-with-lease`.
- **Ship one branch at a time.** Cut the next branch from an updated `main` only after the previous
  one merges, and confirm its tag exists first: `version.yml` mints it asynchronously.

## Reading CI

- **`Playwright Tests` and `Lighthouse Budget` both red on a no-op diff** is usually Google's Chrome
  apt mirror (`Hash Sum mismatch` in the browser-install step), not the code. Read which step failed
  before the diff, and rerun with `gh run rerun <run-id> --failed`.
- **The Lighthouse job never fails the workflow** (`continue-on-error: true`). Before calling the
  budget met, read its log: a clean run ends "Checking assertions … All results processed!" with no
  failure lines.
- **Lighthouse asserts one representative run, not per-metric medians** (`median-run` in
  `lighthouserc.cjs`), and most of the Total Blocking Time is one hydration task, so a change that adds
  DOM or client components has little headroom. Before pushing such a change, compare the medians of
  two or three local five-run batches (`npm run test:lighthouse`, then `.lighthouseci/lhr-*.json`);
  one batch on a laptop is too noisy. CI's `lighthouse-report` artifact has each run's long tasks.
  An issue's acceptance criteria require fixing a miss, not waiving it as advisory.
- **A green agent-sync job may have tested nothing.** `sync-agents.yml` pushes only when the mirror
  has drift, so on an in-sync PR it passes without exercising its push path; that hid a push that had
  never worked. To verify the workflow, open a PR that deliberately leaves drift.

## Reviewing a dependency change

`.gitattributes` marks `package-lock.json` `-diff`, so `git diff` and GitHub show only "Bin". Diff
the blobs to see the real change: `diff <(git show HEAD:package-lock.json) package-lock.json`. A
targeted bump should touch only its package's version, `resolved` and `integrity` lines, whatever
`npm update` reports.

## After the merge

- **Closing an issue doesn't always move its board `Status` to Done.** Re-query the board and set it
  with the mutation ([issue tracker](issue-tracker.md)) if it is still stale.
- **A published security advisory keeps `closed_at: null` forever**, and that is correct: `closed` is
  the alternative to publishing a draft, never a step after it. Never PATCH a published advisory to
  `closed`; judge one by `state`, `withdrawn_at` and its `patched_versions`.
