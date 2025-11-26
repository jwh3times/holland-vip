import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";

const projects = [
  {
    title: "Enterprise SaaS Platform Modernization",
    description:
      "Led modernization initiative for legacy enterprise application serving Fortune 500 clients. Migrated from monolithic architecture to containerized microservices on Kubernetes, implemented modern authentication flows, and redesigned data storage architecture. Achieved zero-downtime deployment across multiple customer environments.",
    icon: <IconClipboardCopy className="h-5 w-5" />,
    className: "md:col-span-2",
  },
  {
    title: "Interactive Data Visualization Framework",
    description:
      "Developed sophisticated charting and annotation system for time-series data analysis. Built custom drawing tools, context capture functionality, and client-side image storage using IndexedDB. Enabled users to annotate trends, capture insights, and share analysis across teams.",
    icon: <IconFileBroken className="h-5 w-5" />,
    className: "md:col-span-1",
  },
  {
    title: "High-Performance Data Calculation Engine",
    description:
      "Architected real-time calculation engine processing streaming data with user-defined formulas. Designed intuitive UI for formula configuration, tag mapping, and validation. Implemented multi-threaded execution pipeline ensuring sub-second calculation results.",
    icon: <IconSignature className="h-5 w-5" />,
    className: "md:col-span-1",
  },
  {
    title: "Third-Party System Integration Platform",
    description:
      "Built flexible integration layer connecting multiple enterprise systems via REST APIs. Implemented data synchronization, transformation pipelines, and error recovery mechanisms. Streamlined workflows by automating data exchange between systems.",
    icon: <IconTableColumn className="h-5 w-5" />,
    className: "md:col-span-2",
  },
];

export function ProjectsSection() {
  return (
    <section id="projects" className="section-surface-contrast py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-heading">
          Featured Projects
        </h2>
        <BentoGrid className="max-w-4xl mx-auto">
          {projects.map((project, i) => (
            <BentoGridItem
              key={i}
              title={project.title}
              description={project.description}
              icon={project.icon}
              className={project.className}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
