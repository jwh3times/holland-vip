import { cn } from "@/lib/utils";
import { FolderGit2, Star, ArrowUpRight } from "lucide-react";
import type { Repo } from "@/lib/github";
import type { ContributionCalendar } from "@/lib/github-contributions";
import { ContributionHeatmap } from "@/components/ContributionHeatmap";
import { Section, type SectionSurfaceProps } from "@/components/ui/section";
import { accent, accentAt } from "@/lib/accent";

/**
 * Formats a last-pushed ISO timestamp to a stable "Mon YYYY" label.
 *
 * Pinned to UTC + en-US so the build-time render is deterministic regardless of
 * the builder's locale/timezone (and matches in unit tests under jsdom/Node).
 */
function formatUpdated(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Renders the featured repos. Callers must not render this with an empty
 * `repos` list — `app/page.tsx` drops the section from its ordered list
 * instead, so a missing section can't re-phase the surface alternation below it.
 */
export function OpenSourceSection({
  repos,
  contributions,
  surface,
}: SectionSurfaceProps & {
  repos: Repo[];
  contributions?: ContributionCalendar;
}) {
  return (
    <Section
      id="open-source"
      title="Open Source"
      surface={surface}
      subtitle={<>Personal projects I build and maintain in the open — pulled live from GitHub.</>}
    >
      <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
        {repos.map((repo, index) => {
          const tokens = accent[accentAt(index)];
          return (
            <a
              key={repo.name}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-2xl p-6 card-bg-white border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div
                  className={cn(
                    "inline-flex h-11 w-11 items-center justify-center rounded-2xl ring-1 flex-shrink-0",
                    tokens.iconChip
                  )}
                >
                  <FolderGit2 className="h-5 w-5" />
                </div>
                <ArrowUpRight
                  className="h-5 w-5 text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </div>

              <h3 className="text-lg font-bold text-heading mb-2">{repo.name}</h3>
              {repo.description && (
                <p className="text-sm leading-relaxed text-muted mb-4 flex-grow">
                  {repo.description}
                </p>
              )}

              <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
                {repo.language && (
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className={cn("h-2.5 w-2.5 rounded-full", tokens.dot)}
                      aria-hidden="true"
                    />
                    {repo.language}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5" aria-hidden="true" />
                  {repo.stars}
                </span>
                <span>Updated {formatUpdated(repo.pushedAt)}</span>
              </div>
            </a>
          );
        })}
      </div>

      {contributions && (
        <div className="max-w-4xl mx-auto">
          <ContributionHeatmap calendar={contributions} />
        </div>
      )}
    </Section>
  );
}
