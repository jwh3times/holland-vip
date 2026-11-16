import { ModeToggle } from "@/components/mode-toggle";
import { NAV_SECTION_IDS, type NavSectionId } from "@/components/ui/section";
import { siteConfig } from "@/lib/site-config";

/**
 * Nav label for each linkable section, styled as a path in the prompt's working
 * directory. Typed as a total `Record` over `NavSectionId`, so adding a nav
 * section without a label — or labelling a section id that doesn't exist — is a
 * type error rather than a dead anchor.
 */
const navLabels: Record<NavSectionId, string> = {
  projects: "projects/",
  career: "career.log",
  impact: "impact.diff",
  work: "work/",
  contact: "contact.sh",
};

const navLinks = NAV_SECTION_IDS.map((id) => ({ href: `#${id}`, label: navLabels[id] }));

/**
 * The sticky 52px header: a shell prompt (the contact address, read as
 * `user@host`) linking to the top of the page, the section links, and the theme
 * toggle. On a narrow screen the link row scrolls sideways instead of collapsing
 * into a menu, so every link stays one tap away.
 */
export function Navigation() {
  return (
    <header className="sticky top-0 z-50 glass">
      <div className="mx-auto flex h-[52px] max-w-[1240px] items-center gap-5 px-[clamp(16px,4vw,40px)] font-mono text-[13px]">
        <a
          href="#top"
          className="flex items-center gap-2.5 whitespace-nowrap font-semibold text-fg"
        >
          <span aria-hidden="true" className="h-2 w-2 rounded-[2px] bg-a-green" />
          {/* One flex item, so the accessible name reads "<email>:~" unbroken. */}
          <span>
            {siteConfig.email}
            <span className="text-dim">:~</span>
          </span>
        </a>
        <nav aria-label="Sections" className="flex min-w-0 flex-1 gap-0.5 overflow-x-auto">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-md px-2.5 py-1.5 text-mute transition-colors hover:bg-panel2 hover:text-fg"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <ModeToggle />
      </div>
    </header>
  );
}
