import type { ReactNode } from "react";
import { ClipboardCopy, FileX, Signature, Columns3, Lock } from "lucide-react";

import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { Badge } from "@/components/ui/badge";
import { Section, type SectionSurfaceProps } from "@/components/ui/section";
import {
  projects,
  projectsSubtitle,
  confidentialLabel,
  type ProjectIcon,
} from "@/content/projects";

/** Content names an icon; this map owns which component that is. */
const icons: Record<ProjectIcon, ReactNode> = {
  clipboard: <ClipboardCopy className="h-5 w-5" />,
  file: <FileX className="h-5 w-5" />,
  signature: <Signature className="h-5 w-5" />,
  columns: <Columns3 className="h-5 w-5" />,
};

const spans = {
  one: "md:col-span-1",
  two: "md:col-span-2",
};

export function ProjectsSection({ surface }: SectionSurfaceProps) {
  return (
    <Section id="projects" title="Professional Work" surface={surface} subtitle={projectsSubtitle}>
      <div className="flex justify-center mb-12">
        <Badge accent="orange">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          {confidentialLabel}
        </Badge>
      </div>
      <BentoGrid className="max-w-4xl mx-auto">
        {projects.map((project) => (
          <BentoGridItem
            key={project.title}
            title={project.title}
            description={project.description}
            icon={icons[project.icon]}
            className={spans[project.span]}
          />
        ))}
      </BentoGrid>
    </Section>
  );
}
