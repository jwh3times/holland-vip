import { yearsOfExperience } from "@/lib/site-config";

/** How the hero terminal colours a line: a typed command, its output, or the highlighted listing. */
export type TerminalLineKind = "command" | "output" | "highlight";

export interface TerminalLine {
  /** The line's text. A `\n` breaks it inside the same output block. */
  text: string;
  kind: TerminalLineKind;
}

/** The script the hero terminal types out, top to bottom. */
const script: TerminalLine[] = [
  { text: "$ whoami", kind: "command" },
  { text: "jerry holland — senior software engineer / tech lead", kind: "output" },
  { text: "$ uptime --career", kind: "command" },
  {
    text: `${yearsOfExperience} years · firmware → data infra → cloud → AI-assisted dev`,
    kind: "output",
  },
  { text: "$ ls ~/hobby-projects --featured", kind: "command" },
  { text: "nearcited/   causet/   magic-agenda/   press/", kind: "highlight" },
  { text: "…and many more active on github.com/jwh3times", kind: "output" },
  { text: "$ cat now.txt", kind: "command" },
  {
    text: "leading a greenfield ledger microservice on AKS,\nrolling out PrimeNG + Storybook company-wide,\nand piloting Claude Code + spec-driven dev.",
    kind: "output",
  },
];

/** Hero copy. Edit here, not in `components/sections/HeroSection.tsx` or the terminal. */
export const hero = {
  status: "Tech Lead @ SoftPro · Raleigh, NC",
  name: "Jerry Holland",
  lead: "Senior software engineer. I build production systems by day and keep a steady stream of hobby projects going in the open — from AI-search tracking to version control to mobile apps.",
  ctas: [
    { label: "./see-projects", href: "#projects" },
    { label: "cat career.log", href: "#experience" },
  ],
  stats: {
    years: "in production",
    contributionsYear: "contributions / 12mo",
    contributionsMonth: "contributions / 30d",
  },
  terminal: {
    title: "zsh — ~/holland.vip",
    script,
    /** What a screen reader hears instead of the typed, `aria-hidden` terminal. */
    summary: `Terminal session. Jerry Holland, senior software engineer and tech lead, ${yearsOfExperience} years into a career that runs from firmware through data infrastructure and cloud to AI-assisted development. Featured hobby projects: Nearcited, causet, Magic Agenda and Press, with many more active on GitHub. Right now: leading a greenfield ledger microservice on AKS, rolling out PrimeNG and Storybook company-wide, and piloting Claude Code with spec-driven development.`,
  },
} as const;
