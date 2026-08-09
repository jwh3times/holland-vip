import { Cta } from "@/components/ui/cta";
import { hero } from "@/content/hero";
import { socialLinks } from "@/lib/site-config";

export function HeroSection() {
  const [primary, secondary] = hero.ctas;

  return (
    <section className="relative overflow-hidden hero-section transition-colors duration-300">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50 dark:opacity-20"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fadeInUp text-heading">
            {hero.greeting} <span className="gradient-text">{hero.name}</span>
          </h1>
          <p className="text-2xl md:text-3xl text-subheading mb-6 animate-fadeInUp font-semibold">
            {hero.tagline}
          </p>
          <p className="text-lg md:text-xl text-muted max-w-3xl mx-auto mb-10 animate-fadeInUp leading-relaxed">
            {hero.blurb}
          </p>

          {/* Social Links */}
          <div className="flex gap-8 justify-center mb-12 animate-fadeInUp">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:scale-125 transform"
                aria-label={social.label}
              >
                <social.icon className="w-10 h-10" />
              </a>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 justify-center animate-fadeInUp">
            <Cta href={primary.href} size="lg">
              {primary.label}
            </Cta>
            <Cta href={secondary.href} variant="secondary" size="lg">
              {secondary.label}
            </Cta>
          </div>
        </div>
      </div>
    </section>
  );
}
