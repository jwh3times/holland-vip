/**
 * Icon key for a project. The section maps these to Lucide components — content
 * names the icon, presentation owns which component that is.
 */
export type ProjectIcon = "clipboard" | "file" | "signature" | "columns";

export interface Project {
  title: string;
  description: string;
  icon: ProjectIcon;
  /** Grid span within the bento layout. */
  span: "one" | "two";
}

export const projectsSubtitle =
  "Selected work from my professional roles — anonymized and generalized to respect client and employer confidentiality. For my public, open-source work, see below.";

export const confidentialLabel = "Confidential";

export const projects: Project[] = [
  {
    title: "Enterprise SaaS Platform Modernization",
    description:
      "Led modernization initiative for legacy enterprise application serving Fortune 500 clients. Migrated from monolithic architecture to containerized microservices on Kubernetes, implemented modern authentication flows, and redesigned data storage architecture. Achieved zero-downtime deployment across multiple customer environments.",
    icon: "clipboard",
    span: "two",
  },
  {
    title: "Interactive Data Visualization Framework",
    description:
      "Developed sophisticated charting and annotation system for time-series data analysis. Built custom drawing tools, context capture functionality, and client-side image storage using IndexedDB. Enabled users to annotate trends, capture insights, and share analysis across teams.",
    icon: "file",
    span: "one",
  },
  {
    title: "High-Performance Data Calculation Engine",
    description:
      "Architected real-time calculation engine processing streaming data with user-defined formulas. Designed intuitive UI for formula configuration, tag mapping, and validation. Implemented multi-threaded execution pipeline ensuring sub-second calculation results.",
    icon: "signature",
    span: "one",
  },
  {
    title: "Third-Party System Integration Platform",
    description:
      "Built flexible integration layer connecting multiple enterprise systems via REST APIs. Implemented data synchronization, transformation pipelines, and error recovery mechanisms. Streamlined workflows by automating data exchange between systems.",
    icon: "columns",
    span: "two",
  },
];
