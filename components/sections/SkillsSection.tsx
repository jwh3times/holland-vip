import { Section, type SectionSurfaceProps } from "@/components/ui/section";
import { skillCategories } from "@/content/skills";
import { accent } from "@/lib/accent";
import { cn } from "@/lib/utils";

function SkillBadge({ skill }: { skill: string }) {
  return (
    <div className="rounded-xl p-4 text-center shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl card-bg-white-transparent ring-1 ring-inset ring-gray-200/70 dark:ring-blue-500/40">
      <p className="text-sm font-semibold text-badge">{skill}</p>
    </div>
  );
}

export function SkillsSection({ surface }: SectionSurfaceProps) {
  return (
    <Section id="skills" title="Skills & Technologies" surface={surface}>
      <div className="max-w-6xl mx-auto space-y-12">
        {skillCategories.map((category) => (
          <div key={category.title}>
            <h3
              className={cn("text-xl font-semibold mb-4 text-center", accent[category.accent].text)}
            >
              {category.title}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {category.skills.map((skill) => (
                <SkillBadge key={skill} skill={skill} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
