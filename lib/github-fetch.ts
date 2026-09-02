/**
 * Build-time GitHub access policy, shared by `github.ts` and
 * `github-contributions.ts`.
 *
 * Both callers need the same three things — authenticate if a token is
 * present, fail loudly on a non-OK response, and degrade to a committed
 * snapshot rather than break the build. This module owns all three so the
 * policy is implemented and asserted once.
 *
 * These functions run at build time only (Server Component / SSG). The token
 * is read from the build environment and is never shipped to the client.
 */

const USER_AGENT = "holland-vip-build";

export type GitHubDataSource = "live" | "fallback";

export interface GitHubDataResult<T> {
  data: T;
  source: GitHubDataSource;
}

/**
 * Performs an authenticated build-time GitHub request and returns the parsed
 * JSON body.
 *
 * Interface:
 * - Adds `User-Agent` and, when `GITHUB_TOKEN` is set, `Authorization: Bearer`.
 * - Uses `cache: "force-cache"` so the result is baked in at build and the
 *   route stays statically generatable. Note that a POST (the GraphQL API)
 *   still opts the route into dynamic rendering unless the route pins
 *   `export const dynamic = "force-static"` — see `app/page.tsx`.
 * - **Throws** on a non-OK response. Callers are expected to wrap this in
 *   {@link withFallback} rather than handle the error themselves.
 *
 * @param label Human-readable request name, used in the thrown error message.
 * @param requireToken When true, throws if `GITHUB_TOKEN` is absent (the
 *   GraphQL API is auth-only; the REST repo API is not).
 */
export async function githubFetch(
  url: string,
  {
    label,
    requireToken = false,
    method = "GET",
    headers = {},
    body,
  }: {
    label: string;
    requireToken?: boolean;
    method?: "GET" | "POST";
    headers?: Record<string, string>;
    body?: string;
  }
): Promise<unknown> {
  const token = process.env.GITHUB_TOKEN;
  if (requireToken && !token) {
    throw new Error(`GITHUB_TOKEN is required for ${label}`);
  }

  const finalHeaders: Record<string, string> = {
    "User-Agent": USER_AGENT,
    ...headers,
  };
  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    ...(body === undefined ? {} : { body }),
    cache: "force-cache",
  });

  if (!res.ok) {
    throw new Error(`${label} responded ${res.status}`);
  }

  return res.json();
}

/**
 * Runs `fetchLive`, degrading to `snapshot` if it throws.
 *
 * This is the module that makes `getFeaturedRepos()` and `getContributions()`
 * never-throwing: any failure (offline, rate-limited, 404, missing token,
 * GraphQL errors) is warned about once and swallowed, so `npm run build`
 * always succeeds with committed data.
 *
 * @param label Prefix for the warning, e.g. "live repo fetch".
 */
export async function withFallback<T>(
  label: string,
  snapshot: T,
  fetchLive: () => Promise<T>
): Promise<T> {
  return (await withFallbackSource(label, snapshot, fetchLive)).data;
}

/** Runs a live fetch and preserves whether live or fallback data won. */
export async function withFallbackSource<T>(
  label: string,
  snapshot: T,
  fetchLive: () => Promise<T>
): Promise<GitHubDataResult<T>> {
  try {
    return { data: await fetchLive(), source: "live" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[github] ${label} failed, using committed fallback: ${message}`);
    return { data: snapshot, source: "fallback" };
  }
}
