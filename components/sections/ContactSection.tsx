import { Cta } from "@/components/ui/cta";
import { Section, type NumberedSectionProps } from "@/components/ui/section";
import { contact } from "@/content/contact";
import { siteConfig } from "@/lib/site-config";

export function ContactSection({ number }: NumberedSectionProps) {
  return (
    <Section
      id="contact"
      title="Get In Touch"
      number={number}
      width="narrow"
      subtitle={contact.subtitle}
    >
      <Cta href={`mailto:${siteConfig.email}`}>{contact.ctaLabel}</Cta>
    </Section>
  );
}
