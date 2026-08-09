import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Section, type SectionSurfaceProps } from "@/components/ui/section";
import { accent, type Accent } from "@/lib/accent";
import { cn } from "@/lib/utils";
import { yearsOfExperience } from "@/lib/site-config";

interface CareerHighlight {
  value: string;
  title: string;
  description: string;
  accent: Accent;
}

interface TechnicalAchievement {
  title: string;
  accent: Accent;
  items: string[];
}

const careerHighlights: CareerHighlight[] = [
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

const technicalAchievements: TechnicalAchievement[] = [
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

// A few things I'm currently digging into — edit this list freely.
const exploringTags: { label: string; accent: Accent }[] = [
  { label: "Agentic AI dev workflows", accent: "blue" },
  { label: "Kubernetes / AKS", accent: "purple" },
  { label: "Next.js & RSC", accent: "green" },
  { label: "Go", accent: "orange" },
];

export function AboutSection({ surface }: SectionSurfaceProps) {
  return (
    <Section id="about" title="About Me" surface={surface}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-lg text-muted mb-6 leading-relaxed">
            I&apos;m a senior software engineer with {yearsOfExperience} years across full-stack
            development, back-end architecture, and embedded systems. I focus on building scalable,
            high-performance applications with modern cloud technologies and a microservices
            approach.
          </p>
          <p className="text-lg text-muted mb-6 leading-relaxed">
            Currently a Senior Software Engineer and Tech Lead at SoftPro, building the new ledger
            and register experience for the Sky platform — letting closing teams balance the
            register for a real-estate transaction file. My team is building it as a greenfield
            microservice on AKS behind a modern Angular front end, integrated with SoftPro&apos;s
            established Select backend. Alongside the full-stack work, I lead our team&apos;s
            adoption of AI in the development workflow — building custom agents, maintaining shared
            Copilot instructions, and authoring reusable prompts — and I partner with product to
            scope work and shape technical direction.
          </p>
          <p className="text-lg text-muted leading-relaxed">
            Outside of feature work, I focus on performance tuning, system optimization, and
            mentoring other developers. I lean on test-driven development and Agile practices, and I
            make a habit of learning continuously.
          </p>

          {/* Currently exploring */}
          <div className="mt-10">
            <p className="text-sm font-semibold text-label mb-3">Currently exploring</p>
            <div className="flex flex-wrap justify-center gap-2">
              {exploringTags.map((tag) => (
                <Badge key={tag.label} accent={tag.accent}>
                  {tag.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Career Highlights */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {careerHighlights.map((highlight) => (
            <Card key={highlight.title} accent={highlight.accent}>
              <div className={cn("text-3xl font-bold mb-2", accent[highlight.accent].text)}>
                {highlight.value}
              </div>
              <div className="text-sm font-semibold text-label mb-1">{highlight.title}</div>
              <div className="text-xs text-muted">{highlight.description}</div>
            </Card>
          ))}
        </div>

        {/* Recent Technical Achievements */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-heading">
            Recent Technical Achievements
          </h3>
          <div className="space-y-6">
            {technicalAchievements.map((achievement) => (
              <Card key={achievement.title} accent={achievement.accent}>
                <h4 className={cn("text-xl font-bold mb-3", accent[achievement.accent].text)}>
                  {achievement.title}
                </h4>
                <ul className="space-y-2 text-muted">
                  {achievement.items.map((item) => (
                    <li key={item} className="flex items-start">
                      <span className={cn("mr-2", accent[achievement.accent].bullet)}>▸</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
