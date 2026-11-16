import type { Accent } from "@/lib/accent";
import { yearsOfExperience } from "@/lib/site-config";

/** A Current Exploration: something being learned now, not claimed as expertise. */
export interface CurrentExploration {
  label: string;
  accent: Accent;
}

/** Biography paragraphs, rendered in order. */
export const bio: string[] = [
  `I'm a senior software engineer with ${yearsOfExperience} years across full-stack development, back-end architecture, and embedded systems. I focus on building scalable, high-performance applications with modern cloud technologies and a microservices approach.`,
  "Currently a Senior Software Engineer and Tech Lead at SoftPro, building the new ledger and register experience for the Sky platform — letting closing teams balance the register for a real-estate transaction file. My team is building it as a greenfield microservice on AKS behind a modern Angular front end, integrated with SoftPro's established Select backend. Alongside the full-stack work, I lead our team's adoption of AI in the development workflow — building custom agents, maintaining shared Copilot instructions, and authoring reusable prompts — and I partner with product to scope work and shape technical direction.",
  "Outside of feature work, I focus on performance tuning, system optimization, and mentoring other developers. I lean on test-driven development and Agile practices, and I make a habit of learning continuously.",
];

/** Current Explorations, shown as `[~]` chips in Career & stack. Edit this list freely. */
export const currentExplorations: CurrentExploration[] = [
  { label: "Multi-agent workflows · Claude Code · Codex · MCP", accent: "purple" },
  { label: "Spec-driven development", accent: "blue" },
  { label: "AI authorship provenance in VCS", accent: "green" },
  { label: "Rust native tooling", accent: "orange" },
  { label: "Edge-native apps on Cloudflare", accent: "blue" },
  { label: "Quant backtesting", accent: "green" },
];
