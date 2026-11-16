import type { Accent } from "@/lib/accent";
import type { RoleDates } from "@/lib/role-dates";

/**
 * A role. Its dates are stored once, as year and month; `lib/role-dates.ts` derives the period
 * label, the timeline bar and the duration from them, so those can never disagree. The current
 * role is the one with no `end`.
 */
export interface Experience extends RoleDates {
  title: string;
  company: string;
  location: string;
  accent: Accent;
  /** A fixed, short commit hash shown in the career `git log`. Flavour, not a real commit. */
  hash: string;
  highlights: string[];
}

/** Roles in reverse-chronological order; the timeline and the log render them top to bottom. */
export const experiences: Experience[] = [
  {
    title: "Senior Software Engineer / Tech Lead",
    company: "SoftPro",
    start: { year: 2025, month: 11 },
    end: null,
    location: "Raleigh, NC (Remote)",
    accent: "blue",
    hash: "f3a91c0",
    highlights: [
      "Tech-leading full-stack development of greenfield ledger/register functionality for SoftPro's Sky platform — register balancing for real-estate transaction files, built as a new microservice on AKS with an Angular front end and integrated with the existing Select backend for file data",
      "Leading the team's AI-in-development initiative — building custom AI agents, maintaining shared Copilot instructions, and authoring reusable prompt files to standardize and accelerate the dev workflow",
      "Partnering with product to plan and scope team work, clarify requirements, and research technical implementation, while modernizing the Angular app to the latest version of Angular",
      "Leading company-wide adoption of PrimeNG and Storybook — a shared component library with living, documented UI across product teams",
      "Selected participant in SoftPro's Claude Code and spec-driven development pilot, helping shape how agentic coding rolls out across engineering",
    ],
  },
  {
    title: "Senior Web Developer",
    company: "Prometheus Group",
    start: { year: 2024, month: 6 },
    end: { year: 2025, month: 11 },
    location: "Raleigh, NC",
    accent: "purple",
    hash: "b27e4d1",
    highlights: [
      "Architecting cloud-hosted web applications using .NET, AWS, Azure with EKS/AKS, RDS, RabbitMQ, and S3/Azure Blob storage",
      "Developing REST APIs with multi-threaded data processing and real-time account management",
      "Leading UI/UX redesign with Angular and TypeScript, mentoring junior developers in TDD and Agile practices",
    ],
  },
  {
    title: "Software Developer",
    company: "SAS Institute",
    start: { year: 2017, month: 8 },
    end: { year: 2024, month: 4 },
    location: "Cary, NC",
    accent: "green",
    hash: "9c05e8a",
    highlights: [
      "Engineered high-performance data infrastructure with 64-bit architecture upgrade enabling limitless storage capacity",
      "Achieved 11% database query performance improvement and 7% Java execution efficiency gains",
      "Automated CI/CD pipelines increasing developer productivity by 15% with reduced deployment times",
    ],
  },
  {
    title: "Electrical Engineer",
    company: "Humboldt Scientific",
    start: { year: 2013, month: 6 },
    end: { year: 2017, month: 8 },
    location: "Raleigh, NC",
    accent: "orange",
    hash: "41d7b2f",
    highlights: [
      "Developed firmware and UI/UX for embedded systems leading to global product line success",
      "Designed PID control algorithms for hydraulic, pneumatic, and motor-driven systems",
      "Reduced Li-Ion battery failure rates from 30% to 5% through optimized circuit design",
    ],
  },
];
