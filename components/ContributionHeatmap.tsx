import { cn } from "@/lib/utils";
import type { ContributionCalendar, ContributionDay } from "@/lib/github-contributions";

/**
 * Per-level cell fills (0 = none … 4 = most). The ramp brightens in dark mode and
 * darkens in light mode so "more activity" reads as higher contrast against each
 * background. Empty cells (level 0) sit very close to the section background, so
 * every cell also gets an inset ring (see `cellBase`) to keep its edge visible —
 * without it, level-0 days disappear against the page in both themes.
 */
const levelClass = [
  "bg-gray-200 dark:bg-slate-700",
  "bg-green-300 dark:bg-green-900",
  "bg-green-500 dark:bg-green-700",
  "bg-green-600 dark:bg-green-500",
  "bg-green-800 dark:bg-green-400",
] as const;

/**
 * Shared cell geometry plus a subtle inset ring that outlines every swatch. The
 * ring is the key to legibility: it gives empty/pale cells a defined edge against
 * the near-white (light) and dark-slate (dark) section backgrounds.
 */
const cellBase = "h-2.5 w-2.5 rounded-[2px] ring-1 ring-inset ring-black/[0.08] dark:ring-white/10";

function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}

/** Dates (YYYY-MM-DD) for the leading pad cells of the first, partial week. */
function leadingPadDates(firstDate: string): string[] {
  const start = new Date(`${firstDate}T00:00:00Z`);
  const lead = start.getUTCDay(); // 0 = Sunday
  return Array.from({ length: lead }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() - (lead - i));
    return d.toISOString().slice(0, 10);
  });
}

export function ContributionHeatmap({ calendar }: { calendar: ContributionCalendar }) {
  const days = calendar.weeks.flat();
  if (days.length === 0) return null;

  // Pad the first (partial) week so each grid column is a Sun→Sat week with days
  // on their correct weekday row. GitHub's weeks are Sunday-aligned.
  const padDates = leadingPadDates(days[0].date);

  const totalLabel = `${formatCount(calendar.totalContributions)} contributions in the last year`;

  return (
    <div className="mt-12 border-t border-gray-200 pt-10 dark:border-slate-700">
      <p className="mb-1 text-sm font-semibold text-label">Contribution activity</p>
      <p className="mb-4 text-xs text-muted">{totalLabel}</p>

      <div className="overflow-x-auto pb-2">
        <div
          role="img"
          aria-label={`${totalLabel} on GitHub`}
          className="grid grid-flow-col grid-rows-[repeat(7,minmax(0,1fr))] gap-[3px]"
        >
          {padDates.map((key) => (
            <div key={key} className="h-2.5 w-2.5" aria-hidden="true" />
          ))}
          {days.map((day: ContributionDay) => (
            <div
              key={day.date}
              className={cn(cellBase, levelClass[day.level])}
              title={`${formatCount(day.count)} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted">
        <span>Less</span>
        {levelClass.map((cls) => (
          <span key={cls} className={cn(cellBase, cls)} aria-hidden="true" />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
