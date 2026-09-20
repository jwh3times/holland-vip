// @vitest-environment node
/* oxlint-disable typescript/require-await -- async test doubles intentionally resolve synchronously */
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

    const { getFeaturedRepos, getFeaturedReposWithSource } = await import("@/lib/github");

    await expect(getFeaturedRepos()).resolves.toEqual([]);
    await expect(getFeaturedReposWithSource()).resolves.toEqual({ data: [], source: "fallback" });
  });

  it("degrades getContributions to an empty calendar", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.resetModules();
    vi.doMock("@/lib/github-contributions-fallback.json", () => ({
      default: { totalContributions: "not a number" },
    }));

    const { getContributions, getContributionsWithSource } =
      await import("@/lib/github-contributions");

    await expect(getContributions()).resolves.toEqual({ totalContributions: 0, weeks: [] });
    await expect(getContributionsWithSource()).resolves.toEqual({
      data: { totalContributions: 0, weeks: [] },
      source: "fallback",
    });
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

  /**
   * A bare `typeof x === "number"` admits values that cannot be a contribution
   * count but still reach the heatmap's sizing and colour maths.
   */
  describe("numeric bounds", () => {
    const withCount = (count: unknown) => ({
      totalContributions: 1,
      weeks: [[{ date: "2026-01-01", count, level: 1 }]],
    });

    it.each([
      ["negative", -1],
      ["fractional", 1.5],
      ["NaN", Number.NaN],
      ["Infinity", Number.POSITIVE_INFINITY],
      ["absurdly large", 1_000_001],
    ])("rejects a %s day count", (_label, count) => {
      expect(parseCalendar(withCount(count))).toBeNull();
    });

    it.each([
      ["negative", -1],
      ["fractional", 0.5],
      ["NaN", Number.NaN],
      ["Infinity", Number.POSITIVE_INFINITY],
    ])("rejects a %s total", (_label, total) => {
      expect(parseCalendar({ totalContributions: total, weeks: [] })).toBeNull();
    });

    it("still accepts a large but plausible real total", () => {
      expect(parseCalendar({ totalContributions: 50_000, weeks: [] })).not.toBeNull();
    });
  });

  describe("date validation", () => {
    const withDate = (date: unknown) => ({
      totalContributions: 1,
      weeks: [[{ date, count: 1, level: 1 }]],
    });

    it.each([
      ["a non-date string", "not a date"],
      ["a US-ordered date", "01/02/2026"],
      ["a missing zero pad", "2026-1-1"],
      ["a timestamp suffix", "2026-01-01T00:00:00Z"],
      ["a non-string", 20260101],
    ])("rejects %s", (_label, date) => {
      expect(parseCalendar(withDate(date))).toBeNull();
    });

    it("rejects a well-shaped but impossible day", () => {
      // A regex alone accepts this, and `Date` rolls it into March.
      expect(parseCalendar(withDate("2026-02-31"))).toBeNull();
    });

    it("accepts a real leap day", () => {
      expect(parseCalendar(withDate("2024-02-29"))).not.toBeNull();
    });
  });
});
