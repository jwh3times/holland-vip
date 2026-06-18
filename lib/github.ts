import fallbackData from "./github-fallback.json";

/** GitHub account whose public repos are featured. */
const GITHUB_USER = "jwh3times";

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

/** Committed snapshot used when the live GitHub fetch is unavailable. */
const fallbackRepos = fallbackData as Repo[];

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
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "holland-vip-build",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  // Optional build-time token, only to lift the 60 req/hr unauthenticated limit.
  // Never shipped to the client — this module runs at build (Server Component / SSG).
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${slug}`, {
    headers,
    // Static export: fetch runs once at build and the result is baked into the
    // HTML. force-cache keeps the page statically generatable (no dynamic opt-out).
    cache: "force-cache",
  });
  if (!res.ok) {
    throw new Error(`GitHub API responded ${res.status} for ${GITHUB_USER}/${slug}`);
  }
  return toRepo((await res.json()) as GitHubRepoResponse);
}

/**
 * Returns the featured repos with live GitHub data, resolved at build time.
 *
 * Never throws: if any repo fetch fails (offline, rate-limited, 404), it degrades
 * to the committed `github-fallback.json` so `npm run build` always succeeds.
 */
export async function getFeaturedRepos(): Promise<Repo[]> {
  try {
    return await Promise.all(FEATURED_REPO_SLUGS.map(fetchRepo));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[github] live fetch failed, using committed fallback: ${message}`);
    return fallbackRepos;
  }
}
