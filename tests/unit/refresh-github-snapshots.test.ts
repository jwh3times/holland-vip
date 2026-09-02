/* oxlint-disable typescript/require-await -- async fetch test doubles intentionally resolve synchronously */
import { describe, expect, it, vi } from "vitest";
import { FEATURED_REPO_SLUGS } from "@/lib/github-repos-contract.mjs";
import { refreshGithubSnapshots } from "@/scripts/refresh-github-snapshots.mjs";

type FetchImpl = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

function urlOf(input: string | URL | Request): string {
  if (typeof input === "string") return input;
  return input instanceof URL ? input.href : input.url;
}

function repoPayload(slug: string) {
  return {
    name: slug,
    description: `Description for ${slug}`,
    language: "TypeScript",
    stargazers_count: 3,
    pushed_at: "2026-09-01T00:00:00Z",
    html_url: `https://github.com/jwh3times/${slug}`,
  };
}

function contributionsPayload() {
  return {
    data: {
      user: {
        contributionsCollection: {
          contributionCalendar: {
            totalContributions: 4,
            weeks: [
              {
                contributionDays: [
                  {
                    date: "2026-09-01",
                    contributionCount: 4,
                    contributionLevel: "SECOND_QUARTILE",
                  },
                ],
              },
            ],
          },
        },
      },
    },
  };
}

function response(payload: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => payload } as unknown as Response;
}

function successfulFetch() {
  return vi.fn<FetchImpl>(async (input) => {
    const url = urlOf(input);
    if (url.endsWith("/graphql")) return response(contributionsPayload());
    return response(repoPayload(url.split("/").pop() ?? ""));
  });
}

describe("refreshGithubSnapshots", () => {
  it("refreshes both snapshots in allowlist order through one writer", async () => {
    const fetchImpl = successfulFetch();
    const writer = vi.fn(async () => {});

    const snapshots = await refreshGithubSnapshots({ fetchImpl, token: "process-token", writer });

    expect((snapshots.repos as { name: string }[]).map((repo) => repo.name)).toEqual(
      FEATURED_REPO_SLUGS
    );
    expect(snapshots.contributions).toEqual({
      totalContributions: 4,
      weeks: [[{ date: "2026-09-01", count: 4, level: 2 }]],
    });
    expect(fetchImpl).toHaveBeenCalledTimes(FEATURED_REPO_SLUGS.length + 1);
    expect(writer).toHaveBeenCalledOnce();
    const requests = fetchImpl.mock.calls.map((call) => call[1] as RequestInit);
    expect(requests.every((request) => request.headers)).toBe(true);
    expect(JSON.stringify(requests)).toContain("Bearer process-token");
  });

  it("does not write either snapshot when a repository payload is malformed", async () => {
    const fetchImpl = successfulFetch();
    fetchImpl.mockImplementation(async (input) => {
      const url = urlOf(input);
      if (url.endsWith("/graphql")) return response(contributionsPayload());
      if (url.endsWith(`/${FEATURED_REPO_SLUGS[0]}`)) return response({ name: "incomplete" });
      return response(repoPayload(url.split("/").pop() ?? ""));
    });
    const writer = vi.fn(async () => {});

    await expect(
      refreshGithubSnapshots({ fetchImpl, token: "process-token", writer })
    ).rejects.toThrow(/invalid repository payload/);
    expect(writer).not.toHaveBeenCalled();
  });

  it("does not write either snapshot when the contribution payload is incomplete", async () => {
    const fetchImpl = successfulFetch();
    fetchImpl.mockImplementation(async (input) =>
      urlOf(input).endsWith("/graphql")
        ? response({ data: { user: null } })
        : response(repoPayload(urlOf(input).split("/").pop() ?? ""))
    );
    const writer = vi.fn(async () => {});

    await expect(
      refreshGithubSnapshots({ fetchImpl, token: "process-token", writer })
    ).rejects.toThrow(/no contribution calendar/);
    expect(writer).not.toHaveBeenCalled();
  });

  it("requires a process-scoped token before making requests", async () => {
    const fetchImpl = successfulFetch();
    const writer = vi.fn(async () => {});

    await expect(refreshGithubSnapshots({ fetchImpl, token: "", writer })).rejects.toThrow(
      /GITHUB_TOKEN is required/
    );
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(writer).not.toHaveBeenCalled();
  });
});
