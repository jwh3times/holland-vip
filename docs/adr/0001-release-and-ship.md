---
status: accepted
---

# Share one release prediction across ship, CI, and GitHub Releases

The repository uses `scripts/next-version.mjs` as the single calculation of the next
`major.minor.build` version. `/ship` classifies the SemVer impact and writes the matching changelog
entry, CI verifies that prediction, and `version.yml` mints the tag after merge; centralizing the
calculation prevents three release paths from disagreeing while preserving automatic build-number
increments.
