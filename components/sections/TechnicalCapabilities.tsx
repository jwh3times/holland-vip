import { Card } from "@/components/ui/card";
import { Section, type SectionSurfaceProps } from "@/components/ui/section";
import { accent, type Accent } from "@/lib/accent";
import { cn } from "@/lib/utils";

interface Capability {
  title: string;
  accent: Accent;
  items: string[];
}

const capabilities: Capability[] = [
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

export function TechnicalCapabilities({ surface }: SectionSurfaceProps) {
  return (
    <Section title="Technical Capabilities" surface={surface}>
      <div className="max-w-6xl mx-auto space-y-8">
        {capabilities.map((capability) => (
          <Card key={capability.title}>
            <h3 className={cn("text-2xl font-bold mb-4", accent[capability.accent].text)}>
              {capability.title}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {capability.items.map((item) => (
                <div key={item} className="flex items-start">
                  <span className={cn("mr-2 text-xl", accent[capability.accent].bullet)}>•</span>
                  <span className="text-label">{item}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
