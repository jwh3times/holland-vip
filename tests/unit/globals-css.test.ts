// @vitest-environment node
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Guards the `app/globals.css` interface.
 *
 * The custom utility classes there are a vocabulary every component author has
 * to learn, and dead entries are invisible — an architecture review once found
 * five classes and four `@keyframes` blocks with zero callers, plus two unused
 * CSS variables. This test makes that condition fail the build instead of
 * needing another audit.
 */

const root = fileURLToPath(new URL("../..", import.meta.url));
const css = readFileSync(join(root, "app", "globals.css"), "utf8");

/**
 * Selectors that exist for reasons a usage scan can't see:
 * - `dark` is applied to <html> by next-themes, never written in our JSX.
 */
const NOT_REFERENCED_IN_SOURCE = new Set(["dark"]);

/** Every `.class-name` defined as a rule in globals.css. */
function definedClasses(): string[] {
  const names = new Set<string>();
  for (const match of css.matchAll(/^\s*\.([A-Za-z][A-Za-z0-9_-]*)[^{]*\{/gm)) {
    names.add(match[1]);
  }
  // `.dark .glass` — pick up the descendant selector's parts too.
  for (const match of css.matchAll(
    /^\s*\.([A-Za-z][A-Za-z0-9_-]*)\s+\.([A-Za-z][A-Za-z0-9_-]*)/gm
  )) {
    names.add(match[1]);
    names.add(match[2]);
  }
  return [...names].sort();
}

/** Every `@keyframes name` defined in globals.css. */
function definedKeyframes(): string[] {
  return [...css.matchAll(/@keyframes\s+([A-Za-z][A-Za-z0-9_-]*)/g)].map((m) => m[1]).sort();
}

/** Every `--custom-property` declared in globals.css. */
function definedVariables(): string[] {
  return [...new Set([...css.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((m) => m[1]))].sort();
}

/** All source text that could reference a class or variable. */
function sourceText(): string {
  const dirs = ["app", "components", "lib", "content"];
  const parts: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|tsx|mjs)$/.test(entry.name)) parts.push(readFileSync(full, "utf8"));
    }
  };
  for (const dir of dirs) walk(join(root, dir));
  return parts.join("\n");
}

const source = sourceText();

describe("globals.css interface", () => {
  it("has no utility class without a caller", () => {
    const dead = definedClasses().filter((name) => {
      if (NOT_REFERENCED_IN_SOURCE.has(name)) return false;
      // Match the class as a whole word inside a class string.
      return !new RegExp(`[\\s"'\`]${name}[\\s"'\`]`).test(source);
    });
    expect(dead, `dead classes in app/globals.css: ${dead.join(", ")}`).toEqual([]);
  });

  it("has no @keyframes without an animation that uses it", () => {
    const dead = definedKeyframes().filter(
      (name) => !new RegExp(`animation:\\s*${name}\\b`).test(css)
    );
    expect(dead, `dead @keyframes in app/globals.css: ${dead.join(", ")}`).toEqual([]);
  });

  it("has no CSS variable that nothing reads", () => {
    const dead = definedVariables().filter((name) => !css.includes(`var(${name})`));
    expect(dead, `unreferenced CSS variables in app/globals.css: ${dead.join(", ")}`).toEqual([]);
  });

  it("documents every utility class in the files agents are told to read", () => {
    // The class list is restated in CLAUDE.md and AGENTS.md. It has drifted
    // before — 8 of 30 classes were undocumented in both. Keep them honest.
    for (const doc of ["CLAUDE.md", "AGENTS.md"]) {
      const text = readFileSync(join(root, doc), "utf8");
      const undocumented = definedClasses().filter(
        (name) => !NOT_REFERENCED_IN_SOURCE.has(name) && !text.includes(name)
      );
      expect(undocumented, `${doc} is missing: ${undocumented.join(", ")}`).toEqual([]);
    }
  });

  it("defines no two text tokens with identical values in both themes", () => {
    // `.text-badge` and `.text-subheading` were byte-identical aliases of
    // `.text-heading`, so callers had three names for one colour and no way to
    // tell them apart. Keep the vocabulary honest.
    const themeBlock = (selector: string) => {
      const match = new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\n  \\}`).exec(css);
      return match ? match[1] : "";
    };
    const values = (block: string) => {
      const out = new Map<string, string>();
      for (const m of block.matchAll(/(--[a-z-]*text[a-z-]*)\s*:\s*([^;]+);/g)) {
        out.set(m[1], m[2].trim());
      }
      return out;
    };

    const light = values(themeBlock(":root"));
    const dark = values(themeBlock("\\.dark"));
    expect(light.size).toBeGreaterThan(0);

    const seen = new Map<string, string>();
    const aliases: string[] = [];
    for (const [name, lightValue] of light) {
      const key = `${lightValue}|${dark.get(name) ?? ""}`;
      const previous = seen.get(key);
      if (previous) aliases.push(`${name} duplicates ${previous}`);
      else seen.set(key, name);
    }
    expect(aliases, `text tokens with identical values: ${aliases.join("; ")}`).toEqual([]);
  });
});
