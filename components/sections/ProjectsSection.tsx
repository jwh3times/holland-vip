import { Section, type NumberedSectionProps } from "@/components/ui/section";
import { projects, projectsCopy } from "@/content/projects";
import { accent } from "@/lib/accent";
import { cn } from "@/lib/utils";

/**
 * Professional work: the anonymized Professional Projects as `private/{slug}` cells on a
 * hairline grid — a 1px gap over the line colour. The grid is only ever one or two columns
 * (each cell is at least 520px), so the hairlines never leave a ragged edge.
 */
export function ProjectsSection({ number }: NumberedSectionProps) {
  return (
    <Section
      id="work"
      title={projectsCopy.title}
      number={number}
      accessory={
        <span
          className={cn("rounded-full border border-line2 px-2.5 py-1 text-xs", accent.orange.text)}
        >
          {projectsCopy.privateLabel}
        </span>
      }
      subtitle={projectsCopy.subtitle}
    >
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,520px),1fr))] gap-px overflow-hidden rounded-xl border border-line bg-line">
        {projects.map((project) => (
          <li key={project.slug} className="bg-panel p-[22px] transition-colors hover:bg-panel2">
            <div className="mb-2 font-mono text-xs text-dim">private/{project.slug}</div>
            <h3 className="mb-2 text-lg font-semibold text-fg">{project.title}</h3>
            <p className="text-sm leading-relaxed text-mute">{project.description}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
