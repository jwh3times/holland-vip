// @vitest-environment node
import { describe, it, expect, vi, afterEach } from "vitest";

import { parseRepos, FEATURED_REPO_SLUGS } from "@/lib/github";
import { parseCalendar } from "@/lib/github-contributions";
import repoSnapshot from "@/lib/github-fallback.json";
import calendarSnapshot from "@/lib/github-contributions-fallback.json";

/**
 * The two committed snapshots are what the site renders whenever the live
 * GitHub calls fail, which is every build without a `GITHUB_TOKEN` — including
 * CI. They used to be unchecked `as` casts, so drift between the JSON and the
 * types it claims to satisfy would have surfaced as broken markup. These tests
 * are what makes the assertion earned.
 */

describe("committed repo snapshot", () => {
  it("parses as Repo[]", () => {
    expect(parseRepos(repoSnapshot)).not.toBeNull();
  });

  it("covers every featured repo slug", () => {
    const parsed = parseRepos(repoSnapshot);
    expect(parsed).not.toBeNull();
    expect(parsed!.map((r) => r.name).sort()).toEqual([...FEATURED_REPO_SLUGS].sort());
  });

  it("has a parseable pushedAt on every entry", () => {
    for (const repo of parseRepos(repoSnapshot)!) {
      expect(Number.isNaN(Date.parse(repo.pushedAt)), `${repo.name}.pushedAt`).toBe(false);
    }
  });
});

describe("committed contributions snapshot", () => {
  it("parses as ContributionCalendar", () => {
    expect(parseCalendar(calendarSnapshot)).not.toBeNull();
  });

  it("holds roughly a year of weeks with 1-7 days each", () => {
    const calendar = parseCalendar(calendarSnapshot)!;
    expect(calendar.weeks.length).toBeGreaterThan(50);
    expect(calendar.weeks.length).toBeLessThanOrEqual(54);
    for (const week of calendar.weeks) {
      expect(week.length).toBeGreaterThan(0);
      expect(week.length).toBeLessThanOrEqual(7);
    }
  });

  it("has ISO dates in ascending order", () => {
    const days = parseCalendar(calendarSnapshot)!.weeks.flat();
    for (const day of days) {
      expect(day.date, `${day.date} is not YYYY-MM-DD`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    const dates = days.map((d) => d.date);
    expect(dates).toEqual([...dates].sort());
  });
});

describe("parseRepos", () => {
  it("rejects a non-array, an empty array, and a wrong-shaped entry", () => {
    expect(parseRepos(null)).toBeNull();
    expect(parseRepos({})).toBeNull();
    expect(parseRepos([])).toBeNull();
    expect(parseRepos([{ name: "x" }])).toBeNull();
    expect(parseRepos([{ ...repoSnapshot[0], stars: "12" }])).toBeNull();
  });

  it("accepts null description and language", () => {
    expect(parseRepos([{ ...repoSnapshot[0], description: null, language: null }])).not.toBeNull();
  });
});

/**
 * The `?? []` / `?? { ... }` arms on the module-scope fallback constants. They
 * are the documented behaviour for a corrupt committed snapshot — degrade to
 * empty rather than render garbage — and are only reachable by re-importing the
 * module with a malformed JSON.
 */
describe("a malformed committed snapshot", () => {
  afterEach(() => {
    vi.doUnmock("@/lib/github-fallback.json");
    vi.doUnmock("@/lib/github-contributions-fallback.json");
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("degrades getFeaturedRepos to an empty list", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.resetModules();
    vi.doMock("@/lib/github-fallback.json", () => ({ default: [{ nope: true }] }));
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      })
    );

    const { getFeaturedRepos } = await import("@/lib/github");

    await expect(getFeaturedRepos()).resolves.toEqual([]);
  });

  it("degrades getContributions to an empty calendar", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.resetModules();
    vi.doMock("@/lib/github-contributions-fallback.json", () => ({
      default: { totalContributions: "not a number" },
    }));

    const { getContributions } = await import("@/lib/github-contributions");

    await expect(getContributions()).resolves.toEqual({ totalContributions: 0, weeks: [] });
  });
});

describe("parseCalendar", () => {
  it("rejects a non-object, a missing total, and an out-of-range level", () => {
    expect(parseCalendar(null)).toBeNull();
    expect(parseCalendar([])).toBeNull();
    expect(parseCalendar({ weeks: [] })).toBeNull();
    expect(parseCalendar({ totalContributions: 1, weeks: "no" })).toBeNull();
    expect(
      parseCalendar({
        totalContributions: 1,
        weeks: [[{ date: "2026-01-01", count: 1, level: 9 }]],
      })
    ).toBeNull();
  });

  it("accepts an empty calendar", () => {
    expect(parseCalendar({ totalContributions: 0, weeks: [] })).not.toBeNull();
  });
});
