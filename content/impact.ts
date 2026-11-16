import type { Accent } from "@/lib/accent";

export interface CareerHighlight {
  /**
   * The signed figure, exactly as shown: `+15%`, `−83%` (with U+2212, the minus sign). The sign
   * belongs to the claim, so it lives here and never follows from `accent`.
   */
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

/** The Impact section's own copy. Its four groups are named for screen readers only. */
export const impactCopy = {
  title: "Impact",
  groups: {
    highlights: "Career Highlights",
    cases: "Problem-Solving Highlights",
    capabilities: "Technical Capabilities",
    achievements: "Technical Achievements",
  },
  /** Each Problem-Solving Highlight's label, numbered from 1: `case #001`. */
  caseLabel: (n: number) => `case #${String(n).padStart(3, "0")}`,
  /** The mono labels for a case's three blocks, in render order. */
  caseBlocks: { challenge: "ERR", solution: "FIX", impact: "OK" },
  achievementLabel: "achievement",
};

export const careerHighlights: CareerHighlight[] = [
  {
    value: "+15%",
    title: "Developer Productivity Increase",
    description: "Through CI/CD pipeline automation and improved deployment processes",
    accent: "blue",
  },
  {
    value: "+11%",
    title: "Query Performance Improvement",
    description: "Database optimization reducing execution times across the platform",
    accent: "green",
  },
  {
    value: "+7%",
    title: "Execution Efficiency Gain",
    description: "Java application modernization to latest LTS version",
    accent: "purple",
  },
  {
    value: "−83%",
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
