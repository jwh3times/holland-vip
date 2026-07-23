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
    claudeSkills: join(root, ".claude", "skills"),
    claudeAgents: join(root, ".claude", "agents"),
    codexSkills: join(root, ".agents", "skills"),
    codexAgents: join(root, ".codex", "agents"),
  };
  mkdirSync(join(paths.claudeSkills, "demo"), { recursive: true });
  mkdirSync(paths.claudeAgents, { recursive: true });
  writeFileSync(
    join(paths.claudeSkills, "demo", "SKILL.md"),
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

    const skill = readFileSync(join(paths.codexSkills, "demo", "SKILL.md"), "utf8");
    expect(skill.split("\n")[1]).toContain("GENERATED — do not edit");

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

  it("copies non-SKILL.md skill assets verbatim and detects tampering", () => {
    const paths = makeFixture();
    writeFileSync(join(paths.claudeSkills, "demo", "reference.md"), "ref body\n");
    syncAll({ paths });

    const copied = join(paths.codexSkills, "demo", "reference.md");
    expect(readFileSync(copied)).toEqual(Buffer.from("ref body\n")); // byte-for-byte, no banner

    writeFileSync(copied, "tampered\n");
    expect(syncAll({ paths, check: true }).changed).toContain(copied);
  });
});
