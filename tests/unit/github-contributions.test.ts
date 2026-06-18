import { afterEach, describe, expect, it, vi } from "vitest";
import { getContributions, toCalendar } from "@/lib/github-contributions";
import fallback from "@/lib/github-contributions-fallback.json";

/** A minimal GraphQL contributions payload with two days. */
function ghPayload() {
  return {
    data: {
      user: {
        contributionsCollection: {
          contributionCalendar: {
            totalContributions: 12,
            weeks: [
              {
                contributionDays: [
                  { date: "2026-06-14", contributionCount: 0, contributionLevel: "NONE" },
                  {
                    date: "2026-06-15",
                    contributionCount: 9,
                    contributionLevel: "FOURTH_QUARTILE",
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

function okResponse(): Response {
  return { ok: true, status: 200, json: async () => ghPayload() } as unknown as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete process.env.GITHUB_TOKEN;
});

describe("toCalendar", () => {
  it("maps GraphQL days to numeric levels and a weeks matrix", () => {
    const cal = toCalendar(ghPayload());
    expect(cal.totalContributions).toBe(12);
    expect(cal.weeks).toHaveLength(1);
    expect(cal.weeks[0]).toEqual([
      { date: "2026-06-14", count: 0, level: 0 },
      { date: "2026-06-15", count: 9, level: 4 },
    ]);
  });

  it("throws on GraphQL errors", () => {
    expect(() => toCalendar({ errors: [{ message: "Bad credentials" }] })).toThrow(
      /Bad credentials/
    );
  });

  it("throws when no calendar is present", () => {
    expect(() => toCalendar({ data: { user: null } })).toThrow(/no contribution calendar/);
  });
});

describe("getContributions", () => {
  it("returns mapped live data when a token is set and the fetch succeeds", async () => {
    process.env.GITHUB_TOKEN = "secret-token";
    const fetchMock = vi.fn(async () => okResponse());
    vi.stubGlobal("fetch", fetchMock);

    const cal = await getContributions();

    expect(cal.totalContributions).toBe(12);
    expect(cal.weeks[0][1].level).toBe(4);
    // Posts to the GraphQL endpoint with a Bearer token.
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.github.com/graphql");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer secret-token");
  });

  it("falls back to the committed JSON when no token is set (offline build)", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const cal = await getContributions();

    expect(cal).toEqual(fallback);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledOnce();
  });

  it("falls back on a non-OK response (e.g. bad token)", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    process.env.GITHUB_TOKEN = "bad";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 401, json: async () => ({}) }) as unknown as Response)
    );

    const cal = await getContributions();

    expect(cal).toEqual(fallback);
  });
});
