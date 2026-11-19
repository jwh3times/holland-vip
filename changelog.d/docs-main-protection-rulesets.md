### Changed

- `main` is protected only by its repository ruleset. The legacy classic branch protection, which
  blocked the release App's first stamp push for v1.6.10, is gone, and its Dependency Review and
  Unit Tests & Coverage checks are now required by the ruleset, alongside Build & Lint, Playwright
  Tests and CodeQL. The `Changelog` check is required too, so a PR whose fragment does not parse,
  or that edits a released section, `Unreleased` or another merge's fragment, can no longer merge.
- `docs/architecture.md` records that `main` carries no classic branch protection, because the
  release App can bypass only a ruleset, and `docs/agents/merging.md` says what a stamp push
  rejected with `GH013` means. `CONTRIBUTING.md` lists every required check.
