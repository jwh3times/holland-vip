/**
 * The site's accent palette.
 *
 * Before this module, "accent colour" was re-taught in six mutually incompatible
 * shapes — two different `colorMap` objects (both exporting a type called
 * `ColorKey`, meaning different things), two sets of inline class strings, and an
 * index-cycled array. Adding a fifth accent meant editing six files.
 *
 * Now there is one union and one token table. Callers name an {@link Accent} and
 * read the token they need; they never write colour classes by hand.
 *
 * Prefer the components that consume these — `<Badge>` and `<Card>` — over reading
 * tokens directly. Reach for the table when you need a single token (a bullet
 * glyph, a timeline dot) rather than a whole element.
 */

export const ACCENTS = ["blue", "green", "purple", "orange"] as const;

export type Accent = (typeof ACCENTS)[number];

export interface AccentTokens {
  /** Accent text: headings, links, metrics. AA on every surface and on the accent's own tint. */
  text: string;
  /** Bullet glyphs and list markers. */
  bullet: string;
  /** Solid dot — timeline nodes, language indicators. */
  dot: string;
  /** Ring around a solid dot, or a chip's outline: the 30% hover tint. */
  ring: string;
  /** Card border for tinted cards: the 30% tint. */
  border: string;
  /** Tinted card background, paired with `border`: the 12% chip tint. */
  cardBg: string;
  /** Pill background + text. See `<Badge>`. */
  badge: string;
  /** Icon chip: background, text, and ring. */
  iconChip: string;
  /** Bar fill — a timeline span: the 14% tint. */
  bar: string;
  /** Border glow on a selected or hovered element: the 55% tint. */
  glow: string;
  /** Solid accent border: a timeline bar's edge, a log node's ring, a dashed exploration chip. */
  outline: string;
  /** Code-style chip: the 12% tint, rising to the 30% tint on hover. */
  chip: string;
  /** Soft drop shadow in the accent at 70%, under a selected timeline bar. */
  shadow: string;
  /** Wide drop shadow in the accent at 60%, under an active Hobby Project card. */
  activeShadow: string;
}

/**
 * Every token reads the accent's `--a-*` variable from `app/globals.css`, so the
 * light/dark swap recolours it without a `dark:` variant. Tints are
 * `color-mix(in oklch, var(--a-X) N%, transparent)` at the design's four steps:
 * 12% (chip), 14% (bar), 30% (hover) and 55% (border glow), plus 70% for a selected bar's
 * shadow and 60% for an active card's. The contribution heatmap's green ramp is `.heatmap` in `app/globals.css`.
 *
 * Each class string is written out in full, never assembled from parts: Tailwind
 * finds classes by scanning this file's text, and would miss an interpolated one.
 */
