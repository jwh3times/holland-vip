import * as React from "react";

import { accent, type Accent } from "@/lib/accent";
import { cn } from "@/lib/utils";

/**
 * The site's card shell.
 *
 * Replaces five near-copies of `rounded-2xl p-{6|8} card-bg-white border
 * border-gray-200 dark:border-slate-700 shadow-lg …` that had drifted on padding
 * and on `transition-all` vs `transition-colors`.
 *
 * Interface:
 * - `accent` — when set, the card takes that accent's tinted background and
 *   border instead of the neutral surface.
 * - `padding` — `"md"` (p-6, default) or `"lg"` (p-8).
 * - `interactive` — adds the hover lift. Off by default; a card that isn't a
 *   link or button shouldn't imply it is.
 * - `className` merges last, for layout and one-off needs.
 */
export interface CardProps {
  children: React.ReactNode;
  accent?: Accent;
  padding?: "md" | "lg";
  interactive?: boolean;
  className?: string;
}

export function Card({
  children,
  accent: key,
  padding = "md",
  interactive = false,
  className,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl transition-all duration-300",
        padding === "lg" ? "p-8" : "p-6",
        key
          ? cn("border", accent[key].border, accent[key].cardBg)
          : "card-bg-white border border-gray-200 dark:border-slate-700 shadow-lg",
        interactive && "hover:shadow-2xl",
        className
      )}
    >
      {children}
    </div>
  );
}
