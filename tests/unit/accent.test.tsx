import { describe, it, expect } from "vitest";

import { accent, ACCENTS, type AccentTokens } from "@/lib/accent";

const TOKEN_KEYS: (keyof AccentTokens)[] = [
  "text",
  "bullet",
  "dot",
  "bar",
  "glow",
  "outline",
  "chip",
  "shadow",
  "activeShadow",
];

/** The tinted fill `color-mix` writes, as a Tailwind arbitrary value: `var(--a-X)` at `pct`. */
const tint = (key: string, pct: number) =>
  `[color-mix(in_oklch,var(--a-${key})_${pct}%,transparent)]`;

describe("accent table", () => {
  it("defines every token for every accent", () => {
    for (const key of ACCENTS) {
      for (const token of TOKEN_KEYS) {
        expect(accent[key][token], `${key}.${token}`).toBeTruthy();
      }
    }
  });

  it("gives each accent a distinct value for every token", () => {
    for (const token of TOKEN_KEYS) {
      const values = ACCENTS.map((key) => accent[key][token]);
      expect(new Set(values).size, `${token} collides across accents`).toBe(ACCENTS.length);
    }
  });

  it("names the accent's own colour in each token", () => {
    // Guards against a copy-paste slip like green.dot === "bg-blue-500".
    for (const key of ACCENTS) {
      for (const token of TOKEN_KEYS) {
        expect(accent[key][token], `${key}.${token}`).toContain(key);
      }
    }
  });
});

describe("accent table on the Terminal tokens", () => {
  it("colours every token from the accent's --a-* variable, never a Tailwind palette shade", () => {
    for (const key of ACCENTS) {
      for (const token of TOKEN_KEYS) {
        const value = accent[key][token];
        expect(value, `${key}.${token}`).not.toMatch(/-(blue|green|purple|orange)-\d{2,3}\b/);
        expect(value, `${key}.${token}`).toMatch(new RegExp(`a-${key}\\b`));
      }
    }
  });

  it("tints at 12% for chips, 14% for bars, 30% for hover and 55% for the border glow", () => {
    for (const key of ACCENTS) {
      expect(accent[key].chip).toContain(`bg-${tint(key, 12)}`);
      expect(accent[key].chip).toContain(`hover:bg-${tint(key, 30)}`);
      expect(accent[key].bar).toContain(`bg-${tint(key, 14)}`);
      expect(accent[key].glow).toContain(`border-${tint(key, 55)}`);
    }
  });

  it("sets accent text and solids from the variable itself", () => {
    for (const key of ACCENTS) {
      expect(accent[key].text).toBe(`text-a-${key}`);
      expect(accent[key].dot).toBe(`bg-a-${key}`);
    }
  });
});
