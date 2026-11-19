### Changed

- Branches no longer predict the version their merge will mint. Each writes its changelog entries
  to its own `changelog.d/<branch-slug>.md` fragment and never edits `CHANGELOG.md`. After a merge,
  `version.yml` runs `scripts/stamp-changelog.mjs`, which turns the fragments that merge added (or,
  with none, its PR title) into the dated section for its version, pushes that as a
  `chore(release)` commit through a release GitHub App, and tags the merge commit itself
  (ADR 0006, `docs/adr/0006-stamp-changelog-on-tag.md`, superseding ADR 0001).
- Open PRs now merge in any order. A merge no longer invalidates every other PR's changelog
  section, a Dependabot merge still gets a section from its PR title, and nothing is backfilled.
- The CI `Changelog Version` check is now `Changelog`: it checks that each fragment holds only
  Keep a Changelog category headings and their entries, and that the branch edits no released
  section, no `Unreleased` entry and no fragment already on `main`.
- The shared `ship`, `docs-updater`, `end-session`, `handoff`, `lets-go` and `what-next` skills are
  reinstalled from `jwh3times/skills` with `stamp-on-tag` support, and the release docs, merge
  guidance and doc map describe the new scheme.
