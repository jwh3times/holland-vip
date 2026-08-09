import type { Accent } from "@/lib/accent";

export interface Capability {
  title: string;
  accent: Accent;
  items: string[];
}

export const capabilities: Capability[] = [
  {
    title: "Architecture & Design",
    accent: "blue",
    items: [
      "Microservices architecture with containerization",
      "Event-driven systems using message queues",
      "Multi-tenant SaaS platform design",
      "RESTful API development with versioning",
    ],
  },
  {
    title: "Performance Engineering",
    accent: "green",
    items: [
      "Database query optimization and indexing strategies",
      "Caching layer implementation (distributed & in-memory)",
      "Multi-threaded data processing",
      "Load balancing and horizontal scaling",
    ],
  },
  {
    title: "DevOps & Infrastructure",
    accent: "purple",
    items: [
      "CI/CD pipeline automation and optimization",
      "Container orchestration (Kubernetes)",
      "Cloud platform migration strategies",
      "Infrastructure as Code (IaC)",
    ],
  },
  {
    title: "Data Engineering",
    accent: "orange",
    items: [
      "Real-time data streaming and processing",
      "Time-series data storage and retrieval",
      "ETL pipeline development",
      "Data validation and quality assurance",
    ],
  },
];
