import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { Section, type SectionSurfaceProps } from "@/components/ui/section";
import { ClipboardCopy, FileX, Signature, Columns3, Lock } from "lucide-react";

const projects = [
  {
    title: "Enterprise SaaS Platform Modernization",
    description:
      "Led modernization initiative for legacy enterprise application serving Fortune 500 clients. Migrated from monolithic architecture to containerized microservices on Kubernetes, implemented modern authentication flows, and redesigned data storage architecture. Achieved zero-downtime deployment across multiple customer environments.",
    icon: <ClipboardCopy className="h-5 w-5" />,
    className: "md:col-span-2",
  },
  {
    title: "Interactive Data Visualization Framework",
    description:
      "Developed sophisticated charting and annotation system for time-series data analysis. Built custom drawing tools, context capture functionality, and client-side image storage using IndexedDB. Enabled users to annotate trends, capture insights, and share analysis across teams.",
    icon: <FileX className="h-5 w-5" />,
    className: "md:col-span-1",
  },
  {
    title: "High-Performance Data Calculation Engine",
    description:
      "Architected real-time calculation engine processing streaming data with user-defined formulas. Designed intuitive UI for formula configuration, tag mapping, and validation. Implemented multi-threaded execution pipeline ensuring sub-second calculation results.",
    icon: <Signature className="h-5 w-5" />,
    className: "md:col-span-1",
  },
  {
    title: "Third-Party System Integration Platform",
    description:
      "Built flexible integration layer connecting multiple enterprise systems via REST APIs. Implemented data synchronization, transformation pipelines, and error recovery mechanisms. Streamlined workflows by automating data exchange between systems.",
    icon: <Columns3 className="h-5 w-5" />,
    className: "md:col-span-2",
  },
];

export function ProjectsSection({ surface }: SectionSurfaceProps) {
  return (
    <Section
      id="projects"
      title="Professional Work"
      surface={surface}
      subtitle={
        <>
          Selected work from my professional roles — anonymized and generalized to respect client
          and employer confidentiality. For my public, open-source work, see below.
        </>
      }
    >
      <div className="flex justify-center mb-12">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-badge-orange dark:bg-orange-900/40">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          Confidential
        </span>
      </div>
      <BentoGrid className="max-w-4xl mx-auto">
        {projects.map((project) => (
          <BentoGridItem
            key={project.title}
            title={project.title}
            description={project.description}
            icon={project.icon}
            className={project.className}
          />
        ))}
      </BentoGrid>
    </Section>
  );
}
