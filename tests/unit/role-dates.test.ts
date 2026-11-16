// @vitest-environment node
import { describe, it, expect } from "vitest";

import { describeRole, timelineTicks, yearMonthOf } from "@/lib/role-dates";

const NOV_2026 = { year: 2026, month: 11 };

describe("describeRole", () => {
  it("labels a finished role's period with both ends", () => {
    const role = { start: { year: 2017, month: 8 }, end: { year: 2024, month: 4 } };
    expect(describeRole(role, NOV_2026).period).toBe("Aug 2017 - Apr 2024");
  });

  it("labels the current role as running to the present", () => {
    const role = { start: { year: 2025, month: 11 }, end: null };
    expect(describeRole(role, NOV_2026).period).toBe("Nov 2025 - Present");
  });

  it("gives a role under a year its length in months", () => {
    const role = { start: { year: 2024, month: 3 }, end: { year: 2024, month: 8 } };
    expect(describeRole(role, NOV_2026).duration).toBe("5mo");
  });

  it("never calls a role shorter than a month", () => {
    const role = { start: { year: 2026, month: 11 }, end: null };
    expect(describeRole(role, NOV_2026).duration).toBe("1mo");
  });

  it("rounds a role of a year or more to whole years", () => {
    // Aug 2017 → Apr 2024 is 80 months: 6.7 years.
    const sas = { start: { year: 2017, month: 8 }, end: { year: 2024, month: 4 } };
    expect(describeRole(sas, NOV_2026).duration).toBe("7y");
    // Jun 2024 → Nov 2025 is 17 months: 1.4 years.
    const prometheus = { start: { year: 2024, month: 6 }, end: { year: 2025, month: 11 } };
    expect(describeRole(prometheus, NOV_2026).duration).toBe("1y");
  });

  it("counts across a year boundary by month, not by calendar year", () => {
    // Dec 2024 → Jan 2025 spans two calendar years but is one month.
    const role = { start: { year: 2024, month: 12 }, end: { year: 2025, month: 1 } };
    expect(describeRole(role, NOV_2026).duration).toBe("1mo");
  });

  it("ends the current role at the build date", () => {
    const role = { start: { year: 2025, month: 11 }, end: null };
    expect(describeRole(role, NOV_2026).duration).toBe("1y");
    expect(describeRole(role, { year: 2026, month: 4 }).duration).toBe("5mo");
  });

  it("places bars on an axis from Jan 2013 to the build date plus 0.1 year", () => {
    // Axis: 2013.0 → 2026 + 10/12 + 0.1, a span of 13.9333… years.
    const span = 2026 + 10 / 12 + 0.1 - 2013;
    const first = { start: { year: 2013, month: 1 }, end: { year: 2014, month: 1 } };
    expect(describeRole(first, NOV_2026).left).toBe(0);
    expect(describeRole(first, NOV_2026).width).toBeCloseTo((1 / span) * 100, 6);

    const current = { start: { year: 2025, month: 11 }, end: null };
    const bar = describeRole(current, NOV_2026);
    expect(bar.left).toBeCloseTo(((2025 + 10 / 12 - 2013) / span) * 100, 6);
    // The current bar stops at the build date, short of the axis end.
    expect(bar.left + bar.width).toBeCloseTo(((2026 + 10 / 12 - 2013) / span) * 100, 6);
    expect(bar.left + bar.width).toBeLessThan(100);
  });
});

describe("timelineTicks", () => {
  it("marks every odd year from 2013 that falls on the axis", () => {
    expect(timelineTicks(NOV_2026).map((tick) => tick.year)).toEqual([
      2013, 2015, 2017, 2019, 2021, 2023, 2025,
    ]);
  });

  it("includes the build year once it is odd and on the axis", () => {
    expect(timelineTicks({ year: 2027, month: 1 }).at(-1)?.year).toBe(2027);
  });

  it("positions each tick on the same axis as the bars", () => {
    const span = 2026 + 10 / 12 + 0.1 - 2013;
    const ticks = timelineTicks(NOV_2026);
    expect(ticks[0].left).toBe(0);
    expect(ticks[1].left).toBeCloseTo((2 / span) * 100, 6);
  });
});

describe("yearMonthOf", () => {
  it("reads the calendar month in UTC", () => {
    expect(yearMonthOf(new Date("2026-11-16T12:00:00Z"))).toEqual({ year: 2026, month: 11 });
    expect(yearMonthOf(new Date("2027-01-01T00:30:00Z"))).toEqual({ year: 2027, month: 1 });
  });
});
