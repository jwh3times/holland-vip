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

/** The Terminal design's tokens (#245): the names every new component reads. */
const TERMINAL_TOKENS = [
  "--bg",
  "--panel",
  "--panel2",
  "--line",
  "--line2",
  "--fg",
  "--mute",
  "--dim",
  "--a-blue",
  "--a-purple",
  "--a-green",
  "--a-orange",
  "--heat0",
];

/** Surfaces text sits on, and the tokens that colour text. */
const SURFACES = ["--bg", "--panel", "--panel2"];
const TEXT_TOKENS = [
  "--fg",
  "--mute",
  "--dim",
  "--a-blue",
  "--a-purple",
  "--a-green",
  "--a-orange",
];

/**
 * The pre-Terminal token names, kept as aliases while sections are converted one
 * slice at a time. The final slice of #245 deletes every one of them, and this
 * list with them.
 */
const ROLLOUT_ALIASES = [
  "--background",
  "--foreground",
  "--muted",
  "--hero-background",
  "--card-blue",
  "--card-green",
  "--card-purple",
  "--card-orange",
  "--card-white",
  "--card-white-transparent",
  "--card-white-80",
  "--bento-gradient",
  "--heading-text",
  "--body-text",
  "--label-text",
  "--muted-text",
  "--badge-blue-text",
  "--badge-green-text",
  "--badge-purple-text",
  "--badge-orange-text",
];

/** The `@theme` block: Tailwind's interface, read by generated utilities, not by this file. */
function themeBlock(): string {
  return /@theme[^{]*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? "";
}

/** Every `--custom-property` declared in globals.css, outside `@theme`. */
function definedVariables(): string[] {
  const own = css.replace(themeBlock(), "");
  return [...new Set([...own.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((m) => m[1]))].sort();
}

/** The custom properties a theme block (`:root` or `.dark`) declares, by name. */
function themeTokens(selector: string): Map<string, string> {
  const block = new RegExp(`^  ${selector}\\s*\\{([\\s\\S]*?)\\n  \\}`, "m").exec(css)?.[1] ?? "";
  const tokens = new Map<string, string>();
  for (const m of block.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    tokens.set(m[1], m[2].replace(/\s+/g, " ").trim());
  }
  return tokens;
}

type Rgb = [number, number, number];

/** sRGB channels in 0–1 from a `#rrggbb` or `oklch(L C H)` token value. */
function parseColor(value: string): Rgb {
  const hex = /^#([0-9a-f]{6})$/i.exec(value);
  if (hex) return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16) / 255) as Rgb;

  const lch = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/.exec(value);
  if (!lch) throw new Error(`unparseable colour token: ${value}`);
  const [L, C, H] = lch.slice(1).map(Number);
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return linear.map((c) => {
    const x = Math.min(1, Math.max(0, c));
    return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
  }) as Rgb;
}

/** `color` at `alpha` composited over `base` — what `color-mix(…, transparent)` paints. */
function over(color: Rgb, alpha: number, base: Rgb): Rgb {
  return color.map((c, i) => c * alpha + base[i] * (1 - alpha)) as Rgb;
}

/** WCAG 2 contrast ratio. */
function contrast(x: Rgb, y: Rgb): number {
  const luminance = (rgb: Rgb) => {
    const [r, g, b] = rgb.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [hi, lo] = [luminance(x), luminance(y)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
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
    // Aliases are kept for unconverted callers until the final slice deletes them.
    const dead = definedVariables().filter(
      (name) => !ROLLOUT_ALIASES.includes(name) && !css.includes(`var(${name})`)
    );
    expect(dead, `unreferenced CSS variables in app/globals.css: ${dead.join(", ")}`).toEqual([]);
  });

  it("documents every utility class in the owning architecture reference", () => {
    const doc = "docs/architecture.md";
    const text = readFileSync(join(root, doc), "utf8");
    const undocumented = definedClasses().filter(
      (name) => !NOT_REFERENCED_IN_SOURCE.has(name) && !text.includes(name)
    );

    expect(undocumented, `${doc} is missing: ${undocumented.join(", ")}`).toEqual([]);
  });
});

describe("Terminal tokens", () => {
  const light = themeTokens(":root");
  const dark = themeTokens("\\.dark");

  it("declares the whole token set in both themes", () => {
    for (const [theme, tokens] of [
      ["light", light],
      ["dark", dark],
    ] as const) {
      const missing = TERMINAL_TOKENS.filter((name) => !tokens.has(name));
      expect(missing, `${theme} theme is missing: ${missing.join(", ")}`).toEqual([]);
    }
  });

  it("keeps every text token at WCAG AA on every surface, accent tints included", () => {
    const failures: string[] = [];
    for (const [theme, tokens] of [
      ["light", light],
      ["dark", dark],
    ] as const) {
      for (const surfaceName of SURFACES) {
        const surface = parseColor(tokens.get(surfaceName)!);
        for (const textName of TEXT_TOKENS) {
          const text = parseColor(tokens.get(textName)!);
          const backgrounds: [string, Rgb][] = [[surfaceName, surface]];
          // An accent also sits on its own tint: a chip, a bar, a selected row.
          if (textName.startsWith("--a-")) {
            backgrounds.push([`${textName} 14% over ${surfaceName}`, over(text, 0.14, surface)]);
          }
          for (const [label, background] of backgrounds) {
            const ratio = contrast(text, background);
            if (ratio < 4.5) failures.push(`${theme} ${textName} on ${label}: ${ratio.toFixed(2)}`);
          }
        }
      }
    }
    expect(failures, `below 4.5:1 — ${failures.join("; ")}`).toEqual([]);
  });

  it("keeps --dim visibly quieter than --mute in both themes", () => {
    for (const tokens of [light, dark]) {
      const bg = parseColor(tokens.get("--bg")!);
      const mute = contrast(parseColor(tokens.get("--mute")!), bg);
      const dim = contrast(parseColor(tokens.get("--dim")!), bg);
      expect(mute - dim).toBeGreaterThan(1);
    }
  });

  it("resolves every old token name through an alias to the new tokens", () => {
    const undeclared = ROLLOUT_ALIASES.filter((name) => !light.has(name));
    expect(undeclared, `aliases missing from :root: ${undeclared.join(", ")}`).toEqual([]);

    const stray = ROLLOUT_ALIASES.filter((name) => {
      const value = light.get(name)!;
      const refs = [...value.matchAll(/var\((--[a-z0-9-]+)\)/g)].map((m) => m[1]);
      // An alias is built only from the new tokens: no literal colour of its own.
      const literal = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch)\(/i.test(value);
      return literal || refs.length === 0 || refs.some((ref) => !TERMINAL_TOKENS.includes(ref));
    });
    expect(stray, `aliases not built from the new tokens: ${stray.join(", ")}`).toEqual([]);

    // Declared once on :root, so `.dark` swapping the new tokens recolours them too.
    const overridden = ROLLOUT_ALIASES.filter((name) => dark.has(name));
    expect(overridden, `aliases redeclared under .dark: ${overridden.join(", ")}`).toEqual([]);
  });

  it("exposes the tokens and the Geist fonts as Tailwind theme variables", () => {
    const theme = themeBlock();
    for (const name of TERMINAL_TOKENS) {
      expect(theme, `@theme is missing ${name}`).toContain(
        `--color-${name.slice(2)}: var(${name});`
      );
    }
    expect(theme).toMatch(/--font-sans:\s*var\(--font-geist-sans\)/);
    expect(theme).toMatch(/--font-mono:\s*var\(--font-geist-mono\)/);
  });
});
