import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Section, type SectionSurfaceProps } from "@/components/ui/section";
import {
  bio,
  careerHighlights,
  technicalAchievements,
  exploringTags,
  exploringHeading,
  achievementsHeading,
} from "@/content/about";
import { accent } from "@/lib/accent";
import { cn } from "@/lib/utils";

export function AboutSection({ surface }: SectionSurfaceProps) {
  return (
    <Section id="about" title="About Me" surface={surface}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          {bio.map((paragraph, index) => (
            <p
              key={paragraph.slice(0, 40)}
              className={cn("text-lg text-muted leading-relaxed", index < bio.length - 1 && "mb-6")}
            >
              {paragraph}
            </p>
          ))}

          {/* Currently exploring */}
          <div className="mt-10">
            <p className="text-sm font-semibold text-label mb-3">{exploringHeading}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {exploringTags.map((tag) => (
                <Badge key={tag.label} accent={tag.accent}>
                  {tag.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Career Highlights */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {careerHighlights.map((highlight) => (
            <Card key={highlight.title} accent={highlight.accent}>
              <div className={cn("text-3xl font-bold mb-2", accent[highlight.accent].text)}>
                {highlight.value}
              </div>
              <div className="text-sm font-semibold text-label mb-1">{highlight.title}</div>
              <div className="text-xs text-muted">{highlight.description}</div>
            </Card>
          ))}
        </div>

        {/* Recent Technical Achievements */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-heading">
            {achievementsHeading}
          </h3>
          <div className="space-y-6">
            {technicalAchievements.map((achievement) => (
              <Card key={achievement.title} accent={achievement.accent}>
                <h4 className={cn("text-xl font-bold mb-3", accent[achievement.accent].text)}>
                  {achievement.title}
                </h4>
                <ul className="space-y-2 text-muted">
                  {achievement.items.map((item) => (
                    <li key={item} className="flex items-start">
                      <span className={cn("mr-2", accent[achievement.accent].bullet)}>▸</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
