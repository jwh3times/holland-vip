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
  /** Heading text. Chosen for AA contrast on both surfaces. */
  text: string;
  /** Bullet glyphs and list markers. */
  bullet: string;
  /** Solid dot — timeline nodes, language indicators. */
  dot: string;
  /** Ring around a solid dot. */
  ring: string;
  /** Card border for tinted cards. */
  border: string;
  /** Tinted card background, paired with `border`. */
  cardBg: string;
  /** Pill background + text. See `<Badge>`. */
  badge: string;
  /** Icon chip: background, text, and ring. */
  iconChip: string;
}

/**
 * Note on `text`: green and orange use the 700 shade rather than 600. Both were
 * previously in use — `SkillsSection` had 700 while `AboutSection` and
 * `TechnicalCapabilities` had 600 — and 700 is the one that clears WCAG AA for
 * normal-size text on the light surfaces. Blue and purple already clear it at 600.
 */
export const accent: Record<Accent, AccentTokens> = {
  blue: {
    text: "text-blue-600 dark:text-blue-400",
    bullet: "text-blue-500",
    dot: "bg-blue-500",
    ring: "ring-blue-500/20",
    border: "border-blue-200 dark:border-slate-700",
    cardBg: "card-bg-blue",
    badge: "bg-blue-100 dark:bg-blue-900/40 text-badge-blue",
    iconChip:
      "bg-blue-500/10 text-blue-600 ring-blue-500/20 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/25",
  },
  green: {
    text: "text-green-700 dark:text-green-400",
    bullet: "text-green-500",
    dot: "bg-green-500",
    ring: "ring-green-500/20",
    border: "border-green-200 dark:border-slate-700",
    cardBg: "card-bg-green",
    badge: "bg-green-100 dark:bg-green-900/40 text-badge-green",
    iconChip:
      "bg-green-500/10 text-green-700 ring-green-500/20 dark:bg-green-500/15 dark:text-green-300 dark:ring-green-500/25",
  },
  purple: {
    text: "text-purple-600 dark:text-purple-400",
    bullet: "text-purple-500",
    dot: "bg-purple-500",
    ring: "ring-purple-500/20",
    border: "border-purple-200 dark:border-slate-700",
    cardBg: "card-bg-purple",
    badge: "bg-purple-100 dark:bg-purple-900/40 text-badge-purple",
    iconChip:
      "bg-purple-500/10 text-purple-600 ring-purple-500/20 dark:bg-purple-500/15 dark:text-purple-300 dark:ring-purple-500/25",
  },
  orange: {
    text: "text-orange-700 dark:text-orange-400",
    bullet: "text-orange-500",
    dot: "bg-orange-500",
    ring: "ring-orange-500/20",
    border: "border-orange-200 dark:border-slate-700",
    cardBg: "card-bg-orange",
    badge: "bg-orange-100 dark:bg-orange-900/40 text-badge-orange",
    iconChip:
      "bg-orange-500/10 text-orange-700 ring-orange-500/20 dark:bg-orange-500/15 dark:text-orange-300 dark:ring-orange-500/25",
  },
};

/** The accent at `index`, cycling through {@link ACCENTS}. For lists with no inherent accent. */
export function accentAt(index: number): Accent {
  return ACCENTS[index % ACCENTS.length];
}
