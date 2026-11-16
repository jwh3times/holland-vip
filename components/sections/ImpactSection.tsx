import type * as React from "react";

import { Section, type NumberedSectionProps } from "@/components/ui/section";
import { capabilities } from "@/content/capabilities";
import { careerHighlights, impactCopy, technicalAchievements } from "@/content/impact";
import { challenges } from "@/content/problem-solving";
import { accent, type Accent } from "@/lib/accent";
import { cn } from "@/lib/utils";

type CaseBlock = keyof typeof impactCopy.caseBlocks;

/**
 * How each of a case's blocks is drawn, in render order: the label's accent, and whether the text
 * is muted. The problem reads in full colour; the response and the result are muted.
 */
const caseBlockStyles: { block: CaseBlock; accent: Accent; muted: boolean }[] = [
  { block: "challenge", accent: "orange", muted: false },
  { block: "solution", accent: "blue", muted: true },
  { block: "impact", accent: "green", muted: true },
];

const panelSurface = "rounded-xl border border-line bg-panel";

/** One of Impact's four groups: a list named by a heading only screen readers hear. */
function ImpactGroup({
  id,
  name,
  className,
  children,
}: {
  id: string;
  name: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <h3 id={id} className="sr-only">
        {name}
      </h3>
      <ul aria-labelledby={id} className={cn("grid gap-5", className)}>
        {children}
      </ul>
    </>
  );
}

/** A muted list whose items each sit beside a decorative glyph. */
function GlyphList({
  items,
  glyph,
  glyphClassName,
  columns,
}: {
  items: string[];
  glyph: string;
  glyphClassName: string;
  /** The grid template: the glyph's column, then the text's. */
  columns: string;
}) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item} className={cn("mb-1.5 grid text-[13px] leading-[1.55] text-mute", columns)}>
          <span aria-hidden="true" className={glyphClassName}>
            {glyph}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Impact: Career Highlights, Problem-Solving Highlights as cases, Technical Capabilities and
 * Technical Achievements, in one section.
 */
export function ImpactSection({ number }: NumberedSectionProps) {
  const { groups } = impactCopy;

  return (
    <Section id="impact" title={impactCopy.title} number={number}>
      <ImpactGroup
        id="impact-highlights"
        name={groups.highlights}
        className="grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-3"
      >
        {careerHighlights.map((highlight) => (
          <li key={highlight.title} className={cn(panelSurface, "p-[22px]")}>
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
      </ImpactGroup>

      <ImpactGroup
        id="impact-cases"
        name={groups.cases}
        className="mt-5 grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))]"
      >
        {challenges.map((item, index) => (
          <li key={item.challenge} className={cn(panelSurface, "flex flex-col gap-3.5 p-5")}>
            <div
              data-testid="case-header"
              className="flex items-baseline justify-between gap-2.5 font-mono"
            >
              <span className="text-xs text-dim">{impactCopy.caseLabel(index + 1)}</span>
              <span className={cn("text-[22px] font-semibold", accent.green.text)}>
                {item.metric}
              </span>
            </div>
            {caseBlockStyles.map(({ block, accent: labelAccent, muted }) => (
              <div
                key={block}
                data-testid="case-block"
                className={cn("text-sm leading-[1.55]", muted ? "text-mute" : "text-fg")}
              >
                <span
                  className={cn("mb-0.5 block font-mono text-[11px]", accent[labelAccent].text)}
                >
                  {impactCopy.caseBlocks[block]}
                </span>
                {item[block]}
              </div>
            ))}
          </li>
        ))}
      </ImpactGroup>

      <ImpactGroup
        id="impact-capabilities"
        name={groups.capabilities}
        className="mt-5 grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))]"
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
            <GlyphList
              items={capability.items}
              glyph="├─"
              glyphClassName="font-mono text-dim"
              columns="grid-cols-[22px_1fr]"
            />
          </li>
        ))}
      </ImpactGroup>

      <ImpactGroup
        id="impact-achievements"
        name={groups.achievements}
        className="mt-7 grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))]"
      >
        {technicalAchievements.map((achievement, index) => (
          <li
            key={achievement.title}
            aria-labelledby={`impact-achievement-${index}`}
            className={cn(panelSurface, "p-5")}
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
            <GlyphList
              items={achievement.items}
              glyph="▸"
              glyphClassName={accent[achievement.accent].bullet}
              columns="grid-cols-[16px_1fr]"
            />
          </li>
        ))}
      </ImpactGroup>
    </Section>
  );
}
