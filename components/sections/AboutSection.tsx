import { cn } from "@/lib/utils";
import { yearsOfExperience } from "@/lib/site-config";

type ColorKey = keyof typeof colorMap;

interface CareerHighlight {
  value: string;
  title: string;
  description: string;
  colorClass: ColorKey;
}

interface TechnicalAchievement {
  title: string;
  colorClass: ColorKey;
  items: string[];
}

const careerHighlights: CareerHighlight[] = [
  {
    value: "15%",
    title: "Developer Productivity Increase",
    description: "Through CI/CD pipeline automation and improved deployment processes",
    colorClass: "blue",
  },
  {
    value: "11%",
    title: "Query Performance Improvement",
    description: "Database optimization reducing execution times across the platform",
    colorClass: "green",
  },
  {
    value: "7%",
    title: "Execution Efficiency Gain",
    description: "Java application modernization to latest LTS version",
    colorClass: "purple",
  },
  {
    value: "83%",
    title: "Failure Rate Reduction",
    description: "Li-Ion battery failures reduced from 30% to 5% through design optimization",
    colorClass: "orange",
  },
];

const technicalAchievements: TechnicalAchievement[] = [
  {
    title: "Enterprise Cloud Platform Migration",
    colorClass: "blue",
    items: [
      "Architected and executed cloud infrastructure migration for multi-tenant SaaS platform",
      "Implemented dual authentication provider system with seamless failover",
      "Reduced infrastructure costs by 30% while improving scalability",
    ],
  },
  {
    title: "Database Performance Optimization",
    colorClass: "green",
    items: [
      "Identified and resolved critical query bottlenecks in high-traffic application",
      "Optimized complex SQL queries handling 50K+ records with sub-second response times",
      "Improved overall system performance by 15% through strategic indexing",
    ],
  },
  {
    title: "Real-Time Data Pipeline Architecture",
    colorClass: "purple",
    items: [
      "Built distributed data collection system processing 100K+ data points per minute",
      "Implemented robust error handling and retry logic for industrial data sources",
      "Designed monitoring and alerting system with predictive analytics capabilities",
    ],
  },
];

const colorMap = {
  blue: {
    border: "border-blue-200 dark:border-slate-700",
    bg: "card-bg-blue",
    text: "text-blue-600 dark:text-blue-400",
    bullet: "text-blue-500",
  },
  green: {
    border: "border-green-200 dark:border-slate-700",
    bg: "card-bg-green",
    text: "text-green-600 dark:text-green-400",
    bullet: "text-green-500",
  },
  purple: {
    border: "border-purple-200 dark:border-slate-700",
    bg: "card-bg-purple",
    text: "text-purple-600 dark:text-purple-400",
    bullet: "text-purple-500",
  },
  orange: {
    border: "border-orange-200 dark:border-slate-700",
    bg: "card-bg-orange",
    text: "text-orange-600 dark:text-orange-400",
    bullet: "text-orange-500",
  },
};

export function AboutSection() {
  return (
    <section id="about" className="section-surface py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-heading">About Me</h2>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-lg text-muted mb-6 leading-relaxed">
              Senior Software Engineer with {yearsOfExperience} years of experience spanning
              full-stack development, back-end architecture, and embedded systems. I specialize in
              building scalable, high-performance applications using modern cloud technologies and
              microservices architecture.
            </p>
            <p className="text-lg text-muted mb-6 leading-relaxed">
              Currently a Senior Software Engineer and Tech Lead at SoftPro, building the new ledger
              and register experience for the Sky platform — letting closing teams balance the
              register for a real-estate transaction file. My team is building it as a greenfield
              microservice on AKS behind a modern Angular front end, integrated with SoftPro&apos;s
              established Select backend. Alongside the full-stack work, I lead our team&apos;s
              adoption of AI in the development workflow — building custom agents, maintaining
              shared Copilot instructions, and authoring reusable prompts — and I partner with
              product to scope work and shape technical direction.
            </p>
            <p className="text-lg text-muted leading-relaxed">
              Passionate about performance tuning, system optimization, and mentoring developers. I
              believe in test-driven development, Agile best practices, and continuous learning to
              stay at the forefront of technology.
            </p>
          </div>

          {/* Career Highlights */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            {careerHighlights.map((highlight) => {
              const colors = colorMap[highlight.colorClass];
              return (
                <div
                  key={highlight.title}
                  className={cn(
                    "rounded-2xl p-6 border transition-colors duration-300",
                    colors.border,
                    colors.bg
                  )}
                >
                  <div className={cn("text-3xl font-bold mb-2", colors.text)}>
                    {highlight.value}
                  </div>
                  <div className="text-sm font-semibold text-label mb-1">{highlight.title}</div>
                  <div className="text-xs text-muted">{highlight.description}</div>
                </div>
              );
            })}
          </div>

          {/* Recent Technical Achievements */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-center mb-8 text-heading">
              Recent Technical Achievements
            </h3>
            <div className="space-y-6">
              {technicalAchievements.map((achievement) => {
                const colors = colorMap[achievement.colorClass];
                return (
                  <div
                    key={achievement.title}
                    className={cn(
                      "rounded-2xl p-6 border transition-colors duration-300",
                      colors.border,
                      colors.bg
                    )}
                  >
                    <h4 className={cn("text-xl font-bold mb-3", colors.text)}>
                      {achievement.title}
                    </h4>
                    <ul className="space-y-2 text-muted">
                      {achievement.items.map((item) => (
                        <li key={item} className="flex items-start">
                          <span className={cn("mr-2", colors.bullet)}>▸</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
