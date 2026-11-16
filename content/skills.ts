import type { Accent } from "@/lib/accent";

export interface SkillCategory {
  title: string;
  accent: Accent;
  skills: string[];
}

/** The `skills.json` inventory in the Career & stack section, one key per category. */
export const skillCategories: SkillCategory[] = [
  {
    title: "Languages",
    accent: "blue",
    skills: ["C#", "Java", "TypeScript", "JavaScript", "Python", "Go", "Rust", "SQL"],
  },
  {
    title: "Frameworks & UI",
    accent: "purple",
    skills: [
      ".NET / ASP.NET Core",
      "EF Core",
      "Angular",
      "PrimeNG",
      "Storybook",
      "React",
      "React Native / Expo",
      "Node.js",
      "FastAPI",
      "Gin",
      "Astro",
    ],
  },
  {
    title: "Cloud & DevOps",
    accent: "green",
    skills: [
      "Azure · AKS · Container Apps",
      "Bicep",
      "AWS",
      "Cloudflare Workers · D1 · R2 · Queues",
      "Kubernetes",
      "Docker",
      "GitHub Actions",
      "GitLab CI/CD",
      "Jenkins",
    ],
  },
  {
    title: "Data & Messaging",
    accent: "orange",
    skills: [
      "PostgreSQL + RLS",
      "SQL Server",
      "Supabase",
      "SQLite / D1",
      "Redis",
      "RabbitMQ",
      "Geode",
    ],
  },
  {
    title: "Architecture",
    accent: "blue",
    skills: [
      "Microservices",
      "Modular monolith",
      "CQRS",
      "Multi-tenancy",
      "Event-driven",
      "OpenAPI codegen",
      "OAuth/OIDC",
      "Double-entry ledgers",
      "Offline-first PWAs",
    ],
  },
  {
    title: "Testing & Quality",
    accent: "green",
    skills: [
      "TDD",
      "Property-based testing",
      "Golden-file tests",
      "Testcontainers",
      "Playwright",
      "Vitest / Jest",
      "xUnit",
      "axe / WCAG AA",
    ],
  },
  {
    title: "Agentic Engineering",
    accent: "purple",
    skills: [
      "Claude Code",
      "Codex",
      "GitHub Copilot",
      "Agent skills",
      "MCP",
      "AGENTS.md",
      "Spec-driven development",
      "Prompt engineering",
    ],
  },
  {
    title: "Applied AI",
    accent: "orange",
    skills: [
      "Anthropic API",
      "OpenAI API",
      "RAG / AI Search",
      "PII pseudonymization",
      "LLM output validation",
    ],
  },
];
