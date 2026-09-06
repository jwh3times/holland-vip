/**
 * Build-time GitHub access policy, shared by `github.ts` and
 * `github-contributions.ts`.
 *
 * Callers select anonymous repository access or token-backed contributions.
 * Non-OK responses preserve their status so callers can choose a safe fallback.
 *
 * These functions run at build time only (Server Component / SSG). The token
 * is read from the build environment and is never shipped to the client.
 */

/** Preserves status without retaining response bodies or credentials. */
export class GitHubResponseError extends Error {
  constructor(
    label: string,
    readonly status: number
  ) {
    super(`${label} responded ${status}`);
  }
}

const USER_AGENT = "holland-vip-build";

export type GitHubDataSource = "live" | "fallback";

export interface GitHubDataResult<T> {
  data: T;
  source: GitHubDataSource;
}

/**
 * Performs a build-time GitHub request and returns the parsed
 * JSON body.
 *
 * Interface:
 * - Adds `User-Agent` and, unless anonymous, an available `GITHUB_TOKEN` bearer header.
 * - Uses `cache: "force-cache"` so the result is baked in at build and the
 *   route stays statically generatable. Note that a POST (the GraphQL API)
 *   still opts the route into dynamic rendering unless the route pins
 *   `export const dynamic = "force-static"` — see `app/page.tsx`.
 * - **Throws** on a non-OK response. Callers select eligible fallback data
 *   using the preserved response status.
 *
 * @param label Human-readable request name, used in the thrown error message.
 * @param anonymous When true, never reads or sends the build token.
 * @param requireToken When true, throws if `GITHUB_TOKEN` is absent (the
 *   GraphQL API is auth-only; the REST repo API is not).
 */
export async function githubFetch(
  url: string,
  {
    label,
    requireToken = false,
    anonymous = false,
    method = "GET",
    headers = {},
    body,
  }: {
    label: string;
    requireToken?: boolean;
    anonymous?: boolean;
    method?: "GET" | "POST";
    headers?: Record<string, string>;
    body?: string;
  }
): Promise<unknown> {
  const token = anonymous ? undefined : process.env.GITHUB_TOKEN;
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
    throw new GitHubResponseError(label, res.status);
  }

  return res.json();
}

/**
 * Runs `fetchLive`, degrading to `snapshot` if it throws.
 *
 * Contribution fetching uses this unconditional fallback policy for offline,
 * rate-limited, missing-token, and GraphQL failures. Repository fetching instead
 * selects fallback data per repository after checking disclosure eligibility.
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
