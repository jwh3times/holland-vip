import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * The site's call-to-action module.
 *
 * Interface — everything a caller needs to know:
 *
 * - `variant`: "primary" (solid --fg fill, --bg text) or "secondary" (outlined in
 *   --line2). Defaults to "primary".
 * - `size`: "md" (the hero's buttons) or "sm" (Contact's social links). Defaults to "md".
 * - The rendered element is derived from the props, not chosen by the caller:
 *     - no `href`            -> <button> (pass `onClick`)
 *     - `href` starting "/"  -> next/link <Link> (internal route)
 *     - any other `href`     -> <a> (hash anchors, mailto:, external)
 *   External `http(s)` hrefs additionally get target="_blank" and
 *   rel="noopener noreferrer".
 * - The Terminal look — mono text, 8px radius, flat (no hover scale or shadow) —
 *   focus-visible rings and theme colours are handled internally and are not
 *   configurable.
 * - `className` is merged last via `cn()`, so callers can still add layout
 *   classes without forking the variant.
 */

type CtaVariant = "primary" | "secondary";
type CtaSize = "sm" | "md";

const base =
  "inline-block rounded-lg font-mono font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-a-blue";

const variants: Record<CtaVariant, string> = {
  primary: "bg-fg text-bg hover:opacity-85",
  secondary: "border border-line2 text-fg hover:bg-panel2",
};

const sizes: Record<CtaSize, string> = {
  sm: "px-3.5 py-2 text-[13px]",
  md: "px-[18px] py-3 text-sm",
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
