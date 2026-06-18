import { cn } from "@/lib/utils";
import { FolderGit2, Star, ArrowUpRight } from "lucide-react";
import type { Repo } from "@/lib/github";
import type { ContributionCalendar } from "@/lib/github-contributions";
import { ContributionHeatmap } from "@/components/ContributionHeatmap";

/** Accent colors cycled per card, mirroring the site's blue/green/purple/orange palette. */
const accents = [
  {
    icon: "bg-blue-500/10 text-blue-600 ring-blue-500/20 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/25",
    dot: "bg-blue-500",
  },
  {
    icon: "bg-green-500/10 text-green-700 ring-green-500/20 dark:bg-green-500/15 dark:text-green-300 dark:ring-green-500/25",
    dot: "bg-green-500",
  },
  {
    icon: "bg-purple-500/10 text-purple-600 ring-purple-500/20 dark:bg-purple-500/15 dark:text-purple-300 dark:ring-purple-500/25",
    dot: "bg-purple-500",
  },
  {
    icon: "bg-orange-500/10 text-orange-700 ring-orange-500/20 dark:bg-orange-500/15 dark:text-orange-300 dark:ring-orange-500/25",
    dot: "bg-orange-500",
  },
] as const;

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

export function OpenSourceSection({
  repos,
  contributions,
}: {
  repos: Repo[];
  contributions?: ContributionCalendar;
}) {
  if (repos.length === 0) return null;

  return (
    <section id="open-source" className="section-surface py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-heading">
          Open Source
        </h2>
        <p className="text-center text-muted max-w-2xl mx-auto mb-12">
          Personal projects I build and maintain in the open — pulled live from GitHub.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
          {repos.map((repo, index) => {
            const accent = accents[index % accents.length];
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
                      accent.icon
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
                        className={cn("h-2.5 w-2.5 rounded-full", accent.dot)}
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
      </div>
    </section>
  );
}
