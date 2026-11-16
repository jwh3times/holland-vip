"use client";

import * as React from "react";

import type { TerminalLine, TerminalLineKind } from "@/content/hero";
import { cn } from "@/lib/utils";

/** Characters revealed per tick, and the tick length: the handoff's typing speed. */
const CHARS_PER_TICK = 2;
const TICK_MS = 28;

const lineColor: Record<TerminalLineKind, string> = {
  command: "text-fg",
  output: "text-mute",
  highlight: "text-a-green",
};

type Motion = "unknown" | "animate" | "reduce";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

// The server can't know the visitor's preference, so it renders "unknown": no typed text,
// matched on hydration, then the client snapshot decides between typing and the full script.
const getMotion = (): Motion =>
  window.matchMedia(reducedMotionQuery).matches ? "reduce" : "animate";
const getServerMotion = (): Motion => "unknown";

function subscribeClock(onTick: () => void) {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
}

const pad = (n: number) => String(n).padStart(2, "0");
const getClock = () => {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};
// Empty on the server and during hydration, so the visitor's time never mismatches.
const getServerClock = () => "";

/** The first `count` characters of the script, line by line; lines not yet reached are left out. */
function typedLines(script: readonly TerminalLine[], count: number): TerminalLine[] {
  const lines: TerminalLine[] = [];
  let left = count;
  for (const line of script) {
    if (left <= 0) break;
    lines.push({ ...line, text: line.text.slice(0, left) });
    left -= line.text.length;
  }
  return lines;
}

function Cursor({ blink }: { blink: boolean }) {
  return (
    <span
      className={cn(
        "ml-px inline-block h-[18px] w-[9px] align-[-3px] bg-a-green",
        blink && "animate-blink"
      )}
    />
  );
}

function Lines({ lines, cursor }: { lines: readonly TerminalLine[]; cursor?: React.ReactNode }) {
  return lines.map((line, index) => (
    // oxlint-disable-next-line react/no-array-index-key -- a script line is its position: lines never reorder.
    <div key={index} className={cn("whitespace-pre-wrap", lineColor[line.kind])}>
      {line.text}
      {index === lines.length - 1 && cursor}
    </div>
  ));
}

export interface HeroTerminalProps {
  title: string;
  script: readonly TerminalLine[];
}

/**
 * The hero's terminal window: it types `script` out with a blinking block cursor beside a
 * live 24-hour clock. Decorative and `aria-hidden` — the hero carries a static summary for
 * assistive technology. Under reduced motion it renders fully typed, with no blink.
 */
export function HeroTerminal({ title, script }: HeroTerminalProps) {
  const total = React.useMemo(() => script.reduce((n, line) => n + line.text.length, 0), [script]);
  const motion = React.useSyncExternalStore(subscribeMotion, getMotion, getServerMotion);
  const clock = React.useSyncExternalStore(subscribeClock, getClock, getServerClock);
  const [typed, setTyped] = React.useState(0);

  const done = typed >= total;

  React.useEffect(() => {
    if (motion !== "animate" || done) return;
    const id = setInterval(() => setTyped((n) => Math.min(n + CHARS_PER_TICK, total)), TICK_MS);
    return () => clearInterval(id);
  }, [motion, done, total]);

  const shown = motion === "reduce" ? total : motion === "animate" ? typed : 0;
  const cursor = <Cursor blink={motion === "animate"} />;
  const lines = typedLines(script, shown);

  return (
    <div
      data-testid="hero-terminal"
      aria-hidden="true"
      className="min-w-0 overflow-hidden rounded-xl border border-line2 bg-panel shadow-terminal"
    >
      <div className="flex items-center gap-2 border-b border-line px-3.5 py-3 font-mono text-xs text-dim">
        <span className="h-[11px] w-[11px] rounded-full bg-line2" />
        <span className="h-[11px] w-[11px] rounded-full bg-line2" />
        <span className="h-[11px] w-[11px] rounded-full bg-line2" />
        <span className="ml-2">{title}</span>
        <span data-testid="terminal-clock" className="ml-auto tabular-nums">
          {clock}
        </span>
      </div>
      {/* Both layers share one grid cell. The invisible full script holds the finished
          height at every width, on top of the 340px floor, so typing never shifts the page. */}
      <div className="grid min-h-[340px] px-[22px] pt-5 pb-[26px] font-mono text-sm leading-[1.75]">
        <div className="invisible [grid-area:1/1]">
          <Lines lines={script} cursor={<Cursor blink={false} />} />
        </div>
        <div data-testid="terminal-output" className="[grid-area:1/1]">
          {lines.length > 0 ? (
            <Lines lines={lines} cursor={cursor} />
          ) : (
            motion !== "unknown" && cursor
          )}
        </div>
      </div>
    </div>
  );
}
