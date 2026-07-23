// Transforms + orchestration for keeping Codex agent artifacts in sync with
// their canonical .claude/ sources. See
// docs/superpowers/specs/2026-07-22-codex-agent-sync-design.md.
//
// The .claude/ tree is the single source of truth. This module derives:
//   .agents/skills/<name>/**   — verbatim mirror of .claude/skills/<name>/**
//   .codex/agents/<name>.toml  — transform of .claude/agents/<name>.md
// Output is deterministic (LF line endings, no timestamps) so regeneration
// never churns and --check is stable across platforms.

/** Repo-relative banner marking a file as generated. */
export function bannerLine(sourceRelPath, commentPrefix) {
  return `${commentPrefix} GENERATED — do not edit. Source: ${sourceRelPath}. Regenerate: npm run sync:agents`;
}

/**
 * Split a markdown document with a leading `---` YAML frontmatter block into
 * { data, body }. Handles the simple single-line `key: value` shape used by
 * this repo's agent files. Throws if the frontmatter block is missing.
 * @param {string} md
 * @returns {{ data: Record<string, string>, body: string }}
 */
export function parseFrontmatter(md) {
  const normalized = md.replace(/\r\n/g, "\n");
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(normalized);
  if (!match) {
    throw new Error("missing YAML frontmatter (expected a leading '---' block)");
  }
  const [, rawFrontmatter, body] = match;
  const data = {};
  for (const line of rawFrontmatter.split("\n")) {
    if (!line.trim()) continue;
    const kv = /^([A-Za-z0-9_-]+):\s?(.*)$/.exec(line);
    if (!kv) {
      throw new Error(`unsupported frontmatter line: ${JSON.stringify(line)}`);
    }
    data[kv[1]] = kv[2];
  }
  return { data, body };
}

/** Codex sandbox mode derived from a Claude `tools:` CSV. */
export function deriveSandboxMode(toolsCsv = "") {
  const tools = toolsCsv.split(",").map((t) => t.trim());
  return tools.includes("Write") || tools.includes("Edit") ? "workspace-write" : "read-only";
}

/** Encode a single-line JS string as a TOML basic (double-quoted) string. */
export function tomlBasicString(value) {
  const escaped = value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\t/g, "\\t")
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n");
  return `"${escaped}"`;
}

/**
 * Transform a .claude/agents/<name>.md source into .codex/agents/<name>.toml
 * text. `sourceRelPath` is the repo-relative source path used in the banner.
 */
export function agentMarkdownToToml(md, sourceRelPath) {
  const { data, body } = parseFrontmatter(md);
  if (!data.name) throw new Error(`agent source ${sourceRelPath} is missing 'name'`);
  if (!data.description) {
    throw new Error(`agent source ${sourceRelPath} is missing 'description'`);
  }

  const instructions = body.replace(/\r\n/g, "\n").trim();
  if (instructions.includes("'''")) {
    throw new Error(
      `agent source ${sourceRelPath} body contains "'''", which collides with the TOML literal-string delimiter`
    );
  }

  return (
    [
      bannerLine(sourceRelPath, "#"),
      `name = ${tomlBasicString(data.name)}`,
      `description = ${tomlBasicString(data.description)}`,
      `sandbox_mode = ${tomlBasicString(deriveSandboxMode(data.tools))}`,
      "developer_instructions = '''",
      instructions,
      "'''",
    ].join("\n") + "\n"
  );
}

/**
 * Inject the generated-file banner as a YAML comment on the second line of a
 * skill's SKILL.md frontmatter, keeping `---` on line 1 so Codex still parses
 * the frontmatter. Files without frontmatter are returned unchanged (LF).
 */
export function injectSkillBanner(skillMd, sourceRelPath) {
  const normalized = skillMd.replace(/\r\n/g, "\n");
  const match = /^---\n/.exec(normalized);
  if (!match) return normalized;
  const banner = bannerLine(sourceRelPath, "#") + "\n";
  return normalized.slice(0, match[0].length) + banner + normalized.slice(match[0].length);
}
