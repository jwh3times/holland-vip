import { career } from "@/content/career";
import type { ContributionCalendar } from "@/lib/github-contributions";

const formatCount = (n: number) => n.toLocaleString("en-US");

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

/**
 * The 12-month Contribution Activity heatmap: one column per week, one row per weekday. It keeps
 * its 640px minimum width and scrolls sideways on a narrow screen rather than shrinking. An empty
 * calendar renders nothing.
 */
export function ContributionHeatmap({ calendar }: { calendar: ContributionCalendar }) {
  const days = calendar.weeks.flat();
  if (days.length === 0) return null;

  // Pad the first (partial) week so each grid column is a Sun→Sat week with days
  // on their correct weekday row. GitHub's weeks are Sunday-aligned.
  const padDates = leadingPadDates(days[0].date);
  const total = formatCount(calendar.totalContributions);

  return (
    <div className="rounded-xl border border-line bg-panel px-[22px] py-5">
      <div className="mb-3.5 flex flex-wrap justify-between gap-2 font-mono text-xs text-dim">
        <span>{career.contributions.command}</span>
        <span className="text-fg">{career.contributions.total(total)}</span>
      </div>
      {/* Scrolls sideways on a narrow screen, so a keyboard user must be able to focus it. */}
      <div
        role="region"
        aria-label={career.contributions.region}
        tabIndex={0}
        className="overflow-x-auto rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-a-blue"
      >
        <div
          role="img"
          aria-label={career.contributions.summary(total)}
          className="heatmap grid min-w-[640px] auto-cols-[minmax(9px,1fr)] grid-flow-col grid-rows-[repeat(7,1fr)] gap-[3px]"
        >
          {/* Each cell carries only its level: `.heatmap` in app/globals.css shapes and fills
              it, so ~370 cells don't each repeat a class string in the HTML and RSC payload. */}
          {padDates.map((date) => (
            <div key={date} data-testid="heat-pad" />
          ))}
          {days.map((day) => (
            <div
              key={day.date}
              data-level={day.level}
              title={`${formatCount(day.count)} on ${day.date}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
