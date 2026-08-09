import type { Accent } from "@/lib/accent";

export interface SkillCategory {
  title: string;
  accent: Accent;
  skills: string[];
}

export const skillCategories: SkillCategory[] = [
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
