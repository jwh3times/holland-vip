import type { Accent } from "@/lib/accent";
import { yearsOfExperience } from "@/lib/site-config";

/** A Current Exploration: something being learned now, not claimed as expertise. */
export interface CurrentExploration {
  label: string;
  accent: Accent;
}

/** The Biography: the README panel's three paragraphs, rendered in order. */
export const bio: string[] = [
  `I'm a senior software engineer with ${yearsOfExperience} years across full-stack development, back-end architecture, and embedded systems. I build scalable, well-tested systems — and lately, the agentic tooling that helps teams build them faster.`,
  "At SoftPro I'm Tech Lead on the new ledger and register experience for the Sky platform: a greenfield microservice on AKS behind a modern Angular front end, integrated with the established Select backend. Beyond my team, I'm leading company-wide adoption of PrimeNG and Storybook, and I'm part of SoftPro's Claude Code and spec-driven development pilot. Inside the team I run our AI-in-development initiative — custom agents, shared Copilot instructions, and reusable prompts.",
  "Off the clock I keep a steady stream of hobby projects going in the open, each run with the same agent workflow: a shared skills repo installed across every project, generated AGENTS.md conventions, MCP servers, and cross-machine handoffs. I lean on TDD, property-based testing, and ADRs, and I make a habit of learning continuously.",
];

/** The README panel's labels. */
export const aboutCopy = {
  file: "# README.md",
  title: "About",
};

/** Current Explorations, shown as `[~]` chips in Career & stack. Edit this list freely. */
export const currentExplorations: CurrentExploration[] = [
  { label: "Multi-agent workflows · Claude Code · Codex · MCP", accent: "purple" },
  { label: "Spec-driven development", accent: "blue" },
  { label: "AI authorship provenance in VCS", accent: "green" },
  { label: "Rust native tooling", accent: "orange" },
  { label: "Edge-native apps on Cloudflare", accent: "blue" },
  { label: "Quant backtesting", accent: "green" },
];
