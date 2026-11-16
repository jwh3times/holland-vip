import { CareerLog, type CareerRole } from "@/components/career-log";
import { ContributionHeatmap } from "@/components/ContributionHeatmap";
import { Panel } from "@/components/ui/panel";
import { Section, type NumberedSectionProps } from "@/components/ui/section";
import { currentExplorations } from "@/content/about";
import { agentSkills, agentSkillsSource } from "@/content/agent-skills";
import { career } from "@/content/career";
import { educationRoot } from "@/content/education";
import { experiences } from "@/content/experience";
import { skillCategories } from "@/content/skills";
import { accent } from "@/lib/accent";
import type { ContributionCalendar } from "@/lib/github-contributions";
import { describeRole, timelineTicks, yearMonthOf } from "@/lib/role-dates";
import { cn } from "@/lib/utils";

/**
 * The build date's month: the static export evaluates this once, at build time, so durations and
 * the timeline's "now" refresh on each deploy, like `yearsOfExperience`.
 */
const buildMonth = yearMonthOf(new Date());

/** A category title as a `skills.json` key: "Frameworks & UI" → "frameworks_ui". */
const jsonKey = (title: string) => title.toLowerCase().replace(/ & /g, "_").replace(/\s+/g, "_");

function SkillsPanel() {
  return (
    <Panel
      title={career.skills.file}
      meta={<span>{career.skills.keys(skillCategories.length)}</span>}
    >
      <div className="px-[18px] py-4 font-mono text-[13px] leading-[1.9]">
        <div className="text-dim">{"{"}</div>
        {skillCategories.map((category) => {
          const tokens = accent[category.accent];
          return (
            <div key={category.title}>
              <div className="pl-[18px]">
                <span className={tokens.text}>&quot;{jsonKey(category.title)}&quot;</span>
                <span className="text-dim">: [</span>
              </div>
              <ul aria-label={category.title} className="flex flex-wrap gap-x-1.5 gap-y-1 pl-9">
                {category.skills.map((skill) => (
                  <li
                    key={skill}
                    className={cn("rounded px-[7px] text-fg transition-colors", tokens.chip)}
                  >
                    &quot;{skill}&quot;
                  </li>
                ))}
              </ul>
              <div className="pl-[18px] text-dim">],</div>
            </div>
          );
        })}
        <div className="text-dim">{"}"}</div>
      </div>
    </Panel>
  );
}

function AgentSkillsPanel() {
  return (
    <Panel
      title={career.agentSkills.command}
      meta={
        <a
          href={agentSkillsSource.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("hover:underline", accent.purple.text)}
        >
          {agentSkillsSource.repo} ↗
        </a>
      }
    >
      <ul className="py-2">
        {agentSkills.map((skill) => (
          <li
            key={skill.name}
            className="grid grid-cols-[minmax(96px,120px)_minmax(0,1fr)] gap-3 px-[18px] py-[7px] text-[13px] leading-normal transition-colors hover:bg-panel2"
          >
            <span className={cn("font-mono", accent.purple.text)}>{skill.name}/</span>
            <span className="text-mute">{skill.does}</span>
          </li>
        ))}
      </ul>
      <p className="border-t border-line px-[18px] pt-2.5 pb-3.5 text-[13px] leading-[1.55] text-mute">
        {agentSkillsSource.note.before}
        <code className="font-mono text-fg">{agentSkillsSource.note.code}</code>
        {agentSkillsSource.note.after}
      </p>
    </Panel>
  );
}

function ExplorationsPanel() {
  return (
    <div className="rounded-xl border border-line bg-panel p-[18px]">
      <p className="mb-3 font-mono text-xs text-dim">{career.exploring.heading}</p>
      <ul className="flex flex-wrap gap-2">
        {currentExplorations.map((exploration) => (
          <li
            key={exploration.label}
            className={cn(
              "rounded-md border border-dashed px-2.5 py-1.5 font-mono text-xs text-fg",
              accent[exploration.accent].outline
            )}
          >
            {career.exploring.marker} {exploration.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface CareerSectionProps extends NumberedSectionProps {
  /** The build-time contribution calendar, for the heatmap at the foot of the section. */
  contributions: ContributionCalendar;
}

/**
 * Career & stack: the timeline and `git log` (the section's one client component), the
 * `skills.json` inventory, the Agent Skills, Current Explorations and the contribution heatmap.
 * Role dates are derived here, against the build date, and handed to the client already formatted.
 */
export function CareerSection({ number, contributions }: CareerSectionProps) {
  const roles: CareerRole[] = experiences.map(
    ({ company, title, accent, hash, highlights, ...role }) => ({
      company,
      title,
      accent,
      hash,
      highlights,
      current: role.end === null,
      ...describeRole(role, buildMonth),
    })
  );

  return (
    <Section id="career" title={career.title} number={number}>
      <CareerLog
        roles={roles}
        ticks={timelineTicks(buildMonth)}
        root={educationRoot}
        aside={
          <>
            <SkillsPanel />
            <AgentSkillsPanel />
            <ExplorationsPanel />
          </>
        }
      />
      <div className="mt-5">
        <ContributionHeatmap calendar={contributions} />
      </div>
    </Section>
  );
}
