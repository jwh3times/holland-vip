import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The page-section shell. Every section on the page renders through it.
 *
 * It owns three things that were previously copied into each section module and
 * enforced by nothing:
 *
 * 1. **The shell** — vertical rhythm, the centered container, and the `h2`.
 * 2. **The anchor id**, typed against {@link SECTION_IDS} so a section cannot
 *    declare an id that `Navigation` doesn't know about.
 * 3. **The surface**, which alternates down the page. A section never picks its
 *    own surface — `app/page.tsx` owns the order and derives it via
 *    {@link surfaceAt}, so adjacent sections can't collide.
 */

/**
 * Sections reachable from the nav. `Navigation` maps over this, so every entry
 * must have a label and every nav link provably points at a real section.
 */
export const NAV_SECTION_IDS = [
  "about",
  "skills",
  "experience",
  "projects",
  "open-source",
  "contact",
] as const;

export type NavSectionId = (typeof NAV_SECTION_IDS)[number];

/**
 * Every anchorable section id. A superset of {@link NAV_SECTION_IDS}: `education`
 * is deep-linkable but deliberately not in the nav. Adding an id here without
 * adding it to `NAV_SECTION_IDS` is a choice, not an accident — before this
 * module existed, `#education` was an orphan nothing linked to and nothing caught.
 */
export const SECTION_IDS = [...NAV_SECTION_IDS, "education"] as const;

export type SectionId = (typeof SECTION_IDS)[number];

/** Which of the two alternating background surfaces a section sits on. */
export type SectionSurface = "surface" | "contrast";

/**
 * The surface for the section at `index` in the page's ordered body sections.
 *
 * Index 0 is `surface`. Because `app/page.tsx` builds its list *after* deciding
 * which sections render at all, a section that drops out cannot re-phase the
 * ones below it.
 */
export function surfaceAt(index: number): SectionSurface {
  return index % 2 === 0 ? "surface" : "contrast";
}

/**
 * Props every page section accepts so `app/page.tsx` can place it on a surface.
 * Sections forward this straight to {@link Section} — they never choose it.
 */
export interface SectionSurfaceProps {
  surface?: SectionSurface;
}

export interface SectionProps {
  /** Heading text, rendered as the section's `h2`. */
  title: string;
  children: React.ReactNode;
  /** Anchor id. Omit for sections that aren't linkable. */
  id?: SectionId;
  /** Optional lead paragraph between the heading and the content. */
  subtitle?: React.ReactNode;
  /** Set by `app/page.tsx` from the section's position. Defaults to `surface`. */
  surface?: SectionSurface;
  /** `wide` (max-w-7xl) for content sections; `narrow` (max-w-3xl, centered) for prose. */
  width?: "wide" | "narrow";
}

export function Section({
  title,
  children,
  id,
  subtitle,
  surface = "surface",
  width = "wide",
}: SectionProps) {
  return (
    <section
      {...(id ? { id } : {})}
      className={cn(
        "py-20",
        surface === "surface" ? "section-surface" : "section-surface-contrast"
      )}
    >
      <div
        className={cn(
          "mx-auto px-4 sm:px-6 lg:px-8",
          width === "wide" ? "max-w-7xl" : "max-w-3xl text-center"
        )}
      >
        <h2
          className={cn(
            "text-3xl md:text-4xl font-bold text-center text-heading",
            subtitle ? "mb-4" : "mb-12"
          )}
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="text-center text-muted max-w-2xl mx-auto mb-12">{subtitle}</p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
