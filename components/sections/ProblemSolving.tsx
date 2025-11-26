const challenges = [
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

interface ChallengeItemProps {
  icon: string;
  title: string;
  description: string;
  bgColor: string;
}

function ChallengeItem({ icon, title, description, bgColor }: ChallengeItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`flex-shrink-0 w-12 h-12 rounded-full ${bgColor} flex items-center justify-center`}
      >
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold text-heading mb-2">{title}</h3>
        <p className="text-label">{description}</p>
      </div>
    </div>
  );
}

export function ProblemSolving() {
  return (
    <section className="section-surface-contrast py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-heading">
          Problem-Solving Highlights
        </h2>

        <div className="max-w-5xl mx-auto space-y-8">
          {challenges.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl p-8 card-bg-white border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="space-y-4">
                <ChallengeItem
                  icon="⚠️"
                  title="Challenge"
                  description={item.challenge}
                  bgColor="bg-red-100 dark:bg-red-900/30"
                />
                <ChallengeItem
                  icon="💡"
                  title="Solution"
                  description={item.solution}
                  bgColor="bg-blue-100 dark:bg-blue-900/30"
                />
                <ChallengeItem
                  icon="✅"
                  title="Impact"
                  description={item.impact}
                  bgColor="bg-green-100 dark:bg-green-900/30"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
