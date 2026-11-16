"use client";

import * as React from "react";

import { hobbyProjectsCopy, type HobbyProject } from "@/content/hobby-projects";
import { accent } from "@/lib/accent";
import { cn } from "@/lib/utils";

/** How long each sample-output line waits before it rises in during a replay. */
export const REPLAY_STEP_MS = 380;

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export interface HobbyProjectCardProps {
  project: HobbyProject;
  /** The repository line, e.g. `★ 3 · pushed 2026-11-16`. Absent when GitHub supplied no data. */
  meta?: string;
}

/**
 * A Hobby Project card. Hovering it, or focusing anything inside it, makes it active: the border
 * and shadow take its accent, it lifts, and its mini terminal replays — the sample-output lines
 * hide, then rise in one every {@link REPLAY_STEP_MS}. An idle card shows every line at 72%.
 * Under reduced motion there is no replay and no lift; the lines are all shown at once.
 */
export function HobbyProjectCard({ project, meta }: HobbyProjectCardProps) {
  const total = project.log.length;
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [shown, setShown] = React.useState(total);
  const active = hovered || focused;
  const headingId = `hobby-project-${project.slug}`;
  const tokens = accent[project.accent];

  // Only the move from idle to active starts a replay; moving focus within the card does not.
  const activate = () => {
    if (!active) setShown(prefersReducedMotion() ? total : 0);
  };

  // One steady tick for the whole replay, cleared once every line is in or the card goes idle.
  const replaying = active && shown < total;
  React.useEffect(() => {
    if (!replaying) return;
    const timer = window.setInterval(
      () => setShown((count) => Math.min(count + 1, total)),
      REPLAY_STEP_MS
    );
    return () => window.clearInterval(timer);
  }, [replaying, total]);

  return (
    <article
      aria-labelledby={headingId}
      onMouseEnter={() => {
        activate();
        setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => {
        activate();
        setFocused(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      data-active={active || undefined}
      className={cn(
        "flex flex-col overflow-hidden rounded-[14px] border bg-panel transition-[border-color,box-shadow,transform] duration-[250ms]",
        active
          ? cn(tokens.glow, tokens.activeShadow, "motion-safe:-translate-y-[3px]")
          : "border-line"
      )}
    >
      {/* Placeholder until the screenshots arrive: the accent-tinted panel and the name in mono. */}
      <div className="relative aspect-[16/8] border-b border-line bg-panel2">
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 flex items-center justify-center font-mono text-sm text-mute",
            tokens.cardBg
          )}
        >
          {project.name}
        </div>
        <span
          className={cn(
            "absolute top-3 left-3 rounded-md border border-line bg-[color-mix(in_oklch,var(--bg)_80%,transparent)] px-2 py-1 font-mono text-[11px]",
            tokens.text
          )}
        >
          ● {project.status}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 px-[22px] pt-[22px]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 id={headingId} className="text-2xl font-bold tracking-[-0.02em] text-fg">
            {project.name}
          </h3>
          <span className="font-mono text-xs whitespace-nowrap text-mute">{project.kind}</span>
        </div>
        <p className="text-[15px] leading-[1.55] text-mute">{project.oneLiner}</p>
      </div>

      <div
        data-testid="sample-output"
        className="mx-[22px] mt-[18px] min-h-[142px] rounded-lg border border-line bg-bg px-3.5 py-3 font-mono text-xs leading-[1.7]"
      >
        <div className="flex flex-wrap justify-between gap-x-3">
          <span className={tokens.text}>$ {project.cmd}</span>
          <span className="text-[11px] text-dim">{hobbyProjectsCopy.sample}</span>
        </div>
        {project.log.map((line, index) => {
          // Hidden lines keep their space and stay in the accessibility tree; only their ink fades.
          const state = !active ? "idle" : index < shown ? "shown" : "hidden";
          return (
            <div
              // Sample lines are fixed copy, so a line's position is a stable key.
              // oxlint-disable-next-line react/no-array-index-key
              key={index}
              data-line={state}
              className={cn(
                "overflow-hidden text-ellipsis whitespace-pre text-fg",
                state === "idle" && "opacity-[0.72]",
                state === "shown" && "animate-rise motion-reduce:animate-none",
                state === "hidden" && "opacity-0"
              )}
            >
              {line}
            </div>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-3 px-[22px] pt-4 pb-[22px]">
        <ul aria-label="Stack" className="flex flex-wrap gap-1.5">
          {project.stack.map((item) => (
            <li
              key={item}
              className="rounded-[5px] border border-line px-2 py-1 font-mono text-[11px] text-mute"
            >
              {item}
            </li>
          ))}
        </ul>
        {/* The repository line sits left of "open ↗"; without repository data it is simply absent. */}
        <div className="flex items-baseline justify-end gap-3 font-mono text-xs">
          {meta ? <span className="mr-auto text-dim">{meta}</span> : null}
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            // Four "open ↗" links need telling apart; the name keeps the visible word first.
            aria-label={`${hobbyProjectsCopy.open} ${project.name}`}
            className={cn("shrink-0 py-1 whitespace-nowrap hover:underline", tokens.text)}
          >
            {hobbyProjectsCopy.open} ↗
          </a>
        </div>
      </div>
    </article>
  );
}
