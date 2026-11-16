import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The page-section shell. Every body section on the page renders through it.
 *
 * It owns three things that were previously copied into each section module and
 * enforced by nothing:
 *
 * 1. **The shell** — vertical rhythm, the centered container, and the heading
 *    row: the `h2`, and an optional accessory aligned to its right.
 * 2. **The anchor id**, typed against {@link SECTION_IDS} so a section cannot
 *    declare an id that `Navigation` doesn't know about.
 * 3. **The section number**, rendered in mono before the title. A section never
 *    picks its own — `app/page.tsx` owns the order and derives it via
 *    {@link numberAt}, so reordering sections cannot leave numbers out of step.
 */

/**
 * Sections reachable from the nav. `Navigation` maps over this, so every entry
 * must have a label and every nav link provably points at a real section.
 */
export const NAV_SECTION_IDS = ["about", "projects", "career", "work", "contact"] as const;

export type NavSectionId = (typeof NAV_SECTION_IDS)[number];

/**
 * Every anchorable section id. A superset of {@link NAV_SECTION_IDS}: `top` (the
 * hero, which the header's prompt links to) is deep-linkable but deliberately
 * not a nav entry. Adding an id here without adding it to `NAV_SECTION_IDS` is
 * a choice, not an accident — before this module existed, `#education` was an
 * orphan nothing linked to and nothing caught.
 */
export const SECTION_IDS = [...NAV_SECTION_IDS, "top"] as const;

export type SectionId = (typeof SECTION_IDS)[number];

/**
 * The ordinal for the numbered section at `index` in the page's ordered list:
 * `"01"`, `"02"`, … Sections receive it from `app/page.tsx`; none chooses its own.
 */
export function numberAt(index: number): string {
  return String(index + 1).padStart(2, "0");
}

/**
 * Props every numbered page section accepts, so `app/page.tsx` can number it by
 * position. Sections forward this straight to {@link Section} — they never choose it.
 */
export interface NumberedSectionProps {
  number: string;
}

export interface SectionProps {
  /** Heading text, rendered as the section's `h2`. */
  title: string;
  children: React.ReactNode;
  /** Anchor id. Omit for sections that aren't linkable. */
  id?: SectionId;
  /** Set by `app/page.tsx` from the section's position. Omit for unnumbered sections. */
  number?: string;
  /** Right-aligned beside the heading: a hint or a pill, never part of the `h2`. */
  accessory?: React.ReactNode;
  /** Optional lead paragraph between the heading and the content. */
  subtitle?: React.ReactNode;
  /** `wide` for content sections; `narrow` (max-w-3xl, centered) for prose. */
  width?: "wide" | "narrow";
}

export function Section({
  title,
  children,
  id,
  number,
  accessory,
  subtitle,
  width = "wide",
}: SectionProps) {
  return (
    // `content-visibility: auto` lets the browser skip layout and paint for a section until it
    // nears the viewport, which keeps first-load main-thread work inside the Lighthouse TBT
    // budget. The content stays in the accessibility tree and find-in-page; the 900px estimate
    // holds the scrollbar steady until a section has been rendered once.
    <section
      {...(id ? { id } : {})}
      className="py-14 [contain-intrinsic-size:auto_900px] [content-visibility:auto]"
    >
      <div
        className={cn(
          "mx-auto px-[clamp(16px,4vw,40px)]",
          width === "wide" ? "max-w-[1240px]" : "max-w-3xl text-center"
        )}
      >
        <div
          className={cn(
            "mb-7 flex flex-wrap items-baseline gap-4 border-b border-line pb-4",
            width === "wide" ? "justify-between" : "justify-center"
          )}
        >
          <h2 className="text-[clamp(28px,3.4vw,40px)] font-bold tracking-[-0.03em] text-fg">
            {number ? (
              <span
                data-testid="section-number"
                aria-hidden="true"
                className="mr-3 font-mono text-[0.6em] font-medium text-dim"
              >
                {number}
              </span>
            ) : null}
            {title}
          </h2>
          {accessory ? <div className="font-mono text-[13px] text-mute">{accessory}</div> : null}
        </div>
        {subtitle ? (
          <p
            className={cn(
              "mb-7 max-w-[720px] leading-relaxed text-mute",
              width === "narrow" && "mx-auto"
            )}
          >
            {subtitle}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
