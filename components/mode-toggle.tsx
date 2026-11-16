"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

// Hydration-safe mount detection without setState-in-effect: returns the
// server snapshot (false) during SSR + initial hydration, then true on the client.
const emptySubscribe = () => () => {};

/** The stored theme choices, in the order the pill cycles through them. */
const CHOICES = ["system", "dark", "light"] as const;
type Choice = (typeof CHOICES)[number];

const NAMES: Record<Choice, string> = { system: "auto", dark: "dark", light: "light" };
const GLYPHS: Record<Choice, string> = { system: "◒", dark: "◐", light: "◑" };

// Shared by the placeholder and the mounted pill so both render at the same fixed
// width: the label appearing on mount must not shift the header's nav row.
const toggleBase =
  "inline-flex h-7 w-[88px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-line bg-panel2 font-mono text-xs text-fg";

export function ModeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return <button type="button" className={toggleBase} disabled tabIndex={-1} aria-hidden />;
  }

  const current: Choice = CHOICES.find((choice) => choice === theme) ?? "system";
  const next = CHOICES[(CHOICES.indexOf(current) + 1) % CHOICES.length];
  const state = current === "system" ? `auto (${resolvedTheme})` : NAMES[current];

  return (
    <button
      type="button"
      className={cn(
        toggleBase,
        "cursor-pointer transition-colors hover:border-line2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-a-blue"
      )}
      onClick={() => setTheme(next)}
      aria-label={`Theme: ${state}. Switch to ${NAMES[next]}.`}
    >
      <span aria-hidden="true">{GLYPHS[current]}</span>&nbsp;{NAMES[current]}
    </button>
  );
}
