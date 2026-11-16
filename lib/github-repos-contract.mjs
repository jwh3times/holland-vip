/** GitHub account that owns the Hobby Projects' repositories. */
export const GITHUB_USER = "jwh3times";

/**
 * The Hobby Projects' repositories, in display order: the only repositories the build fetches.
 * `content/hobby-projects.ts` names the same set; a unit test fails when the two differ.
 */
export const HOBBY_PROJECT_REPOS = ["Nearcited", "causet", "magic-agenda", "PressGolf"];

/** Validates the normalized repository snapshot consumed by the site. */
export function parseRepos(data) {
  if (!Array.isArray(data) || data.length === 0) return null;
  const valid = data.every(
    (repo) =>
      typeof repo === "object" &&
      repo !== null &&
      typeof repo.name === "string" &&
      (typeof repo.description === "string" || repo.description === null) &&
      (typeof repo.language === "string" || repo.language === null) &&
      typeof repo.stars === "number" &&
      typeof repo.pushedAt === "string" &&
      typeof repo.url === "string"
  );
  return valid ? data : null;
}

/** A live response that is not eligible for public disclosure. */
export class RepositoryDisclosureError extends Error {}

/** Normalizes only explicitly public data for the requested repository identity. */
export function toRepo(repo, slug) {
  if (
    !HOBBY_PROJECT_REPOS.includes(slug) ||
    repo?.private !== false ||
    (repo.visibility !== undefined && repo.visibility !== "public") ||
    repo.name !== slug ||
    repo.owner?.login !== GITHUB_USER ||
    repo.full_name !== `${GITHUB_USER}/${slug}` ||
    repo.html_url !== `https://github.com/${GITHUB_USER}/${slug}`
  ) {
    throw new RepositoryDisclosureError(
      "GitHub REST returned an invalid repository payload for public disclosure"
    );
  }
  const normalized = {
    name: repo?.name,
    description: repo?.description,
    language: repo?.language,
    stars: repo?.stargazers_count,
    pushedAt: repo?.pushed_at,
    url: repo?.html_url,
  };
  const parsed = parseRepos([normalized]);
  if (!parsed)
    throw new RepositoryDisclosureError("GitHub REST returned an invalid repository payload");
  return parsed[0];
}
