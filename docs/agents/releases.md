# Releases

## Scheme

per-merge — `.github/workflows/version.yml` tags every merge to `main` `v<major>.<minor>.<build>`,
and each merge's dated changelog section names the version it mints (ADR-0001).

## Ask before bumping

always

## Next-version command

`node scripts/next-version.mjs`

## Changelog check

`test "$(node scripts/next-version.mjs)" = "$(grep -m1 -E '^## \[[0-9]+\.[0-9]+\.[0-9]+\]' CHANGELOG.md | sed -E 's/^## \[([0-9.]+)\].*/\1/')"`
— the **Changelog Version** job in `.github/workflows/ci.yml`.
