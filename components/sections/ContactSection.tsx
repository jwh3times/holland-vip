import { Cta } from "@/components/ui/cta";
import { siteConfig } from "@/lib/site-config";

export function ContactSection() {
  return (
    <section id="contact" className="section-surface-contrast py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-heading">Get In Touch</h2>
        <p className="text-lg text-muted mb-8">
          I&apos;m always open to discussing new opportunities, projects, or just having a chat
          about technology.
        </p>
        <Cta href={`mailto:${siteConfig.email}`}>Send Me an Email</Cta>
      </div>
    </section>
  );
}
