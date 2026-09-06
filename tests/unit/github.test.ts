/* oxlint-disable typescript/require-await -- async fetch test doubles intentionally resolve synchronously */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getFeaturedRepos,
  getFeaturedReposWithSource,
  FEATURED_REPO_SLUGS,
  type Repo,
} from "@/lib/github";
import fallback from "@/lib/github-fallback.json";

/** Build a GitHub `/repos/{owner}/{repo}` payload for a given slug. */
function ghPayload(slug: string) {
  return {
    name: slug,
    private: false,
    visibility: "public",
    owner: { login: "jwh3times" },
    full_name: `jwh3times/${slug}`,
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

  it("keeps repository requests anonymous even when GITHUB_TOKEN is set", async () => {
    const fetchMock = mockOkFetch();
    process.env.GITHUB_TOKEN = "secret-token";

    await getFeaturedRepos();

    expect(headersOf(fetchMock.mock.calls[0]).Authorization).toBeUndefined();
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

describe("repository disclosure eligibility", () => {
  it.each([
    { private: true, visibility: "private" },
    { private: false, visibility: "internal" },
    { private: undefined, visibility: "public" },
    { owner: { login: "someone-else" } },
    { full_name: "someone-else/apexracers" },
    { html_url: "https://example.invalid/apexracers" },
  ])("omits rejected live data and its old snapshot: %j", async (changes) => {
    process.env.GITHUB_TOKEN = "synthetic-token";
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        const slug = url.split("/").pop() ?? "";
        const payload = ghPayload(slug);
        return {
          ok: true,
          status: 200,
          json: async () =>
            slug === "apexracers"
              ? { ...payload, ...changes, description: "SYNTHETIC CONFIDENTIAL" }
              : payload,
        };
      })
    );
    const repos = await getFeaturedRepos();
    expect(repos.map((repo) => repo.name)).toEqual(FEATURED_REPO_SLUGS.slice(1));
    expect(JSON.stringify(repos)).not.toContain("SYNTHETIC CONFIDENTIAL");
  });

  it.each([404, 410])(
    "omits unavailable repositories on %i instead of restoring snapshots",
    async (status) => {
      vi.spyOn(console, "warn").mockImplementation(() => {});
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => ({ ok: false, status }))
      );
      expect(await getFeaturedRepos()).toEqual([]);
    }
  );
});

it("keeps public live results and transient snapshots without reviving a rejected repository", async () => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const slug = url.split("/").pop() ?? "";
      if (slug === "apexracers") return { ok: false, status: 404 };
      if (slug === "LeaseBook") throw new Error("offline");
      return okResponse(slug);
    })
  );
  const result = await getFeaturedReposWithSource();
  expect(result.source).toBe("fallback");
  expect(result.data).toEqual([
    fallback[1],
    expect.objectContaining({ name: "GuardianTracker", description: "desc-GuardianTracker" }),
    expect.objectContaining({ name: "holland-vip", description: "desc-holland-vip" }),
  ]);
});

it("accepts explicit public repositories when optional visibility is absent", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const payload = ghPayload(url.split("/").pop() ?? "");
      return { ok: true, json: async () => ({ ...payload, visibility: undefined }) };
    })
  );
  const result = await getFeaturedReposWithSource();
  expect(result.source).toBe("live");
  expect(result.data.map((repo) => repo.name)).toEqual(FEATURED_REPO_SLUGS);
});
