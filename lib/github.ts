import { githubFetch, GitHubResponseError, type GitHubDataResult } from "./github-fetch";
import {
  FEATURED_REPO_SLUGS as RAW_FEATURED_REPO_SLUGS,
  GITHUB_USER,
  parseRepos as parseRepoContract,
  toRepo,
  RepositoryDisclosureError,
} from "./github-repos-contract.mjs";
import fallbackData from "./github-fallback.json";

/**
 * Curated allowlist of repos to feature, in display order.
 *
 * Resolved 2026-06-18 (Tier 5 B1). Only these are fetched — an explicit list
 * keeps the interview-submission repos out of the Open Source section. Update
 * this array (and `github-fallback.json`) to change what the site shows.
 */
export { GITHUB_USER };
export const FEATURED_REPO_SLUGS = RAW_FEATURED_REPO_SLUGS as readonly string[];

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
  return parseRepoContract(data) as Repo[] | null;
}

/**
 * Committed snapshot used when the live GitHub fetch is unavailable.
 *
 * If the snapshot itself is malformed the section renders empty rather than
 * with garbage — `app/page.tsx` drops `OpenSourceSection` on an empty list.
 */
const fallbackRepos: Repo[] = parseRepos(fallbackData) ?? [];

/** The subset of GitHub's `/repos/{owner}/{repo}` payload we consume. */
async function fetchRepo(slug: string): Promise<Repo> {
  const json = await githubFetch(`https://api.github.com/repos/${GITHUB_USER}/${slug}`, {
    anonymous: true,
    label: `GitHub API for ${GITHUB_USER}/${slug}`,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  return toRepo(json, slug) as Repo;
}

/**
 * Returns the featured repos with live GitHub data, resolved at build time.
 *
 * Never throws. Transient failures use reviewed snapshots per repository;
 * unavailable or disclosure-ineligible responses omit that repository entirely.
 */
export async function getFeaturedRepos(): Promise<Repo[]> {
  return (await getFeaturedReposWithSource()).data;
}

/** Returns featured repositories and the build-time source selected for them. */
export async function getFeaturedReposWithSource(): Promise<GitHubDataResult<Repo[]>> {
  const results = await Promise.allSettled(FEATURED_REPO_SLUGS.map(fetchRepo));
  const failed = results.some((result) => result.status === "rejected");
  if (failed)
    console.warn("[github] live repo fetch incomplete; using eligible committed fallback only");
  const data = results.flatMap((result, index): Repo[] => {
    if (result.status === "fulfilled") return [result.value];
    const error: unknown = result.reason;
    if (
      error instanceof RepositoryDisclosureError ||
      (error instanceof GitHubResponseError && [404, 410].includes(error.status))
    )
      return [];
    const slug = FEATURED_REPO_SLUGS[index];
    return fallbackRepos.filter(
      (repo) => repo.name === slug && repo.url === `https://github.com/${GITHUB_USER}/${slug}`
    );
  });
  return { data, source: failed ? "fallback" : "live" };
}
