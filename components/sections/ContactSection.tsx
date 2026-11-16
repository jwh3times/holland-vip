import { Cta } from "@/components/ui/cta";
import { Section } from "@/components/ui/section";
import { contact } from "@/content/contact";
import { siteConfig } from "@/lib/site-config";

export function ContactSection() {
  return (
    <Section id="contact" title="Get In Touch" width="narrow" subtitle={contact.subtitle}>
      <Cta href={`mailto:${siteConfig.email}`}>{contact.ctaLabel}</Cta>
    </Section>
  );
}
