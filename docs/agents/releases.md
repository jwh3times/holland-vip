# Releases

## Scheme

stamp-on-tag — `.github/workflows/version.yml` tags every merge to `main`
`v<major>.<minor>.<build>`. Each branch's entries live in its own `changelog.d/<branch-slug>.md`
fragment; the workflow stamps them into the merge's dated section and tags the merge commit
(ADR-0006).

## Ask before bumping

always

## Merging into main

`main`'s required status checks are strict: a PR merges only when it is up to date with `main` and
its checks pass on that state, so after one PR merges, every other open PR is behind and waits for
an update and a fresh CI run. No branch names a version, so open PRs merge in any order and catching
up never touches the changelog.

- **A feature PR** catches up by merging `origin/main` into its branch, or with the "Update branch"
  button. A pushed branch is never rebased.
- **A Dependabot PR** catches up only through a `@dependabot rebase` comment. A merge commit pushed
  to its branch stops Dependabot from rebasing it later. It writes no fragment, and `version.yml`
  gives its merge a section from its PR title.

Merge with a merge commit, the only method the repository allows: every first-parent commit on
`main` is one release, and the stamp commit `version.yml` pushes straight to `main` is the only
other way onto it.
