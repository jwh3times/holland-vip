/** A Problem-Solving Highlight: a problem, the response to it, and the result. */
export interface Challenge {
  /** The headline result, exactly as shown: `−75%` (with U+2212), `45s → 3s`. */
  metric: string;
  challenge: string;
  solution: string;
  impact: string;
}

export const challenges: Challenge[] = [
  {
    metric: "−75%",
    challenge:
      "Legacy authentication system causing frequent user lockouts and poor session management",
    solution:
      "Implemented modern OAuth/OIDC flow with refresh token management and dual authentication provider support for seamless failover",
    impact:
      "Reduced authentication support tickets by 75%, improved user satisfaction scores, and enabled single sign-on capabilities",
  },
  {
    metric: "45s → 3s",
    challenge:
      "Complex database queries timing out in production, causing application slowdowns and poor user experience",
    solution:
      "Analyzed execution plans, identified bottlenecks, added strategic indexes, and refactored complex CTEs for better query optimization",
    impact:
      "Reduced query execution time from 45 seconds to under 3 seconds, dramatically improved user experience and system throughput",
  },
  {
    metric: "−95%",
    challenge:
      "Manual data import process prone to errors, consuming significant staff time and causing data quality issues",
    solution:
      "Built automated import system with comprehensive validation, error recovery mechanisms, and transactional rollback capabilities",
    impact:
      "Eliminated 95% of data import errors, freed up 10+ hours per week of staff time, and improved data quality metrics",
  },
];
