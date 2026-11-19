---
status: accepted
---

# Stamp each merge's changelog section when it is tagged, not when it ships

A branch no longer names the version its merge will mint. `/ship` writes the branch's entries to its
own `changelog.d/<branch-slug>.md` fragment and never edits `CHANGELOG.md`; after the merge,
`version.yml` runs `scripts/stamp-changelog.mjs`, which turns each untagged merge's fragments (or,
with none, its PR title) into a dated section, commits the sections with `[skip ci]`, and tags the
merge commit. The version is still `scripts/next-version.mjs`'s computation, now made once, at tag
time, over the merges in the order they landed.

This supersedes ADR-0001. Predicting the version at ship time meant every merge invalidated every
open PR's changelog section, so branches shipped one at a time, a Dependabot merge turned a green
PR's changelog check red, and tags minted with no section needed backfilling. Fragments cannot
collide, and a merge that wrote none still gets a section, so none of that survives.

The stamp commit goes straight to `main`, which the ruleset otherwise forbids, so `version.yml`
pushes it with a token from a release GitHub App listed as the ruleset's one bypass actor
(`GITHUB_TOKEN` cannot be one). Every first-parent commit on `main` is a release, so rebase merging
stays off. The scheme and its operating rules are `stamp-on-tag` in `jwh3times/skills`, which
holds the canonical scripts.
