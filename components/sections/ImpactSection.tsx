import { Section, type NumberedSectionProps } from "@/components/ui/section";
import { capabilities } from "@/content/capabilities";
import { careerHighlights, impactCopy, technicalAchievements } from "@/content/impact";
import { challenges } from "@/content/problem-solving";
import { accent, type Accent } from "@/lib/accent";
import { cn } from "@/lib/utils";

/** A case's three blocks, in order: the problem reads in full colour, the response and result muted. */
const caseBlocks: { key: "challenge" | "solution" | "impact"; accent: Accent; muted: boolean }[] = [
  { key: "challenge", accent: "orange", muted: false },
  { key: "solution", accent: "blue", muted: true },
  { key: "impact", accent: "green", muted: true },
];

/**
 * Impact: Career Highlights, Problem-Solving Highlights as cases, Technical Capabilities and
 * Technical Achievements, in one section.
 */
export function ImpactSection({ number }: NumberedSectionProps) {
  const { groups } = impactCopy;

  return (
    <Section id="impact" title={impactCopy.title} number={number}>
      <h3 id="impact-highlights" className="sr-only">
        {groups.highlights}
      </h3>
      <ul
        aria-labelledby="impact-highlights"
        className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-3"
      >
        {careerHighlights.map((highlight) => (
          <li key={highlight.title} className="rounded-xl border border-line bg-panel p-[22px]">
            <div
              className={cn(
                "font-mono text-[clamp(36px,4vw,48px)] font-semibold tracking-[-0.03em]",
                accent[highlight.accent].text
              )}
            >
              {highlight.value}
            </div>
            <div className="mt-2 font-semibold text-fg">{highlight.title}</div>
            <div className="mt-1.5 text-[13px] leading-normal text-mute">
              {highlight.description}
            </div>
          </li>
        ))}
      </ul>

      <h3 id="impact-cases" className="sr-only">
        {groups.cases}
      </h3>
      <ul
        aria-labelledby="impact-cases"
        className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-5"
      >
        {challenges.map((item, index) => (
          <li
            key={item.challenge}
            className="flex flex-col gap-3.5 rounded-xl border border-line bg-panel p-5"
          >
            <div
              data-testid="case-header"
              className="flex items-baseline justify-between gap-2.5 font-mono"
            >
              <span className="text-xs text-dim">{impactCopy.caseLabel(index + 1)}</span>
              <span className={cn("text-[22px] font-semibold", accent.green.text)}>
                {item.metric}
              </span>
            </div>
            {caseBlocks.map(({ key, accent: blockAccent, muted }) => (
              <div
                key={key}
                data-block={key}
                className={cn("text-sm leading-[1.55]", muted ? "text-mute" : "text-fg")}
              >
                <span
                  className={cn("mb-0.5 block font-mono text-[11px]", accent[blockAccent].text)}
                >
                  {impactCopy.caseBlocks[key]}
                </span>
                {item[key]}
              </div>
            ))}
          </li>
        ))}
      </ul>

      <h3 id="impact-capabilities" className="sr-only">
        {groups.capabilities}
      </h3>
      <ul
        aria-labelledby="impact-capabilities"
        className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-5"
      >
        {capabilities.map((capability, index) => (
          <li
            key={capability.title}
            aria-labelledby={`impact-capability-${index}`}
            className={cn("border-t-2 pt-3.5", accent[capability.accent].outline)}
          >
            <h4 id={`impact-capability-${index}`} className="mb-2.5 font-semibold text-fg">
              {capability.title}
            </h4>
            <ul>
              {capability.items.map((item) => (
                <li
                  key={item}
                  className="mb-1.5 grid grid-cols-[22px_1fr] text-[13px] leading-normal text-mute"
                >
                  <span aria-hidden="true" className="font-mono text-dim">
                    ├─
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <h3 id="impact-achievements" className="sr-only">
        {groups.achievements}
      </h3>
      <ul
        aria-labelledby="impact-achievements"
        className="mt-7 grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-5"
      >
        {technicalAchievements.map((achievement, index) => (
          <li
            key={achievement.title}
            aria-labelledby={`impact-achievement-${index}`}
            className="rounded-xl border border-line bg-panel p-5"
          >
            <div
              aria-hidden="true"
              className={cn("mb-2 font-mono text-[11px]", accent[achievement.accent].text)}
            >
              {impactCopy.achievementLabel}
            </div>
            <h4
              id={`impact-achievement-${index}`}
              className="mb-2.5 text-[17px] font-semibold text-fg"
            >
              {achievement.title}
            </h4>
            <ul>
              {achievement.items.map((item) => (
                <li
                  key={item}
                  className="mb-1.5 grid grid-cols-[16px_1fr] text-[13px] leading-[1.55] text-mute"
                >
                  <span aria-hidden="true" className={accent[achievement.accent].bullet}>
                    ▸
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Section>
  );
}
