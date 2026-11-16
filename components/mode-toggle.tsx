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

/** How the pill shows each choice. The glyphs are part of the text label, not icons. */
const LABELS: Record<Choice, { glyph: string; name: string }> = {
  system: { glyph: "◒", name: "auto" },
  dark: { glyph: "◐", name: "dark" },
  light: { glyph: "◑", name: "light" },
};

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
  // "auto (dark)": in auto, say which scheme the OS resolved to, once it is known.
  const currentState =
    current === "system" && resolvedTheme ? `auto (${resolvedTheme})` : LABELS[current].name;

  return (
    <button
      type="button"
      className={cn(
        toggleBase,
        "cursor-pointer transition-colors hover:border-line2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-a-blue"
      )}
      onClick={() => setTheme(next)}
      aria-label={`Theme: ${currentState}. Switch to ${LABELS[next].name}.`}
    >
      <span aria-hidden="true">{LABELS[current].glyph}</span>&nbsp;{LABELS[current].name}
    </button>
  );
}
