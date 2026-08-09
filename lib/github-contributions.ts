import { GITHUB_USER } from "./github";
import { githubFetch, withFallback } from "./github-fetch";
import { CONTRIBUTIONS_QUERY, LEVEL_MAP as RAW_LEVEL_MAP } from "./github-contributions-query.mjs";
import fallbackData from "./github-contributions-fallback.json";

/** Intensity bucket for a single day, 0 (none) .. 4 (most), mirroring GitHub's quartiles. */
export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

/** One day in the contribution calendar. */
export interface ContributionDay {
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  count: number;
  level: ContributionLevel;
}

/** A full contribution calendar: total + weeks (each an ordered Sun→Sat list of days). */
export interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionDay[][];
}

/**
 * Validates a committed snapshot against {@link ContributionCalendar}.
 *
 * Replaces an unchecked `as ContributionCalendar` cast over a ~2,000-line JSON
 * file. Exported so a test can assert the committed file still parses; see
 * `tests/unit/github-fallback.test.ts`.
 *
 * Returns `null` rather than throwing: this feeds the degradation path, which
 * must never break the build.
 */
export function parseCalendar(data: unknown): ContributionCalendar | null {
  if (typeof data !== "object" || data === null) return null;
  const candidate = data as ContributionCalendar;
  if (typeof candidate.totalContributions !== "number") return null;
  if (!Array.isArray(candidate.weeks)) return null;

  const daysValid = candidate.weeks.every(
    (week) =>
      Array.isArray(week) &&
      week.every(
        (day: unknown) =>
          typeof day === "object" &&
          day !== null &&
          typeof (day as ContributionDay).date === "string" &&
          typeof (day as ContributionDay).count === "number" &&
          [0, 1, 2, 3, 4].includes((day as ContributionDay).level)
      )
  );
  return daysValid ? candidate : null;
}

/**
 * Committed snapshot used when the live GraphQL fetch is unavailable (no/invalid
 * token, offline). A malformed snapshot degrades to an empty calendar rather
 * than rendering garbage — `OpenSourceSection` omits the heatmap when it's absent.
 */
const fallbackCalendar: ContributionCalendar = parseCalendar(fallbackData) ?? {
  totalContributions: 0,
  weeks: [],
};

// The query and level mapping are shared with `scripts/seed-contributions.mjs`,
// which runs under bare node and so cannot import this module. See that file's
// header for why the shared piece is `.mjs`.
const LEVEL_MAP = RAW_LEVEL_MAP as Record<string, ContributionLevel>;

/** Shape of the slice of the GraphQL response we consume. */
interface GraphQLContributionsResponse {
  data?: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: {
            contributionDays: {
              date: string;
              contributionCount: number;
              contributionLevel: string;
            }[];
          }[];
        };
      };
    } | null;
  };
  errors?: { message: string }[];
}

/** Normalizes the GraphQL payload to a `ContributionCalendar`. */
export function toCalendar(json: GraphQLContributionsResponse): ContributionCalendar {
  if (json.errors?.length) {
    throw new Error(`GitHub GraphQL errors: ${json.errors.map((e) => e.message).join("; ")}`);
  }
  const calendar = json.data?.user?.contributionsCollection.contributionCalendar;
  if (!calendar) {
    throw new Error("GitHub GraphQL returned no contribution calendar");
  }
  return {
    totalContributions: calendar.totalContributions,
    weeks: calendar.weeks.map((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: LEVEL_MAP[day.contributionLevel] ?? 0,
      }))
    ),
  };
}

async function fetchContributions(): Promise<ContributionCalendar> {
  // `requireToken` (not optional): the contributions calendar is only exposed
  // via the authenticated GraphQL API, so no token means no data at all.
  const json = await githubFetch("https://api.github.com/graphql", {
    label: "the contributions GraphQL API",
    requireToken: true,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: CONTRIBUTIONS_QUERY, variables: { login: GITHUB_USER } }),
  });
  return toCalendar(json as GraphQLContributionsResponse);
}

/**
 * Returns the contribution calendar with live GraphQL data, resolved at build time.
 *
 * Never throws: if the fetch fails (no token, non-OK, GraphQL errors, offline) it degrades
 * to the committed `github-contributions-fallback.json` so `npm run build` always succeeds.
 *
 * Issues exactly one request.
 */
export async function getContributions(): Promise<ContributionCalendar> {
  return withFallback("contributions fetch", fallbackCalendar, fetchContributions);
}
