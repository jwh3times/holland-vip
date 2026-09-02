// Refreshes both committed GitHub fallback snapshots in one validated operation.
// Credentials are read from the process environment and never printed or persisted.

import { rename, writeFile } from "node:fs/promises";
import { pathToFileURL, fileURLToPath } from "node:url";

import { CONTRIBUTIONS_QUERY, toCalendar } from "../lib/github-contributions-query.mjs";
import {
  FEATURED_REPO_SLUGS,
  GITHUB_USER,
  parseRepos,
  toRepo,
} from "../lib/github-repos-contract.mjs";

const USER_AGENT = "holland-vip-snapshot-refresh";

async function requestJson(fetchImpl, url, init, label) {
  const response = await fetchImpl(url, init);
  if (!response.ok) throw new Error(`${label} responded ${response.status}`);
  return response.json();
}

/** Fetches and validates both snapshots without writing either file. */
export async function fetchGithubSnapshots({ fetchImpl = fetch, token }) {
  if (!token) throw new Error("GITHUB_TOKEN is required in the process environment");

  const headers = {
    Authorization: `Bearer ${token}`,
    "User-Agent": USER_AGENT,
  };
  const repoRequests = FEATURED_REPO_SLUGS.map(async (slug) => {
    const payload = await requestJson(
      fetchImpl,
      `https://api.github.com/repos/${GITHUB_USER}/${slug}`,
      {
        headers: {
          ...headers,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
      `GitHub API for ${GITHUB_USER}/${slug}`
    );
    return toRepo(payload);
  });
  const contributionsRequest = requestJson(
    fetchImpl,
    "https://api.github.com/graphql",
    {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ query: CONTRIBUTIONS_QUERY, variables: { login: GITHUB_USER } }),
    },
    "GitHub contributions GraphQL API"
  ).then(toCalendar);

  const [repos, contributions] = await Promise.all([
    Promise.all(repoRequests),
    contributionsRequest,
  ]);
  if (!parseRepos(repos)) throw new Error("Refusing to write an invalid repository snapshot");
  return { repos, contributions };
}

/** Writes both already-validated snapshots through temporary files. */
export async function writeSnapshots(
  { repos, contributions },
  { reposOut, contributionsOut } = {}
) {
  reposOut ??= fileURLToPath(new URL("../lib/github-fallback.json", import.meta.url));
  contributionsOut ??= fileURLToPath(
    new URL("../lib/github-contributions-fallback.json", import.meta.url)
  );
  const repoTemp = `${reposOut}.${process.pid}.tmp`;
  const contributionsTemp = `${contributionsOut}.${process.pid}.tmp`;
  await Promise.all([
    writeFile(repoTemp, `${JSON.stringify(repos, null, 2)}\n`),
    writeFile(contributionsTemp, `${JSON.stringify(contributions, null, 2)}\n`),
  ]);
  await Promise.all([rename(repoTemp, reposOut), rename(contributionsTemp, contributionsOut)]);
}

/** Refreshes both files only after every upstream response passes the production contracts. */
export async function refreshGithubSnapshots({
  fetchImpl = fetch,
  token = process.env.GITHUB_TOKEN,
  writer = writeSnapshots,
} = {}) {
  const snapshots = await fetchGithubSnapshots({ fetchImpl, token });
  await writer(snapshots);
  return snapshots;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const snapshots = await refreshGithubSnapshots();
    console.log(
      `Refreshed ${snapshots.repos.length} repositories and ${snapshots.contributions.weeks.length} contribution weeks.`
    );
  } catch (error) {
    console.error(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
