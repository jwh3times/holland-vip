// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  parseFrontmatter,
  deriveSandboxMode,
  tomlBasicString,
  agentMarkdownToToml,
  injectSkillBanner,
} from "../../scripts/lib/agent-sync.mjs";

const SAMPLE_AGENT = [
  "---",
  "name: sample-agent",
  "description: Keeps CLAUDE.md, README.md, and AGENTS.md current.",
  "tools: Read, Write, Edit, Glob",
  "model: sonnet",
  "---",
  "",
  "Line one of instructions.",
  "Regex with a backslash: \\d+",
  "",
].join("\n");

describe("parseFrontmatter", () => {
  it("splits frontmatter keys from the body", () => {
    const { data, body } = parseFrontmatter(SAMPLE_AGENT);
    expect(data.name).toBe("sample-agent");
    expect(data.description).toBe("Keeps CLAUDE.md, README.md, and AGENTS.md current.");
    expect(data.tools).toBe("Read, Write, Edit, Glob");
    expect(body).toContain("Line one of instructions.");
  });

  it("throws when the frontmatter block is missing", () => {
    expect(() => parseFrontmatter("no frontmatter here")).toThrow(/frontmatter/);
  });
});

describe("deriveSandboxMode", () => {
  it("is workspace-write when Write or Edit is present", () => {
    expect(deriveSandboxMode("Read, Write, Glob")).toBe("workspace-write");
    expect(deriveSandboxMode("Read, Edit")).toBe("workspace-write");
  });
  it("is read-only otherwise", () => {
    expect(deriveSandboxMode("Read, Glob, Grep")).toBe("read-only");
    expect(deriveSandboxMode("")).toBe("read-only");
  });
});

describe("tomlBasicString", () => {
  it("wraps and escapes quotes and backslashes", () => {
    expect(tomlBasicString('a "b" \\ c')).toBe('"a \\"b\\" \\\\ c"');
  });
});

describe("agentMarkdownToToml", () => {
  it("maps fields, derives sandbox_mode, and keeps the description verbatim", () => {
    const toml = agentMarkdownToToml(SAMPLE_AGENT, ".claude/agents/sample-agent.md");
    expect(toml).toContain(
      "# GENERATED — do not edit. Source: .claude/agents/sample-agent.md. Regenerate: npm run sync:agents"
    );
    expect(toml).toContain('name = "sample-agent"');
    expect(toml).toContain('description = "Keeps CLAUDE.md, README.md, and AGENTS.md current."');
    expect(toml).toContain('sandbox_mode = "workspace-write"');
    expect(toml).toContain("developer_instructions = '''");
    expect(toml).toContain("Regex with a backslash: \\d+"); // backslash preserved
    expect(toml).not.toContain("model ="); // model intentionally omitted
  });

  it("throws when the body contains the TOML literal delimiter", () => {
    const bad = [
      "---",
      "name: x",
      "description: y",
      "tools: Read",
      "---",
      "",
      "has ''' inside",
      "",
    ].join("\n");
    expect(() => agentMarkdownToToml(bad, ".claude/agents/x.md")).toThrow(/'''/);
  });
});

describe("injectSkillBanner", () => {
  it("adds the banner as line 2, keeping --- on line 1", () => {
    const out = injectSkillBanner("---\nname: ship\n---\n\nBody\n", ".claude/skills/ship/SKILL.md");
    const lines = out.split("\n");
    expect(lines[0]).toBe("---");
    expect(lines[1]).toBe(
      "# GENERATED — do not edit. Source: .claude/skills/ship/SKILL.md. Regenerate: npm run sync:agents"
    );
    expect(lines[2]).toBe("name: ship");
  });
});
