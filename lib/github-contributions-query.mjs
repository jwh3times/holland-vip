// Shared source of truth for the GitHub contributions GraphQL request.
//
// This is plain `.mjs` rather than TypeScript on purpose: `scripts/refresh-github-snapshots.mjs`
// runs under bare `node` with no build step, so it cannot import `github-contributions.ts`
// (which also imports JSON, requiring import attributes Node applies differently).
// Keeping the query and the level mapping here lets both the build-time module and the
// seed script share them, so a change to the query can't silently drift the committed
// fallback snapshot out of shape.
//
// Consumers:
//   - lib/github-contributions.ts  (build-time fetch)
//   - scripts/refresh-github-snapshots.mjs (snapshot refresh)

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

/** Validates the normalized contribution snapshot consumed by the site. */
export function parseCalendar(data) {
  if (typeof data !== "object" || data === null) return null;
  if (typeof data.totalContributions !== "number" || !Array.isArray(data.weeks)) return null;
  const valid = data.weeks.every(
    (week) =>
      Array.isArray(week) &&
      week.every(
        (day) =>
          typeof day === "object" &&
          day !== null &&
          typeof day.date === "string" &&
          typeof day.count === "number" &&
          [0, 1, 2, 3, 4].includes(day.level)
      )
  );
  return valid ? data : null;
}

/** Normalizes and validates GitHub's GraphQL contribution response. */
export function toCalendar(json) {
  if (json?.errors?.length) {
    throw new Error(
      `GitHub GraphQL errors: ${json.errors.map((error) => error.message).join("; ")}`
    );
  }
  const source = json?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!source) throw new Error("GitHub GraphQL returned no contribution calendar");

  const calendar = {
    totalContributions: source.totalContributions,
    weeks: source.weeks?.map((week) =>
      week.contributionDays?.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: LEVEL_MAP[day.contributionLevel] ?? 0,
      }))
    ),
  };
  const parsed = parseCalendar(calendar);
  if (!parsed) throw new Error("GitHub GraphQL returned an invalid contribution calendar");
  return parsed;
}
