import { Section, type NumberedSectionProps } from "@/components/ui/section";
import { bio } from "@/content/about";
import { cn } from "@/lib/utils";

/** The Biography. Its Career Highlights and Technical Achievements render in Impact. */
export function AboutSection({ number }: NumberedSectionProps) {
  return (
    <Section id="about" title="About Me" number={number}>
      <div className="max-w-4xl mx-auto text-center">
        {bio.map((paragraph, index) => (
          <p
            key={paragraph.slice(0, 40)}
            className={cn("text-lg text-muted leading-relaxed", index < bio.length - 1 && "mb-6")}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </Section>
  );
}
