import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { geistMono, geistSans } from "@/app/fonts";
import RootLayout, { metadata, viewport } from "@/app/layout";

// Vitest runs from the repository root; jsdom gives import.meta.url an http: scheme.
const root = process.cwd();

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx|css|mjs)$/.test(entry.name) ? [full] : [];
  });
}

describe("RootLayout", () => {
  it("exports site metadata", () => {
    expect(metadata.title).toBeDefined();
    expect(metadata.description).toContain("Senior Software Engineer");
    expect(metadata.manifest).toBe("/manifest.json");
  });

  it("exports viewport configuration", () => {
    expect(viewport.themeColor).toBeDefined();
    expect(viewport.width).toBe("device-width");
  });

  it("builds the document shell around its children", () => {
    const tree = RootLayout({ children: <div>page body</div> });
    expect(tree).toBeTruthy();
    expect(tree.type).toBe("html");
  });

  it("puts the Geist font variables on <html> for the --font-sans / --font-mono theme", () => {
    const { className } = RootLayout({ children: <div>page body</div> }).props as {
      className: string;
    };
    expect(className).toContain(geistSans.variable);
    expect(className).toContain(geistMono.variable);
    expect(geistSans.variable).not.toBe(geistMono.variable);
  });

  it("loads fonts only from the local geist package, never a font CDN", () => {
    // next/font/google downloads at build time; the static export must build offline.
    const sources = ["app", "components", "lib"].flatMap((dir) => sourceFiles(join(root, dir)));
    const offenders = sources.filter((file) =>
      /next\/font\/google|fonts\.googleapis|fonts\.gstatic/.test(readFileSync(file, "utf8"))
    );
    expect(offenders).toEqual([]);
  });
});
