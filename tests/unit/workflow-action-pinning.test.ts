// @vitest-environment node
import { readFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * AGENTS.md makes SHA-pinned actions a non-negotiable constraint: a mutable
 * tag or branch lets a retagged or compromised upstream action reach a workflow
 * run. GitHub's own `sha_pinning_required` setting would enforce this at the
 * repository level; until that is enabled, this test is the enforcement.
 */
const WORKFLOW_DIR = resolve(".github/workflows");

/** `uses: owner/repo@<40-hex> # vX.Y.Z`, the only accepted remote form. */
const PINNED = /^uses: [^@\s]+@[0-9a-f]{40} # v\d+\.\d+\.\d+$/;

function workflowFiles(): string[] {
  return readdirSync(WORKFLOW_DIR).filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));
}

/** Every `uses:` value in a workflow, with its 1-based line number. */
function usesLines(file: string): { line: number; value: string }[] {
  const text = readFileSync(join(WORKFLOW_DIR, file), "utf8");
  return text
    .split("\n")
    .map((raw, i) => ({ line: i + 1, value: raw.trim().replace(/^-\s*/, "") }))
    .filter((entry) => entry.value.startsWith("uses:"));
}

describe("workflow action pinning", () => {
  it("finds workflows to check", () => {
    // Guards against the walk silently matching nothing and passing vacuously.
    expect(workflowFiles().length).toBeGreaterThan(0);
    expect(workflowFiles().flatMap(usesLines).length).toBeGreaterThan(0);
  });

  it("pins every remote action to a full commit SHA with a version comment", () => {
    const offenders = workflowFiles().flatMap((file) =>
      usesLines(file)
        // A local composite action is a path in this repository, already at
        // the reviewed commit — there is nothing to pin.
        .filter((entry) => !entry.value.startsWith("uses: ./"))
        .filter((entry) => !PINNED.test(entry.value))
        .map((entry) => `${file}:${entry.line}  ${entry.value}`)
    );

    expect(offenders).toEqual([]);
  });

  it("rejects a mutable tag or branch reference", () => {
    const mutable = workflowFiles().flatMap((file) =>
      usesLines(file)
        .filter((entry) => /@(v?\d+(\.\d+)*|main|master|latest)$/.test(entry.value))
        .map((entry) => `${file}:${entry.line}  ${entry.value}`)
    );

    expect(mutable).toEqual([]);
  });
});
