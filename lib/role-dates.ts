import { CAREER_START_YEAR } from "./site-config";

/** A calendar month: `month` runs 1 (January) to 12 (December). */
export interface YearMonth {
  year: number;
  month: number;
}

/** A role's dates as content stores them. `end` is `null` for the current role. */
export interface RoleDates {
  start: YearMonth;
  end: YearMonth | null;
}

/** Everything the career timeline and `git log` show about a role's dates. */
export interface RoleTimeline {
  /** "Nov 2025 - Present", "Aug 2017 - Apr 2024". */
  period: string;
  /** "7y", or "5mo" under a year. */
  duration: string;
  /** The bar's start on the timeline axis, as a percentage of its width. */
  left: number;
  /** The bar's length, as a percentage of the axis width. */
  width: number;
}

/** A year label on the timeline axis, at a percentage of its width. */
export interface TimelineTick {
  year: number;
  left: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The axis runs a little past the build date, so the current role's bar never touches the edge. */
const AXIS_OVERHANG_YEARS = 0.1;

const label = ({ year, month }: YearMonth) => `${MONTHS[month - 1]} ${year}`;
const monthIndex = ({ year, month }: YearMonth) => year * 12 + (month - 1);
const decimalYear = (date: YearMonth) => monthIndex(date) / 12;

function axis(now: YearMonth) {
  const end = decimalYear(now) + AXIS_OVERHANG_YEARS;
  const span = end - CAREER_START_YEAR;
  return { end, at: (year: number) => ((year - CAREER_START_YEAR) / span) * 100 };
}

/** The calendar month a date falls in, read in UTC so a build's timezone can't move it. */
export function yearMonthOf(date: Date): YearMonth {
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

/**
 * Derives a role's period label, duration and timeline bar from its stored dates and the build
 * date, so none of them can disagree. The current role runs to `now`.
 */
export function describeRole({ start, end }: RoleDates, now: YearMonth): RoleTimeline {
  const finish = end ?? now;
  const months = monthIndex(finish) - monthIndex(start);
  const { at } = axis(now);
  const left = at(decimalYear(start));

  return {
    period: `${label(start)} - ${end ? label(end) : "Present"}`,
    duration: months >= 12 ? `${Math.round(months / 12)}y` : `${Math.max(1, months)}mo`,
    left,
    width: at(decimalYear(finish)) - left,
  };
}

/** The odd years from the career start that fall on the timeline axis, for gridlines and labels. */
export function timelineTicks(now: YearMonth): TimelineTick[] {
  const { end, at } = axis(now);
  const ticks: TimelineTick[] = [];
  for (let year = CAREER_START_YEAR; year < end; year++) {
    if (year % 2 === 1) ticks.push({ year, left: at(year) });
  }
  return ticks;
}
