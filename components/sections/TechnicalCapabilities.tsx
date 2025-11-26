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

export function TechnicalCapabilities() {
  return (
    <section className="section-surface py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-heading">
          Technical Capabilities
        </h2>

        <div className="max-w-6xl mx-auto space-y-8">
          {capabilities.map((capability) => (
            <div
              key={capability.title}
              className="rounded-2xl p-6 card-bg-white border border-gray-200 dark:border-slate-700 shadow-lg transition-colors duration-300"
            >
              <h3 className={`text-2xl font-bold ${capability.colorClass} mb-4`}>
                {capability.title}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {capability.items.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <span className={`mr-2 ${capability.bulletColor} text-xl`}>•</span>
                    <span className="text-label">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
