import { Cta } from "@/components/ui/cta";
import { Section, type SectionSurfaceProps } from "@/components/ui/section";
import { siteConfig } from "@/lib/site-config";

export function ContactSection({ surface }: SectionSurfaceProps) {
  return (
    <Section
      id="contact"
      title="Get In Touch"
      surface={surface}
      width="narrow"
      subtitle={
        <>
          I&apos;m always open to discussing new opportunities, projects, or just having a chat
          about technology.
        </>
      }
    >
      <Cta href={`mailto:${siteConfig.email}`}>Send Me an Email</Cta>
    </Section>
  );
}
