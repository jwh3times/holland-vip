import { Card } from "@/components/ui/card";
import { Section, type SectionSurfaceProps } from "@/components/ui/section";
import { challenges, challengeRows } from "@/content/problem-solving";
import { cn } from "@/lib/utils";

interface ChallengeItemProps {
  icon: string;
  title: string;
  description: string;
  bgColor: string;
}

function ChallengeItem({ icon, title, description, bgColor }: ChallengeItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={cn(
          "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
          bgColor
        )}
      >
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold text-heading mb-2">{title}</h3>
        <p className="text-label">{description}</p>
      </div>
    </div>
  );
}

export function ProblemSolving({ surface }: SectionSurfaceProps) {
  return (
    <Section title="Problem-Solving Highlights" surface={surface}>
      <div className="max-w-5xl mx-auto space-y-8">
        {challenges.map((item) => (
          <Card key={item.challenge} padding="lg" interactive>
            <div className="space-y-4">
              {challengeRows.map((row) => (
                <ChallengeItem
                  key={row.key}
                  icon={row.icon}
                  title={row.title}
                  description={item[row.key]}
                  bgColor={row.bgColor}
                />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
