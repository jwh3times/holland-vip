import { Card } from "@/components/ui/card";
import { Section, type SectionSurfaceProps } from "@/components/ui/section";
import { capabilities } from "@/content/capabilities";
import { accent } from "@/lib/accent";
import { cn } from "@/lib/utils";

export function TechnicalCapabilities({ surface }: SectionSurfaceProps) {
  return (
    <Section title="Technical Capabilities" surface={surface}>
      <div className="max-w-6xl mx-auto space-y-8">
        {capabilities.map((capability) => (
          <Card key={capability.title}>
            <h3 className={cn("text-2xl font-bold mb-4", accent[capability.accent].text)}>
              {capability.title}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {capability.items.map((item) => (
                <div key={item} className="flex items-start">
                  <span className={cn("mr-2 text-xl", accent[capability.accent].bullet)}>•</span>
                  <span className="text-label">{item}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
