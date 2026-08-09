import type { Accent } from "@/lib/accent";

export interface Experience {
  title: string;
  company: string;
  period: string;
  location: string;
  isCurrent: boolean;
  accent: Accent;
  highlights: string[];
}

/** Roles in reverse-chronological order; the timeline renders them top to bottom. */
export const experiences: Experience[] = [
  {
    title: "Senior Software Engineer / Tech Lead",
    company: "SoftPro",
    period: "Nov 2025 - Present",
    location: "Raleigh, NC (Remote)",
    isCurrent: true,
    accent: "blue",
    highlights: [
      "Tech-leading full-stack development of greenfield ledger/register functionality for SoftPro's Sky platform — register balancing for real-estate transaction files, built as a new microservice on AKS with an Angular front end and integrated with the existing Select backend for file data",
      "Leading the team's AI-in-development initiative — building custom AI agents, maintaining shared Copilot instructions, and authoring reusable prompt files to standardize and accelerate the dev workflow",
      "Partnering with product to plan and scope team work, clarify requirements, and research technical implementation, while modernizing the Angular app to the latest version of Angular",
    ],
  },
  {
    title: "Senior Web Developer",
    company: "Prometheus Group",
    period: "Jun 2024 - Nov 2025",
    location: "Raleigh, NC",
    isCurrent: false,
    accent: "purple",
    highlights: [
      "Architecting cloud-hosted web applications using .NET, AWS, Azure with EKS/AKS, RDS, RabbitMQ, and S3/Azure Blob storage",
      "Developing REST APIs with multi-threaded data processing and real-time account management",
      "Leading UI/UX redesign with Angular and TypeScript, mentoring junior developers in TDD and Agile practices",
    ],
  },
  {
    title: "Software Developer",
    company: "SAS Institute",
    period: "Aug 2017 - Apr 2024",
    location: "Cary, NC",
    isCurrent: false,
    accent: "green",
    highlights: [
      "Engineered high-performance data infrastructure with 64-bit architecture upgrade enabling limitless storage capacity",
      "Achieved 11% database query performance improvement and 7% Java execution efficiency gains",
      "Automated CI/CD pipelines increasing developer productivity by 15% with reduced deployment times",
    ],
  },
  {
    title: "Electrical Engineer",
    company: "Humboldt Scientific",
    period: "Jun 2013 - Aug 2017",
    location: "Raleigh, NC",
    isCurrent: false,
    accent: "orange",
    highlights: [
      "Developed firmware and UI/UX for embedded systems leading to global product line success",
      "Designed PID control algorithms for hydraulic, pneumatic, and motor-driven systems",
      "Reduced Li-Ion battery failure rates from 30% to 5% through optimized circuit design",
    ],
  },
];
