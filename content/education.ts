import type { Accent } from "@/lib/accent";

export interface Degree {
  name: string;
  accent: Accent;
}

export interface Highlight {
  label: string;
  accent: Accent;
}

export const education = {
  school: "North Carolina State University",
  /** Alt text for the logo, and the name the logo is of. */
  logoAlt: "NC State University",
  logoSrc: "/ncsu-logo.jpg",
  location: "Raleigh, NC",
  graduated: "Graduated May 2013",
  degrees: [
    { name: "Bachelor of Science in Electrical Engineering", accent: "blue" },
    { name: "Bachelor of Science in Computer Engineering", accent: "purple" },
  ] as Degree[],
  highlights: [
    { label: "Embedded Systems", accent: "blue" },
    { label: "Software Development", accent: "purple" },
    { label: "Led Senior Design Project", accent: "green" },
  ] as Highlight[],
};
