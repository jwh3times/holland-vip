/** GitHub account whose public repos are featured. */
export const GITHUB_USER = "jwh3times";

/** Curated allowlist of repositories, in display order. */
export const FEATURED_REPO_SLUGS = ["apexracers", "LeaseBook", "GuardianTracker", "holland-vip"];

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

/** Normalizes and validates one GitHub REST repository payload. */
export function toRepo(repo) {
  const normalized = {
    name: repo?.name,
    description: repo?.description,
    language: repo?.language,
    stars: repo?.stargazers_count,
    pushedAt: repo?.pushed_at,
    url: repo?.html_url,
  };
  const parsed = parseRepos([normalized]);
  if (!parsed) throw new Error("GitHub REST returned an invalid repository payload");
  return parsed[0];
}
