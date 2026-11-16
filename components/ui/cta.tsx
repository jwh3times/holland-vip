import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * The site's call-to-action module.
 *
 * Interface — everything a caller needs to know:
 *
 * - `variant`: "primary" (solid --fg fill, --bg text) or "secondary" (outlined).
 *   Defaults to "primary".
 * - `size`: "md" (px-8 py-3) or "lg" (px-10 py-4). Defaults to "md".
 * - The rendered element is derived from the props, not chosen by the caller:
 *     - no `href`            -> <button> (pass `onClick`)
 *     - `href` starting "/"  -> next/link <Link> (internal route)
 *     - any other `href`     -> <a> (hash anchors, mailto:, external)
 *   External `http(s)` hrefs additionally get target="_blank" and
 *   rel="noopener noreferrer".
 * - Focus-visible rings, hover scale, and dark-mode colours are handled
 *   internally and are not configurable.
 * - `className` is merged last via `cn()`, so callers can still add layout
 *   classes without forking the variant.
 */

type CtaVariant = "primary" | "secondary";
type CtaSize = "md" | "lg";

const base =
  "inline-block rounded-xl font-semibold transition-all hover:scale-105 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-a-blue focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

const variants: Record<CtaVariant, string> = {
  primary: "bg-fg text-bg hover:shadow-2xl",
  secondary: "border-2 border-line2 text-fg hover:bg-panel2",
};

const sizes: Record<CtaSize, string> = {
  md: "px-8 py-3",
  lg: "px-10 py-4",
};

export interface CtaProps {
  children: React.ReactNode;
  variant?: CtaVariant;
  size?: CtaSize;
  href?: string;
  onClick?: () => void;
  className?: string;
  "aria-label"?: string;
}

export function Cta({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  className,
  ...rest
}: CtaProps) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (href === undefined) {
    return (
      <button type="button" onClick={onClick} className={classes} {...rest}>
        {children}
      </button>
    );
  }

  if (href.startsWith("/")) {
    return (
      <Link href={href} onClick={onClick} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const isExternal = href.startsWith("http://") || href.startsWith("https://");

  return (
    <a
      href={href}
      onClick={onClick}
      className={classes}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}
