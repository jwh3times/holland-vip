"use client";

import * as React from "react";

import { Panel } from "@/components/ui/panel";
import { career } from "@/content/career";
import type { Experience } from "@/content/experience";
import { accent } from "@/lib/accent";
import type { RoleTimeline, TimelineTick } from "@/lib/role-dates";
import { cn } from "@/lib/utils";

/** A role as the timeline and log show it, its dates already derived at build time. */
export interface CareerRole
  extends Pick<Experience, "company" | "title" | "accent" | "hash" | "highlights">, RoleTimeline {
  /** The role with no end date: open by default, and marked `(HEAD → main)`. */
  current: boolean;
}

export interface CareerLogProps {
  roles: CareerRole[];
  ticks: TimelineTick[];
  /** The log's last line, the Education root. */
  root: string;
  /** What sits beside the log in the two-column grid below the timeline. */
  aside: React.ReactNode;
}

const columns = "grid-cols-[minmax(120px,190px)_minmax(0,1fr)]";
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-a-blue";

/**
 * The career timeline and `git log`, which share one open role: a timeline row opens its role
 * in the log, a log row toggles its own, only one is open at a time, and none is a valid state.
 * The current role starts open. The dates arrive pre-derived, so the client never recomputes
 * them against the visitor's clock.
 */
export function CareerLog({ roles, ticks, root, aside }: CareerLogProps) {
  const initial = roles.findIndex((role) => role.current);
  const [open, setOpen] = React.useState<number | null>(initial === -1 ? null : initial);
  const id = React.useId();
  const highlightsIdOf = (index: number) => `${id}-role-${index}`;

  return (
    <>
      <Panel title={career.timeline.command} meta={career.timeline.hint} className="mb-5">
        <div className="pt-2.5 pb-3.5">
          <ul aria-label={career.timeline.label}>
            {roles.map((role, index) => {
              const selected = open === index;
              const tokens = accent[role.accent];
              return (
                <li key={role.company}>
                  <button
                    type="button"
                    // It opens its role in the log, so it reports that role's state there.
                    aria-expanded={selected}
                    aria-controls={highlightsIdOf(index)}
                    onClick={() => setOpen(index)}
                    className={cn(
                      "grid h-[46px] w-full cursor-pointer items-center px-[22px] text-left transition-colors hover:bg-panel2",
                      columns,
                      focusRing,
                      selected && "bg-panel2"
                    )}
                  >
                    <span className="flex min-w-0 items-baseline gap-2 pr-3.5">
                      <span
                        className={cn(
                          "truncate text-sm font-semibold",
                          selected ? tokens.text : "text-fg"
                        )}
                      >
                        {role.company}
                      </span>
                      <span className="font-mono text-[11px] whitespace-nowrap text-dim">
                        {role.duration}
                      </span>
                    </span>
                    <span aria-hidden="true" className="relative h-full">
                      {ticks.map((tick) => (
                        <span
                          key={tick.year}
                          className="absolute inset-y-0 border-l border-dashed border-line"
                          style={{ left: `${tick.left}%` }}
                        />
                      ))}
                      <span
                        className={cn(
                          "absolute top-[13px] h-5 min-w-1.5 rounded-[5px] border transition-[background-color,box-shadow] duration-200",
                          tokens.outline,
                          selected ? cn(tokens.dot, tokens.shadow) : tokens.bar
                        )}
                        style={{ left: `${role.left}%`, width: `calc(${role.width}% - 2px)` }}
                      />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div aria-hidden="true" className={cn("grid px-[22px] pt-1", columns)}>
            <span />
            <span className="relative h-4">
              {/* Every other label below `sm`: a phone's track is too narrow for all of them. */}
              {ticks.map((tick, index) => (
                <span
                  key={tick.year}
                  className={cn(
                    "absolute -translate-x-1/2 font-mono text-[11px] text-dim",
                    index % 2 === 1 && "max-sm:hidden"
                  )}
                  style={{ left: `${tick.left}%` }}
                >
                  {tick.year}
                </span>
              ))}
            </span>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,480px),1fr))] items-start gap-5">
        <Panel title={career.log.command}>
          <ol aria-label={career.log.label} className="py-2">
            {roles.map((role, index) => {
              const expanded = open === index;
              const tokens = accent[role.accent];
              const highlightsId = highlightsIdOf(index);
              return (
                <li
                  key={role.company}
                  className={cn(
                    "grid grid-cols-[28px_1fr] gap-x-2.5 py-3 pr-4 pl-3.5 transition-colors hover:bg-panel2",
                    expanded && "bg-panel2"
                  )}
                >
                  <span aria-hidden="true" className="relative flex justify-center">
                    <span className="absolute top-0 -bottom-6 w-0.5 bg-line2" />
                    <span
                      className={cn(
                        "relative mt-1.5 h-3 w-3 rounded-full border-2",
                        tokens.outline,
                        expanded ? tokens.dot : "bg-panel"
                      )}
                    />
                  </span>
                  <div className="min-w-0">
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={highlightsId}
                      onClick={() => setOpen(expanded ? null : index)}
                      className={cn("block w-full cursor-pointer rounded-md text-left", focusRing)}
                    >
                      <span className="flex flex-wrap gap-2.5 font-mono text-xs text-dim">
                        <span className={tokens.text}>{role.hash}</span>
                        <span>{role.period}</span>
                        {role.current && (
                          <span className={accent.green.text}>{career.log.head}</span>
                        )}
                      </span>
                      <span className="mt-1 block text-[17px] font-semibold text-fg">
                        {role.title} <span className="font-normal text-mute">@ {role.company}</span>
                      </span>
                    </button>
                    <ul
                      id={highlightsId}
                      hidden={!expanded}
                      className="mt-2.5 mb-0.5 flex flex-col gap-2 text-sm leading-[1.55] text-mute"
                    >
                      {role.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="grid grid-cols-[16px_1fr] animate-rise motion-reduce:animate-none"
                        >
                          <span aria-hidden="true" className={cn("font-mono", tokens.bullet)}>
                            +
                          </span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="pt-2.5 pr-4 pb-1.5 pl-[52px] font-mono text-xs text-dim">{root}</p>
        </Panel>
        <div className="flex flex-col gap-5">{aside}</div>
      </div>
    </>
  );
}
