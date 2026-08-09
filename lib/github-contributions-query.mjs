// Shared source of truth for the GitHub contributions GraphQL request.
//
// This is plain `.mjs` rather than TypeScript on purpose: `scripts/seed-contributions.mjs`
// runs under bare `node` with no build step, so it cannot import `github-contributions.ts`
// (which also imports JSON, requiring import attributes Node applies differently).
// Keeping the query and the level mapping here lets both the build-time module and the
// seed script share them, so a change to the query can't silently drift the committed
// fallback snapshot out of shape.
//
// Consumers:
//   - lib/github-contributions.ts  (build-time fetch)
//   - scripts/seed-contributions.mjs (manual snapshot refresh)

/** GitHub's GraphQL contributions query. The GraphQL API is auth-only. */
export const CONTRIBUTIONS_QUERY = `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

/** GitHub's `contributionLevel` enum → our numeric 0..4. */
export const LEVEL_MAP = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};
