import { Section, type SectionSurfaceProps } from "@/components/ui/section";
import { accent, type Accent } from "@/lib/accent";
import { cn } from "@/lib/utils";

interface SkillCategory {
  title: string;
  accent: Accent;
  skills: string[];
}

const skillCategories: SkillCategory[] = [
  {
    title: "Languages & Frameworks",
    accent: "blue",
    skills: [
      "Java",
      "C#",
      ".NET",
      "Python",
      "TypeScript",
      "JavaScript",
      "Angular",
      "Node.js",
      "React",
    ],
  },
  {
    title: "Cloud & DevOps",
    accent: "purple",
    skills: ["AWS", "Azure", "Kubernetes", "Docker", "Jenkins", "GitLab CI/CD", "Git"],
  },
  {
    title: "Databases & Messaging",
    accent: "green",
    skills: ["PostgreSQL", "SQL Server", "Redis", "RabbitMQ", "Geode"],
  },
  {
    title: "Architecture & Design",
    accent: "orange",
    skills: [
      "REST APIs",
      "Microservices",
      "Multi-Tenancy",
      "Distributed Systems",
      "OAuth/OIDC",
      "Event-Driven Architecture",
    ],
  },
];

function SkillBadge({ skill }: { skill: string }) {
  return (
    <div className="rounded-xl p-4 text-center shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl card-bg-white-transparent ring-1 ring-inset ring-gray-200/70 dark:ring-blue-500/40">
      <p className="text-sm font-semibold text-badge">{skill}</p>
    </div>
  );
}

export function SkillsSection({ surface }: SectionSurfaceProps) {
  return (
    <Section id="skills" title="Skills & Technologies" surface={surface}>
      <div className="max-w-6xl mx-auto space-y-12">
        {skillCategories.map((category) => (
          <div key={category.title}>
            <h3
              className={cn("text-xl font-semibold mb-4 text-center", accent[category.accent].text)}
            >
              {category.title}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {category.skills.map((skill) => (
                <SkillBadge key={skill} skill={skill} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
