import { GITHUB_USER } from "./github";
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

/** Committed snapshot used when the live GraphQL fetch is unavailable (no/invalid token, offline). */
const fallbackCalendar = fallbackData as ContributionCalendar;

/**
 * GitHub's GraphQL contributions query. Unlike the REST repo calls in `github.ts`,
 * the GraphQL API is auth-only, so this needs a token for *any* data.
 */
const CONTRIBUTIONS_QUERY = `
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
const LEVEL_MAP: Record<string, ContributionLevel> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

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
  // Required (not optional): the contributions calendar is only exposed via the
  // authenticated GraphQL API. Token is build-env only, never shipped to the client.
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is required for the contributions GraphQL API");
  }

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "holland-vip-build",
    },
    body: JSON.stringify({ query: CONTRIBUTIONS_QUERY, variables: { login: GITHUB_USER } }),
    // Static export: bake the result at build (the page is `force-static`).
    cache: "force-cache",
  });
  if (!res.ok) {
    throw new Error(`GitHub GraphQL responded ${res.status}`);
  }
  return toCalendar((await res.json()) as GraphQLContributionsResponse);
}

/**
 * Returns the contribution calendar with live GraphQL data, resolved at build time.
 *
 * Never throws: if the fetch fails (no token, non-OK, GraphQL errors, offline) it degrades
 * to the committed `github-contributions-fallback.json` so `npm run build` always succeeds.
 */
export async function getContributions(): Promise<ContributionCalendar> {
  try {
    return await fetchContributions();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[github] contributions fetch failed, using committed fallback: ${message}`);
    return fallbackCalendar;
  }
}
