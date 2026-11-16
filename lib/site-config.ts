import { GitHubIcon, LinkedInIcon } from "@/components/icons/SocialIcons";

/**
 * Single source of truth for contact + social links.
 * `siteConfig` is read by the layout, the page's JSON-LD, the header prompt and
 * ContactSection; `socialLinks` by the Footer, the JSON-LD and the hero terminal's
 * script in `content/hero.ts`.
 */
export const siteConfig = {
  email: "jerry@holland.vip",
  /**
   * Canonical origin. Drives `metadataBase`, `og:url`, and the sitemap — and is
   * what `tests/global-setup.ts` looks for to confirm the server the e2e suite
   * is about to drive is actually this site.
   */
  url: "https://holland.vip",
  /** Rendered in the document title; the second identity signal for the e2e check. */
  name: "Jerry Holland",
} as const;

/** Career began mid-2013 (NCSU grad → first role). Single source for "years of experience". */
export const CAREER_START_YEAR = 2013;

/** Whole years since career start. Computed at build time (static export — refreshes on deploy). */
export const yearsOfExperience = new Date().getFullYear() - CAREER_START_YEAR;

export const socialLinks = [
  {
    href: "https://github.com/jwh3times",
    label: "GitHub",
    icon: GitHubIcon,
  },
  {
    href: "https://www.linkedin.com/in/jerryhollandiii",
    label: "LinkedIn",
    icon: LinkedInIcon,
  },
];
