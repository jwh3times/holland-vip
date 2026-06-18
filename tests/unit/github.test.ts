import { afterEach, describe, expect, it, vi } from "vitest";
import { getFeaturedRepos, FEATURED_REPO_SLUGS, type Repo } from "@/lib/github";
import fallback from "@/lib/github-fallback.json";

/** Build a GitHub `/repos/{owner}/{repo}` payload for a given slug. */
function ghPayload(slug: string) {
  return {
    name: slug,
    description: `desc-${slug}`,
    language: "TypeScript",
    stargazers_count: 7,
    pushed_at: "2026-01-02T03:04:05Z",
    html_url: `https://github.com/jwh3times/${slug}`,
  };
}

function okResponse(slug: string): Response {
  return {
    ok: true,
    status: 200,
    json: async () => ghPayload(slug),
  } as unknown as Response;
}

/** A fetch mock that resolves every allowlisted repo successfully. */
function mockOkFetch() {
  const fetchMock = vi.fn(async (url: string) => okResponse(url.split("/").pop() ?? ""));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/** Pull the request headers out of a recorded fetch call's init argument. */
function headersOf(call: unknown[]): Record<string, string> {
  const init = call[1] as RequestInit | undefined;
  return (init?.headers ?? {}) as Record<string, string>;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete process.env.GITHUB_TOKEN;
});

describe("getFeaturedRepos", () => {
  it("maps live GitHub data for every allowlisted repo, in order", async () => {
    const fetchMock = mockOkFetch();

    const repos = await getFeaturedRepos();

    expect(repos.map((r) => r.name)).toEqual([...FEATURED_REPO_SLUGS]);
    expect(fetchMock).toHaveBeenCalledTimes(FEATURED_REPO_SLUGS.length);
    expect(repos[0]).toEqual<Repo>({
      name: "apexracers",
      description: "desc-apexracers",
      language: "TypeScript",
      stars: 7,
      pushedAt: "2026-01-02T03:04:05Z",
      url: "https://github.com/jwh3times/apexracers",
    });
  });

  it("sends a Bearer Authorization header when GITHUB_TOKEN is set", async () => {
    const fetchMock = mockOkFetch();
    process.env.GITHUB_TOKEN = "secret-token";

    await getFeaturedRepos();

    expect(headersOf(fetchMock.mock.calls[0]).Authorization).toBe("Bearer secret-token");
  });

  it("omits the Authorization header when no token is set", async () => {
    const fetchMock = mockOkFetch();

    await getFeaturedRepos();

    expect(headersOf(fetchMock.mock.calls[0]).Authorization).toBeUndefined();
  });

  it("falls back to the committed JSON when the network fails (offline build)", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      })
    );

    const repos = await getFeaturedRepos();

    expect(repos).toEqual(fallback);
    expect(warn).toHaveBeenCalledOnce();
  });

  it("falls back to the committed JSON on a non-OK response (rate limited)", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 403, json: async () => ({}) }) as unknown as Response)
    );

    const repos = await getFeaturedRepos();

    expect(repos).toEqual(fallback);
  });
});
