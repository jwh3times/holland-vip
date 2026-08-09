import * as React from "react";

import { accent, type Accent } from "@/lib/accent";
import { cn } from "@/lib/utils";

/**
 * The site's pill badge.
 *
 * Replaces five hand-written copies of the same class string, which had drifted
 * into two different token orderings and one variant baked into content data.
 *
 * `accent` picks the background and text pair from the accent table; everything
 * else is fixed. Pass `className` for layout only.
 */
export interface BadgeProps {
  children: React.ReactNode;
  accent?: Accent;
  className?: string;
}

export function Badge({ children, accent: key = "blue", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        accent[key].badge,
        className
      )}
    >
      {children}
    </span>
  );
}
