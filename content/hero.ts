import { yearsOfExperience } from "@/lib/site-config";

/** Hero copy. Edit here, not in `components/sections/HeroSection.tsx`. */
export const hero = {
  greeting: "Hi, I'm",
  name: "Jerry Holland",
  tagline: `Senior Software Engineer | ${yearsOfExperience} Years Experience`,
  blurb:
    "Building scalable, high-performance applications with expertise in full-stack development, cloud architecture, and system optimization.",
  ctas: [
    { label: "View My Work", href: "#projects" },
    { label: "Get in Touch", href: "#contact" },
  ],
} as const;
