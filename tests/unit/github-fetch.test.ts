/* oxlint-disable typescript/no-unnecessary-type-assertion, typescript/only-throw-error, typescript/require-await -- intentional test doubles and non-Error throw coverage */
import { afterEach, describe, expect, it, vi } from "vitest";
import { githubFetch, withFallback, withFallbackSource } from "@/lib/github-fetch";

function okResponse(body: unknown = { ok: true }): Response {
  return { ok: true, status: 200, json: async () => body } as unknown as Response;
}

/** Pull the init argument out of a recorded fetch call. */
function initOf(call: unknown[]): RequestInit {
  return (call[1] ?? {}) as RequestInit;
}

function headersOf(call: unknown[]): Record<string, string> {
  return (initOf(call).headers ?? {}) as Record<string, string>;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete process.env.GITHUB_TOKEN;
});

describe("githubFetch", () => {
  it("sends the build User-Agent and force-cache on every request", async () => {
    const fetchMock = vi.fn(async () => okResponse());
    vi.stubGlobal("fetch", fetchMock);

    await githubFetch("https://api.github.com/x", { label: "test" });

    expect(headersOf(fetchMock.mock.calls[0])["User-Agent"]).toBe("holland-vip-build");
    expect(initOf(fetchMock.mock.calls[0]).cache).toBe("force-cache");
    expect(initOf(fetchMock.mock.calls[0]).method).toBe("GET");
  });

  it("adds a Bearer header when GITHUB_TOKEN is set, and omits it otherwise", async () => {
    const fetchMock = vi.fn(async () => okResponse());
    vi.stubGlobal("fetch", fetchMock);

    await githubFetch("https://api.github.com/x", { label: "test" });
    expect(headersOf(fetchMock.mock.calls[0]).Authorization).toBeUndefined();

    process.env.GITHUB_TOKEN = "secret-token";
    await githubFetch("https://api.github.com/x", { label: "test" });
    expect(headersOf(fetchMock.mock.calls[1]).Authorization).toBe("Bearer secret-token");
  });

  it("merges caller headers with the defaults", async () => {
    const fetchMock = vi.fn(async () => okResponse());
    vi.stubGlobal("fetch", fetchMock);

    await githubFetch("https://api.github.com/x", {
      label: "test",
      headers: { Accept: "application/vnd.github+json" },
    });

    const headers = headersOf(fetchMock.mock.calls[0]);
    expect(headers.Accept).toBe("application/vnd.github+json");
    expect(headers["User-Agent"]).toBe("holland-vip-build");
  });

  it("throws before fetching when requireToken is set and no token exists", async () => {
    const fetchMock = vi.fn(async () => okResponse());
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      githubFetch("https://api.github.com/graphql", {
        label: "the GraphQL API",
        requireToken: true,
      })
    ).rejects.toThrow("GITHUB_TOKEN is required for the GraphQL API");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends a POST body when given one", async () => {
    const fetchMock = vi.fn(async () => okResponse());
    vi.stubGlobal("fetch", fetchMock);
    process.env.GITHUB_TOKEN = "t";

    await githubFetch("https://api.github.com/graphql", {
      label: "graphql",
      method: "POST",
      body: '{"query":"{}"}',
    });

    expect(initOf(fetchMock.mock.calls[0]).method).toBe("POST");
    expect(initOf(fetchMock.mock.calls[0]).body).toBe('{"query":"{}"}');
  });

  it("throws on a non-OK response, naming the label and status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 403, json: async () => ({}) }) as unknown as Response)
    );

    await expect(githubFetch("https://api.github.com/x", { label: "GitHub API" })).rejects.toThrow(
      "GitHub API responded 403"
    );
  });
});

describe("withFallback", () => {
  it("returns the live value when the fetch succeeds", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await withFallback("test fetch", "snapshot", async () => "live");

    expect(result).toBe("live");
    expect(warn).not.toHaveBeenCalled();
  });

  it("degrades to the snapshot and warns once when the fetch throws", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await withFallback("test fetch", "snapshot", async () => {
      throw new Error("offline");
    });

    expect(result).toBe("snapshot");
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toContain("[github] test fetch failed");
    expect(warn.mock.calls[0][0]).toContain("offline");
  });

  it("stringifies a non-Error throw rather than losing it", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await withFallback("test fetch", "snapshot", async () => {
      throw "plain string";
    });

    expect(result).toBe("snapshot");
    expect(warn.mock.calls[0][0]).toContain("plain string");
  });
});

describe("withFallbackSource", () => {
  it("reports live when the fetch succeeds", async () => {
    await expect(withFallbackSource("test", "snapshot", async () => "live")).resolves.toEqual({
      data: "live",
      source: "live",
    });
  });

  it("reports fallback without throwing when the fetch fails", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(
      withFallbackSource("test", "snapshot", async () => {
        throw new Error("offline");
      })
    ).resolves.toEqual({ data: "snapshot", source: "fallback" });
  });
});
