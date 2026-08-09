import { githubFetch, withFallback } from "./github-fetch";
import fallbackData from "./github-fallback.json";

/** GitHub account whose public repos are featured. */
export const GITHUB_USER = "jwh3times";

/**
 * Curated allowlist of repos to feature, in display order.
 *
 * Resolved 2026-06-18 (Tier 5 B1). Only these are fetched — an explicit list
 * keeps the interview-submission repos out of the Open Source section. Update
 * this array (and `github-fallback.json`) to change what the site shows.
 */
export const FEATURED_REPO_SLUGS = [
  "apexracers",
  "LeaseBook",
  "GuardianTracker",
  "holland-vip",
] as const;

/** A featured repository, normalized to just the fields the UI renders. */
export interface Repo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  /** ISO-8601 timestamp of the last push. */
  pushedAt: string;
  url: string;
}

/**
 * Validates a committed snapshot against {@link Repo}.
 *
 * The snapshot is a repo asset, hand-edited or written by a script, and it used
 * to be an unchecked `as Repo[]` cast — so a malformed one would have surfaced
 * as broken markup rather than an error. Exported so a test can assert the
 * committed file still parses; see `tests/unit/github-fallback.test.ts`.
 *
 * Returns `null` rather than throwing: this feeds the degradation path, which
 * must never break the build.
 */
export function parseRepos(data: unknown): Repo[] | null {
  if (!Array.isArray(data) || data.length === 0) return null;
  const ok = data.every(
    (r: unknown) =>
      typeof r === "object" &&
      r !== null &&
      typeof (r as Repo).name === "string" &&
      (typeof (r as Repo).description === "string" || (r as Repo).description === null) &&
      (typeof (r as Repo).language === "string" || (r as Repo).language === null) &&
      typeof (r as Repo).stars === "number" &&
      typeof (r as Repo).pushedAt === "string" &&
      typeof (r as Repo).url === "string"
  );
  return ok ? (data as Repo[]) : null;
}

/**
 * Committed snapshot used when the live GitHub fetch is unavailable.
 *
 * If the snapshot itself is malformed the section renders empty rather than
 * with garbage — `app/page.tsx` drops `OpenSourceSection` on an empty list.
 */
const fallbackRepos: Repo[] = parseRepos(fallbackData) ?? [];

/** The subset of GitHub's `/repos/{owner}/{repo}` payload we consume. */
interface GitHubRepoResponse {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  html_url: string;
}

function toRepo(r: GitHubRepoResponse): Repo {
  return {
    name: r.name,
    description: r.description,
    language: r.language,
    stars: r.stargazers_count,
    pushedAt: r.pushed_at,
    url: r.html_url,
  };
}

async function fetchRepo(slug: string): Promise<Repo> {
  // The token is optional here — it only lifts the 60 req/hr unauthenticated
  // limit. The REST repo API serves public repos anonymously.
  const json = await githubFetch(`https://api.github.com/repos/${GITHUB_USER}/${slug}`, {
    label: `GitHub API for ${GITHUB_USER}/${slug}`,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  return toRepo(json as GitHubRepoResponse);
}

/**
 * Returns the featured repos with live GitHub data, resolved at build time.
 *
 * Never throws: if any repo fetch fails (offline, rate-limited, 404), it degrades
 * to the committed `github-fallback.json` so `npm run build` always succeeds.
 *
 * Note the request count and its failure mode: this issues one request per entry
 * in `FEATURED_REPO_SLUGS` (currently 4) via `Promise.all`, so a single failing
 * repo discards the whole batch and the committed snapshot is used for *all* of
 * them. `getContributions()` issues one request by comparison.
 */
export async function getFeaturedRepos(): Promise<Repo[]> {
  return withFallback("live repo fetch", fallbackRepos, () =>
    Promise.all(FEATURED_REPO_SLUGS.map(fetchRepo))
  );
}
