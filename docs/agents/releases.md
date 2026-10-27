# Releases

## Scheme

per-merge — `.github/workflows/version.yml` tags every merge to `main` `v<major>.<minor>.<build>`,
and each merge's dated changelog section names the version it mints (ADR-0001).

## Skipped tags

backfill — a merged Dependabot PR (exempt from the changelog check) or a PR opened in the web UI
gets its section on the next ship.

- **Ignore:** the 4-part `v1.0.0.x` tags, which predate SemVer.

## Version file

`package.json` (with `package-lock.json` beside it)

## Bump command

`npm version <version> --no-git-tag-version`

## Ask before bumping

always

## Next-version command

`node scripts/next-version.mjs`

## Unreleased placeholder

`No unreleased changes.`

## Changelog check

`test "$(node scripts/next-version.mjs)" = "$(grep -m1 -E '^## \[[0-9]+\.[0-9]+\.[0-9]+\]' CHANGELOG.md | sed -E 's/^## \[([0-9.]+)\].*/\1/')"`
— the **Changelog Version** job in `.github/workflows/ci.yml`.

## Release commit message

`docs: update docs and changelog for v<version>` — the release-prep commit
`docs/agents/dev-flow.md` exempts.
