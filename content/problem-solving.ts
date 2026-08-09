export interface Challenge {
  challenge: string;
  solution: string;
  impact: string;
}

/** Row labels for each challenge card, in render order. */
export const challengeRows = [
  { key: "challenge", icon: "⚠️", title: "Challenge", bgColor: "bg-red-100 dark:bg-red-900/30" },
  { key: "solution", icon: "💡", title: "Solution", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  { key: "impact", icon: "✅", title: "Impact", bgColor: "bg-green-100 dark:bg-green-900/30" },
] as const;

export const challenges: Challenge[] = [
  {
    challenge:
      "Legacy authentication system causing frequent user lockouts and poor session management",
    solution:
      "Implemented modern OAuth/OIDC flow with refresh token management and dual authentication provider support for seamless failover",
    impact:
      "Reduced authentication support tickets by 75%, improved user satisfaction scores, and enabled single sign-on capabilities",
  },
  {
    challenge:
      "Complex database queries timing out in production, causing application slowdowns and poor user experience",
    solution:
      "Analyzed execution plans, identified bottlenecks, added strategic indexes, and refactored complex CTEs for better query optimization",
    impact:
      "Reduced query execution time from 45 seconds to under 3 seconds, dramatically improved user experience and system throughput",
  },
  {
    challenge:
      "Manual data import process prone to errors, consuming significant staff time and causing data quality issues",
    solution:
      "Built automated import system with comprehensive validation, error recovery mechanisms, and transactional rollback capabilities",
    impact:
      "Eliminated 95% of data import errors, freed up 10+ hours per week of staff time, and improved data quality metrics",
  },
];
