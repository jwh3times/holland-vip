// @vitest-environment node
import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { syncAll } from "../../scripts/lib/agent-sync.mjs";

const createdRoots: string[] = [];

afterEach(() => {
  for (const root of createdRoots) rmSync(root, { recursive: true, force: true });
  createdRoots.length = 0;
});

function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), "agent-sync-"));
  createdRoots.push(root);
  const paths = {
    repoRoot: root,
    skillSources: join(root, ".agents", "skills"),
    claudeSkills: join(root, ".claude", "skills"),
    claudeAgents: join(root, ".claude", "agents"),
    codexAgents: join(root, ".codex", "agents"),
  };
  mkdirSync(join(paths.skillSources, "demo"), { recursive: true });
  mkdirSync(paths.claudeAgents, { recursive: true });
  writeFileSync(
    join(paths.skillSources, "demo", "SKILL.md"),
    "---\nname: demo\ndescription: Demo skill.\n---\n\nDo the thing.\n"
  );
  writeFileSync(
    join(paths.claudeAgents, "helper.md"),
    "---\nname: helper\ndescription: Helper agent.\ntools: Read, Write\n---\n\nHelp with things.\n"
  );
  return paths;
}

describe("syncAll", () => {
  it("generates the skill mirror and agent TOML, then reports in sync", () => {
    const paths = makeFixture();
    const first = syncAll({ paths });
    expect(first.changed.length).toBe(2);

    const skill = readFileSync(join(paths.claudeSkills, "demo", "SKILL.md"), "utf8");
    expect(skill.split("\n")[1]).toContain("GENERATED — do not edit");
    expect(skill.split("\n")[1]).toContain(".agents/skills/demo/SKILL.md");

    const toml = readFileSync(join(paths.codexAgents, "helper.toml"), "utf8");
    expect(toml).toContain('name = "helper"');
    expect(toml).toContain('sandbox_mode = "workspace-write"');

    const check = syncAll({ paths, check: true });
    expect(check.changed).toEqual([]);
    expect(check.stale).toEqual([]);
  });

  it("detects a modified artifact in check mode without writing", () => {
    const paths = makeFixture();
    syncAll({ paths });
    writeFileSync(join(paths.codexAgents, "helper.toml"), "tampered\n");
    const check = syncAll({ paths, check: true });
    expect(check.changed).toContain(join(paths.codexAgents, "helper.toml"));
    expect(readFileSync(join(paths.codexAgents, "helper.toml"), "utf8")).toBe("tampered\n");
  });

  it("flags then removes extraneous output files", () => {
    const paths = makeFixture();
    syncAll({ paths });
    const orphan = join(paths.codexAgents, "orphan.toml");
    writeFileSync(orphan, "old\n");
    expect(syncAll({ paths, check: true }).stale).toContain(orphan);
    expect(existsSync(orphan)).toBe(true); // check mode must not delete
    syncAll({ paths }); // write mode prunes it
    expect(existsSync(orphan)).toBe(false);
  });

  it("prunes a mirrored skill once its source directory is gone", () => {
    const paths = makeFixture();
    syncAll({ paths });
    const mirrored = join(paths.claudeSkills, "demo", "SKILL.md");
    expect(existsSync(mirrored)).toBe(true);

    rmSync(join(paths.skillSources, "demo"), { recursive: true });
    expect(syncAll({ paths, check: true }).stale).toContain(mirrored);
    expect(existsSync(mirrored)).toBe(true); // check mode must not delete
    syncAll({ paths });
    expect(existsSync(mirrored)).toBe(false);
  });

  it("copies non-SKILL.md skill assets verbatim and detects tampering", () => {
    const paths = makeFixture();
    mkdirSync(join(paths.skillSources, "demo", "agents"), { recursive: true });
    writeFileSync(join(paths.skillSources, "demo", "reference.md"), "ref body\n");
    writeFileSync(join(paths.skillSources, "demo", "agents", "openai.yaml"), "name: demo\n");
    syncAll({ paths });

    // The whole skill directory is drift-controlled, not just SKILL.md.
    expect(readFileSync(join(paths.claudeSkills, "demo", "agents", "openai.yaml"), "utf8")).toBe(
      "name: demo\n"
    );

    const copied = join(paths.claudeSkills, "demo", "reference.md");
    expect(readFileSync(copied)).toEqual(Buffer.from("ref body\n")); // byte-for-byte, no banner

    writeFileSync(copied, "tampered\n");
    expect(syncAll({ paths, check: true }).changed).toContain(copied);
  });
});
