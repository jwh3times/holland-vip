"use client";

import { useTheme } from "next-themes";

import { useMounted } from "@/lib/use-mounted";

/**
 * The theme actually painted, `dark` or `light`, never `system`. The static HTML can't know
 * it, so until mount this renders an empty placeholder of the same width.
 */
export function ResolvedThemeName() {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  return <span className="inline-block min-w-[5ch]">{mounted ? resolvedTheme : null}</span>;
}
