import { Section, type SectionSurfaceProps } from "@/components/ui/section";
import { cn } from "@/lib/utils";

const capabilities = [
  {
    title: "Architecture & Design",
    colorClass: "text-blue-600 dark:text-blue-400",
    bulletColor: "text-blue-500",
    items: [
      "Microservices architecture with containerization",
      "Event-driven systems using message queues",
      "Multi-tenant SaaS platform design",
      "RESTful API development with versioning",
    ],
  },
  {
    title: "Performance Engineering",
    colorClass: "text-green-600 dark:text-green-400",
    bulletColor: "text-green-500",
    items: [
      "Database query optimization and indexing strategies",
      "Caching layer implementation (distributed & in-memory)",
      "Multi-threaded data processing",
      "Load balancing and horizontal scaling",
    ],
  },
  {
    title: "DevOps & Infrastructure",
    colorClass: "text-purple-600 dark:text-purple-400",
    bulletColor: "text-purple-500",
    items: [
      "CI/CD pipeline automation and optimization",
      "Container orchestration (Kubernetes)",
      "Cloud platform migration strategies",
      "Infrastructure as Code (IaC)",
    ],
  },
  {
    title: "Data Engineering",
    colorClass: "text-orange-600 dark:text-orange-400",
    bulletColor: "text-orange-500",
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
          <div
            key={capability.title}
            className="rounded-2xl p-6 card-bg-white border border-gray-200 dark:border-slate-700 shadow-lg transition-colors duration-300"
          >
            <h3 className={cn("text-2xl font-bold mb-4", capability.colorClass)}>
              {capability.title}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {capability.items.map((item) => (
                <div key={item} className="flex items-start">
                  <span className={cn("mr-2 text-xl", capability.bulletColor)}>•</span>
                  <span className="text-label">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
