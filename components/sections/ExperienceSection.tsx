import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Section, type SectionSurfaceProps } from "@/components/ui/section";
import { experiences } from "@/content/experience";
import { accent } from "@/lib/accent";
import { cn } from "@/lib/utils";

export function ExperienceSection({ surface }: SectionSurfaceProps) {
  return (
    <Section id="experience" title="Professional Experience" surface={surface}>
      <div className="max-w-4xl mx-auto">
        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[linear-gradient(to_bottom,var(--color-blue-500),var(--color-purple-500),var(--color-green-500),var(--color-orange-500))]"></div>

          {experiences.map((exp, index) => {
            const colors = accent[exp.accent];
            return (
              <div
                key={exp.company}
                className={cn("relative ml-20", index < experiences.length - 1 && "mb-12")}
              >
                <div
                  className={cn(
                    "absolute -left-[3.25rem] top-2 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 ring-4",
                    colors.dot,
                    colors.ring
                  )}
                ></div>
                <Card className="card-bg-white-80 backdrop-blur-sm shadow-none hover:shadow-xl">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-heading">{exp.title}</h3>
                    {exp.isCurrent && <Badge accent="blue">Current</Badge>}
                  </div>
                  <div className="text-base font-semibold text-label mb-2">{exp.company}</div>
                  <div className="text-sm text-muted mb-4">
                    {exp.period} • {exp.location}
                  </div>
                  <ul className="space-y-2 text-sm text-muted">
                    {exp.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start">
                        <span className={cn("mr-2", colors.bullet)}>▸</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
