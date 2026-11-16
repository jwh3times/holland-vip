import { Cta } from "@/components/ui/cta";
import type { SectionId } from "@/components/ui/section";
import { contact } from "@/content/contact";
import { accent } from "@/lib/accent";
import { siteConfig, socialLinks } from "@/lib/site-config";

/**
 * Contact: the `./contact.sh` prompt, the address as one large mailto link, and the social
 * buttons. Unnumbered. The prompt stands in for a heading on screen, so the `h2` is for
 * screen readers only.
 */
export function ContactSection() {
  return (
    <section
      id={"contact" satisfies SectionId}
      aria-labelledby="contact-heading"
      className="border-t border-line"
    >
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-[clamp(16px,4vw,40px)] py-[clamp(56px,8vw,96px)]">
        <h2 id="contact-heading" className="sr-only">
          {contact.title}
        </h2>
        <div aria-hidden="true" className="font-mono text-sm text-dim">
          {contact.prompt}
        </div>
        <a
          href={`mailto:${siteConfig.email}`}
          className="w-fit rounded-lg text-[clamp(36px,7vw,84px)] leading-none font-bold tracking-[-0.04em] [overflow-wrap:anywhere] text-fg transition-colors hover:text-a-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-a-blue"
        >
          {siteConfig.email}
          <span aria-hidden="true" className={accent.green.text}>
            ↗
          </span>
        </a>
        <p className="max-w-[560px] leading-normal text-mute">{contact.subtitle}</p>
        <div className="flex flex-wrap gap-2.5">
          {socialLinks.map(({ href, label }) => (
            <Cta key={href} href={href} variant="secondary" size="sm">
              {label}
            </Cta>
          ))}
        </div>
      </div>
    </section>
  );
}
