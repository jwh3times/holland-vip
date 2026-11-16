/** A Professional Project: work from an employer's private repositories, anonymized. */
export interface Project {
  /** The cell's label, printed as `private/{slug}`. */
  slug: string;
  title: string;
  description: string;
}

/** The Professional work section's own copy. */
export const projectsCopy = {
  title: "Professional work",
  privateLabel: "🔒 private repos · anonymized",
  subtitle:
    "Selected work from my professional roles — anonymized and generalized to respect client and employer confidentiality. My public work is in Hobby projects, above.",
};

export const projects: Project[] = [
  {
    slug: "enterprise-saas-platform-modernization",
    title: "Enterprise SaaS Platform Modernization",
    description:
      "Led modernization initiative for legacy enterprise application serving Fortune 500 clients. Migrated from monolithic architecture to containerized microservices on Kubernetes, implemented modern authentication flows, and redesigned data storage architecture. Achieved zero-downtime deployment across multiple customer environments.",
  },
  {
    slug: "interactive-data-visualization-framework",
    title: "Interactive Data Visualization Framework",
    description:
      "Developed sophisticated charting and annotation system for time-series data analysis. Built custom drawing tools, context capture functionality, and client-side image storage using IndexedDB. Enabled users to annotate trends, capture insights, and share analysis across teams.",
  },
  {
    slug: "high-performance-data-calculation-engine",
    title: "High-Performance Data Calculation Engine",
    description:
      "Architected real-time calculation engine processing streaming data with user-defined formulas. Designed intuitive UI for formula configuration, tag mapping, and validation. Implemented multi-threaded execution pipeline ensuring sub-second calculation results.",
  },
  {
    slug: "third-party-system-integration-platform",
    title: "Third-Party System Integration Platform",
    description:
      "Built flexible integration layer connecting multiple enterprise systems via REST APIs. Implemented data synchronization, transformation pipelines, and error recovery mechanisms. Streamlined workflows by automating data exchange between systems.",
  },
];
