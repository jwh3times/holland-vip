# Releases

## Scheme

per-merge — `.github/workflows/version.yml` tags every merge to `main` `v<major>.<minor>.<build>`,
and each merge's dated changelog section names the version it mints (ADR-0001).

## Ask before bumping

always

## Merging into main

`main`'s required status checks are strict: a PR merges only when it is up to date with `main` and
its checks pass on that state. Every merge mints a tag, so after one PR merges, every other open PR
is behind and waits for an update and a fresh CI run.

- **A feature PR** catches up by merging `origin/main` into its branch, or with the "Update branch"
  button. A pushed branch is never rebased. If another merge took the version its changelog section
  names, re-run `ship` to renumber the section; the `Changelog Version` check fails until then.
- **A Dependabot PR** catches up only through a `@dependabot rebase` comment. A merge commit pushed
  to its branch stops Dependabot from rebasing it later.

With a feature PR and a Dependabot PR open together, merge the feature PR first, while its section
still names the version its merge mints. Then comment `@dependabot rebase` on the bot PR, and merge
it once its CI passes and the feature merge's tag exists. The bot PR writes no section, and the next
`ship` backfills one for its tag (the default `Skipped tags: backfill`). Merging the bot PR first
instead takes the feature PR's version and forces a re-`ship` of the feature branch.
