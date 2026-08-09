import { Cta } from "@/components/ui/cta";
import { Section, type SectionSurfaceProps } from "@/components/ui/section";
import { contact } from "@/content/contact";
import { siteConfig } from "@/lib/site-config";

export function ContactSection({ surface }: SectionSurfaceProps) {
  return (
    <Section
      id="contact"
      title="Get In Touch"
      surface={surface}
      width="narrow"
      subtitle={contact.subtitle}
    >
      <Cta href={`mailto:${siteConfig.email}`}>{contact.ctaLabel}</Cta>
    </Section>
  );
}
