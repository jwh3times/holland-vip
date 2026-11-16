import { HobbyProjectCard } from "@/components/hobby-project-card";
import { Section, type NumberedSectionProps } from "@/components/ui/section";
import { hobbyProjects, hobbyProjectsCopy } from "@/content/hobby-projects";
import { accent } from "@/lib/accent";
import type { Repo } from "@/lib/github";
import { cn } from "@/lib/utils";

/**
 * The Hobby Projects: one card per project in `content/hobby-projects.ts`, always. `repos` holds
 * whatever repository data the build could disclose; a card whose repository is missing from it
 * (unavailable, rejected, or absent from the fallback) renders without its metadata line.
 */
export function HobbyProjectsSection({ number, repos }: NumberedSectionProps & { repos: Repo[] }) {
  const repoByName = new Map(repos.map((repo) => [repo.name, repo]));
  const { more } = hobbyProjectsCopy;

  return (
    <Section
      id="projects"
      title={hobbyProjectsCopy.title}
      number={number}
      accessory={hobbyProjectsCopy.hint}
      subtitle={
        <>
          {hobbyProjectsCopy.subtitle}{" "}
          <a
            href={more.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("font-mono text-[13px] hover:underline", accent.green.text)}
          >
            {more.label}
          </a>
        </>
      }
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,520px),1fr))] gap-5">
        {hobbyProjects.map((project) => {
          const repo = repoByName.get(project.repo);
          return (
            <HobbyProjectCard
              key={project.slug}
              project={project}
              meta={repo ? hobbyProjectsCopy.meta(repo) : undefined}
            />
          );
        })}
      </div>
    </Section>
  );
}
