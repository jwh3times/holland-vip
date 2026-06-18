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

// A few things I'm currently digging into — edit this list freely.
const exploringTags = [
  {
    label: "Agentic AI dev workflows",
    className: "bg-blue-100 dark:bg-blue-900/40 text-badge-blue",
  },
  { label: "Kubernetes / AKS", className: "bg-purple-100 dark:bg-purple-900/40 text-badge-purple" },
  { label: "Next.js & RSC", className: "bg-green-100 dark:bg-green-900/40 text-badge-green" },
  { label: "Go", className: "bg-orange-100 dark:bg-orange-900/40 text-badge-orange" },
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
              I&apos;m a senior software engineer with {yearsOfExperience} years across full-stack
              development, back-end architecture, and embedded systems. I focus on building
              scalable, high-performance applications with modern cloud technologies and a
              microservices approach.
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
              Outside of feature work, I focus on performance tuning, system optimization, and
              mentoring other developers. I lean on test-driven development and Agile practices, and
              I make a habit of learning continuously.
            </p>

            {/* Currently exploring */}
            <div className="mt-10">
              <p className="text-sm font-semibold text-label mb-3">Currently exploring</p>
              <div className="flex flex-wrap justify-center gap-2">
                {exploringTags.map((tag) => (
                  <span
                    key={tag.label}
                    className={cn("px-3 py-1 rounded-full text-xs font-semibold", tag.className)}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
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
