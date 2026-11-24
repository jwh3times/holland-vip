# Merging

From an open pull request to a finished merge. How feature and Dependabot PRs catch up with `main`
is in [releases](releases.md#merging-into-main); this file holds the checks around it and what has
gone wrong.

## Before merging

- **The maintainer works sessions in parallel**, from another agent session, an IDE or the web UI,
  so `main` can move mid-task. Before updating a branch, opening a PR or reading a release,
  re-derive the state: `git fetch --all --tags --prune`, `git branch --show-current`,
  `git log --oneline origin/main..HEAD`, and `git reflog` when a branch's base is unclear.
- **Catch a branch up by merging, never by rebasing or force-pushing a pushed branch**, as
  [releases](releases.md#merging-into-main) says. Run `npm ci` after the merge and before the fast
  checks, since the merge may have moved dependencies.
- **Never edit or delete a fragment already on `main`.** It belongs to the merge that added it, and
  `version.yml` releases that merge's copy, so the `Changelog` check rejects the change. A
  correction to a released entry is a new fragment.

## The release

- **`version.yml` stamps and tags asynchronously.** Each run pushes one stamp commit,
  `chore(release): v<x.y.z>[, ...] [skip ci]`, for every merge it releases, and tags each merge
  commit. Pull before cutting the next branch so it starts from the stamped changelog, and update
  another open PR only after the stamp commit lands: it moves `main` again, so a PR updated before
  it is behind once more.
- **A run that ends "main moved during this run" is not a failure**: the run queued behind it
  releases both merges. Any other failed run leaves its merges untagged until a later run succeeds,
  so re-run it once the cause is fixed. A release GitHub App token that fails to mint means the
  `RELEASE_APP_CLIENT_ID` variable, the `RELEASE_APP_PRIVATE_KEY` secret or the App's installation
  on this repository is gone. A stamp push rejected with `GH013` means a rule the App cannot bypass
  now applies to `main`, such as classic branch protection or a ruleset that does not list the App:
  `main`'s protection lives only in rulesets
  ([architecture](../architecture.md#deployment-and-release-checks)).

## Reading CI

- **`Playwright Tests` and `Lighthouse Budget (advisory)` both red on a no-op diff** is usually Google's Chrome
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
  with the mutation ([issue tracker](issue-tracker.md#project-board)) if it is still stale.
- **A published security advisory keeps `closed_at: null` forever**, and that is correct: `closed` is
  the alternative to publishing a draft, never a step after it. Never PATCH a published advisory to
  `closed`; judge one by `state`, `withdrawn_at` and its `patched_versions`.

## Dependabot catch-up

`gh pr comment <n> --body "@dependabot rebase"`

A Dependabot PR catches up only through Dependabot's own rebase
([releases](releases.md#merging-into-main)); the merge commit `gh pr update-branch` pushes stops
Dependabot from rebasing the branch later.
