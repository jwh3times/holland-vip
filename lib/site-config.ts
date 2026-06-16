import { GitHubIcon, LinkedInIcon } from "@/components/icons/SocialIcons";

/**
 * Single source of truth for contact + social links.
 * Consumed by HeroSection, Footer, and ContactSection.
 */
export const siteConfig = {
  email: "jerry@holland.vip",
} as const;

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