export const accent: Record<Accent, AccentTokens> = {
  blue: {
    text: "text-a-blue",
    bullet: "text-a-blue",
    dot: "bg-a-blue",
    ring: "ring-[color-mix(in_oklch,var(--a-blue)_30%,transparent)]",
    border: "border-[color-mix(in_oklch,var(--a-blue)_30%,transparent)]",
    cardBg: "bg-[color-mix(in_oklch,var(--a-blue)_12%,transparent)]",
    badge: "bg-[color-mix(in_oklch,var(--a-blue)_12%,transparent)] text-a-blue",
    iconChip:
      "bg-[color-mix(in_oklch,var(--a-blue)_12%,transparent)] text-a-blue ring-[color-mix(in_oklch,var(--a-blue)_30%,transparent)]",
    bar: "bg-[color-mix(in_oklch,var(--a-blue)_14%,transparent)]",
    glow: "border-[color-mix(in_oklch,var(--a-blue)_55%,transparent)]",
    outline: "border-a-blue",
    chip: "bg-[color-mix(in_oklch,var(--a-blue)_12%,transparent)] hover:bg-[color-mix(in_oklch,var(--a-blue)_30%,transparent)]",
    shadow: "shadow-[0_8px_24px_-8px_color-mix(in_oklch,var(--a-blue)_70%,transparent)]",
    activeShadow: "shadow-[0_20px_60px_-24px_color-mix(in_oklch,var(--a-blue)_60%,transparent)]",
  },
  green: {
    text: "text-a-green",
    bullet: "text-a-green",
    dot: "bg-a-green",
    ring: "ring-[color-mix(in_oklch,var(--a-green)_30%,transparent)]",
    border: "border-[color-mix(in_oklch,var(--a-green)_30%,transparent)]",
    cardBg: "bg-[color-mix(in_oklch,var(--a-green)_12%,transparent)]",
    badge: "bg-[color-mix(in_oklch,var(--a-green)_12%,transparent)] text-a-green",
    iconChip:
      "bg-[color-mix(in_oklch,var(--a-green)_12%,transparent)] text-a-green ring-[color-mix(in_oklch,var(--a-green)_30%,transparent)]",
    bar: "bg-[color-mix(in_oklch,var(--a-green)_14%,transparent)]",
    glow: "border-[color-mix(in_oklch,var(--a-green)_55%,transparent)]",
    outline: "border-a-green",
    chip: "bg-[color-mix(in_oklch,var(--a-green)_12%,transparent)] hover:bg-[color-mix(in_oklch,var(--a-green)_30%,transparent)]",
    shadow: "shadow-[0_8px_24px_-8px_color-mix(in_oklch,var(--a-green)_70%,transparent)]",
    activeShadow: "shadow-[0_20px_60px_-24px_color-mix(in_oklch,var(--a-green)_60%,transparent)]",
  },
  purple: {
    text: "text-a-purple",
    bullet: "text-a-purple",
    dot: "bg-a-purple",
    ring: "ring-[color-mix(in_oklch,var(--a-purple)_30%,transparent)]",
    border: "border-[color-mix(in_oklch,var(--a-purple)_30%,transparent)]",
    cardBg: "bg-[color-mix(in_oklch,var(--a-purple)_12%,transparent)]",
    badge: "bg-[color-mix(in_oklch,var(--a-purple)_12%,transparent)] text-a-purple",
    iconChip:
      "bg-[color-mix(in_oklch,var(--a-purple)_12%,transparent)] text-a-purple ring-[color-mix(in_oklch,var(--a-purple)_30%,transparent)]",
    bar: "bg-[color-mix(in_oklch,var(--a-purple)_14%,transparent)]",
    glow: "border-[color-mix(in_oklch,var(--a-purple)_55%,transparent)]",
    outline: "border-a-purple",
    chip: "bg-[color-mix(in_oklch,var(--a-purple)_12%,transparent)] hover:bg-[color-mix(in_oklch,var(--a-purple)_30%,transparent)]",
    shadow: "shadow-[0_8px_24px_-8px_color-mix(in_oklch,var(--a-purple)_70%,transparent)]",
    activeShadow: "shadow-[0_20px_60px_-24px_color-mix(in_oklch,var(--a-purple)_60%,transparent)]",
  },
  orange: {
    text: "text-a-orange",
    bullet: "text-a-orange",
    dot: "bg-a-orange",
    ring: "ring-[color-mix(in_oklch,var(--a-orange)_30%,transparent)]",
    border: "border-[color-mix(in_oklch,var(--a-orange)_30%,transparent)]",
    cardBg: "bg-[color-mix(in_oklch,var(--a-orange)_12%,transparent)]",
    badge: "bg-[color-mix(in_oklch,var(--a-orange)_12%,transparent)] text-a-orange",
    iconChip:
      "bg-[color-mix(in_oklch,var(--a-orange)_12%,transparent)] text-a-orange ring-[color-mix(in_oklch,var(--a-orange)_30%,transparent)]",
    bar: "bg-[color-mix(in_oklch,var(--a-orange)_14%,transparent)]",
    glow: "border-[color-mix(in_oklch,var(--a-orange)_55%,transparent)]",
    outline: "border-a-orange",
    chip: "bg-[color-mix(in_oklch,var(--a-orange)_12%,transparent)] hover:bg-[color-mix(in_oklch,var(--a-orange)_30%,transparent)]",
    shadow: "shadow-[0_8px_24px_-8px_color-mix(in_oklch,var(--a-orange)_70%,transparent)]",
    activeShadow: "shadow-[0_20px_60px_-24px_color-mix(in_oklch,var(--a-orange)_60%,transparent)]",
  },
};

/** The accent at `index`, cycling through {@link ACCENTS}. For lists with no inherent accent. */
export function accentAt(index: number): Accent {
  return ACCENTS[index % ACCENTS.length];
}
