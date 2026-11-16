import { ResolvedThemeName } from "@/components/resolved-theme-name";
import { statusBar } from "@/content/status-bar";
import { accent } from "@/lib/accent";

// Read once at module load: the build year, since the page is a static export.
const year = new Date().getFullYear();

/**
 * The page's footer, styled as an editor's status bar. Server-rendered, with the copyright
 * year fixed at build time; only the theme name is a client component.
 */
export function StatusBar() {
  return (
    <footer className="border-t border-line font-mono text-[11px] text-dim">
      <div className="mx-auto flex max-w-[1240px] flex-wrap gap-x-[18px] gap-y-1 px-[clamp(16px,4vw,40px)] py-2.5">
        <span className={accent.green.text}>{statusBar.branch}</span>
        <span>{statusBar.host}</span>
        <span>{statusBar.copyright(year)}</span>
        <span className="ml-auto">
          {statusBar.encoding} · <ResolvedThemeName />
        </span>
      </div>
    </footer>
  );
}
