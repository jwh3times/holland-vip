import type * as React from "react";

import { HeroTerminal } from "@/components/hero-terminal";
import { Cta } from "@/components/ui/cta";
import type { SectionId } from "@/components/ui/section";
import { hero } from "@/content/hero";
import type { ContributionCalendar } from "@/lib/github-contributions";
import { yearsOfExperience } from "@/lib/site-config";

export interface HeroSectionProps {
  /** The build-time contribution calendar, live or snapshot; the stats are counted from it. */
  contributions: ContributionCalendar;
}

const formatCount = (n: number) => n.toLocaleString("en-US");

/**
 * The two contribution stats. An empty calendar (a malformed snapshot degrades to one)
 * shows a dash rather than claiming zero activity.
 */
function contributionStats({ totalContributions, weeks }: ContributionCalendar) {
  const days = weeks.flat();
  if (days.length === 0) return { year: "—", month: "—" };
  const lastThirty = days.slice(-30).reduce((sum, day) => sum + day.count, 0);
  return { year: formatCount(totalContributions), month: formatCount(lastThirty) };
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div>
      <div className="text-[28px] font-semibold text-fg">{value}</div>
      <div className="mt-1 text-xs text-mute">{label}</div>
    </div>
  );
}

/**
 * The page's opening screen. Server-rendered, so the h1 and stats are in the static HTML;
 * only the terminal window is a client component.
 */
export function HeroSection({ contributions }: HeroSectionProps) {
  const [primary, secondary] = hero.ctas;
  const counts = contributionStats(contributions);

  return (
    <section
      id={"top" satisfies SectionId}
      className="mx-auto grid max-w-[1240px] grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] items-center gap-12 px-[clamp(16px,4vw,40px)] pt-[clamp(48px,8vw,96px)] pb-14"
    >
      <div className="min-w-0">
        <div className="mb-6 flex items-center gap-2 font-mono text-[13px] text-mute">
          <span
            aria-hidden="true"
            className="h-[7px] w-[7px] rounded-full bg-a-green animate-status-pulse motion-reduce:animate-none"
          />
          {hero.status}
        </div>
        <h1 className="mb-6 text-[clamp(48px,7vw,88px)] leading-[0.95] font-bold tracking-[-0.04em] text-balance text-fg">
          {hero.name}
          <span aria-hidden="true" className="text-a-green">
            _
          </span>
        </h1>
        <p className="mb-8 max-w-[540px] text-[clamp(18px,1.6vw,21px)] leading-normal text-pretty text-mute">
          {hero.lead}
        </p>
        <div className="flex flex-wrap gap-3">
          <Cta href={primary.href}>{primary.label}</Cta>
          <Cta href={secondary.href} variant="secondary">
            {secondary.label}
          </Cta>
        </div>
        <div className="mt-12 grid grid-cols-[repeat(3,auto)] justify-start gap-8 font-mono">
          <Stat
            value={
              <>
                {yearsOfExperience}
                <span className="text-base text-dim">y</span>
              </>
            }
            label={hero.stats.years}
          />
          <Stat value={counts.year} label={hero.stats.contributionsYear} />
          <Stat value={counts.month} label={hero.stats.contributionsMonth} />
        </div>
      </div>
      <p className="sr-only">{hero.terminal.summary}</p>
      <HeroTerminal title={hero.terminal.title} script={hero.terminal.script} />
    </section>
  );
}
