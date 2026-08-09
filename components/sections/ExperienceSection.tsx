import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Section, type SectionSurfaceProps } from "@/components/ui/section";
import { accent, type Accent } from "@/lib/accent";
import { cn } from "@/lib/utils";

interface Experience {
  title: string;
  company: string;
  period: string;
  location: string;
  isCurrent: boolean;
  accent: Accent;
  highlights: string[];
}

const experiences: Experience[] = [
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

export function ExperienceSection({ surface }: SectionSurfaceProps) {
  return (
    <Section id="experience" title="Professional Experience" surface={surface}>
      <div className="max-w-4xl mx-auto">
        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[linear-gradient(to_bottom,var(--color-blue-500),var(--color-purple-500),var(--color-green-500),var(--color-orange-500))]"></div>

          {experiences.map((exp, index) => {
            const colors = accent[exp.accent];
            return (
              <div
                key={exp.company}
                className={cn("relative ml-20", index < experiences.length - 1 && "mb-12")}
              >
                <div
                  className={cn(
                    "absolute -left-[3.25rem] top-2 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 ring-4",
                    colors.dot,
                    colors.ring
                  )}
                ></div>
                <Card className="card-bg-white-80 backdrop-blur-sm shadow-none hover:shadow-xl">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-heading">{exp.title}</h3>
                    {exp.isCurrent && <Badge accent="blue">Current</Badge>}
                  </div>
                  <div className="text-base font-semibold text-label mb-2">{exp.company}</div>
                  <div className="text-sm text-muted mb-4">
                    {exp.period} • {exp.location}
                  </div>
                  <ul className="space-y-2 text-sm text-muted">
                    {exp.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start">
                        <span className={cn("mr-2", colors.bullet)}>▸</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
