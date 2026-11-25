// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Each npm group in `.github/dependabot.yml` exists to keep a peer-locked
 * family on one major line. A group whose patterns match no dependency is dead
 * config: it documents a family the repository no longer has and misleads the
 * Dependabot review into looking for PRs that can never arrive.
 */
const CONFIG = resolve(".github/dependabot.yml");
const MANIFEST = resolve("package.json");

interface GroupPattern {
  group: string;
  pattern: string;
  line: number;
}

/**
 * The `patterns:` entries of every group in the npm update block, read line by
 * line as `workflow-action-pinning.test.ts` reads workflows: the config is
 * hand-written YAML with one quoted pattern per line.
 */
function npmGroupPatterns(): GroupPattern[] {
  const lines = readFileSync(CONFIG, "utf8").split("\n");
  const found: GroupPattern[] = [];
  let inNpm = false;
  let group: string | undefined;
  let inPatterns = false;

  lines.forEach((raw, i) => {
    const text = raw.replace(/\r$/, "");
    const ecosystem = /^\s*- package-ecosystem: "([^"]+)"/.exec(text);
    if (ecosystem) {
      inNpm = ecosystem[1] === "npm";
      group = undefined;
      inPatterns = false;
      return;
    }
    if (!inNpm) return;

    const groupName = /^ {6}([\w-]+):\s*$/.exec(text);
    if (groupName) {
      group = groupName[1];
      inPatterns = false;
      return;
    }
    if (/^ {8}patterns:\s*$/.test(text)) {
      inPatterns = true;
      return;
    }
    if (/^ {8}\S/.test(text)) {
      inPatterns = false;
      return;
    }
    const entry = /^ {10}- "([^"]+)"\s*$/.exec(text);
    if (group && inPatterns && entry) {
      found.push({ group, pattern: entry[1], line: i + 1 });
    }
  });

  return found;
}

function declaredDependencies(): string[] {
  const manifest = JSON.parse(readFileSync(MANIFEST, "utf8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  return Object.keys({ ...manifest.dependencies, ...manifest.devDependencies });
}

/** Dependabot patterns use `*` as the only wildcard. */
function matches(pattern: string, name: string): boolean {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`).test(name);
}

describe("dependabot npm groups", () => {
  it("finds group patterns to check", () => {
    // Guards against the parser silently matching nothing and passing vacuously.
    const groups = new Set(npmGroupPatterns().map((p) => p.group));
    expect(groups).toContain("next-ecosystem");
    expect(groups).toContain("minor-and-patch");
  });

  it("matches a pattern against the whole package name", () => {
    // Unanchored, `vite` would match `vitest` and hide a dead group.
    expect(matches("vite", "vitest")).toBe(false);
    expect(matches("@next/*", "@next/env")).toBe(true);
    expect(matches("@next/*", "next")).toBe(false);
  });

  it("matches at least one declared dependency with every group", () => {
    // Per group, not per pattern: a live family may name a member it does not
    // install yet (`@next/*`, `vite`) so the member joins the family on arrival.
    const deps = declaredDependencies();
    const byGroup = new Map<string, GroupPattern[]>();
    for (const p of npmGroupPatterns()) {
      byGroup.set(p.group, [...(byGroup.get(p.group) ?? []), p]);
    }
    const dead = [...byGroup.entries()]
      .filter(([, patterns]) =>
        patterns.every((p) => !deps.some((name) => matches(p.pattern, name)))
      )
      .map(([group, patterns]) => `dependabot.yml:${patterns[0].line}  ${group}`);

    expect(dead).toEqual([]);
  });
});
