import type { Accent } from "@/lib/accent";
import { yearsOfExperience } from "@/lib/site-config";

export interface CareerHighlight {
  value: string;
  title: string;
  description: string;
  accent: Accent;
}

export interface TechnicalAchievement {
  title: string;
  accent: Accent;
  items: string[];
}

export interface ExploringTag {
  label: string;
  accent: Accent;
}

/** Biography paragraphs, rendered in order. */
export const bio: string[] = [
  `I'm a senior software engineer with ${yearsOfExperience} years across full-stack development, back-end architecture, and embedded systems. I focus on building scalable, high-performance applications with modern cloud technologies and a microservices approach.`,
  "Currently a Senior Software Engineer and Tech Lead at SoftPro, building the new ledger and register experience for the Sky platform — letting closing teams balance the register for a real-estate transaction file. My team is building it as a greenfield microservice on AKS behind a modern Angular front end, integrated with SoftPro's established Select backend. Alongside the full-stack work, I lead our team's adoption of AI in the development workflow — building custom agents, maintaining shared Copilot instructions, and authoring reusable prompts — and I partner with product to scope work and shape technical direction.",
  "Outside of feature work, I focus on performance tuning, system optimization, and mentoring other developers. I lean on test-driven development and Agile practices, and I make a habit of learning continuously.",
];

export const careerHighlights: CareerHighlight[] = [
  {
    value: "15%",
    title: "Developer Productivity Increase",
    description: "Through CI/CD pipeline automation and improved deployment processes",
    accent: "blue",
  },
  {
    value: "11%",
    title: "Query Performance Improvement",
    description: "Database optimization reducing execution times across the platform",
    accent: "green",
  },
  {
    value: "7%",
    title: "Execution Efficiency Gain",
    description: "Java application modernization to latest LTS version",
    accent: "purple",
  },
  {
    value: "83%",
    title: "Failure Rate Reduction",
    description: "Li-Ion battery failures reduced from 30% to 5% through design optimization",
    accent: "orange",
  },
];

export const technicalAchievements: TechnicalAchievement[] = [
  {
    title: "Enterprise Cloud Platform Migration",
    accent: "blue",
    items: [
      "Architected and executed cloud infrastructure migration for multi-tenant SaaS platform",
      "Implemented dual authentication provider system with seamless failover",
      "Reduced infrastructure costs by 30% while improving scalability",
    ],
  },
  {
    title: "Database Performance Optimization",
    accent: "green",
    items: [
      "Identified and resolved critical query bottlenecks in high-traffic application",
      "Optimized complex SQL queries handling 50K+ records with sub-second response times",
      "Improved overall system performance by 15% through strategic indexing",
    ],
  },
  {
    title: "Real-Time Data Pipeline Architecture",
    accent: "purple",
    items: [
      "Built distributed data collection system processing 100K+ data points per minute",
      "Implemented robust error handling and retry logic for industrial data sources",
      "Designed monitoring and alerting system with predictive analytics capabilities",
    ],
  },
];

export const achievementsHeading = "Recent Technical Achievements";

export const exploringHeading = "Currently exploring";

/** A few things I'm currently digging into — edit this list freely. */
export const exploringTags: ExploringTag[] = [
  { label: "Agentic AI dev workflows", accent: "blue" },
  { label: "Kubernetes / AKS", accent: "purple" },
  { label: "Next.js & RSC", accent: "green" },
  { label: "Go", accent: "orange" },
];
